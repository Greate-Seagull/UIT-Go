import z from "zod";
import { Request, Response, NextFunction } from "express";
import { tokenService } from "../../composition-root";
import { authenticationTokenSchema } from "../../domain/service/encrypt.service";
import { logger } from "../../infrastructure/logger/pino.logger";

export const bearerTokenHeaderSchema = z
	.string()
	.regex(/^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/, "Invalid Bearer token format")
	.transform((val) => {
		const [, token] = val.split(" ");
		return token as string;
	});

export function authenticationMiddleware(
	req: any,
	res: any,
	next: NextFunction
) {
	logger.info("AuthenticationMiddleware: Start", {
		path: req.path,
		method: req.method,
	});

	try {
		logger.debug("AuthenticationMiddleware: Checking Authorization header");
		const result = authenticate(req.headers.authorization);

		req.authId = result.id;
		logger.info("AuthenticationMiddleware: Authenticated", {
			userId: result.id,
		});

		next();
	} catch (e: any) {
		logger.warn("AuthenticationMiddleware: Unauthorized request", {
			path: req.path,
			method: req.method,
			error: e.message,
		});

		res.status(401).jsend.fail("Unauthenticated");
	}
}

function authenticate(header: string | undefined) {
	const authHeader = bearerTokenHeaderSchema.parse(header);
	const decoded = tokenService.verifyJwt(authHeader);
	const result = authenticationTokenSchema.parse(decoded);
	return result;
}
