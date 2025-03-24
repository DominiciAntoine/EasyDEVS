import type { components } from "@/api/v1";

export function findParentModel(
	nodeid: components["schemas"]["response.DiagramResponse"]["models"][number]["id"],
	diagram: components["schemas"]["response.DiagramResponse"],
) {
	return diagram.models.find(
		({ type, components }) =>
			type === "coupled" && components?.includes(nodeid),
	);
}
