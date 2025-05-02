import type { components } from "@/api/v1";
import { DEFAULT_NODE_SIZE } from "@/constants";
import type { ReactFlowInput } from "@/types";
import { addEdge } from "@xyflow/react";

const DEFAULT_POSITION = { x: 0, y: 0 }

const connectionToEdge = ({
	from,
	to,
}: components["schemas"]["json.ModelConnection"]): ReactFlowInput["edges"][number] => addEdge({
	source: from.modelId,
	target: to.modelId,
	sourceHandle: from.port,
	targetHandle: to.port,
	type: "step",
	animated: true,
	zIndex: 1000,
}, [])[0];

const modelToNode = (
	model: components["schemas"]["response.ModelResponse"],
): ReactFlowInput["nodes"][number] => {
	return {
		id: model.id ?? "Unnamed model",
		type: "resizer",
		measured: {
			height: model.metadata.style.height ?? DEFAULT_NODE_SIZE,
			width: model.metadata.style.width ?? DEFAULT_NODE_SIZE,
		},
		data: {
			id: model.id ?? "Unnamed model",
			modelType: model.type ?? "atomic",
			label: model.name ?? "Unnamed model",
			inputPorts: model.ports.filter((p) => {
				p.type === "in";
			}),
			outputPorts: model.ports.filter((p) => {
				p.type === "out";
			}),
		},
		position: model.metadata.position ?? DEFAULT_POSITION,
		height: model.metadata.style.height ?? DEFAULT_NODE_SIZE,
		width: model.metadata.style.width ?? DEFAULT_NODE_SIZE,
		// TODO
		// extent: '',
		// parentId: '',
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
