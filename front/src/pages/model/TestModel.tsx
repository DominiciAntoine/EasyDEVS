import {
    Background,
    ConnectionMode,
    MiniMap,
    ReactFlow,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import BiDirectionalEdge from "@/components/custom/reactFlow/BiDirectionalEdge.tsx";
import { ZoomSlider } from "@/components/zoom-slider";
import { useCallback, useState } from "react";
import ModelNode from "../../components/custom/reactFlow/ModelNode";

// Données statiques pour les nœuds
const initialNodes = [
    {
        id: 'node-1',
        type: 'resizer',
        position: { x: 100, y: 100 },
        data: {
            label: 'Node 1',
            modelId: '1',
            modelType: 'atomic',
            alwaysShowExtraInfo: true,
            inputPorts: [
                { id: 'input-1', name: 'Input 1' },
                { id: 'input-2', name: 'Input 2' }
            ],
            outputPorts: [
                { id: 'output-1', name: 'Output 1' },
                { id: 'output-2', name: 'Output 2' }
            ]
        }
    },
    {
        id: 'node-2',
        type: 'resizer',
        position: { x: 400, y: 100 },
        data: {
            label: 'Node 2',
            modelId: '2',
            modelType: 'atomic',
            alwaysShowExtraInfo: true,
            inputPorts: [
                { id: 'input-3', name: 'Input 3' }
            ],
            outputPorts: [
                { id: 'output-3', name: 'Output 3' }
            ]
        }
    },
    {
        id: 'node-3',
        type: 'resizer',
        position: { x: 250, y: 300 },
        data: {
            label: 'Coupled Node',
            modelId: '3',
            modelType: 'coupled',
            alwaysShowExtraInfo: true,
            inputPorts: [
                { id: 'input-4', name: 'Input 4' }
            ],
            outputPorts: [
                { id: 'output-4', name: 'Output 4' }
            ]
        }
    }
];

// Données statiques pour les connexions
const initialEdges = [
    {
        id: 'edge-1-2',
        source: 'node-1',
        sourceHandle: 'out-output-1',
        target: 'node-2',
        targetHandle: 'in-input-3',
        type: 'step',
        animated: true
    }
];

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

export function TestModel() {
    // État pour stocker les données ReactFlow
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const { fitView } = useReactFlow();

    // Gestionnaire des changements de nœuds
    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    // Gestionnaire des changements de connexions
    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    // Gestionnaire de création de connexions
    const onConnect = useCallback((params) => {
        console.log('Trying to connect:', params);
        setEdges((eds) => addEdge({
            ...params,
            type: 'step',
            animated: true,
            style: { zIndex: 1000 }
        }, eds));
    }, []);

    // Fonction pour organiser les nœuds
    const onOrganizeClick = () => {
        // Ici, vous pourriez appeler votre fonction getLayoutedElements
        // Pour simplifier, on ajuste juste la position
        setNodes((nds) => 
            nds.map((node, index) => ({
                ...node,
                position: { x: 100 + index * 200, y: 100 + (index % 2) * 150 }
            }))
        );
        setTimeout(() => fitView(), 200);
    };

    // Fonction pour afficher/masquer les infos
    const onInfoClick = (state) => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    alwaysShowExtraInfo: state,
                },
            }))
        );
    };

    return (
        <div className="h-full w-full flex flex-col">
            <ReactFlow
                nodes={nodes}
                edges={edges}
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
                <ZoomSlider
                    onOrganizeClick={onOrganizeClick}
                    onInfoClick={onInfoClick}
                />
                <Background />
            </ReactFlow>
        </div>
    );
}