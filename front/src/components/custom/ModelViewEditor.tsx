
import { ReactFlow, Background, MiniMap, NodeChange, Node, applyNodeChanges, EdgeChange, Edge, applyEdgeChanges, addEdge, useReactFlow, ConnectionMode } from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { ComponentProps, useCallback, useRef, useState,
    
} from "react";

import { ZoomSlider } from "../zoom-slider";

  import BiDirectionalEdge from "../../components/custom/reactFlow/BiDirectionalEdge.tsx";
import { getLayoutedElements } from "@/lib/getLayoutedElements.ts";
import ModelNode from "./reactFlow/ModelNode.tsx";
import { DiagramDataType, NodeData } from "@/types/newTypes.ts";



const nodeTypes = {
  resizer: ModelNode,
};


const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

const defaultEdgeOptions = {
    type: "step",
    animated: true,
    style: { zIndex: 1000 },
  };


export function ModelViewEditor({ models }: { models: DiagramDataType }) {
  const [ReactFlowData, setReactFlowData] = useState<DiagramDataType | undefined>(models);
  const { fitView } = useReactFlow();
  
  const onNodesChange = useCallback((changes: NodeChange<Node<NodeData>>[]) => {
    setReactFlowData((prev) =>
      prev
        ? {
          ...prev,
          nodes: applyNodeChanges(changes, prev.nodes),
        }
        : undefined
    );
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setReactFlowData((prev) =>
      prev
        ? {
          ...prev,
          edges: applyEdgeChanges(changes, prev.edges),
        }
        : undefined
    );
  }, []);

  const onOrganizeClick = () => {
    onLayoutRef.current({ direction: "RIGHT" });
  };

  const onConnect = useCallback<NonNullable<ComponentProps<typeof ReactFlow>['onConnect']>>((connection) => {
    setReactFlowData((prev) =>
      prev
        ? {
          ...prev,
          edges: addEdge(connection, prev.edges),
        }
        : undefined
    );
  }, []);

  const onLayoutRef = useRef(
    ({ direction = "RIGHT" }) => {
      const opts = direction;
      if (ReactFlowData) {
        getLayoutedElements(ReactFlowData.nodes, ReactFlowData.edges, opts).then(
          ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setReactFlowData((prev) =>
              prev
                ? {
                  ...prev,
                  nodes: layoutedNodes,
                  edges: layoutedEdges,
                }
                : undefined
            );
            setTimeout(() => fitView(), 200);
          }
        );
      }
    }
  );

  return (
    <div className="h-full w-full flex flex-col">
      <ReactFlow
        nodes={ReactFlowData?.nodes}
        edges={ReactFlowData?.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        onConnect={onConnect}
      >
        <MiniMap zoomable pannable />
        <ZoomSlider onOrganizeClick={onOrganizeClick} />
        <Background />
      </ReactFlow>
    </div>
  );
}
