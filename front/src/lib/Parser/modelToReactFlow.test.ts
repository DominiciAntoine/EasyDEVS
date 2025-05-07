import type { components } from "@/api/v1";
import type { ReactFlowInput } from "@/types";
import { describe, expect, it } from "vitest";
import { modelToReactflow } from "./modelToReactflow";

const reactFlowModelLibrary: ReactFlowInput = {
	nodes: [
		{
			id: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
			type: "resizer",
			data: {
				id: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
				modelType: "coupled",
				label: "Light_group",
				inputPorts: [
					{
						id: "82762b6b-1aa6-4895-99b4-6206e3b4a1a7",
					},
				],
				outputPorts: [],
			},
			position: {
				x: -35.00000000000001,
				y: -134.00000000000003,
			},
			measured: {
				width: 953,
				height: 840,
			},
			width: 953,
			height: 840,
		},
		{
			id: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			type: "resizer",
			data: {
				id: "020f4dbd-9b91-44f5-9ae0-ae8847e29267",
				modelType: "coupled",
				label: "sub_light_group",
				inputPorts: [
					{
						id: "47b48e13-09fa-40f6-b924-f9e764c00b84",
					},
				],
				outputPorts: [
					{
						id: "fa922221-b3ce-4834-8f8b-e88e783a3eca",
					},
				],
			},
			position: {
				x: 82.82179269859705,
				y: 70.6804920892271,
			},
			parentId: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
			extent: "parent",
			measured: {
				width: 391,
				height: 360,
			},
			width: 391,
			height: 360,
		},
		{
			id: "0742ce95-d349-486f-9701-96f40d918f6a",
			type: "resizer",
			data: {
				id: "2137aa67-c857-4881-9810-2723438c8680",
				modelType: "atomic",
				label: "Light",
				inputPorts: [
					{
						id: "e31fd581-2222-4d28-930e-66c36908b33b",
					},
				],
				outputPorts: [
					{
						id: "361f5fbf-65b8-4d85-8fc6-a45413091cfa",
					},
				],
			},
			position: {
				x: 83.69736389555317,
				y: 103.14130060936999,
			},
			parentId: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			extent: "parent",
			measured: {
				width: 137,
				height: 147,
			},
			width: 137,
			height: 147,
		},
		{
			id: "4d3cf815-531b-4dc7-99c7-5a58ed6771b6",
			type: "resizer",
			data: {
				id: "2137aa67-c857-4881-9810-2723438c8680",
				modelType: "atomic",
				label: "Light",
				inputPorts: [
					{
						id: "976f05da-9ae5-423a-aed2-f2f46c0d074a",
					},
				],
				outputPorts: [],
			},
			position: {
				x: 603.4590519370295,
				y: 207.16274199134452,
			},
			parentId: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
			extent: "parent",
			measured: {
				width: 200,
				height: 200,
			},
			width: 200,
			height: 200,
		},
	],
	edges: [
		{
			type: "step",
			animated: true,
			style: {
				zIndex: 1000,
			},
			source: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
			sourceHandle: "in-internal-82762b6b-1aa6-4895-99b4-6206e3b4a1a7",
			target: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			targetHandle: "in-47b48e13-09fa-40f6-b924-f9e764c00b84",
			id: "xy-edge__fa5af68e-c879-4f77-bc93-c9e655ac77a9in-internal-82762b6b-1aa6-4895-99b4-6206e3b4a1a7-8a1fd02d-e429-43ff-ac8f-cd9c511bb310in-47b48e13-09fa-40f6-b924-f9e764c00b84",
		},
		{
			type: "step",
			animated: true,
			style: {
				zIndex: 1000,
			},
			source: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			sourceHandle: "in-internal-47b48e13-09fa-40f6-b924-f9e764c00b84",
			target: "0742ce95-d349-486f-9701-96f40d918f6a",
			targetHandle: "in-e31fd581-2222-4d28-930e-66c36908b33b",
			id: "xy-edge__8a1fd02d-e429-43ff-ac8f-cd9c511bb310in-internal-47b48e13-09fa-40f6-b924-f9e764c00b84-0742ce95-d349-486f-9701-96f40d918f6ain-e31fd581-2222-4d28-930e-66c36908b33b",
		},
		{
			type: "step",
			animated: true,
			style: {
				zIndex: 1000,
			},
			source: "0742ce95-d349-486f-9701-96f40d918f6a",
			sourceHandle: "out-361f5fbf-65b8-4d85-8fc6-a45413091cfa",
			target: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			targetHandle: "out-internal-fa922221-b3ce-4834-8f8b-e88e783a3eca",
			id: "xy-edge__0742ce95-d349-486f-9701-96f40d918f6aout-361f5fbf-65b8-4d85-8fc6-a45413091cfa-8a1fd02d-e429-43ff-ac8f-cd9c511bb310out-internal-fa922221-b3ce-4834-8f8b-e88e783a3eca",
		},
		{
			type: "step",
			animated: true,
			style: {
				zIndex: 1000,
			},
			source: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			sourceHandle: "out-fa922221-b3ce-4834-8f8b-e88e783a3eca",
			target: "4d3cf815-531b-4dc7-99c7-5a58ed6771b6",
			targetHandle: "in-976f05da-9ae5-423a-aed2-f2f46c0d074a",
			id: "xy-edge__8a1fd02d-e429-43ff-ac8f-cd9c511bb310out-fa922221-b3ce-4834-8f8b-e88e783a3eca-4d3cf815-531b-4dc7-99c7-5a58ed6771b6in-976f05da-9ae5-423a-aed2-f2f46c0d074a",
		},
	],
};

// Ajouter components, ports, connections
const apiModel: components["schemas"]["response.ModelResponse"][] = [
	{
		id: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
		code: "",
		components: [
			{
				modelId: "020f4dbd-9b91-44f5-9ae0-ae8847e29267",
				componentId: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
			},
			{
				modelId: "2137aa67-c857-4881-9810-2723438c8680",
				componentId: "4d3cf815-531b-4dc7-99c7-5a58ed6771b6",
			},
		],
		connections: [
			{
				from: {
					port: "82762b6b-1aa6-4895-99b4-6206e3b4a1a7",
					modelId: "fa5af68e-c879-4f77-bc93-c9e655ac77a9",
				},
				to: {
					port: "47b48e13-09fa-40f6-b924-f9e764c00b84",
					modelId: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
				},
			},
			{
				from: {
					port: "fa922221-b3ce-4834-8f8b-e88e783a3eca",
					modelId: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
				},
				to: {
					port: "976f05da-9ae5-423a-aed2-f2f46c0d074a",
					modelId: "4d3cf815-531b-4dc7-99c7-5a58ed6771b6",
				},
			},
		],
		description: "",
		metadata: {
			position: {
				x: -35.00000000000001,
				y: -134.00000000000003,
			},
			style: {
				width: 953,
				height: 840,
			},
		},
		name: "Light_group",
		ports: [
			{
				type: "in",
				id: "82762b6b-1aa6-4895-99b4-6206e3b4a1a7",
			},
		],
		type: "coupled",
		libId: undefined,
	},
	{
		id: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
		code: "",
		components: [
			{
				componentId: "0742ce95-d349-486f-9701-96f40d918f6a",
				modelId: "2137aa67-c857-4881-9810-2723438c8680",
			},
		],
		connections: [
			{
				from: {
					port: "47b48e13-09fa-40f6-b924-f9e764c00b84",
					modelId: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
				},
				to: {
					port: "e31fd581-2222-4d28-930e-66c36908b33b",
					modelId: "0742ce95-d349-486f-9701-96f40d918f6a",
				},
			},
			{
				from: {
					port: "361f5fbf-65b8-4d85-8fc6-a45413091cfa",
					modelId: "0742ce95-d349-486f-9701-96f40d918f6a",
				},
				to: {
					port: "fa922221-b3ce-4834-8f8b-e88e783a3eca",
					modelId: "8a1fd02d-e429-43ff-ac8f-cd9c511bb310",
				},
			},
		],
		description: "",
		metadata: {
			position: {
				x: 82.82179269859705,
				y: 70.6804920892271,
			},
			style: {
				width: 391,
				height: 360,
			},
		},
		name: "sub_light_group",
		ports: [
			{
				id: "47b48e13-09fa-40f6-b924-f9e764c00b84",
				type: "in",
			},
			{
				id: "fa922221-b3ce-4834-8f8b-e88e783a3eca",
				type: "out",
			},
		],
		type: "coupled",
		libId: undefined,
	},
	{
		id: "0742ce95-d349-486f-9701-96f40d918f6a",
		code: "",
		components: [],
		connections: [],
		description: "",
		metadata: {
			position: {
				x: 83.69736389555317,
				y: 103.14130060936999,
			},
			style: {
				width: 137,
				height: 147,
			},
		},
		name: "Light",
		ports: [
			{
				id: "e31fd581-2222-4d28-930e-66c36908b33b",
				type: "in",
			},
			{
				id: "361f5fbf-65b8-4d85-8fc6-a45413091cfa",
				type: "out",
			},
		],
		type: "atomic",
		libId: undefined,
	},
	{
		id: "4d3cf815-531b-4dc7-99c7-5a58ed6771b6",
		code: "",
		components: [],
		connections: [],
		description: "",
		metadata: {
			position: {
				x: 603.4590519370295,
				y: 207.16274199134452,
			},
			style: {
				width: 200,
				height: 200,
			},
		},
		name: "Light",
		ports: [
			{
				id: "976f05da-9ae5-423a-aed2-f2f46c0d074a",
				type: "in",
			},
		],
		type: "atomic",
		libId: undefined,
	},
];

describe("modelToReactflow", () => {
	it("should convert a model library to api request", () => {
		expect(modelToReactflow(apiModel)).toStrictEqual(reactFlowModelLibrary);
	});
});
