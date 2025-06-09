import {
	Background,
	ConnectionMode,
	type Edge,
	type EdgeChange,
	MiniMap,
	type NodeChange,
	ReactFlow,
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
import type { EdgeData, ReactFlowInput } from "@/types";
import { type ComponentProps, useCallback, useEffect, useRef } from "react";
import ModelNode from "./reactFlow/ModelNode.tsx";

import { client } from "@/api/client.ts";
import { useToast } from "@/hooks/use-toast.ts";
import { modelToReactflow } from "@/lib/Parser/modelToReactflow.ts";
import { findHolderId } from "@/lib/findHolderId.ts";
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

type Props = {
	models: ReactFlowInput;
	onChange?: (structure: ReactFlowInput) => void;
	isLoadingNodes?: boolean;
};

export function ModelViewEditor({ models, onChange, isLoadingNodes }: Props) {
	const { fitView, screenToFlowPosition, getInternalNode } = useReactFlow();
	const [dragId] = useDnD();
	const { toast } = useToast();
	const needAutoFitView = useRef(true);

	const nodes = models?.nodes || [];
	const edges = models?.edges || [];

	const onNodesChange = useCallback(
		(changes: NodeChange<(typeof nodes)[number]>[]) => {
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
		(changes: EdgeChange<(typeof edges)[number]>[]) => {
			if (!onChange || !models) return;

			const updatedEdges = applyEdgeChanges<(typeof edges)[number]>(
				changes,
				edges,
			);
			onChange({
				...models,
				edges: updatedEdges,
			});
		},
		[models, onChange, edges],
	);

	const onLayoutFn = async ({ direction = "RIGHT" }) => {
		const opts = direction;
		if (models) {
			const { nodes: layoutedNodes, edges: layoutedEdges } =
				await getLayoutedElements(models.nodes, models.edges, opts);
			onChange?.({
				...models,
				nodes: layoutedNodes,
				edges: layoutedEdges,
			});
			needAutoFitView.current = true;
		}
	};

	const onOrganizeClick = () => {
		onLayoutFn({ direction: "RIGHT" });
	};

	const onInfoClick = (state: boolean) => {
		toggleInfoForAllNodes(state);
	};

	const toggleInfoForAllNodes = (show: boolean) => {
		if (!onChange || !models) return;

		console.log({ nodes, edges });

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

	const onDrop: NonNullable<
		ComponentProps<typeof ReactFlow>["onDrop"]
	> = async (event) => {
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

		const dragReactFlowData = modelToReactflow(data, dragId);

		const dragRootModel = dragReactFlowData.nodes.find(
			(model) => model.id === dragId,
		);

		const targetId = FindParentNodeId(models?.nodes, position, getInternalNode);
		const parentNode = models.nodes.find((n) => n.id === targetId);

		if (targetId && dragRootModel && parentNode) {
			const localX = position.x - parentNode.position.x;
			const localY = position.y - parentNode.position.y;

			dragRootModel.parentId = targetId;
			dragRootModel.extent = "parent";
			dragRootModel.id = `${targetId}/${uuidv4()}`;
			dragRootModel.position = { x: localX, y: localY };
		}

		onChange({
			nodes: [...models.nodes, ...dragReactFlowData.nodes],
			edges: [...models.edges, ...dragReactFlowData.edges],
		});
	};

	const onConnect: NonNullable<
		ComponentProps<typeof ReactFlow>["onConnect"]
	> = (connection) => {
		if (!onChange || !models) return;

		const holderId = findHolderId(connection.source, connection.target);
		if (holderId === null) {
			toast({
				title: "Invalid action",
				description: "Only direct connection are allowed",
				variant: "destructive",
			});
			return;
		}
		const newEdge: Edge<EdgeData> = {
			id: `${connection.source}->${connection.target}`,
			source: connection.source,
			sourceHandle: connection.sourceHandle,
			target: connection.target,
			targetHandle: connection.targetHandle,
			data: {
				holderId: holderId,
			},
		};

		const updatedEdges = addEdge(newEdge, models.edges);
		onChange({
			...models,
			edges: updatedEdges,
		});
	};

	useEffect(() => {
		if (
			needAutoFitView.current &&
			models &&
			edges &&
			!isLoadingNodes &&
			models.nodes.length > 0
		) {
			fitView();
			needAutoFitView.current = false;
		}
	}, [fitView, models, edges, isLoadingNodes]);

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
				onInit={(instance) => {
					setTimeout(() => {
						instance.fitView();
					});
				}}
			>
				<MiniMap zoomable pannable />
				<ZoomSlider onOrganizeClick={onOrganizeClick} />
				<Background />
			</ReactFlow>
		</div>
	);
}
