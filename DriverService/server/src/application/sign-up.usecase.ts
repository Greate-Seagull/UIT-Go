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
		logger.info("SignUpUseCase: Start", { input });

		try {
			const parsedInput = inputSchema.parse(input);
			logger.debug("SignUpUseCase: Input validated", { parsedInput });

			const isSignedUp = await this.accountRepository.getByUsername(
				parsedInput.username
			);
			if (isSignedUp) {
				logger.warn("SignUpUseCase: Username already exists", {
					username: parsedInput.username,
				});
				throw Error("Driver has signed up");
			}

			logger.debug("SignUpUseCase: Generating salt & password hash");
			const salt = this.passwordService.generateSalt();
			const passwordHash = this.passwordService.hashPassword(
				parsedInput.password,
				salt
			);

			logger.debug("SignUpUseCase: Creating Driver entity");
			const driver = Driver.create(parsedInput);

			logger.debug("SignUpUseCase: Saving Driver to repository");
			const savedDriver = await this.driverRepository.add(null, driver);

			logger.debug("SignUpUseCase: Creating Account entity");
			const account = Account.create({
				username: parsedInput.username,
				password: passwordHash,
				salt: salt,
				driverId: savedDriver.id,
			});

			logger.debug("SignUpUseCase: Saving Account to repository");
			const savedAccount = await this.accountRepository.add(
				null,
				account
			);

			logger.debug("SignUpUseCase: Generating JWT token");
			const accessJwt = this.tokenService.generateJwt({
				id: account.driverId,
			});

			logger.info("SignUpUseCase: Success", {
				driverId: savedDriver.id,
				accountId: savedAccount.id,
			});

			return outputSchema.parse({
				token: accessJwt,
				driverId: account.driverId,
			});
		} catch (error: any) {
			logger.error("SignUpUseCase: Failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}
}
