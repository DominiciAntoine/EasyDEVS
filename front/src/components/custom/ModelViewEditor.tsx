import {
	Background,
	ConnectionMode,
	type Edge,
	type EdgeChange,
	MiniMap,
	type Node,
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
import type { ReactFlowInput, ReactFlowModelData } from "@/types";
import { type ComponentProps, useCallback, useRef, useState } from "react";
import ModelNode from "./reactFlow/ModelNode.tsx";

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
			console.log("we need to save");
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
			>
				<MiniMap zoomable pannable />
				<ZoomSlider onOrganizeClick={onOrganizeClick} />
				<Background />
			</ReactFlow>
		</div>
	);
}
