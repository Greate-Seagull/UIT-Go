import { driverPositionInput } from "./update-position.test-data";
import { updatePositionUsecase } from "../../../src/composition-root";

describe("Update position integration test", () => {
	let input: any;
	let output: any;

	describe("Normal case", () => {
		beforeAll(async () => {
			input = driverPositionInput;
			output = await updatePositionUsecase.execute(input);
		});

		it("Should have lat", () => {
			expect(output.lat).toBeCloseTo(input.lat);
		});

		it("Should have long", () => {
			expect(output.long).toBeCloseTo(input.long);
		});
	});
});
