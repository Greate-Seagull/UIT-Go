"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const update_position_test_data_1 = require("./update-position.test-data");
const composition_root_1 = require("../../../src/composition-root");
describe("Update position integration test", () => {
    let input;
    let output;
    describe("Normal case", () => {
        beforeAll(async () => {
            input = update_position_test_data_1.driverPositionInput;
            output = await composition_root_1.updatePositionUsecase.execute(input);
        });
        it("Should have lat", () => {
            expect(output.lat).toBeCloseTo(input.lat);
        });
        it("Should have long", () => {
            expect(output.long).toBeCloseTo(input.long);
        });
    });
});
//# sourceMappingURL=update-position.integration.test.js.map