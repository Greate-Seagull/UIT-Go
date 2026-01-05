"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSelfInfoUsecase = exports.outputSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
const inputSchema = zod_1.default.object({
    authId: zod_1.default.number(),
});
exports.outputSchema = zod_1.default.object({
    id: zod_1.default.number(),
    name: zod_1.default.string(),
    licensePlate: zod_1.default.string(),
});
class GetSelfInfoUsecase {
    driverRepo;
    constructor(driverRepo) {
        this.driverRepo = driverRepo;
    }
    async execute(input) {
        pino_logger_1.logger.info("GetDriverUseCase: Start", {
            input: { authId: input.authId },
        });
        try {
            const parsedInput = inputSchema.parse(input);
            pino_logger_1.logger.debug("GetDriverUseCase: Input validated", {
                authId: parsedInput.authId,
            });
            pino_logger_1.logger.debug("GetDriverUseCase: Fetching driver from repository", {
                driverId: parsedInput.authId,
            });
            const driver = await this.driverRepo.getById(parsedInput.authId);
            if (!driver) {
                pino_logger_1.logger.warn("GetDriverUseCase: Driver not found", {
                    driverId: parsedInput.authId,
                });
                throw new Error("Driver not found");
            }
            pino_logger_1.logger.info("GetDriverUseCase: Success", {
                driverId: driver.id,
                name: driver.name,
            });
            return exports.outputSchema.parse(driver);
        }
        catch (error) {
            pino_logger_1.logger.error("GetDriverUseCase: Failed", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}
exports.GetSelfInfoUsecase = GetSelfInfoUsecase;
//# sourceMappingURL=get-self.usecase.js.map