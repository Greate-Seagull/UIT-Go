"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInUsecase = exports.outputSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
const signInUsecaseInputSchema = zod_1.default.object({
    username: zod_1.default.string(),
    password: zod_1.default.string(),
});
exports.outputSchema = zod_1.default.object({
    token: zod_1.default.string(),
    driverId: zod_1.default.number(),
});
class SignInUsecase {
    accountRepo;
    passwordService;
    tokenService;
    constructor(accountRepo, passwordService, tokenService) {
        this.accountRepo = accountRepo;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
    }
    async execute(input) {
        pino_logger_1.logger.info("Signing in started", { username: input.username });
        try {
            const parsed = signInUsecaseInputSchema.safeParse(input);
            if (!parsed.success) {
                pino_logger_1.logger.warn("Input validation failed", {
                    errors: parsed.error.format(),
                });
                throw Error(parsed.error.message);
            }
            const account = await this.accountRepo.getByUsername(input.username);
            if (!account) {
                pino_logger_1.logger.warn("Account not found", {
                    username: input.username,
                });
                throw Error("Invalid username or password");
            }
            const isValidPassword = this.passwordService.comparePassword(input.password, account.password);
            if (!isValidPassword) {
                pino_logger_1.logger.warn("Wrong password", {
                    username: input.username,
                });
                throw Error("Invalid username or password");
            }
            const token = this.tokenService.generateJwt({
                id: account.driverId,
            });
            pino_logger_1.logger.info("Signing in completed", { accountId: account.id });
            return exports.outputSchema.parse({
                token: token,
                driverId: account.driverId,
            });
        }
        catch (error) {
            pino_logger_1.logger.error("Signing in failed", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}
exports.SignInUsecase = SignInUsecase;
//# sourceMappingURL=sign-in.usecase.js.map