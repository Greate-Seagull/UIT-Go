import z from "zod";

export const driverPositionSchema = z.object({
	id: z.number().nullable().default(null),
	lat: z.number(),
	long: z.number(),
});

export class DriverPosition {
	static create(input: any) {
		let parsedInput = driverPositionSchema.parse(input);

		// Business rules here

		return Object.assign(new DriverPosition(), parsedInput);
	}

	static rehydrate(input: any) {
		if (!input) return null;

		const entity = new DriverPosition();

		Object.assign(entity, input);

		return entity;
	}
}
