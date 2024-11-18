import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN', // Ajout de cette option
};

// Fonction pour construire la hiérarchie des nœuds avec leurs enfants
const buildHierarchy = (nodes, isHorizontal) => {
  const nodeMap = {};
  const rootNodes = [];

  // Créer un dictionnaire de nœuds par ID
  nodes.forEach((node) => {
    nodeMap[node.id] = {
      id: node.id,
      width: node.style?.width || 150,
      height: node.style?.height || 50,
      layoutOptions: { 'elk.padding': '[top=120,left=40,bottom=40,right=40]' },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      children: [],
    };
  });

  // Organiser les nœuds en hiérarchie en utilisant parentId
  nodes.forEach((node) => {
    if (node.parentId && nodeMap[node.parentId]) {
      nodeMap[node.parentId].children.push(nodeMap[node.id]);
    } else {
      rootNodes.push(nodeMap[node.id]);
    }
  });

  return rootNodes;
};

// Fonction pour aplatir les nœuds hiérarchisés après la mise en page
const flattenNodes = (nodes) => {
  const flatList = [];

  const extractNodes = (node) => {
    flatList.push({
      ...node,
      position: { x: node.x || 0, y: node.y || 0 },
    });
    if (node.children) {
      node.children.forEach(extractNodes);
    }
  };

  nodes.forEach(extractNodes);
  return flatList;
};

export const getLayoutedElements = async (nodes, edges, direction = 'RIGHT') => {
  const isHorizontal = direction === 'RIGHT';

  // Construire la hiérarchie de graphes avec les nœuds et leurs enfants
  const graph = {
    id: 'root',
    layoutOptions: { ...elkOptions, 'elk.direction': direction },
    children: buildHierarchy(nodes, isHorizontal),
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
    nodes: layoutedFlatNodes.map((node) => ({
      ...nodes.find((n) => n.id === node.id),
      position: node.position,
    })),
    edges,
  };
};
