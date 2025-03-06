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
	ports?: {
		in?: string[];
		out?: string[];
	};
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

const diagramExample1: DiagramExample = {
	models: [
		{
			id: "M1",
			type: "coupled",
			ports: { in: ["i1"], out: ["o1"] },
			components: ["M2"],
		},
		{
			id: "M2",
			type: "coupled",
			ports: { in: ["i2"], out: ["o2"] },
			components: ["M3"],
		},
		{ id: "M3", type: "atomic", ports: { in: ["i3"], out: ["o3"] } },
		{ id: "M4", type: "atomic", ports: { in: ["i4"], out: ["o4"] } },
	],
	connections: [
		{ from: { model: "M4", port: "i4" }, to: { model: "M3", port: "o3" } },
	],
};

export { diagramExample1 };
