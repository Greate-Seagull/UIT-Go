"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
const composition_root_1 = require("../../../src/composition-root");
const get_position_test_data_1 = require("./get-position.test-data");
const driver_position_repository_1 = require("../../../src/infrastructure/repositories/driver-position.repository");
describe("Get position integration test", () => {
    let path = `/api/drivers/${get_position_test_data_1.driverPosition.id}/position`;
    let input = {};
    let output;
    beforeAll(async () => {
        await composition_root_1.driverPositionRepository.save(get_position_test_data_1.driverPosition);
    });
    afterAll(async () => {
        await composition_root_1.redis.zrem(driver_position_repository_1.DriverPositionRepository.GEO_KEY, get_position_test_data_1.driverPosition.id);
    });
    describe("Normal case", () => {
        beforeAll(async () => {
            output = await (0, supertest_1.default)(app_1.default).get(path).send(input);
        });
        it("Should return 200", () => {
            expect(output.status).toBe(200);
        });
        it("Should return correct long", () => {
            expect(output.body.long).toBeCloseTo(get_position_test_data_1.driverPosition.long);
        });
        it("Should return correct lat", () => {
            expect(output.body.lat).toBeCloseTo(get_position_test_data_1.driverPosition.lat);
        });
    });
    describe("Abnormal case", () => {
        describe("Not found driver case", () => {
            beforeAll(async () => {
                let path = `/api/drivers/${get_position_test_data_1.driverPosition.id - 1}/position`;
                output = await (0, supertest_1.default)(app_1.default).get(path).send(input);
            });
            it("Should return error message", () => {
                expect(output.body).toHaveProperty("message", "Driver doesn't exist or not in ready state");
            });
        });
    });
});
//# sourceMappingURL=get-position.integration.test.js.map