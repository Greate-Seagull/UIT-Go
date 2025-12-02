import z from "zod";

export enum DriverState {
	READY = "READY",
	TRANSPORTING = "TRANSPORTING",
	UNAVAILABLE = "UNAVAILABLE",
}

export const driverSchema = z.object({
	id: z.number().nullable().default(null),
	state: z.string().default(DriverState.UNAVAILABLE),
	name: z.string(),
	licensePlate: z.string(),
});

export class Driver {
	static create(input: any) {
		let parsedInput = driverSchema.parse(input);

		// Business rules here

		return Object.assign(new Driver(), parsedInput);
	}

	static rehydrate(input: any) {
		if (!input) return null;

		const entity = new Driver();

		Object.assign(entity, input);

		return entity;
	}
}
