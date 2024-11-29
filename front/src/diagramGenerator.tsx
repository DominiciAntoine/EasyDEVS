'use client'

import { useState, useCallback, useLayoutEffect, ComponentProps } from 'react';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable.tsx"

import {
    ReactFlow,
    addEdge,
    Background,
    useNodesState,
    useEdgesState,
    MiniMap,
    ConnectionMode,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { ZoomSlider } from './components/zoom-slider.tsx';
import ResizerNode from './ResizerNode.tsx';
import BiDirectionalEdge from './BiDirectionalEdge';
import { getLayoutedElements } from './ElkPlaceMode.tsx';
import { initialNodes, initialEdges } from './initialElements';
import { Button } from './components/ui/button.tsx';
import DiagramPrompt from './diagramPrompt.tsx';
import { SidebarTrigger } from './components/ui/sidebar.tsx';
import { Separator } from './components/ui/separator.tsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from './components/ui/breadcrumb.tsx';
import { NavActions } from './components/nav-actions.tsx';
import { ModeToggle } from './components/mode-toggle.tsx';
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from '@codemirror/lang-javascript';
import ModelPrompt from './modelPrompt.tsx';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useTheme } from "./components/theme-provider"; // Assure-toi que ce hook existe

const nodeTypes: ComponentProps<typeof ReactFlow>['nodeTypes'] = {
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

const DiagramGenerator = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { theme } = useTheme();
    const [stage, setStage] = useState(0);
    const { fitView } = useReactFlow();
    const [code, setCode] = useState('// Hello, CodeMirror!');
    const test = true;


    const onConnect = useCallback((connection: any) => {
        setEdges((eds) => addEdge(connection, eds));
    }, []);

    const updateDiagram = (diagramData: { nodes: any[]; edges: any[] }) => {
        setNodes(diagramData.nodes);
        setEdges(diagramData.edges);
        setStage(1);

    };

    const onValidate = () => {
        setStage(2);
    }

    const onLayout = useCallback(
        ({ direction = "RIGHT", useInitialNodes = false }) => {
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
        onLayout({ direction: 'RIGHT' });
    }, []);

    return (
        <div className='h-full w-full flex flex-col'>
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
                    {stage === 1 || test ? <Button onClick={onValidate}>Validate diagram</Button> : null}
                    <NavActions />
                    <ModeToggle />
                </div>
            </header>

            <ResizablePanelGroup direction="horizontal">
                {(() => {
                    switch (stage) {
                        case 0:
                        case 1:
                            return (
                                <>
                                    {/* Bloc commun pour case 0 et 1 */}
                                    <ResizablePanel defaultSize={40} minSize={20}>
                                        <DiagramPrompt stage={stage} onGenerate={updateDiagram} />
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={60} minSize={20} onResize={() => fitView()}>
                                        <ReactFlow
                                            nodes={nodes}
                                            edges={edges}
                                            onNodesChange={onNodesChange}
                                            onEdgesChange={onEdgesChange}
                                            onConnect={onConnect}
                                            defaultEdgeOptions={defaultEdgeOptions}
                                            nodeTypes={nodeTypes as any}
                                            edgeTypes={edgeTypes}
                                            connectionMode={ConnectionMode.Loose}
                                            fitView
                                        >
                                            <MiniMap zoomable pannable />
                                            <Background />
                                            <ZoomSlider />
                                        </ReactFlow>
                                    </ResizablePanel>
                                </>
                            );

                        case 2:
                            return (
                                <>
                                    {/* Bloc spécifique au case 2 */}

                                    <ResizablePanel defaultSize={40} minSize={20}>
                                        <ResizablePanelGroup direction="vertical">
                                            {/* Bloc 2 (contenu vertical) */}
                                            <ResizablePanel defaultSize={60} minSize={20}>
                                                <ModelPrompt stage={stage} onGenerate={updateDiagram} />
                                            </ResizablePanel>
                                            <ResizableHandle />
                                            <ResizablePanel defaultSize={40} minSize={20} onResize={() => fitView()}>
                                                <ReactFlow
                                                    nodes={nodes}
                                                    edges={edges}
                                                    onNodesChange={onNodesChange}
                                                    onEdgesChange={onEdgesChange}
                                                    onConnect={onConnect}
                                                    defaultEdgeOptions={defaultEdgeOptions}
                                                    nodeTypes={nodeTypes as any}
                                                    edgeTypes={edgeTypes}
                                                    connectionMode={ConnectionMode.Loose}
                                                    fitView
                                                >
                                                    <Background />
                                                    <ZoomSlider />
                                                </ReactFlow>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={60} minSize={20}>
                                        <CodeMirror
                                            value={code}
                                            className="h-full"
                                            onChange={(value) => setCode(value)}
                                            theme={theme === "dark" ? githubDark : githubLight}
                                            extensions={[javascript()]}
                                        />
                                    </ResizablePanel>
                                </>
                            );

                        default:
                            return null; // Ne rien afficher pour les cas non gérés
                    }
                })()}
            </ResizablePanelGroup>


        </div>
    );
};

export default DiagramGenerator;
