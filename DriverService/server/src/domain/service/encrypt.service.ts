import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";

export class PasswordService {
	constructor(private readonly saltRound: number) {}

	async generateSalt() {
		return await bcrypt.genSalt(this.saltRound);
	}

	async hashPassword(barePassword: string, salt: string): Promise<string> {
		return await bcrypt.hash(barePassword, salt);
	}

	async comparePassword(
		barePassword: string,
		hashedPassword: string
	): Promise<boolean> {
		return await bcrypt.compare(barePassword, hashedPassword);
	}
}

export type Expiry = `${number}${"s" | "m" | "h" | "d"}`;
export const authenticationTokenSchema = z.object({
	id: z.number(),
});
export type AuthenticationTokenPayload = z.infer<
	typeof authenticationTokenSchema
>;

export class TokenService {
	constructor(
		private readonly secret: jwt.Secret,
		private readonly expiry: Expiry
	) {}

	generateJwt(payload: AuthenticationTokenPayload) {
		const options: SignOptions = { expiresIn: this.expiry };
		return jwt.sign(payload, this.secret, options);
	}

	verifyJwt(token: string) {
		return jwt.verify(token, this.secret);
	}
}
