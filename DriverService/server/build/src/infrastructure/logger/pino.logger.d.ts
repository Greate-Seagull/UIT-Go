import { Logger as PinoBaseLogger } from "pino";
export declare class PinoLogger {
    private readonly logger;
    constructor(logger: PinoBaseLogger);
    debug(message: string, context?: any): void;
    info(message: string, context?: any): void;
    warn(message: string, context?: any): void;
    error(message: string, context?: any): void;
}
export declare const logger: PinoLogger;
//# sourceMappingURL=pino.logger.d.ts.map