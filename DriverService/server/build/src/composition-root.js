"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelfInfoUsecase = exports.signInUsecase = exports.signUpUsecase = exports.getPositionUsecase = exports.rejectTripUsecase = exports.searchDriverUsecase = exports.completeTripUsecase = exports.updatePositionUsecase = exports.acceptTripUsecase = exports.startAcceptingUsecase = exports.tokenService = exports.accountRepository = exports.driverPositionRepository = exports.driverRepository = exports.axiosClient = exports.redis = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const ioredis_1 = __importDefault(require("ioredis"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config/config");
const start_accepting_usecase_1 = require("./application/start-accepting.usecase");
const driver_repository_1 = require("./infrastructure/repositories/driver.repository");
const transaction_1 = require("./infrastructure/repositories/transaction");
const accept_trip_usecase_1 = require("./application/accept-trip.usecase");
const update_position_usecase_1 = require("./application/update-position.usecase");
const driver_position_repository_1 = require("./infrastructure/repositories/driver-position.repository");
const complete_trip_usecase_1 = require("./application/complete-trip.usecase");
const trip_client_1 = require("./infrastructure/clients/trip.client");
const search_driver_usecase_1 = require("./application/search-driver.usecase");
const reject_trip_usecase_1 = require("./application/reject-trip.usecase");
const get_position_usecase_1 = require("./application/get-position.usecase");
const redis_cache_1 = require("./infrastructure/cache/redis.cache");
const account_repository_1 = require("./infrastructure/repositories/account.repository");
const sign_up_usecase_1 = require("./application/sign-up.usecase");
const encrypt_service_1 = require("./domain/service/encrypt.service");
const sign_in_usecase_1 = require("./application/sign-in.usecase");
const get_self_usecase_1 = require("./application/get-self.usecase");
exports.prisma = new client_1.PrismaClient();
exports.redis = new ioredis_1.default(config_1.config.redis.REDIS_PORT, config_1.config.redis.REDIS_HOST);
exports.axiosClient = axios_1.default.create({
    baseURL: config_1.config.tripApi.TRIP_SERVICE_URL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});
const cache = new redis_cache_1.RedisCache(exports.redis);
const transaction = new transaction_1.TransactionManager(exports.prisma);
exports.driverRepository = new driver_repository_1.DriverRepository(exports.prisma, cache);
exports.driverPositionRepository = new driver_position_repository_1.DriverPositionRepository(exports.redis);
exports.accountRepository = new account_repository_1.AccountRepository(exports.prisma);
const tripApiClient = new trip_client_1.TripApiClient(exports.axiosClient);
const passwordService = new encrypt_service_1.PasswordService(config_1.config.bcrypt.SALT_ROUND);
exports.tokenService = new encrypt_service_1.TokenService(config_1.config.jwt.SECRET, config_1.config.jwt.EXPIRY);
exports.startAcceptingUsecase = new start_accepting_usecase_1.StartAcceptingUsecase(exports.driverRepository, transaction);
exports.acceptTripUsecase = new accept_trip_usecase_1.AcceptTripUsecase(exports.driverRepository, tripApiClient, transaction);
exports.updatePositionUsecase = new update_position_usecase_1.UpdatePositionUsecase(exports.driverPositionRepository);
exports.completeTripUsecase = new complete_trip_usecase_1.CompleteTripUsecase(exports.driverRepository, tripApiClient, transaction);
exports.searchDriverUsecase = new search_driver_usecase_1.SearchDriverUsecase(exports.driverPositionRepository);
exports.rejectTripUsecase = new reject_trip_usecase_1.RejectTripUsecase(exports.driverRepository, tripApiClient);
exports.getPositionUsecase = new get_position_usecase_1.GetPositionUsecase(exports.driverPositionRepository);
exports.signUpUsecase = new sign_up_usecase_1.SignUpUseCase(exports.driverRepository, exports.accountRepository, passwordService, exports.tokenService);
exports.signInUsecase = new sign_in_usecase_1.SignInUsecase(exports.accountRepository, passwordService, exports.tokenService);
exports.getSelfInfoUsecase = new get_self_usecase_1.GetSelfInfoUsecase(exports.driverRepository);
//# sourceMappingURL=composition-root.js.map