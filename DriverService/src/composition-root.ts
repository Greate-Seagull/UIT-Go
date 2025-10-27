import { PrismaClient } from "./generated/client/client";
import { StartAcceptingUsecase } from "./application/start-accepting.usecase";
import { DriverRepository } from "./infrastructure/repositories/driver.repository";

export const prisma = new PrismaClient();

const driverRepository = new DriverRepository();
export const startAcceptingUsecase = new StartAcceptingUsecase(
	driverRepository
);
