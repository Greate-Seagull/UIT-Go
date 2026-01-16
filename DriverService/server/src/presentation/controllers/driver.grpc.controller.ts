import { GetPositionUsecase } from "../../application/get-position.usecase";
import { UpdatePositionUsecase } from "../../application/update-position.usecase";
import * as driverGrpc from "../../generated/driver/v1/driver";
import * as grpc from "@grpc/grpc-js";

export class DriverGrpcController implements driverGrpc.DriverService {
    constructor(
        private readonly updatePositionUsecase: UpdatePositionUsecase, 
        private readonly getPositionUsecase: GetPositionUsecase
    ) {}

    public async updatePosition(request: driverGrpc.UpdatePositionRequest): Promise<driverGrpc.UpdatePositionResponse> {
        await this.updatePositionUsecase.execute(request);
        return {};
    }

    public async getPosition(request: driverGrpc.GetPositionRequest): Promise<driverGrpc.GetPositionResponse> {
        return await this.getPositionUsecase.execute(request);
    }
}

export function createDriverGrpcServer(
  controller: DriverGrpcController,
): driverGrpc.DriverServiceServer {
  const serverImpl: driverGrpc.DriverServiceServer = {
    updatePosition: async (
      call: grpc.ServerUnaryCall<driverGrpc.UpdatePositionRequest, driverGrpc.UpdatePositionResponse>,
      callback: grpc.sendUnaryData<driverGrpc.UpdatePositionResponse>,
    ) => {
      try {
        const result = await controller.updatePosition(call.request);
        callback(null, result);
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    getPosition: async (
      call: grpc.ServerUnaryCall<driverGrpc.GetPositionRequest, driverGrpc.GetPositionResponse>,
      callback: grpc.sendUnaryData<driverGrpc.GetPositionResponse>,
    ) => {
      try {
        const result = await controller.getPosition(call.request);
        callback(null, result);
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },
  };

  return serverImpl;
}