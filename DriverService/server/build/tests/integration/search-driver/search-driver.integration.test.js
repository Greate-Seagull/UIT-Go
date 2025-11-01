"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const search_driver_test_data_1 = require("./search-driver.test-data");
const app_1 = __importDefault(require("../../../src/app"));
const composition_root_1 = require("../../../src/composition-root");
const driver_position_repository_1 = require("../../../src/infrastructure/repositories/driver-position.repository");
describe("Search driver integration test", () => {
    let path = "/api/drivers/search";
    let input;
    let output;
    beforeAll(async () => {
        await composition_root_1.driverPositionRepository.save(search_driver_test_data_1.driverPositionData);
    });
    afterAll(async () => {
        await composition_root_1.redis.zrem(driver_position_repository_1.DriverPositionRepository.GEO_KEY, search_driver_test_data_1.driverPositionData.id);
    });
    describe("Normal case", () => {
        describe("Searchable driver position case", () => {
            beforeAll(async () => {
                input = search_driver_test_data_1.queryInput;
                output = await (0, supertest_1.default)(app_1.default).get(path).query(input);
            });
            it("Should return 200", () => {
                expect(output.status).toBe(200);
            });
            it("Should return correct driver id", () => {
                const uniqueResult = output.body[0];
                expect(uniqueResult.id).toBe(search_driver_test_data_1.driverPositionData.id);
            });
        });
        describe("Out-ranged driver position case", () => {
            beforeAll(async () => {
                input = structuredClone(search_driver_test_data_1.queryInput);
                input.radiusMeters = 200;
                output = await (0, supertest_1.default)(app_1.default).get(path).query(input);
            });
            it("Should return 200", () => {
                expect(output.status).toBe(200);
            });
            it("Should return correct driver id", () => {
                expect(output.body).toHaveLength(0);
            });
        });
    });
});
//# sourceMappingURL=search-driver.integration.test.js.map