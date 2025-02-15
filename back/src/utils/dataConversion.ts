import type { Edge, LLMResponse, ReactFlowInput } from "../types";

function findParent(
	nodeid: LLMResponse["models"][number]["id"],
	diagram: LLMResponse,
) {
	return diagram.models.find(
		({ type, components }) =>
			type === "coupled" && components?.includes(nodeid),
	);
}

function generateInterPort(from: string, to: string) {
	return `inter-${from}-to-${to}`;
}

function existingConnection(
	newconn: LLMResponse["connections"][number],
	history: LLMResponse["connections"],
) {
	return history.find(
		(aConn) =>
			(aConn.from.model === newconn.from.model &&
				aConn.from.port === newconn.from.port &&
				aConn.to.model === newconn.to.model) ||
			(aConn.to.model === newconn.to.model &&
				aConn.to.port === newconn.to.port &&
				aConn.from.model === newconn.from.model) ||
			(aConn.to.model === newconn.from.model &&
				aConn.to.port === newconn.from.port &&
				aConn.from.model === newconn.to.model) ||
			(aConn.from.model === newconn.to.model &&
				aConn.from.port === newconn.to.port &&
				aConn.to.model === newconn.from.model),
	);
}

function createConnections(
	conn: LLMResponse["connections"][number],
	parentModel: LLMResponse["models"][number],
	diagram: LLMResponse,
	type: keyof LLMResponse["connections"][number],
) {
	const arrayOfConnections: LLMResponse["connections"] = [];
	if (type === "from") {
		const generatedPortNameFrom = generateInterPort(
			conn.from.model,
			parentModel.id,
		);
		if (!parentModel.ports) {
			parentModel.ports = { in: [], out: [] };
		}
		const interConn: typeof conn = {
			from: { model: conn.from.model, port: conn.from.port },
			to: { model: parentModel.id, port: generatedPortNameFrom },
		};

		const parent = findParent(parentModel.id, diagram);

		if (parent) {
			arrayOfConnections.push(
				...createConnections(interConn, parent, diagram, type),
			);
		} else {
			arrayOfConnections.push(interConn);
		}
		return arrayOfConnections;
	}

	const generatedPortNameTo = generateInterPort(
		parentModel.id,
		conn.from.model,
	);
	if (!parentModel.ports) {
		parentModel.ports = { in: [], out: [] };
	}
	// switch_kitchen -> out -> in -> lights -> out -> in -> light_kitchen_1
	const interConn: typeof conn = {
		from: { model: parentModel.id, port: generatedPortNameTo },
		to: { model: conn.to.model, port: conn.to.port },
	};

	const parent = findParent(parentModel.id, diagram);

	if (parent) {
		arrayOfConnections.push(
			...createConnections(interConn, parent, diagram, type),
		);
	} else {
		arrayOfConnections.push(interConn);
	}
	return arrayOfConnections;
}

function splitConnection(
	connection: LLMResponse["connections"][number],
	diagram: LLMResponse,
	history: LLMResponse["connections"],
): LLMResponse["connections"] {
	const connections: LLMResponse["connections"] = [];

	if (!connection) {
		return history;
	}

	let finalSource = connection.from;
	const parentFrom = findParent(connection.from.model, diagram);

	if (parentFrom) {
		connections.push(
			...createConnections(connection, parentFrom, diagram, "from"),
		);
		const aConnection = connections[connections.length - 1];
		if (aConnection) {
			finalSource = aConnection.to;
		}
	}

	//si pas de parent  = conection.from
	let finalTarget = connection.to;

	const parentTo = findParent(connection.to.model, diagram);
	if (parentTo) {
		connections.push(...createConnections(connection, parentTo, diagram, "to"));
		const aConnection = connections[connections.length - 1];
		if (aConnection) {
			finalTarget = aConnection.from;
		}
	}

	// Si pas de parent = connection.to
	if (finalTarget && finalSource && finalSource.model !== finalTarget.model) {
		const newConnection: typeof connection = {
			from: { model: finalSource.model, port: finalSource.port },
			to: { model: finalTarget.model, port: finalTarget.port },
		};

		if (!existingConnection(newConnection, history)) {
			connections.push(newConnection);
		}
	}

	// sans ... -> [] -> [[x,y]]
	// avec ... -> [] -> [x,y]
	history.push(
		...connections.filter((aConn) => !existingConnection(aConn, history)),
	);

	return history;
}

function addPortToModel(
	model: LLMResponse["models"][number],
	port: string,
	type: "in" | "out",
) {
	if (!model.ports) {
		model.ports = { in: [], out: [] };
	}
	if (!model.ports.in) {
		model.ports.in = [];
	}
	if (!model.ports.out) {
		model.ports.out = [];
	}

	if (type === "in") {
		if (!model.ports.in.includes(port)) {
			model.ports.in.push(port);
		}
	} else {
		if (!model.ports.out.includes(port)) {
			model.ports.out.push(port);
		}
	}
}

export function convertDevsToReactFlow(diagram: LLMResponse) {
	diagram.connections = diagram.connections.reduce<LLMResponse["connections"]>(
		(actualConnections, conn) => [
			...splitConnection(conn, diagram, actualConnections),
		],
		[],
	);
	//ca ne vas pas pour le history

	//création des ports manquants

	diagram.connections = diagram.connections.flatMap((conn) => {
		const fromModel = diagram.models.find(({ id }) => id === conn.from.model);
		const toModel = diagram.models.find(({ id }) => id === conn.to.model);
		if (!fromModel || !toModel) {
			return [];
		}

		if (!fromModel.ports) {
			fromModel.ports = { in: [], out: [] };
		}

		if (!toModel.ports) {
			toModel.ports = { in: [], out: [] };
		}

		if (toModel.components?.includes(fromModel.id)) {
			addPortToModel(toModel, conn.to.port, "out");
			conn.to.port = `out-internal-${conn.to.port}`;
		} else {
			addPortToModel(toModel, conn.to.port, "in");
			conn.to.port = `in-${conn.to.port}`;
		}

		if (fromModel.components?.includes(toModel.id)) {
			addPortToModel(fromModel, conn.from.port, "in");
			conn.from.port = `in-internal-${conn.from.port}`;
		} else {
			addPortToModel(fromModel, conn.from.port, "out");
			conn.from.port = `out-${conn.from.port}`;
		}

		return [conn];
	});

	//je fais les nodes
	const nodes: ReactFlowInput[] = diagram.models
		.map((model, index) => {
			const node: ReactFlowInput = {
				id: `${index + 1}`,
				type: "resizer",
				data: {
					modelType: model.type,
					label: model.id,
					inputPorts: [],
					outputPorts: [],
				},
				style: { width: 200, height: 200 },
				position: { x: 0, y: 0 },
			};

			if (model.ports) {
				if (model.ports.in) {
					node.data.inputPorts = model.ports.in.map((port) => ({ id: port }));
				}
				if (model.ports.out) {
					node.data.outputPorts = model.ports.out.map((port) => ({ id: port }));
				}
			}
			return node;
		})
		.map((node, _, nodeArray) => {
			const parent = findParent(node.data.label, diagram);
			if (parent) {
				const parentNode = nodeArray.find(
					({ data }) => data.label === parent.id,
				);
				if (parentNode) {
					return {
						...node,
						parentId: parentNode.id,
						extent: "parent",
					};
				}
			}

			return node;
		});

	//je fais les edges
	const edges: Edge[] = diagram.connections.flatMap((conn) => {
		const fromNode = nodes.find(({ data }) => data.label === conn.from.model);
		const toNode = nodes.find(({ data }) => data.label === conn.to.model);
		if (fromNode && toNode) {
			return [
				{
					id: `e${conn.from.model}-${conn.to.model}`,
					source: fromNode.id,
					sourceHandle: `${conn.from.port || "1"}`,
					target: toNode.id,
					targetHandle: `${conn.to.port || "1"}`,
					type: "smoothstep",
				},
			];
		}

		return [];
	});

	return { nodes, edges };
}
