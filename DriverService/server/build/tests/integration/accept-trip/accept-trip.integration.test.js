"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
const driver_entity_1 = require("../../../src/domain/driver.entity");
const composition_root_1 = require("../../../src/composition-root");
const accept_trip_test_data_1 = require("./accept-trip.test-data");
describe("Accept trip integration test", () => {
    let path = "/api/drivers/me/accept";
    let input = { driverId: accept_trip_test_data_1.driver.id, tripId: 1 };
    let output;
    beforeAll(async () => {
        await composition_root_1.prisma.driver.create({ data: accept_trip_test_data_1.driver });
    });
    afterAll(async () => {
        await composition_root_1.prisma.driver.delete({ where: { id: accept_trip_test_data_1.driver.id } });
    });
    describe("Normal case", () => {
        beforeAll(async () => {
            output = await (0, supertest_1.default)(app_1.default).put(path).send(input);
        });
        it("Should return 200", () => {
            expect(output.status).toBe(200);
        });
        it("Should return state 'transporting'", () => {
            expect(output.body).toHaveProperty("state", driver_entity_1.DriverState.TRANSPORTING);
        });
    });
    describe("Abnormal case", () => {
        describe("Non-ready state case", () => {
            beforeAll(async () => {
                await composition_root_1.prisma.driver.update({
                    where: { id: accept_trip_test_data_1.driver.id },
                    data: { state: driver_entity_1.DriverState.UNAVAILABLE },
                });
                output = await (0, supertest_1.default)(app_1.default).put(path).send(input);
            });
            it("Should return error message", () => {
                expect(output.body).toHaveProperty("message", "The driver is not in ready state: UNAVAILABLE");
            });
        });
    });
});
//# sourceMappingURL=accept-trip.integration.test.js.map