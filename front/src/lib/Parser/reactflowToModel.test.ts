import { describe, assert, it } from "vitest";
import { mockApiModel, mockReactFlowModelLibrary } from "./__tests__/fakeData";
import { mockApiModel as mockApiModel2, mockReactFlowModelLibrary as mockReactFlowModelLibrary2 } from "./__tests__/fakeData2";
import { reactflowToModel } from "./reactflowToModel";

describe("reactflowToModel", () => {
	it("should convert a model library to api request", () => {
		assert.deepEqual(reactflowToModel(mockReactFlowModelLibrary), mockApiModel)
	});
	it("should convert a model library to api request 2", () => {
		assert.deepEqual(reactflowToModel(mockReactFlowModelLibrary2), mockApiModel2)
	});
});
