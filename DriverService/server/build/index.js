"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const grpc = __importStar(require("@grpc/grpc-js"));
const app_1 = __importDefault(require("./src/app"));
const grpc_1 = __importDefault(require("./src/grpc"));
const monitorings_1 = require("./src/presentation/monitoring/monitorings");
const HTTP_PORT = 3000;
const GRPC_PORT = 50051;
(0, monitorings_1.startMonitoring)();
// --- HTTP SERVER SETUP ---
const httpServer = http_1.default.createServer(app_1.default);
httpServer.maxConnections = 10000;
httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
httpServer.listen(HTTP_PORT, () => {
    console.log(`Version 1.0.5`);
});
httpServer.on("error", (error) => {
    throw error;
});
// --- gRPC SERVER SETUP ---
grpc_1.default.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error('Failed to start server:', error);
        return;
    }
    console.log(`gRPC server running on port ${port}`);
});
//# sourceMappingURL=index.js.map