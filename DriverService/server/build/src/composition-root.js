"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTripUsecase = exports.updatePositionUsecase = exports.acceptTripUsecase = exports.startAcceptingUsecase = exports.redis = exports.prisma = void 0;
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
exports.prisma = new client_1.PrismaClient();
exports.redis = new ioredis_1.default(config_1.config.redis.REDIS_PORT, config_1.config.redis.REDIS_HOST);
const transaction = new transaction_1.TransactionManager(exports.prisma);
const driverRepository = new driver_repository_1.DriverRepository(exports.prisma);
const driverPositionRepository = new driver_position_repository_1.DriverPositionRepository(exports.redis);
exports.startAcceptingUsecase = new start_accepting_usecase_1.StartAcceptingUsecase(driverRepository, transaction);
exports.acceptTripUsecase = new accept_trip_usecase_1.AcceptTripUsecase(driverRepository, transaction);
exports.updatePositionUsecase = new update_position_usecase_1.UpdatePositionUsecase(driverPositionRepository);
exports.completeTripUsecase = new complete_trip_usecase_1.CompleteTripUsecase(driverRepository, transaction);
//# sourceMappingURL=composition-root.js.map