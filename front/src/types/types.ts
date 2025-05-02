import type { Edge, Node, Position } from "@xyflow/react";

export type ReactFlowInput = {
	nodes: Node<ReactFlowModelData>[];
	edges: Edge[];
};

export type ReactFlowPort = { id: string };

export type ReactFlowModelData = {
	id: string;
	modelType: "atomic" | "coupled";
	label: string;
	inputPorts?: ReactFlowPort[];
	outputPorts?: ReactFlowPort[];
	toolbarVisible?: boolean;
	toolbarPosition?: Position | string;
	alwaysShowToolbar?: boolean;
	alwaysShowExtraInfo?: boolean;
};
