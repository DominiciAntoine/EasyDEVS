import { describe, expect, it } from "vitest";
import { reactflowToModel } from "./reactflowToModel";
import { mockApiModel, mockReactFlowModelLibrary } from "./__tests__/fakeData";

describe("reactflowToModel", () => {
	it("should convert a model library to api request", () => {
		expect(reactflowToModel(mockReactFlowModelLibrary)).toStrictEqual(mockApiModel);
	});
});
