"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
const driver_entity_1 = require("../../../src/domain/driver.entity");
const composition_root_1 = require("../../../src/composition-root");
const start_accepting_test_data_1 = require("./start-accepting.test-data");
describe("Start accepting integration test", () => {
    let path = "/api/drivers/me/start";
    let input;
    let output;
    beforeAll(async () => {
        await composition_root_1.prisma.driver.create({ data: start_accepting_test_data_1.driver });
    });
    afterAll(async () => {
        await composition_root_1.prisma.driver.delete({ where: { id: start_accepting_test_data_1.driver.id } });
    });
    describe("Normal case", () => {
        beforeAll(async () => {
            input = { id: 1 };
            output = await (0, supertest_1.default)(app_1.default).put(path).send(input);
        });
        it("Should return 200", () => {
            expect(output.status).toBe(200);
        });
        it("Should return state 'ready'", () => {
            expect(output.body).toHaveProperty("state", driver_entity_1.DriverState.READY);
        });
    });
    // No abnormal case
    // describe("Abnormal case", () => {});
});
//# sourceMappingURL=start-accepting.integration.test.js.map