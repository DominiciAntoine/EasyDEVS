import type { components } from "@/api/v1";
import type { ReactFlowInput } from "@/types";
import { Position } from "@xyflow/react";

const connectionToEdge = ({
	from,
	to,
}: components["schemas"]["json.ModelConnection"]): ReactFlowInput["edges"][number] => ({
	id: `from-${from.modelId}-${from.port}-to-${to.modelId}-${to.port}`,
	source: from.modelId,
	target: to.modelId,
	sourceHandle: from.port,
	targetHandle: to.port,
	type: "step",
	animated: true,
	style: { zIndex: 1000 },
});

const modelToNode = (
	model: components["schemas"]["response.ModelResponse"],
): ReactFlowInput["nodes"][number] => {
	return {
		id: model.id ?? "Unnamed model",
		type: "resizer",
		style: {
			height: model.metadata.style?.height ?? 200,
			width: model.metadata.style?.width ?? 200,
			backgroundColor: model.metadata.backgroundColor ?? undefined,
		},
		data: {
			id: model.id ?? "Unnamed model",
			modelType: model.type ?? "atomic",
			label: model.name ?? "Unnamed model",
			inputPorts: model.ports.filter((p) => {
				p.type == "in";
			}),
			outputPorts: model.ports.filter((p) => {
				p.type == "out";
			}),
			toolbarVisible: model.metadata.toolbarVisible ?? false,
			// as because Position is an enum
			toolbarPosition:
				(model.metadata.toolbarPosition as Position) ?? Position.Top,
			alwaysShowToolbar: model.metadata.alwaysShowToolbar,
			alwaysShowExtraInfo: model.metadata.alwaysShowExtraInfo,
		},
		position: model.metadata.position ?? { x: 0, y: 0 },
	};
};

export const modelToReactflow = (
	res: components["schemas"]["response.ModelResponse"][],
): ReactFlowInput => ({
	nodes: res.map((model) => modelToNode(model)),
	edges: res.flatMap((model) => {
		return model.connections.map(connectionToEdge);
	}),
});
