import {
	Background,
	ConnectionMode,
	type Edge,
	type EdgeChange,
	MiniMap,
	type Node,
	type NodeChange,
	ReactFlow,
	XYPosition,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import BiDirectionalEdge from "@/components/custom/reactFlow/BiDirectionalEdge.tsx";
import { ZoomSlider } from "@/components/zoom-slider";
import { getLayoutedElements } from "@/lib/getLayoutedElements.ts";
import { useDnD } from "@/providers/DnDContext.tsx";
import type { ReactFlowInput, ReactFlowModelData } from "@/types";
import { type ComponentProps, useCallback, useRef, useState, useEffect } from "react";
import ModelNode from "./reactFlow/ModelNode.tsx";

import { client } from "@/api/client.ts";
import { useToast } from "@/hooks/use-toast.ts";
import { modelToReactflow } from "@/lib/Parser/modelToReactflow.ts";
import { FindParentNodeId } from "@/lib/findParentNodeId.ts";
import { v4 as uuidv4 } from "uuid";

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

export function ModelViewEditor({ 
	models, 
	onChange 
}: { 
	models: ReactFlowInput; 
	onChange?: (structure: ReactFlowInput) => void 
}) {
	const { fitView, screenToFlowPosition } = useReactFlow();
	const [dragId] = useDnD();
	const { toast } = useToast();
	
	
	const nodes = models?.nodes || [];
	const edges = models?.edges || [];

	const onNodesChange = useCallback(
		(changes: NodeChange<Node<ReactFlowModelData>>[]) => {
			if (!onChange || !models) return;
			
			const updatedNodes = applyNodeChanges(changes, nodes);
			onChange({
				...models,
				nodes: updatedNodes,
			});
		},
		[models, onChange, nodes],
	);

	const onEdgesChange = useCallback(
		(changes: EdgeChange<Edge>[]) => {
			if (!onChange || !models) return;
			
			const updatedEdges = applyEdgeChanges(changes, edges);
			onChange({
				...models,
				edges: updatedEdges,
			});
		}, 
		[models, onChange, edges]
	);

	const onLayoutFn = useCallback(
		({ direction = "RIGHT" }) => {
			const opts = direction;
			if (models) {
				getLayoutedElements(
					models.nodes,
					models.edges,
					opts,
				).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
					if (onChange) {
						onChange({
							...models,
							nodes: layoutedNodes,
							edges: layoutedEdges,
						});
						setTimeout(() => fitView(), 200);
					}
				});
			}
		},
		[models, fitView, onChange],
	);

	const onOrganizeClick = () => {
		onLayoutFn({ direction: "RIGHT" });
	};

	const onInfoClick = (state: boolean) => {
		toggleInfoForAllNodes(state);
	};

	const toggleInfoForAllNodes = (show: boolean) => {
		if (!onChange || !models) return;
		
		const updatedNodes = models.nodes.map((node) => ({
			...node,
			data: {
				...node.data,
				alwaysShowExtraInfo: show,
			},
		}));
		
		onChange({
			...models,
			nodes: updatedNodes,
		});
	};

	const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>(
		(event) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = "move";
		},
		[],
	);

	const onDrop = useCallback<
		NonNullable<ComponentProps<typeof ReactFlow>["onDrop"]>
	>(
		async (event) => {
			event.preventDefault();

			// check if the dropped element is valid
			if (!dragId || !onChange || !models) {
				return;
			}

			const { data, error } = await client.GET("/model/{id}/recursive", {
				params: {
					path: {
						id: dragId,
					},
				},
			});

			if (error) {
				toast({
					title: "An error occured",
					description: "Can't load model data",
					variant: "destructive",
				});
				return;
			}

			if (!models?.nodes || !data) return;

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			const dragReactFlowData = modelToReactflow(data);

			const dragRootModel = dragReactFlowData.nodes.find(
				(model) => model.id === dragId,
			);

			const targetId = FindParentNodeId(models?.nodes, position);
			const parentNode = models.nodes.find((n) => n.id === targetId);

			if (targetId && dragRootModel && parentNode) {
				const localX = position.x - parentNode.position.x;
				const localY = position.y - parentNode.position.y;

				dragRootModel.parentId = targetId;
				dragRootModel.extent = "parent";
				dragRootModel.id = uuidv4();
				dragRootModel.position = { x: localX, y: localY };
			}
			else if (dragRootModel) {
				dragRootModel.id = uuidv4();
				dragRootModel.position = position;
			}

			onChange({
				nodes: [...models.nodes, ...dragReactFlowData.nodes],
				edges: [...models.edges, ...dragReactFlowData.edges],
			});
		},
		[screenToFlowPosition, dragId, toast, models, onChange],
	);

	const onConnect = useCallback<
		NonNullable<ComponentProps<typeof ReactFlow>["onConnect"]>
	>(
		(connection) => {
			if (!onChange || !models) return;
			
			const updatedEdges = addEdge(connection, models.edges);
			onChange({
				...models,
				edges: updatedEdges,
			});
		}, 
		[models, onChange]
	);

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
				onDrop={onDrop}
				onDragOver={onDragOver}
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