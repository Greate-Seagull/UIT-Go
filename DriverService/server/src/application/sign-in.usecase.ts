import z from "zod";
import {
	PasswordService,
	TokenService,
} from "../domain/service/encrypt.service";
import { AccountRepository } from "../infrastructure/repositories/account.repository";
import { logger } from "../infrastructure/logger/pino.logger";

const signInUsecaseInputSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export const outputSchema = z.object({
	token: z.string(),
	driverId: z.number(),
});

export class SignInUsecase {
	constructor(
		private readonly accountRepo: AccountRepository,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(input: any) {
		logger.info("Signing in started", { username: input.username });

		try {
			const parsed = signInUsecaseInputSchema.safeParse(input);
			if (!parsed.success) {
				logger.warn("Input validation failed", {
					errors: parsed.error.format(),
				});
				throw Error(parsed.error.message);
			}

			const account = await this.accountRepo.getByUsername(
				input.username
			);

			if (!account) {
				logger.warn("Account not found", {
					username: input.username,
				});
				throw Error("Invalid username or password");
			}

			const isValidPassword = await this.passwordService.comparePassword(
				input.password,
				account.password
			);

			if (!isValidPassword) {
				logger.warn("Wrong password", {
					username: input.username,
				});
				throw Error("Invalid username or password");
			}

			const token = this.tokenService.generateJwt({
				id: account.driverId,
			});

			logger.info("Signing in completed", { accountId: account.id });

			return outputSchema.parse({
				token: token,
				driverId: account.driverId,
			});
		} catch (error: any) {
			logger.error("Signing in failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}
}
