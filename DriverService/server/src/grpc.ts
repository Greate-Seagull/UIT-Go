import * as grpc from "@grpc/grpc-js";
import { driverGrpcController } from "./composition-root";
import { DriverServiceService } from "./generated/driver/v1/driver";
import { createDriverGrpcServer } from "./presentation/controllers/driver.grpc.controller";

const grpcServerOptions: grpc.ChannelOptions = {
	// Connection limits
	"grpc.max_concurrent_streams": 10000,		// Allow 10k concurrent stream
	"grpc.max_connection_idle_ms": 180000,		// 3 minutes idle timeout
	"grpc.max_connection_age_ms": 1800000,		// 30 minutes max connection age
	"grpc.max_connection_age_grace_ms": 5000,	// 5 seconds grace period for shutdown

	// Keepalive settings (prevent connection drops under load)
	"grpc.keepalive_time_ms": 120000,			// Send keepalive every 2 minutes
	"grpc.keepalive_timeout_ms": 20000,			// Wait 20s for keepalive response
	"grpc.keepalive_permit_without_calls": 1,	// Allow keepalive without active calls
	"grpc.http2.min_ping_interval_without_data_ms": 300000,	// Rate limit pings

	// Performance tuning
	"grpc.max_send_message_length": 4 * 1024 * 1024,		// 4MB max message size
	"grpc.max_receive_message_length": 4 * 1024 * 1024,		// 4MB max message size
	
	// TCP socket options
	"grpc.so_reuseport": 1		// Allow port reuse
}

const server = new grpc.Server(grpcServerOptions);
server.addService(DriverServiceService, createDriverGrpcServer(driverGrpcController));

export default server;