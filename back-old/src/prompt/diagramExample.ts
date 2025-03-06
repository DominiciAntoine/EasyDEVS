interface AtomicModel {
	id: string;
	type: "atomic";
	ports: {
		in?: string[];
		out?: string[];
	};
}

interface CoupledModel {
	id: string;
	type: "coupled";
	components: string[];
}

type Model = AtomicModel | CoupledModel;

interface Connection {
	from: {
		model: string;
		port: string;
	};
	to: {
		model: string;
		port: string;
	};
}

interface DiagramExample {
	models: Model[];
	connections: Connection[];
}

const diagramExample: DiagramExample = {
	models: [
		{
			id: "coupled_switch",
			type: "coupled",
			components: ["switch_kitchen"],
		},
		{
			id: "switch_kitchen",
			type: "atomic",
			ports: {
				out: ["signal", "signal2"],
			},
		},
		{
			id: "switch_bedroom",
			type: "atomic",
			ports: {
				out: ["signal"],
			},
		},
		{
			id: "light_kitchen_1",
			type: "atomic",
			ports: {
				in: ["switch_signal"],
			},
		},
		{
			id: "light_kitchen_2",
			type: "atomic",
			ports: {
				in: ["switch_signal"],
			},
		},
		{
			id: "light_bedroom",
			type: "atomic",
			ports: {
				in: ["switch_signal"],
			},
		},
		{
			id: "coupled_kitchen",
			type: "coupled",
			components: ["light_kitchen_1", "light_kitchen_2"],
		},
	],
	connections: [
		{
			from: {
				model: "switch_kitchen",
				port: "signal",
			},
			to: {
				model: "light_kitchen_1",
				port: "switch_signal",
			},
		},
		{
			from: {
				model: "switch_kitchen",
				port: "signal",
			},
			to: {
				model: "light_kitchen_2",
				port: "switch_signal",
			},
		},
		{
			from: {
				model: "switch_bedroom",
				port: "signal",
			},
			to: {
				model: "light_bedroom",
				port: "switch_signal",
			},
		},
	],
};

export { diagramExample };
