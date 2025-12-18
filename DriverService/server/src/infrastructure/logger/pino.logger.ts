import pino, { Logger as PinoBaseLogger } from "pino";

export class PinoLogger {
	constructor(private readonly logger: PinoBaseLogger) {}

	debug(message: string, context?: any) {
		this.logger.debug(context ?? {}, message);
	}

	info(message: string, context?: any) {
		this.logger.info(context ?? {}, message);
	}

	warn(message: string, context?: any) {
		this.logger.warn(context ?? {}, message);
	}

	error(message: string, context?: any) {
		this.logger.error(context ?? {}, message);
	}
}

export const logger = new PinoLogger(
	pino({
		level: "debug",
		transport: {
			target: "pino-pretty",
			options: { colorize: true },
		},
	})
);
