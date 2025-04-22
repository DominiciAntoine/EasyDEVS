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
import { type ComponentProps, useCallback, useRef, useState } from "react";
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

export function ModelViewEditor({ models }: { models: ReactFlowInput }) {
	const [ReactFlowData, setReactFlowData] = useState<
		ReactFlowInput | undefined
	>(models);
	const { fitView } = useReactFlow();
	const { screenToFlowPosition } = useReactFlow();
	const [dragId, setdragId] = useDnD();
	const { toast } = useToast();

	const onNodesChange = useCallback(
		(changes: NodeChange<Node<ReactFlowModelData>>[]) => {
			setReactFlowData((prev) =>
				prev
					? {
							...prev,
							nodes: applyNodeChanges(changes, prev.nodes),
						}
					: undefined,
			);
		},
		[],
	);

	const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
		setReactFlowData((prev) =>
			prev
				? {
						...prev,
						edges: applyEdgeChanges(changes, prev.edges),
					}
				: undefined,
		);
	}, []);

	const onOrganizeClick = () => {
		onLayoutRef.current({ direction: "RIGHT" });
	};

	const onInfoClick = (state: boolean) => {
		toggleInfoForAllNodes(state);
	};

	const toggleInfoForAllNodes = (show: boolean) => {
		setReactFlowData((prev) =>
			prev
				? {
						...prev,
						nodes: prev.nodes.map((node) => ({
							...node,
							data: {
								...node.data,
								alwaysShowExtraInfo: show,
							},
						})),
					}
				: undefined,
		);
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
			if (!dragId) {
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
			}

			if (!ReactFlowData?.nodes || !data) return;

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			const dragReactFlowData = modelToReactflow(data);

			const dragRootModel = dragReactFlowData.nodes.find(
				(model) => model.id === dragId,
			);

			const targetId = FindParentNodeId(ReactFlowData?.nodes, position);
			if (targetId && dragRootModel) {
				dragRootModel.parentId = targetId;
				dragRootModel.extent = "parent";
				dragRootModel.id = uuidv4();
				dragRootModel.data.alwaysShowExtraInfo = true;
			}

			setReactFlowData((prev) =>
				prev
					? {
							nodes: [...prev.nodes, ...dragReactFlowData.nodes],
							edges: [...prev.edges, ...dragReactFlowData.edges],
						}
					: dragReactFlowData,
			);
		},
		[screenToFlowPosition, dragId, toast, ReactFlowData],
	);

	const onConnect = useCallback<
		NonNullable<ComponentProps<typeof ReactFlow>["onConnect"]>
	>((connection) => {
		setReactFlowData((prev) =>
			prev
				? {
						...prev,
						edges: addEdge(connection, prev.edges),
					}
				: undefined,
		);
	}, []);

	const onLayoutRef = useRef(({ direction = "RIGHT" }) => {
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
							: undefined,
					);
					setTimeout(() => fitView(), 200);
				},
			);
		}
	});

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
