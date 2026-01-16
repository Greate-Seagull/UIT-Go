import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import axios from "axios";

import { JobTable } from "./infrastructure/cache/job-table";

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
import { BullmqRequestQueue } from "./infrastructure/request-queue/bullmq.request-queue";
import { DriverGrpcController } from "./presentation/controllers/driver.grpc.controller";

export const pool = new Pool({
	connectionString: config.postgres.DATABASE_URL,
	max: 250,
	min: 5,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000, // Fail fast instead of 60s
	maxUses: 7500, // Recycle connections periodically
	statement_timeout: 30000,
	query_timeout: 30000,
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
// export const redis = new Redis(
// 	config.redis.REDIS_PORT,
// 	config.redis.REDIS_HOST,
// 	{
// 		maxRetriesPerRequest: null,
// 	}
// );
export const redis = new Redis.Cluster(config.redisCluster.NODES);
export const axiosClient = axios.create({
	baseURL: config.tripApi.TRIP_SERVICE_URL,
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
});
export const jobTable = new JobTable();
export const messageQueue = new BullmqRequestQueue(redis, jobTable);
messageQueue.setupWorker(redis);

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

jobTable.add(startAcceptingUsecase.constructor.name, startAcceptingUsecase);
jobTable.add(acceptTripUsecase.constructor.name, acceptTripUsecase);
jobTable.add(updatePositionUsecase.constructor.name, updatePositionUsecase);
jobTable.add(completeTripUsecase.constructor.name, completeTripUsecase);
jobTable.add(searchDriverUsecase.constructor.name, searchDriverUsecase);
jobTable.add(rejectTripUsecase.constructor.name, rejectTripUsecase);
jobTable.add(getPositionUsecase.constructor.name, getPositionUsecase);
jobTable.add(signUpUsecase.constructor.name, signUpUsecase);
jobTable.add(signInUsecase.constructor.name, signInUsecase);
jobTable.add(getSelfInfoUsecase.constructor.name, getSelfInfoUsecase);

export const driverGrpcController = new DriverGrpcController(
	updatePositionUsecase,
	getPositionUsecase
);
