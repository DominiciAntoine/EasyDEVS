import type { components } from "@/api/v1";
import { DEFAULT_NODE_SIZE, DEFAULT_POSITION, INTERNAL_PREFIX } from "@/constants";
import type { EdgeData, ReactFlowInput } from "@/types";
import type { Edge } from "@xyflow/react";


const createEdge = (conn: components['schemas']['json.ModelConnection'], component: components["schemas"]["json.ModelComponent"]): Edge<EdgeData> => {
	const id = `${conn.from.instanceId === "root"? component.instanceId : conn.from.instanceId}->${conn.to.instanceId === "root"? component.instanceId : conn.to.instanceId}`

	return {
		id,
		source: conn.from.instanceId === "root"? component.instanceId : conn.from.instanceId,
		target: conn.to.instanceId === "root"? component.instanceId : conn.to.instanceId,
		sourceHandle: conn.from.instanceId === "root" ? `${INTERNAL_PREFIX}${component.instanceId}:${conn.from.port}` : `${conn.from.instanceId}:${conn.from.port}`,
		targetHandle: conn.to.instanceId === "root"? `${INTERNAL_PREFIX}${component.instanceId}:${conn.to.port}` : `${conn.to.instanceId}:${conn.to.port}`,
		data: {
			holderId: component.instanceId,
		},
	}
}

const getModelMetadata = (
	component: components["schemas"]["json.ModelComponent"],
	model: components["schemas"]["response.ModelResponse"],
): components["schemas"]["json.ModelMetadata"] =>
	component.instanceMetadata ?? model.metadata;

const createReactflowModel = (
	models: components["schemas"]["response.ModelResponse"][],
	component: (typeof models)[number]["components"][number],
	parentComponent: components["schemas"]["json.ModelComponent"] | null,
): ReactFlowInput["nodes"][number] | null => {
	const model = models.find((m) => m.id === component.modelId);
	if (!model) return null;

	const metadata = getModelMetadata(component, model);

	return {
		// on devrait recréer un autre uuid ici
		id: component.instanceId || component.modelId,
		type: "resizer",
		measured: {
			height: metadata.style.height ?? DEFAULT_NODE_SIZE,
			width: metadata.style.width ?? DEFAULT_NODE_SIZE,
		},
		data: {
			id: model.id ?? "Unnamed model",
			modelType: model.type ?? "atomic",
			label: model.name ?? "Unnamed model",
			inputPorts: model.ports
				.filter((p) => p.type === "in")
				.map((p) => ({ id: p.id })),
			outputPorts: model.ports
				.filter((p) => p.type === "out")
				.map((p) => ({ id: p.id })),
			...(model.metadata.modelColors
			? { reactFlowModelGraphicalData: model.metadata.modelColors }
			: {}),
			parameters: model.metadata.parameters
		},
		dragging: false,
		selected: false,
		position: metadata.position ?? DEFAULT_POSITION,
		height: metadata.style.height ?? DEFAULT_NODE_SIZE,
		width: metadata.style.width ?? DEFAULT_NODE_SIZE,
		...(parentComponent
			? { extent: "parent", parentId: parentComponent.instanceId }
			: {}),
	};
};

const recursiveModelParsing = (
	models: components["schemas"]["response.ModelResponse"][],
	component: components["schemas"]["json.ModelComponent"],
	parentComponent: components["schemas"]["json.ModelComponent"] | null,
): ReactFlowInput => {
	const actualModel = models.find((m) => m.id === component.modelId);

	if (!actualModel || !actualModel.id) return { nodes: [], edges: [] };

	const actualEdge = actualModel.connections.map<Edge<EdgeData>>((conn) => createEdge(conn, component));

	const childNodes =
		actualModel.components?.flatMap((c) =>
			recursiveModelParsing(models, c, component),
		) ?? [];

	const currentNode = createReactflowModel(models, component, parentComponent);

	const nodesAndEdges = {
		nodes: currentNode
			? [childNodes.map(({ nodes }) => nodes), currentNode].flat(2)
			: childNodes.flatMap(({ nodes }) => nodes),
		edges: [childNodes.map(({ edges }) => edges), actualEdge].flat(2),
	};

	return nodesAndEdges;
};

export const modelToReactflow = (
	res: components["schemas"]["response.ModelResponse"][],
	rootID: string,
): ReactFlowInput => {
	const firstComponent: components["schemas"]["json.ModelComponent"] = {
		instanceId: rootID,
		modelId: rootID,
	};

	const result = recursiveModelParsing(res, firstComponent, null);

	return {
		nodes: result.nodes.sort((a, b) => a.id.localeCompare(b.id)),
		edges: result.edges.sort((a, b) => a.id.localeCompare(b.id))
	}
};
