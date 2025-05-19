import type { components } from "@/api/v1";
import { DEFAULT_NODE_SIZE } from "@/constants";
import type { ReactFlowInput } from "@/types";
import { addEdge } from "@xyflow/react";
import { v4 } from "uuid";

const DEFAULT_POSITION = { x: 0, y: 0 };

const connectionToEdge = ({
	from,
	to,
}: components["schemas"]["json.ModelConnection"]): ReactFlowInput["edges"][number] =>
	addEdge(
		{
			source: from.modelId,
			target: to.modelId,
			sourceHandle: from.port,
			targetHandle: to.port,
			type: "step",
			animated: true,
			zIndex: 1000,
		},
		[],
	)[0];

	//pour chauqe composant dans un model recupérer, il faudra check les composants, si un composant, il faudra créer a la volé une nouvelle isntance de de ce modèle avec uid fraichement générer pour eviter les conflits 


	// on part sur une focntion recursive 


const modelToNode = (
	model: components["schemas"]["response.ModelResponse"],
): ReactFlowInput["nodes"][number] => {

	return {
		id: v4() ?? "Unnamed model",
		type: "resizer",
		measured: {
			height: model.metadata.style.height ?? DEFAULT_NODE_SIZE,
			width: model.metadata.style.width ?? DEFAULT_NODE_SIZE,
		},
		data: {
			id: model.id ?? "Unnamed model",
			modelType: model.type ?? "atomic",
			label: model.name ?? "Unnamed model",
			inputPorts: model.ports.filter((p) => 
				p.type === "in").map((p) => ({id: p.id})),
			outputPorts: model.ports.filter((p) => 
				p.type === "out").map((p) => ({id: p.id})),
			alwaysShowExtraInfo: false,
			toolbarPosition: "top",
			toolbarVisible: false
		},
		position: model.metadata.position ?? DEFAULT_POSITION,
		height: model.metadata.style.height ?? DEFAULT_NODE_SIZE,
		width: model.metadata.style.width ?? DEFAULT_NODE_SIZE,
		selected: false,
		dragging: false
		// TODO
		// extent: '',
		// parentId: '',
	};
};

const createReactflowModel = (models: components["schemas"]["response.ModelResponse"][], actualModelID : string , parentModelID : string | null) : ReactFlowInput["nodes"][number] | null =>
{
	const model = models.find( (m) => m.id === actualModelID)
	if (!model) return null;
	return {
		// on devrait recréer un autre uuid ici
		id: actualModelID ?? "Unnamed model",
		type: "resizer",
		measured: {
			height: model.metadata.style.height ?? DEFAULT_NODE_SIZE,
			width: model.metadata.style.width ?? DEFAULT_NODE_SIZE,
		},
		data: {
			id: model.id ?? "Unnamed model",
			modelType: model.type ?? "atomic",
			label: model.name ?? "Unnamed model",
			inputPorts: model.ports.filter((p) => 
				p.type === "in").map((p) => ({id: p.id})),
			outputPorts: model.ports.filter((p) => 
				p.type === "out").map((p) => ({id: p.id})),
		},
		position: model.metadata.position ?? DEFAULT_POSITION,
		height: model.metadata.style.height ?? DEFAULT_NODE_SIZE,
		width: model.metadata.style.width ?? DEFAULT_NODE_SIZE,
		...(parentModelID ? { extent: "parent", parentId: parentModelID } : {}),
	};
}

const recursiveModelParsing = (models: components["schemas"]["response.ModelResponse"][], modelID: string, parentModelID: string | null ): ReactFlowInput["nodes"][]=> {
	const actualModel = models.find((m) => m.id === modelID);
	if (!actualModel || !actualModel.id ) return [];


	const childNodes = actualModel.components?.flatMap((c) =>
		recursiveModelParsing(models, c.modelId, actualModel.id ?? null)
	) ?? [];


	const currentNode = createReactflowModel(models, actualModel.id , parentModelID);


	return currentNode ? [...childNodes, currentNode] : childNodes;
};

export const modelToReactflow = (res: components["schemas"]["response.ModelResponse"][] , rootID : string, ): ReactFlowInput => 
{
	const result = 
	{
		nodes: res.map((model) => modelToNode(model)),
		edges: res.flatMap((model) => {
			return model.connections.map(connectionToEdge);
		})
	}
	return result
}

