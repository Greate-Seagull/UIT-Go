import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "driver.v1";
export interface UpdatePositionRequest {
    id: number;
    lat: number;
    long: number;
}
/** This is intentionally empty */
export interface UpdatePositionResponse {
}
export interface GetPositionRequest {
    id: number;
}
export interface GetPositionResponse {
    lat: number;
    long: number;
}
export declare const UpdatePositionRequest: MessageFns<UpdatePositionRequest>;
export declare const UpdatePositionResponse: MessageFns<UpdatePositionResponse>;
export declare const GetPositionRequest: MessageFns<GetPositionRequest>;
export declare const GetPositionResponse: MessageFns<GetPositionResponse>;
export interface DriverService {
    updatePosition(request: UpdatePositionRequest): Promise<UpdatePositionResponse>;
    getPosition(request: GetPositionRequest): Promise<GetPositionResponse>;
}
export declare const DriverServiceServiceName = "driver.v1.DriverService";
export declare class DriverServiceClientImpl implements DriverService {
    private readonly rpc;
    private readonly service;
    constructor(rpc: Rpc, opts?: {
        service?: string;
    });
    updatePosition(request: UpdatePositionRequest): Promise<UpdatePositionResponse>;
    getPosition(request: GetPositionRequest): Promise<GetPositionResponse>;
}
export type DriverServiceService = typeof DriverServiceService;
export declare const DriverServiceService: {
    readonly updatePosition: {
        readonly path: "/driver.v1.DriverService/UpdatePosition";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: UpdatePositionRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => UpdatePositionRequest;
        readonly responseSerialize: (value: UpdatePositionResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => UpdatePositionResponse;
    };
    readonly getPosition: {
        readonly path: "/driver.v1.DriverService/GetPosition";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: GetPositionRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => GetPositionRequest;
        readonly responseSerialize: (value: GetPositionResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => GetPositionResponse;
    };
};
export interface DriverServiceServer extends UntypedServiceImplementation {
    updatePosition: handleUnaryCall<UpdatePositionRequest, UpdatePositionResponse>;
    getPosition: handleUnaryCall<GetPositionRequest, GetPositionResponse>;
}
export interface DriverServiceClient extends Client {
    updatePosition(request: UpdatePositionRequest, callback: (error: ServiceError | null, response: UpdatePositionResponse) => void): ClientUnaryCall;
    updatePosition(request: UpdatePositionRequest, metadata: Metadata, callback: (error: ServiceError | null, response: UpdatePositionResponse) => void): ClientUnaryCall;
    updatePosition(request: UpdatePositionRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: UpdatePositionResponse) => void): ClientUnaryCall;
    getPosition(request: GetPositionRequest, callback: (error: ServiceError | null, response: GetPositionResponse) => void): ClientUnaryCall;
    getPosition(request: GetPositionRequest, metadata: Metadata, callback: (error: ServiceError | null, response: GetPositionResponse) => void): ClientUnaryCall;
    getPosition(request: GetPositionRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: GetPositionResponse) => void): ClientUnaryCall;
}
export declare const DriverServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): DriverServiceClient;
    service: typeof DriverServiceService;
    serviceName: string;
};
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
//# sourceMappingURL=driver.d.ts.map