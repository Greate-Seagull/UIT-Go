import z from "zod";
import { logger } from "../infrastructure/logger/pino.logger";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { id } from "zod/v4/locales";

const inputSchema = z.object({
	authId: z.number(),
});

export const outputSchema = z.object({
	id: z.number(),
	name: z.string(),
	licensePlate: z.string(),
});

export class GetSelfInfoUsecase {
	constructor(private readonly driverRepo: DriverRepository) {}

	async execute(input: any) {
		logger.info("GetDriverUseCase: Start", {
			input: { authId: input.authId },
		});

		try {
			const parsedInput = inputSchema.parse(input);
			logger.debug("GetDriverUseCase: Input validated", {
				authId: parsedInput.authId,
			});

			logger.debug("GetDriverUseCase: Fetching driver from repository", {
				driverId: parsedInput.authId,
			});
			const driver = await this.driverRepo.getById(parsedInput.authId);

			if (!driver) {
				logger.warn("GetDriverUseCase: Driver not found", {
					driverId: parsedInput.authId,
				});
				throw new Error("Driver not found");
			}

			logger.info("GetDriverUseCase: Success", {
				driverId: driver.id,
				name: driver.name,
			});

			return outputSchema.parse(driver);
		} catch (error: any) {
			logger.error("GetDriverUseCase: Failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}
}
