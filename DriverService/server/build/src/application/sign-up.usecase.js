"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpUseCase = exports.outputSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const driver_entity_1 = require("../domain/entities/driver.entity");
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
const account_entity_1 = require("../domain/entities/account.entity");
const inputSchema = zod_1.default.object({
    name: zod_1.default.string(),
    licensePlate: zod_1.default.string(),
    username: zod_1.default.string(),
    password: zod_1.default.string(),
});
exports.outputSchema = zod_1.default.object({
    token: zod_1.default.string(),
    driverId: zod_1.default.number(),
});
class SignUpUseCase {
    driverRepository;
    accountRepository;
    passwordService;
    tokenService;
    constructor(driverRepository, accountRepository, passwordService, tokenService) {
        this.driverRepository = driverRepository;
        this.accountRepository = accountRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }
    async execute(input) {
        pino_logger_1.logger.info("Signing up started", { username: input.username });
        try {
            const parsedInput = inputSchema.parse(input);
            const isSignedUp = await this.accountRepository.getByUsername(parsedInput.username);
            if (isSignedUp) {
                pino_logger_1.logger.warn("Username already exists", {
                    username: parsedInput.username,
                });
                throw Error("Driver has signed up");
            }
            const salt = this.passwordService.generateSalt();
            const passwordHash = this.passwordService.hashPassword(parsedInput.password, salt);
            const driver = driver_entity_1.Driver.create(parsedInput);
            const savedDriver = await this.driverRepository.add(null, driver);
            const account = account_entity_1.Account.create({
                username: parsedInput.username,
                password: passwordHash,
                salt: salt,
                driverId: savedDriver.id,
            });
            const savedAccount = await this.accountRepository.add(null, account);
            const accessJwt = this.tokenService.generateJwt({
                id: account.driverId,
            });
            pino_logger_1.logger.info("Signing up completed", {
                driverId: savedDriver.id,
                accountId: savedAccount.id,
            });
            return exports.outputSchema.parse({
                token: accessJwt,
                driverId: account.driverId,
            });
        }
        catch (error) {
            pino_logger_1.logger.error("Signing up failed", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}
exports.SignUpUseCase = SignUpUseCase;
//# sourceMappingURL=sign-up.usecase.js.map