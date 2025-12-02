import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import axios from "axios";

import { config } from "./config/config";
import { StartAcceptingUsecase } from "./application/start-accepting.usecase";
import { DriverRepository } from "./infrastructure/repositories/driver.repository";
import { TransactionManager } from "./infrastructure/repositories/transaction";
import { AcceptTripUsecase } from "./application/accept-trip.usecase";
import { UpdatePositionUsecase } from "./application/update-position.usecase";
import { DriverPositionRepository } from "./infrastructure/repositories/driver-position.repository";
import { CompleteTripUsecase } from "./application/complete-trip.usecase";
import { TripApiClient } from "./infrastructure/clients/trip.client";
import { SearchDriverUsecase } from "./application/search-driver.usecase";
import { RejectTripUsecase } from "./application/reject-trip.usecase";
import { GetPositionUsecase } from "./application/get-position.usecase";
import { RedisCache } from "./infrastructure/cache/redis.cache";
import { AccountRepository } from "./infrastructure/repositories/account.repository";
import { SignUpUseCase } from "./application/sign-up.usecase";
import {
	PasswordService,
	TokenService,
} from "./domain/service/encrypt.service";
import { SignInUsecase } from "./application/sign-in.usecase";
import { GetSelfInfoUsecase } from "./application/get-self.usecase";

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

const cache = new RedisCache(redis);
const transaction = new TransactionManager(prisma);
export const driverRepository = new DriverRepository(prisma, cache);
export const driverPositionRepository = new DriverPositionRepository(redis);
export const accountRepository = new AccountRepository(prisma);
const tripApiClient = new TripApiClient(axiosClient);

const passwordService = new PasswordService(config.bcrypt.SALT_ROUND);
export const tokenService = new TokenService(
	config.jwt.SECRET,
	config.jwt.EXPIRY as any
);

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
	tripApiClient,
	transaction
);
export const searchDriverUsecase = new SearchDriverUsecase(
	driverPositionRepository
);
export const rejectTripUsecase = new RejectTripUsecase(
	driverRepository,
	tripApiClient
);
export const getPositionUsecase = new GetPositionUsecase(
	driverPositionRepository
);
export const signUpUsecase = new SignUpUseCase(
	driverRepository,
	accountRepository,
	passwordService,
	tokenService
);
export const signInUsecase = new SignInUsecase(
	accountRepository,
	passwordService,
	tokenService
);
export const getSelfInfoUsecase = new GetSelfInfoUsecase(driverRepository);
