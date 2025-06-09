import {
	Background,
	ConnectionMode,
	type Edge,
	type EdgeChange,
	MiniMap,
	type NodeChange,
	ReactFlow,
	ReactFlowProvider,
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
};

export function ModelView({ models }: Props) {
	const nodes = models?.nodes || [];
	const edges = models?.edges || [];

	return (
		<div className="h-full w-full flex flex-col">
			<ReactFlowProvider>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					fitView
					minZoom={0.1}
					defaultEdgeOptions={defaultEdgeOptions}
					connectionMode={ConnectionMode.Loose}
					onInit={(instance) => {
						setTimeout(() => {
							instance.fitView();
						});
					}}
				>
					<Background />
				</ReactFlow>
			</ReactFlowProvider>
		</div>
	);
}
