import "dotenv/config";

export const config = {
	redis: {
		REDIS_HOST: String(process.env.REDIS_HOST),
		REDIS_PORT: Number(process.env.REDIS_PORT),
	},

	tripApi: {
		TRIP_SERVICE_URL: String(process.env.TRIP_SERVICE_URL),
	},

	postgres: {
		DATABASE_URL: String(process.env.DATABASE_URL),
	},

	bcrypt: {
		SALT_ROUND: Number(process.env.SALT_ROUND),
	},

	jwt: {
		SECRET: String(process.env.SECRET),
		EXPIRY: String(process.env.EXPIRY),
	},
};
