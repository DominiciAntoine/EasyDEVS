import { describe, expect, it } from "vitest";
import { modelToReactflow } from "./modelToReactflow";
import { mockApiModel, mockReactFlowModelLibrary } from "./__tests__/fakeData";


describe("modelToReactflow", () => {
	it("should convert a model library to api request", () => {
		expect(modelToReactflow(mockApiModel, "fa5af68e-c879-4f77-bc93-c9e655ac77a9")).toStrictEqual(mockReactFlowModelLibrary);
	});
});
