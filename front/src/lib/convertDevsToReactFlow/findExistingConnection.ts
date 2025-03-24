import type { components } from "@/api/v1";

// TODO: Check me
export function findExistingConnection(
	newconn: components["schemas"]["response.DiagramResponse"]["connections"][number],
	history: components["schemas"]["response.DiagramResponse"]["connections"],
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
