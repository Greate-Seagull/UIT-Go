import "dotenv/config";

export const config = {
	redis: {
		REDIS_HOST: String(process.env.REDIS_HOST),
		REDIS_PORT: Number(process.env.REDIS_PORT),
	},

	redisCluster: {
		NODES: [
			{
				host: String(process.env.NODE_HOST1),
				port: Number(process.env.NODE_PORT1),
			},
			{
				host: String(process.env.NODE_HOST2),
				port: Number(process.env.NODE_PORT2),
			},
			{
				host: String(process.env.NODE_HOST3),
				port: Number(process.env.NODE_PORT3),
			},
		],
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

	logs: {
		DIR: String(process.env.LOG_DIR),
	},
};
