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

export type Edge = {
	id: string;
	source: string;
	sourceHandle: string;
	target: string;
	targetHandle: string;
	type: string;
};
