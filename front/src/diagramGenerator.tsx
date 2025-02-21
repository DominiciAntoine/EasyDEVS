'use client'

import { useState, useCallback, useLayoutEffect, ComponentProps, useEffect, useRef } from 'react';

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
    applyNodeChanges,
    applyEdgeChanges,
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
import { python } from "@codemirror/lang-python"; 
import ModelPrompt from './modelPrompt.tsx';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { ModelData, DiagramDataType, NodeData } from './types'
import { useTheme } from "./components/theme-provider"; // Assure-toi que ce hook existe
import StepShower from './components/stepShower.tsx';
import { Edge, Node, EdgeChange, NodeChange } from '@xyflow/react';
import {saveDiagram} from './api/diagramApi.ts';
import useAuth from './use-auth.tsx';

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
    const lastSavedDiagram = useRef<DiagramDataType | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { theme } = useTheme();
    const [stage, setStage] = useState(0);
    const { fitView } = useReactFlow();
    const [code, setCode] = useState('// Hello, CodeMirror!');
    const [diagramData, setDiagramData] = useState<DiagramDataType>({
        name:"Unamed model",
        diagramId:null,
        nodes: initialNodes,
        edges: initialEdges,
        models: [],
        currentModel: 0,
    });
    const { token } = useAuth();

    const onNodesChange = useCallback((changes : NodeChange<Node<NodeData>>[]) => {
        setDiagramData((prev) => ({
            ...prev,
            nodes: applyNodeChanges(changes, prev.nodes),
        }));
    }, []);

    const onEdgesChange = useCallback((changes : EdgeChange<Edge>[]) => {
        setDiagramData((prev) => ({
            ...prev,
            edges: applyEdgeChanges(changes, prev.edges),
        }));
    }, []);




    const onConnect = useCallback((connection : Edge) => {
        setDiagramData((prev) => ({
            ...prev,
            edges: addEdge(connection, prev.edges),
        }));
    }, []);

    const createModelDataStructure = () => {

        // 2. Construire le graphe des dépendances
        const inDegree: Record<string, number> = {}; // Compte le nombre d'arêtes entrant dans chaque modèle
        const graph: Record<string, string[]> = {}; // Liste d'adjacence des dépendances

        // Initialiser le graphe et les degrés entrants (in-degrees)
        diagramData.nodes.forEach(model => {
            inDegree[model.id] = 0;
            graph[model.id] = [];
        });

        // Remplir le graphe et les degrés entrants
        diagramData.edges.forEach(edge => {
            inDegree[edge.target] += 1;
            graph[edge.source].push(edge.target);
        });

        // 3. Algorithme de tri topologique (Kahn's algorithm)
        const queue: string[] = [];
        const result: string[] = [];

        // Ajouter les nœuds avec un degré entrant de 0 (pas de dépendances)
        Object.keys(inDegree).forEach(id => {
            if (inDegree[id] === 0) {
                queue.push(id);
            }
        });

        // Processus de tri topologique
        while (queue.length > 0) {
            const currentNode: string | undefined = queue.shift(); // Prendre un nœud sans dépendance

            if (currentNode) {
                result.push(currentNode); // Ajouter le nœud au résultat

                // Réduire le degré entrant des nœuds dépendants

                graph[currentNode].forEach((neighbor: any) => {
                    inDegree[neighbor] -= 1;
                    if (inDegree[neighbor] === 0) {
                        queue.push(neighbor);
                    }
                });
            }
        }

        // 4. Si le résultat contient tous les modèles, nous avons un ordre valide
        if (result.length !== diagramData.nodes.length) {
            console.error("Il existe un cycle de dépendances!");
            return;
        }

        // 5. Récupérer les codes des modèles dans l'ordre de tri topologique
        const orderedModels: ModelData[] = result.map(id => ({
            id: id,
            name: diagramData.nodes.find(node => node.id === id)?.data.label || "Unnamed",
            code: "",
            dependencies: diagramData.edges.filter(edge => edge.target === id).map(edge => edge.source), // Les sources des dépendances
            type: diagramData.nodes.find(node => node.id === id)?.data.modelType || "atomic",
        }));


        setDiagramData((prevData) => {
            if (!prevData) return undefined; // Ou gérez un état initial vide si nécessaire
    
            return {
                ...prevData,
                models: orderedModels, 
                currentModel: 0
            };
        });
        
    }


    const updateDiagram = (diagramData: DiagramDataType) => {
        setDiagramData((prev) => ({
            ...prev,
            nodes: diagramData.nodes,
            edges: diagramData.edges,
            name: diagramData.name
        }));
        
        setStage(1);

    };

    const updateModelCode = (modelName: string, modelCode: string) => {
        setCode(modelCode);
        const temp = diagramData;
        if (temp) {
            temp.models[temp.currentModel].name = modelName;
            temp.models[temp.currentModel].code = modelCode;
            setDiagramData(temp);

        }
    };

    const onValidateModel = () => {
        setDiagramData((prevData) => {
            if (!prevData) return undefined; // Ou gérez un état initial vide si nécessaire
    
            return {
                ...prevData,
                currentModel: prevData.currentModel + 1,
                nodes: prevData.nodes || [], // Garantir que nodes est défini
                edges: prevData.edges || [], // Garantir que edges est défini
                models: prevData.models || [], // Garantir que models est défini
            };
        });
        // Je devrais faire un save bdd ici
    };

    const onValidate = () => {
        setStage(2);
        createModelDataStructure();
        //je devrais faire un save bdd ici avec le diagrammes
        //lets swap here the highlighted model
    }

    

    const changeHiglightedModel = () => {
        if (!diagramData || !diagramData.models || diagramData.models.length === 0) {
            console.error("diagramData or models is not set correctly:", diagramData);
            return;
        }
    
        const currentModelId = diagramData.models[diagramData.currentModel]?.id;
        if (!currentModelId) {
            console.error("Invalid currentModel ID:", currentModelId);
            return;
        }
    
        setDiagramData((prevData) => {
            if (!prevData) return prevData;
    
            // Vérifie si une mise à jour est vraiment nécessaire
            const isAlreadyHighlighted = prevData.nodes.some(
                (node) => node.id === currentModelId && node.data.isSelected === true
            );
    
            if (isAlreadyHighlighted) {
                return prevData; // Pas de mise à jour si déjà sélectionné
            }
    
            const updatedNodes = prevData.nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    isSelected: node.id === currentModelId,
                },
            }));
    
            return {
                ...prevData,
                nodes: updatedNodes,
            };
        });
    };
    

      

    const getDependencyCodes = (model: ModelData) => {
        return model.dependencies?.map(d => {
            return diagramData?.models.filter((m) => m.id === d).map(m => m.code)
        }
        )
    }

    const onLayout = useCallback(
        ({ direction = "RIGHT" }) => {
            const opts = direction;
            getLayoutedElements(diagramData.nodes, diagramData.edges, opts).then(
                ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
                    setDiagramData((prev) => ({
                        ...prev,
                        nodes: layoutedNodes,
                        edges: layoutedEdges,
                    }));
                    setTimeout(() => fitView(), 0);
                },
            );
        },
        [diagramData],
    );

    useEffect(() => {
        if (!diagramData.diagramId && diagramData.models.length > 0 && !isSaving) {
            setIsSaving(true); // Empêche un deuxième appel
            
            const currentModelId = diagramData.models[diagramData.currentModel]?.id;
            const isAlreadyHighlighted = diagramData.nodes.some(
                (node) => node.id === currentModelId && node.data.isSelected
            );
    
            if (!isAlreadyHighlighted) {
                changeHiglightedModel();
                console.log("changing selected");
            }
    
            if (JSON.stringify(lastSavedDiagram.current) !== JSON.stringify(diagramData)) {
                saveDiagram(diagramData, token).then((diagramId) => {
                    if (diagramId !== -1) {
                        setDiagramData((prev) => ({
                            ...prev,
                            diagramId: diagramId
                        }));
                        lastSavedDiagram.current = { ...diagramData, diagramId };
                    }
                    setIsSaving(false); // Réactive la possibilité de sauvegarder
                }).catch(() => setIsSaving(false)); // Évite un blocage en cas d’erreur
            } else {
                setIsSaving(false);
            }
        }
    }, [diagramData]);

    useLayoutEffect(() => {
        onLayout({ direction: 'RIGHT' });
    }, [diagramData.nodes.length, diagramData.edges.length
    ]);

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
                    {stage === 1 ? <Button onClick={onValidate}>Validate diagram</Button> : null}
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
                                            nodes={diagramData.nodes}
                                            edges={diagramData.edges}
                                            onNodesChange={onNodesChange}
                                            onEdgesChange={onEdgesChange}
                                            onConnect={onConnect}
                                            defaultEdgeOptions={defaultEdgeOptions}
                                            nodeTypes={nodeTypes as any}
                                            edgeTypes={edgeTypes}
                                            connectionMode={ConnectionMode.Loose}
                                            fitView
                                            minZoom={0.1}
                                        >
                                            <MiniMap zoomable pannable />
                                            <Background />
                                            <ZoomSlider />
                                        </ReactFlow>
                                    </ResizablePanel>
                                </>
                            );

                        case 2:
                            if (!diagramData) {
                                return null
                            }
                            else return (
                                <>
                                    {/* Bloc spécifique au case 2 */}

                                    <ResizablePanel defaultSize={40} minSize={20}>
                                        <ResizablePanelGroup direction="vertical">
                                            {/* Bloc 2 (contenu vertical) */}
                                            <ResizablePanel defaultSize={60} minSize={20}>
                                                <ModelPrompt stage={stage} onGenerate={updateModelCode} previousCodes={getDependencyCodes(diagramData.models[diagramData.currentModel])} model={diagramData.models[diagramData.currentModel]} />
                                            </ResizablePanel>
                                            <ResizableHandle />
                                            <ResizablePanel defaultSize={40} minSize={20} onResize={() => fitView()}>
                                            
                                                <ReactFlow
                                                    nodes={diagramData.nodes}
                                                    edges={diagramData.edges}
                                                    onNodesChange={onNodesChange}
                                                    onEdgesChange={onEdgesChange}
                                                    onConnect={onConnect}
                                                    defaultEdgeOptions={defaultEdgeOptions}
                                                    nodeTypes={nodeTypes as any}
                                                    edgeTypes={edgeTypes}
                                                    connectionMode={ConnectionMode.Loose}
                                                    fitView
                                                    minZoom={0.1}
                                                >
                                                    <Background />
                                                    <ZoomSlider />
                                                </ReactFlow>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel className='relative' defaultSize={60} minSize={20}>
                                    <div className='h-12 w-full bg-background'>
                                        <StepShower diagramData={diagramData} />
                                    </div>
                                        <CodeMirror
                                            value={code}
                                            className="h-full"
                                            onChange={(value) => setCode(value)}
                                            theme={theme === "dark" ? githubDark : githubLight}
                                            extensions={[python()]}
                                        />
                                        
                                        <Button className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 w-auto px-4 py-2 bg-foreground text-background rounded" onClick={onValidateModel}>Validate model</Button>

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


