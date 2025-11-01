import { config } from "./config/config";
import Redis from "ioredis";
import { PrismaClient } from "./generated/client/client";
import { StartAcceptingUsecase } from "./application/start-accepting.usecase";
import { DriverRepository } from "./infrastructure/repositories/driver.repository";
import { TransactionManager } from "./infrastructure/repositories/transaction";
import { AcceptTripUsecase } from "./application/accept-trip.usecase";
import { UpdatePositionUsecase } from "./application/update-position.usecase";
import { DriverPositionRepository } from "./infrastructure/repositories/driver-position.repository";
import { CompleteTripUsecase } from "./application/complete-trip.usecase";
import axios from "axios";
import { TripApiClient } from "./infrastructure/clients/trip.client";
import { SearchDriverUsecase } from "./application/search-driver.usecase";

export const prisma = new PrismaClient();
export const redis = new Redis(
	config.redis.REDIS_PORT,
	config.redis.REDIS_HOST
);
export const axiosClient = axios.create({
	baseURL: config.tripApi.TRIP_SERVICE_URL,
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
});

const transaction = new TransactionManager(prisma);
const driverRepository = new DriverRepository(prisma);
export const driverPositionRepository = new DriverPositionRepository(redis);
const tripApiClient = new TripApiClient(axiosClient);

export const startAcceptingUsecase = new StartAcceptingUsecase(
	driverRepository,
	transaction
);
export const acceptTripUsecase = new AcceptTripUsecase(
	driverRepository,
	tripApiClient,
	transaction
);
export const updatePositionUsecase = new UpdatePositionUsecase(
	driverPositionRepository
);
export const completeTripUsecase = new CompleteTripUsecase(
	driverRepository,
	transaction
);
export const searchDriverUsecase = new SearchDriverUsecase(
	driverPositionRepository
);
