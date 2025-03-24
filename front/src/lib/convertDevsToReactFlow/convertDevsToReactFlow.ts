import type { components } from "@/api/v1";
import { DEFAULT_NODE_SIZE } from "@/constants";
import type { ReactFlowInput } from "@/types";
import { Position } from "@xyflow/react";
import { addPortToModel } from "./addPortToModel";
import { findParentModel } from "./findParentModel";
import { splitConnection } from "./splitConnection";

export function convertDevsToReactFlow(
	diagram: components["schemas"]["response.DiagramResponse"],
) {
	diagram.connections = diagram.connections.reduce<
		components["schemas"]["response.DiagramResponse"]["connections"]
	>(
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
	const nodes: ReactFlowInput["nodes"] = diagram.models
		.map((model, index) => {
			const node: (typeof nodes)[number] = {
				id: `${index + 1}`,
				type: "resizer",
				data: {
					modelType: model.type,
					label: model.id,
					inputPorts: [],
					outputPorts: [],
					id: `${index + 1}`,
					toolbarPosition: Position.Bottom,
					toolbarVisible: true,
					alwaysShowExtraInfo: false,
					alwaysShowToolbar: true,
				},
				style: { width: DEFAULT_NODE_SIZE, height: DEFAULT_NODE_SIZE },
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
			const parent = findParentModel(node.data.label, diagram);
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
	const edges: ReactFlowInput["edges"] = diagram.connections.flatMap((conn) => {
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
