'use client'

import { useState, useCallback, useEffect, useLayoutEffect } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

import { AppSidebar } from "./components/app-sidebar"
import { NavActions } from "./components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./components/ui/breadcrumb"
import { Separator } from "./components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar"

import Modal from './modal.tsx';

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
  ReactFlowProvider,
  useNodesInitialized,
   useReactFlow,
  type ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';

import { ZoomSlider } from './components/zoom-slider.tsx';
import { cn } from './lib/utils';

import ResizerNode from './ResizerNode.tsx';
import BiDirectionalEdge from './BiDirectionalEdge';
import { getLayoutedElements } from './ElkPlaceMode.tsx';

import { initialNodes, initialEdges } from './initialElements';
import { ModeToggle } from './components/mode-toggle.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { Button } from './components/ui/button.tsx';


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
  const [isModalOpen, setModalOpen] = useState(false); 
  const { fitView } = useReactFlow();

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const updateDiagram = (diagramData: { nodes: any[]; edges: any[] }) => {
    setNodes(diagramData.nodes);
    setEdges(diagramData.edges);
  };

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = direction;
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;
 
      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
 
          setTimeout(() => fitView(), 0);
        },
      );
    },
    [nodes, edges],
  );
  

  useLayoutEffect(() => {
    onLayout({ direction: 'RIGHT', useInitialNodes: false });
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Project Management & Task Tracking
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3 flex items-center gap-2">
              <Button
                onClick={() => setModalOpen(true)}
              >
                Make a New Diagram
              </Button>
              <NavActions />
              <ModeToggle />
            </div>
          </header>

          <main id='app'>
            {/* Modal */}
            {isModalOpen && (
              <Modal onGenerate={updateDiagram}>
              </Modal>
            )}

            {/* React Flow */}
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
              connectionMode={ConnectionMode.Loose}
              fitView
            >
              <MiniMap zoomable pannable />
              <Background />
              <ZoomSlider />

            </ReactFlow>
          </main>


        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>


  );
};


const App = () => (
  <ReactFlowProvider>
    <NestedFlow />
  </ReactFlowProvider>
);

export default App;
