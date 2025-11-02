"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
const composition_root_1 = require("../../../src/composition-root");
const reject_trip_test_data_1 = require("./reject-trip.test-data");
describe("Reject trip integration test", () => {
    let path = "/api/drivers/me/reject";
    let input = { driverId: reject_trip_test_data_1.driver.id, offerId: 1 };
    let output;
    beforeAll(async () => {
        await composition_root_1.prisma.driver.create({ data: reject_trip_test_data_1.driver });
    });
    afterAll(async () => {
        await composition_root_1.prisma.driver.delete({ where: { id: reject_trip_test_data_1.driver.id } });
    });
    describe("Normal case", () => {
        beforeAll(async () => {
            output = await (0, supertest_1.default)(app_1.default).put(path).send(input);
        });
        it("Should return 200", () => {
            expect(output.status).toBe(200);
        });
    });
});
//# sourceMappingURL=reject-trip.integration.test.js.map