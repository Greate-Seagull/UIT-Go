import request from "supertest";
import app from "../../../src/app";
import Request from "superagent/lib/node/response";
import { DriverState } from "../../../src/domain/driver.entity";
import { prisma } from "../../../src/composition-root";
import { driver } from "./accept-trip.test-data";

describe("Accept trip integration test", () => {
	let path = "/api/drivers/me/accept";
	let input = { driverId: driver.id, tripId: 1 };
	let output: Request;

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

		it("Should return state 'transporting'", () => {
			expect(output.body).toHaveProperty(
				"state",
				DriverState.TRANSPORTING
			);
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
					"The driver is not in ready state: UNAVAILABLE"
				);
			});
		});
	});
});
