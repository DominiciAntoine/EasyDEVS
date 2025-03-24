import type { components } from "@/api/v1";

export function addPortToModel(
	model: components["schemas"]["response.DiagramResponse"]["models"][number],
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
