import request from "supertest";
import app from "../../../src/app";
import { prisma } from "../../../src/composition-root";
import { driver } from "./complete-trip.test-data";
import { DriverState } from "../../../src/domain/driver.entity";

describe("Complete trip integration test", () => {
	let path = "/api/drivers/me/complete";
	let input = { driverId: driver.id, userId: 1, tripId: 1 };
	let output: any;

	beforeAll(async () => {
		await prisma.driver.create({ data: driver as any });
	});

	afterAll(async () => {
		await prisma.driver.delete({ where: { id: driver.id } });
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			output = await request(app).put(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return state 'ready'", () => {
			expect(output.body).toHaveProperty("state", DriverState.READY);
		});
	});

	describe("Abnormal case", () => {
		describe("Non-ready state case", () => {
			beforeAll(async () => {
				await prisma.driver.update({
					where: { id: driver.id },
					data: { state: DriverState.UNAVAILABLE },
				});

				output = await request(app).put(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty(
					"message",
					"The driver is not in transporting state: UNAVAILABLE"
				);
			});
		});
	});
});
