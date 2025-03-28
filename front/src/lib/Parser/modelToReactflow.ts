import type { components } from "@/api/v1";
import type { ReactFlowInput } from "@/types";
import { Position } from "@xyflow/react";

const connectionToEdge = ({
	from,
	to,
}: components["schemas"]["json.Connection"]): ReactFlowInput["edges"][number] => ({
	id: `from-${from.model}-${from.port}-to-${to.model}-${to.port}`,
	source: from.model,
	target: to.model,
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
			height: model.metadataJson.style?.height ?? 200,
			width: model.metadataJson.style?.width ?? 200,
			backgroundColor: model.metadataJson.backgroundColor ?? undefined,
		},
		data: {
			id: model.id ?? "Unnamed model",
			modelType: model.type ?? "atomic",
			label: model.name ?? "Unnamed model",
			inputPorts: model.portInJson,
			outputPorts: model.portOutJson,
			toolbarVisible: model.metadataJson.toolbarVisible ?? false,
			// as because Position is an enum
			toolbarPosition:
				(model.metadataJson.toolbarPosition as Position) ?? Position.Top,
			alwaysShowToolbar: model.metadataJson.alwaysShowToolbar,
			alwaysShowExtraInfo: model.metadataJson.alwaysShowExtraInfo,
		},
		position: model.metadataJson.position ?? { x: 0, y: 0 },
	};
};

export const modelToReactflow = (
	res: components["schemas"]["response.ModelResponse"][],
): ReactFlowInput => ({
	nodes: res.map((model) => modelToNode(model)),
	edges: res.flatMap((model) => {
		return model.connectionsJson.map(connectionToEdge);
	}),
});
