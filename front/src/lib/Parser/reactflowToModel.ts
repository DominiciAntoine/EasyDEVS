import type { components } from "@/api/v1";
import { DEFAULT_NODE_SIZE } from "@/constants";
import type { ReactFlowInput } from "@/types";

const cleanHandleId = (str: string | undefined | null) =>
	str?.replace(/^(in-internal-|out-internal-|out-|in-)/, "");

const getModelComponent = (
	parentNode: ReactFlowInput["nodes"][number],
	nodes: ReactFlowInput["nodes"],
): components["schemas"]["json.ModelComponent"][] => {
	return nodes
		.filter((nodeInNodes) => nodeInNodes.parentId === parentNode.id)
		.map((nodeInNodes) => ({
			componentId: nodeInNodes.id,
			modelId: nodeInNodes.data.id,
		}));
};

const getModelConnection = (
	node: ReactFlowInput["nodes"][number],
	nodesAndEdges: ReactFlowInput,
	components: components["schemas"]["json.ModelComponent"][],
): components["schemas"]["json.ModelConnection"][] => {
	const internalId: string[] = [
		...components.map(({ componentId }) => componentId),
		node.id,
	];

	const internalPorts: string[] = nodesAndEdges.nodes
		.filter((aNode) => internalId.includes(aNode.id))
		.flatMap(({ data: { inputPorts, outputPorts } }) => [
			...(inputPorts?.map(({ id }) => id) ?? []),
			...(outputPorts?.map(({ id }) => id) ?? []),
		]);

	const directInternalEdges = nodesAndEdges.edges.filter((anEdge) => {
		const cleanSource = cleanHandleId(anEdge.sourceHandle);
		const cleanTarget = cleanHandleId(anEdge.targetHandle);

		if (cleanSource && cleanTarget) {
			return (
				internalPorts.includes(cleanSource) &&
				internalPorts.includes(cleanTarget)
			);
		}

		return false;
	});

	return directInternalEdges.map((anEdge) => ({
		from: {
			modelId: anEdge.source,
			port: cleanHandleId(anEdge.sourceHandle) ?? "",
		},
		to: {
			modelId: anEdge.target,
			port: cleanHandleId(anEdge.targetHandle) ?? "",
		},
	}));
};

const getModelPorts = (
	node: ReactFlowInput["nodes"][number],
): components["schemas"]["json.ModelPort"][] => {
	const portIn =
		node.data.inputPorts?.map<components["schemas"]["json.ModelPort"]>((p) => ({
			id: p.id,
			type: "in",
		})) ?? [];
	const portOut =
		node.data.outputPorts?.map<components["schemas"]["json.ModelPort"]>(
			(p) => ({ id: p.id, type: "out" }),
		) ?? [];

	return [...portIn, ...portOut];
};

const nodeToModel = (
	node: ReactFlowInput["nodes"][number],
	nodesAndEdges: ReactFlowInput,
): components["schemas"]["request.ModelRequest"] => {
	const comp = getModelComponent(node, nodesAndEdges.nodes);
	return {
		name: node.data.label,
		id: node.id,
		code: "",
		components: comp,
		ports: getModelPorts(node),
		description: "",
		type: node.data.modelType,
		metadata: {
			position: { x: node.position.x, y: node.position.y },
			style: {
				height: node.measured?.height ?? DEFAULT_NODE_SIZE,
				width: node.measured?.width ?? DEFAULT_NODE_SIZE,
			},
		},
		libId: undefined,
		connections:
			node.data.modelType === "coupled"
				? getModelConnection(node, nodesAndEdges, comp)
				: [],
	};
};

export const reactflowToModel = (
	res: ReactFlowInput,
): components["schemas"]["request.ModelRequest"][] => {
	return res.nodes.map((n) => nodeToModel(n, res));
};
