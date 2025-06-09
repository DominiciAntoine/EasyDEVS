import { assert, describe, it } from "vitest";
import { mockApiModel, mockReactFlowModelLibrary } from "./__tests__/fakeData";
import {
	mockApiModel as mockApiModel2,
	mockReactFlowModelLibrary as mockReactFlowModelLibrary2,
} from "./__tests__/fakeData2";
import { modelToReactflow } from "./modelToReactflow";

describe("modelToReactflow", () => {
	it("should convert a model library to api request nodes", () => {
		assert.deepEqual(
			modelToReactflow(
				mockApiModel,
				"2fe58217-47ae-4527-8983-ac8b54754abf",
			).nodes.sort((a, b) => a.id.localeCompare(b.id)),
			mockReactFlowModelLibrary.nodes.sort((a, b) => a.id.localeCompare(b.id)),
		);
	});
	it("should convert a model library to api request edges", () => {
		assert.deepEqual(
			modelToReactflow(
				mockApiModel,
				"2fe58217-47ae-4527-8983-ac8b54754abf",
			).edges.sort((a, b) => a.id.localeCompare(b.id)),
			mockReactFlowModelLibrary.edges.sort((a, b) => a.id.localeCompare(b.id)),
		);
	});
	it("should convert a model library to api request nodes 2", () => {
		assert.deepEqual(
			modelToReactflow(
				mockApiModel2,
				"63cc59b1-45e7-4861-8c1d-d35f22de4194",
			).nodes.sort((a, b) => a.id.localeCompare(b.id)),
			mockReactFlowModelLibrary2.nodes.sort((a, b) => a.id.localeCompare(b.id)),
		);
	});
	it("should convert a model library to api request edges 2", () => {
		assert.deepEqual(
			modelToReactflow(
				mockApiModel2,
				"63cc59b1-45e7-4861-8c1d-d35f22de4194",
			).edges.sort((a, b) => a.id.localeCompare(b.id)),
			mockReactFlowModelLibrary2.edges.sort((a, b) => a.id.localeCompare(b.id)),
		);
	});
});
