import z from "zod";

export const accountSchema = z.object({
	id: z.number().nullable().default(null),
	username: z.string(),
	password: z.string(),
	salt: z.string(),
	driverId: z.number(),
});

export class Account {
	static create(input: any) {
		let parsedInput = accountSchema.parse(input);

		// Business rules here

		return Object.assign(new Account(), parsedInput);
	}

	static rehydrate(input: any) {
		if (!input) return null;

		const entity = new Account();

		Object.assign(entity, input);

		return entity;
	}
}
