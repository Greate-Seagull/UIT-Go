import z from "zod";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { AccountRepository } from "../infrastructure/repositories/account.repository";
import {
	PasswordService,
	TokenService,
} from "../domain/service/encrypt.service";
import { Driver } from "../domain/entities/driver.entity";
import { logger } from "../infrastructure/logger/pino.logger";
import { Account } from "../domain/entities/account.entity";

const inputSchema = z.object({
	name: z.string(),
	licensePlate: z.string(),
	username: z.string(),
	password: z.string(),
});

export const outputSchema = z.object({
	token: z.string(),
	driverId: z.number(),
});

export class SignUpUseCase {
	constructor(
		private readonly driverRepository: DriverRepository,
		private readonly accountRepository: AccountRepository,
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService
	) {}

	async execute(input: any) {
		logger.info("Signing up started", { username: input.username });

		try {
			const parsedInput = inputSchema.parse(input);
			const isSignedUp = await this.accountRepository.getByUsername(
				parsedInput.username
			);
			if (isSignedUp) {
				logger.warn("Username already exists", {
					username: parsedInput.username,
				});
				throw Error("Driver has signed up");
			}

			const salt = await this.passwordService.generateSalt();
			const passwordHash = await this.passwordService.hashPassword(
				parsedInput.password,
				salt
			);

			const driver = Driver.create(parsedInput);

			const savedDriver = await this.driverRepository.add(null, driver);

			const account = Account.create({
				username: parsedInput.username,
				password: passwordHash,
				salt: salt,
				driverId: savedDriver.id,
			});

			const savedAccount = await this.accountRepository.add(
				null,
				account
			);

			const accessJwt = this.tokenService.generateJwt({
				id: account.driverId,
			});

			logger.info("Signing up completed", {
				driverId: savedDriver.id,
				accountId: savedAccount.id,
			});

			return outputSchema.parse({
				token: accessJwt,
				driverId: account.driverId,
			});
		} catch (error: any) {
			logger.error("Signing up failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}
}
