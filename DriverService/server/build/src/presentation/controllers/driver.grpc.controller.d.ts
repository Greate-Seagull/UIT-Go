import { GetPositionUsecase } from "../../application/get-position.usecase";
import { UpdatePositionUsecase } from "../../application/update-position.usecase";
import * as driverGrpc from "../../generated/driver/v1/driver";
export declare class DriverGrpcController implements driverGrpc.DriverService {
    private readonly updatePositionUsecase;
    private readonly getPositionUsecase;
    constructor(updatePositionUsecase: UpdatePositionUsecase, getPositionUsecase: GetPositionUsecase);
    updatePosition(request: driverGrpc.UpdatePositionRequest): Promise<driverGrpc.UpdatePositionResponse>;
    getPosition(request: driverGrpc.GetPositionRequest): Promise<driverGrpc.GetPositionResponse>;
}
export declare function createDriverGrpcServer(controller: DriverGrpcController): driverGrpc.DriverServiceServer;
//# sourceMappingURL=driver.grpc.controller.d.ts.map