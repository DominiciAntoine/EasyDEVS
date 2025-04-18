import type { ReactFlowInput } from "@/types";
import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();
const elkOptions = {
	"elk.algorithm": "layered",
	"elk.layered.spacing.nodeNodeBetweenLayers": "100",
	"elk.spacing.nodeNode": "80",
	"elk.hierarchyHandling": "INCLUDE_CHILDREN", // Ajout de cette option
};

// Fonction pour construire la hiérarchie des nœuds avec leurs enfants
const buildHierarchy = (nodes: ReactFlowInput["nodes"]) => {
	const nodeMap: Record<string, ElkNode> = {};
	const rootNodes: ElkNode[] = [];

	// Créer un dictionnaire de nœuds par ID
	nodes.forEach((node) => {
		nodeMap[node.id] = {
			id: node.id,
			layoutOptions: { "elk.padding": "[top=120,left=40,bottom=40,right=40]" },
			//targetPosition: isHorizontal ? 'left' : 'top',
			//sourcePosition: isHorizontal ? 'right' : 'bottom',
			width: Number(node.style?.width) || 150,
			height: Number(node.style?.height) || 50,
			children: [],
		};
	});

	// Organiser les nœuds en hiérarchie en utilisant parentId
	nodes.forEach((node) => {
		if (node.parentId && nodeMap[node.parentId]) {
			nodeMap[node.parentId].children?.push(nodeMap[node.id]);
		} else {
			rootNodes.push(nodeMap[node.id]);
		}
	});

	return rootNodes;
};

// Fonction pour aplatir les nœuds hiérarchisés après la mise en page
const flattenNodes = (nodes: ElkNode[]) => {
	const flatList: ReactFlowInput["nodes"] = [];

	const extractNodes = (node: ElkNode) => {
		flatList.push({
			...node,
			position: { x: node.x || 0, y: node.y || 0 },
		} as (typeof flatList)[number]);
		if (node.children) {
			node.children.forEach(extractNodes);
		}
	};

	nodes.forEach(extractNodes);

	return flatList;
};

export const getLayoutedElements = async (
	nodes: ReactFlowInput["nodes"],
	edges: ReactFlowInput["edges"],
	direction = "RIGHT",
): Promise<ReactFlowInput> => {
	// Construire la hiérarchie de graphes avec les nœuds et leurs enfants
	const graph = {
		id: "root",
		layoutOptions: { ...elkOptions, "elk.direction": direction },
		children: buildHierarchy(nodes),
		edges: edges.map((edge) => ({
			id: edge.id,
			sources: [edge.source],
			targets: [edge.target],
		})),
	};

	// Générer la mise en page avec ELK
	const layoutedGraph = await elk.layout(graph);

	// Aplatir les nœuds hiérarchisés après la mise en page
	const layoutedFlatNodes = flattenNodes(layoutedGraph.children || []);

	// Remettre à jour les données des nœuds en incluant leurs positions
	return {
		nodes: layoutedFlatNodes
			.map<(typeof layoutedFlatNodes)[number] | undefined>((node) => {
				const nodeInNodes = nodes.find((n) => n.id === node.id);
				if (nodeInNodes) {
					return {
						...nodeInNodes,
						width: node.width,
						height: node.height,
						position: node.position,
					};
				}

				return undefined;
			})
			.filter((node): node is (typeof layoutedFlatNodes)[number] => !!node),
		edges,
	};
};
