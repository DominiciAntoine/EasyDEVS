import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"

import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  ConnectionMode,
  Controls,
  Panel,
  useReactFlow, 
  type ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';

import { ZoomSlider } from "./components/zoom-slider.tsx";
import { cn } from "./lib/utils"

import ResizerNode from './ResizerNode.tsx';
import BiDirectionalEdge from './BiDirectionalEdge';
import {getLayoutedElements} from'./ElkPlaceMode.tsx';

import {
  initialNodes,
  initialEdges,
} from './initialElements';

const nodeTypes = {
  resizer: ResizerNode,
};

const defaultEdgeOptions = {
  type: 'step',
  animated: true,
  style: { zIndex: 1000 },
};

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

const NestedFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as any);
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const applyLayout = useCallback(
    async (direction = 'RIGHT') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes(layoutedNodes as any);
      setEdges(layoutedEdges as any);
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Calcul de la disposition initiale
  useEffect(() => {
    applyLayout('RIGHT');
  }, []);

  return (
    <div id='app'>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      defaultEdgeOptions={defaultEdgeOptions}
      nodeTypes={nodeTypes as any}
      edgeTypes={edgeTypes}
      colorMode={colorMode}
      fitView
      connectionMode={ConnectionMode.Loose}
    >
      <MiniMap zoomable pannable/>
      <Background />
      <Panel className={cn("flex bg-primary-foreground text-foreground")} position="top-right">
      <Select onValueChange={(value) => setColorMode(value as ColorMode)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Light" />
        </SelectTrigger>
        <SelectContent className="w-[180px]">
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
      </Panel>
      <ZoomSlider />
    </ReactFlow>
    </div>
  );
};

export default NestedFlow;
