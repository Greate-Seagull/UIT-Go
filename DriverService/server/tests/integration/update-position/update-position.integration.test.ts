import { driverPositionInput } from "./update-position.test-data";
import { updatePositionUsecase } from "../../../src/composition-root";

describe("Update position integration test", () => {
	let input;
	let output: any;

	describe("Normal case", () => {
		beforeAll(async () => {
			input = driverPositionInput;
			output = await updatePositionUsecase.execute(input);
		});

		it("Should return correct lat", () => {
			expect(output).toHaveProperty("lat", driverPositionInput.lat);
		});

		it("Should return correct long", () => {
			expect(output).toHaveProperty("long", driverPositionInput.long);
		});
	});
});
