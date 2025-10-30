import "dotenv/config";

export const config = {
	redis: {
		REDIS_HOST: String(process.env.REDIS_HOST),
		REDIS_PORT: Number(process.env.REDIS_PORT),
	},
};
