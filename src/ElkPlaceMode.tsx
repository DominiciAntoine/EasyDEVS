import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

export const getLayoutedElements = async (nodes: any[], edges: any[], direction = 'RIGHT') => {
  const isHorizontal = direction === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: { ...elkOptions, 'elk.direction': direction },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.style?.width || 150,
      height: node.style?.height || 50,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);
  return {
    nodes: layoutedGraph.children?.map((node) => ({
      ...nodes.find((n) => n.id === node.id),
      position: { x: node.x, y: node.y },
    })),
    edges,
  };
};