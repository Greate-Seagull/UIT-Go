import request from "supertest";
import app from "../../../src/app";
import Request from "superagent/lib/node/response";
import { DriverState } from "../../../src/domain/driver.entity";
import { prisma } from "../../../src/composition-root";
import { driver } from "./accept-trip.test-data";

describe("Accept trip integration test", () => {
	let path = `/drivers/${driver.id}/accept`;
	let input;
	let output: Request;

	beforeAll(async () => {
		await prisma.driver.create({ data: driver as any });
	});

	afterAll(async () => {
		await prisma.driver.delete({ where: { id: driver.id } });
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			input = { tripId: 1 };
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
		describe("Unexisting user case", () => {
			beforeAll(async () => {
				path = `/drivers/-1/accept`;
				input = { tripId: 1 };
				output = await request(app).put(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty(
					"message",
					"Cannot find driver with id: -1"
				);
			});
		});

		describe("Non-ready state case", () => {
			beforeAll(async () => {
				await prisma.driver.update({
					where: { id: driver.id },
					data: { state: DriverState.UNAVAILABLE },
				});

				path = `/drivers/2/accept`;
				input = { tripId: 1 };
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
