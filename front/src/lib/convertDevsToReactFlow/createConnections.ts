import type { components } from "@/api/v1";
import { findParentModel } from "./findParentModel";

function generateInterPort(from: string, to: string) {
	return `inter-${from}-to-${to}`;
}

export function createConnections(
	conn: components["schemas"]["response.DiagramResponse"]["connections"][number],
	parentModel: components["schemas"]["response.DiagramResponse"]["models"][number],
	diagram: components["schemas"]["response.DiagramResponse"],
	type: keyof components["schemas"]["response.DiagramResponse"]["connections"][number],
) {
	const arrayOfConnections: components["schemas"]["response.DiagramResponse"]["connections"] =
		[];
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

		const parent = findParentModel(parentModel.id, diagram);

		if (parent) {
			arrayOfConnections.push(interConn);

			const nextGeneratedPortNameFrom = generateInterPort(
				parentModel.id,
				parent.id,
			);
			const nextConn: typeof conn = {
				from: { model: parentModel.id, port: generatedPortNameFrom },
				to: { model: parent.id, port: nextGeneratedPortNameFrom },
			};

			arrayOfConnections.push(
				...createConnections(nextConn, parent, diagram, type),
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

	const parent = findParentModel(parentModel.id, diagram);

	if (parent) {
		arrayOfConnections.push(interConn);

		const nextGeneratedPortNameTo = generateInterPort(
			parent.id,
			parentModel.id,
		);
		const nextConn: typeof conn = {
			from: { model: parent.id, port: nextGeneratedPortNameTo },
			to: { model: parentModel.id, port: generatedPortNameTo },
		};

		arrayOfConnections.push(
			...createConnections(nextConn, parent, diagram, type),
		);
	} else {
		arrayOfConnections.push(interConn);
	}
	return arrayOfConnections;
}
