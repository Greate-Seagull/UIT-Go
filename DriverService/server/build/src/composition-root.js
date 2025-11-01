"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDriverUsecase = exports.completeTripUsecase = exports.updatePositionUsecase = exports.acceptTripUsecase = exports.startAcceptingUsecase = exports.driverPositionRepository = exports.driverRepository = exports.axiosClient = exports.redis = exports.prisma = void 0;
const config_1 = require("./config/config");
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("./generated/client/client");
const start_accepting_usecase_1 = require("./application/start-accepting.usecase");
const driver_repository_1 = require("./infrastructure/repositories/driver.repository");
const transaction_1 = require("./infrastructure/repositories/transaction");
const accept_trip_usecase_1 = require("./application/accept-trip.usecase");
const update_position_usecase_1 = require("./application/update-position.usecase");
const driver_position_repository_1 = require("./infrastructure/repositories/driver-position.repository");
const complete_trip_usecase_1 = require("./application/complete-trip.usecase");
const axios_1 = __importDefault(require("axios"));
const trip_client_1 = require("./infrastructure/clients/trip.client");
const search_driver_usecase_1 = require("./application/search-driver.usecase");
exports.prisma = new client_1.PrismaClient();
exports.redis = new ioredis_1.default(config_1.config.redis.REDIS_PORT, config_1.config.redis.REDIS_HOST);
exports.axiosClient = axios_1.default.create({
    baseURL: config_1.config.tripApi.TRIP_SERVICE_URL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});
const transaction = new transaction_1.TransactionManager(exports.prisma);
exports.driverRepository = new driver_repository_1.DriverRepository(exports.prisma);
exports.driverPositionRepository = new driver_position_repository_1.DriverPositionRepository(exports.redis);
const tripApiClient = new trip_client_1.TripApiClient(exports.axiosClient);
exports.startAcceptingUsecase = new start_accepting_usecase_1.StartAcceptingUsecase(exports.driverRepository, transaction);
exports.acceptTripUsecase = new accept_trip_usecase_1.AcceptTripUsecase(exports.driverRepository, tripApiClient, transaction);
exports.updatePositionUsecase = new update_position_usecase_1.UpdatePositionUsecase(exports.driverPositionRepository);
exports.completeTripUsecase = new complete_trip_usecase_1.CompleteTripUsecase(exports.driverRepository, tripApiClient, transaction);
exports.searchDriverUsecase = new search_driver_usecase_1.SearchDriverUsecase(exports.driverPositionRepository);
//# sourceMappingURL=composition-root.js.map