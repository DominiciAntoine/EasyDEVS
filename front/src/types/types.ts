import { Edge, Node } from '@xyflow/react';

export type NodeData = {
    modelType: "atomic" | "coupled"
    label: string
    inputPorts?: { id: string }[]
    outputPorts?: { id: string }[]
    isSelected?: boolean
}

export type ModelData = 
{
    id: string
    name: string
    code: string
    dependencies?: string[]
    type: "atomic" | "coupled"

}

export type DiagramDataType =
{
    diagramId : number | null
    name: string,
    nodes: Node<NodeData>[]
    edges: Edge[]
    currentModel : number
    models: ModelData[]
}

export type User = {
    id: number
    email: string, 
}

export type LLMResponse = {
	models: {
		id: string;
		type: "atomic" | "coupled";
		ports?: {
			out?: string[];
			in?: string[];
		};
		components?: string[];
	}[];
	connections: {
		from: {
			model: string;
			port: string;
		};
		to: {
			model: string;
			port: string;
		};
	}[];
};

export type ReactFlowInput = {
	id: string;
	type: string;
	data: Data;
	style: Style;
	position: Position;
	parentId?: string;
	extent?: "parent";
};

export type Data = {
	modelType: string;
	label: string;
	inputPorts: InputPort[];
	outputPorts: OutputPort[];
};

export type InputPort = {
	id: string;
};

export type OutputPort = {
	id: string;
};

export type Style = {
	width: number;
	height: number;
};

export type Position = {
	x: number;
	y: number;
};
