import http from "http";
import * as grpc from "@grpc/grpc-js";

import app from "./src/app";
import grpcServer from "./src/grpc";

const HTTP_PORT = 3000;
const GRPC_PORT = 50051;

console.log(`Version 1.0.10`);

// --- HTTP SERVER SETUP ---
const httpServer = http.createServer(app);
httpServer.maxConnections = 10000;
httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;

httpServer.listen(HTTP_PORT, () => {
	console.log(`HTTP server running on port ${HTTP_PORT}`);
});

httpServer.on("error", (error: any) => {
	throw error;
});

// --- gRPC SERVER SETUP ---
grpcServer.bindAsync(
	`0.0.0.0:${GRPC_PORT}`,
	grpc.ServerCredentials.createInsecure(),
	(error, port) => {
		if (error) {
			console.error("Failed to start server:", error);
			return;
		}
		console.log(`gRPC server running on port ${port}`);
	}
);

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("SIGTERM received, shutting down gracefully...");

	httpServer.close(() => {
		console.log("HTTP server closed");
	});

	grpcServer.tryShutdown(() => {
		console.log("gRPC server closed");
		process.exit(0);
	});

	setTimeout(() => {
		console.error("Forced shutdown after timeout");
		grpcServer.forceShutdown();
		process.exit(1);
	}, 30000);
});
