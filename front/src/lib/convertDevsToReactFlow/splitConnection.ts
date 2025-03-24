import type { components } from "@/api/v1";
import { createConnections } from "./createConnections";
import { findExistingConnection } from "./findExistingConnection";
import { findParentModel } from "./findParentModel";

export function splitConnection(
	connection: components["schemas"]["response.DiagramResponse"]["connections"][number],
	diagram: components["schemas"]["response.DiagramResponse"],
	history: components["schemas"]["response.DiagramResponse"]["connections"],
): components["schemas"]["response.DiagramResponse"]["connections"] {
	const connections: components["schemas"]["response.DiagramResponse"]["connections"] =
		[];

	if (!connection) {
		return history;
	}

	let finalSource = connection.from;
	const parentFrom = findParentModel(connection.from.model, diagram);
	const parentTo = findParentModel(connection.to.model, diagram);

	if (
		parentFrom &&
		parentFrom.id !== connection.to.model &&
		parentFrom.id !== parentTo?.id
	) {
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

	if (
		parentTo &&
		parentTo.id !== connection.from.model &&
		parentFrom?.id !== parentTo.id
	) {
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

		if (!findExistingConnection(newConnection, history)) {
			connections.push(newConnection);
		}
	}

	// sans ... -> [] -> [[x,y]]
	// avec ... -> [] -> [x,y]
	history.push(
		...connections.filter((aConn) => !findExistingConnection(aConn, history)),
	);

	return history;
}
