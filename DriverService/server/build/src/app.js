"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rest_router_1 = __importDefault(require("./presentation/routers/rest.router"));
const trpc_router_1 = require("./presentation/routers/trpc.router");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api", rest_router_1.default);
app.use("/trpc", trpc_router_1.createTrpcMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map