import { components } from "@/api/v1";
import { DatabaseModelMetadata, ReactFlowInput, ReactFlowPort, ReactFlowModel, ReactFlowModelData } from "@/types/modelType";
import { Edge, Node, Position } from "@xyflow/react";

export function reactFlowToModels(reactFlowInput: ReactFlowInput): components["schemas"]["model.Model"][] {
  const { nodes, edges } = reactFlowInput;
  
  // Group nodes by parent to handle connections properly
  const nodesByParent: Record<string, Node<ReactFlowModelData>[]> = {};
  
  // First, group all nodes by their parent
  nodes.forEach(node => {
    const parentId = node.parentId || 'root';
    if (!nodesByParent[parentId]) {
      nodesByParent[parentId] = [];
    }
    nodesByParent[parentId].push(node);
  });
  
  // Process edges to associate them with their coupled model parent
  const edgesByParent: Record<string, Edge[]> = {};
  
  edges.forEach(edge => {
    // Find parent for the source and target nodes
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    // If both nodes have the same parent, assign the edge to that parent
    if (sourceNode.parentId === targetNode.parentId) {
      const parentId = sourceNode.parentId || 'root';
      if (!edgesByParent[parentId]) {
        edgesByParent[parentId] = [];
      }
      edgesByParent[parentId].push(edge);
    } else {
      // If different parents, assign to the closest common ancestor
      // For simplicity, we'll assign to 'root' in this case
      if (!edgesByParent['root']) {
        edgesByParent['root'] = [];
      }
      edgesByParent['root'].push(edge);
    }
  });
  
  // Convert nodes to model format
  return nodes.map(node => {
    const { data, position, style } = node;
    
    // Extract node data
    const {
      inputPorts,
      outputPorts,
      modelType,
      label,
      toolbarVisible,
      toolbarPosition,
      alwaysShowToolbar,
      alwaysShowExtraInfo
    } = data;
    
    // Get direct children if this is a coupled model
    const components = modelType === 'coupled' 
      ? nodesByParent[node.id]?.map(childNode => childNode.id) || []
      : [];
    
    // Get connections for this model (only if coupled)
    const connections = modelType === 'coupled'
      ? edgesByParent[node.id] || []
      : [];
    
    // Build metadata object
    const metadata: DatabaseModelMetadata = {
      position,
      backgroundColor: style?.backgroundColor,
      toolbarVisible,
      toolbarPosition,
      alwaysShowToolbar,
      alwaysShowExtraInfo,
      style: {
        width: style?.width as number || 200,
        height: style?.height as number || 200
      }
    };
    
    // Créer un objet qui correspond au schéma attendu par l'API
    const model: components["schemas"]["model.Model"] = {
      id: node.id,
      name: label,
      type: modelType,
      description: '',  // Default empty string as it's not in ReactFlow data
      code: '',        // Default empty string as it's not in ReactFlow data
      metadataJson: metadata,
      componentsJson: components,
      connectionsJson: connections,
      portInJson: inputPorts || [],
      portOutJson: JSON.stringify(outputPorts || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return model;
  });
}