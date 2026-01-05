import z from "zod";
import { logger } from "../infrastructure/logger/pino.logger";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";

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
		logger.info("Gettting self started", {
			driverId: input.authId,
		});

		try {
			const parsedInput = inputSchema.parse(input);
			const driver = await this.driverRepo.getById(parsedInput.authId);

			if (!driver) {
				logger.warn("Driver not found", {
					driverId: parsedInput.authId,
				});
				throw new Error("Driver not found");
			}

			logger.info("Getting self completed", {
				driverId: driver.id,
			});

			return outputSchema.parse(driver);
		} catch (error: any) {
			logger.error("Getting self failed", {
				error: error.message,
				stack: error.stack,
			});
			throw error;
		}
	}
}
