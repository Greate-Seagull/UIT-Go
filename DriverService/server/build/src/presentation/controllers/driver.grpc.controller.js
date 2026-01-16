"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverGrpcController = void 0;
exports.createDriverGrpcServer = createDriverGrpcServer;
class DriverGrpcController {
    updatePositionUsecase;
    getPositionUsecase;
    constructor(updatePositionUsecase, getPositionUsecase) {
        this.updatePositionUsecase = updatePositionUsecase;
        this.getPositionUsecase = getPositionUsecase;
    }
    async updatePosition(request) {
        await this.updatePositionUsecase.execute(request);
        return {};
    }
    async getPosition(request) {
        return await this.getPositionUsecase.execute(request);
    }
}
exports.DriverGrpcController = DriverGrpcController;
function createDriverGrpcServer(controller) {
    const serverImpl = {
        updatePosition: async (call, callback) => {
            try {
                const result = await controller.updatePosition(call.request);
                callback(null, result);
            }
            catch (err) {
                callback(err, null);
            }
        },
        getPosition: async (call, callback) => {
            try {
                const result = await controller.getPosition(call.request);
                callback(null, result);
            }
            catch (err) {
                callback(err, null);
            }
        },
    };
    return serverImpl;
}
//# sourceMappingURL=driver.grpc.controller.js.map