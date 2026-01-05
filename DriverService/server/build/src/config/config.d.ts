import "dotenv/config";
export declare const config: {
    redis: {
        REDIS_HOST: string;
        REDIS_PORT: number;
    };
    tripApi: {
        TRIP_SERVICE_URL: string;
    };
    postgres: {
        DATABASE_URL: string;
    };
    bcrypt: {
        SALT_ROUND: number;
    };
    jwt: {
        SECRET: string;
        EXPIRY: string;
    };
};
//# sourceMappingURL=config.d.ts.map