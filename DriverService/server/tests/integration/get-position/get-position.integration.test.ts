import request from "supertest";
import app from "../../../src/app";
import { driverPositionRepository, redis } from "../../../src/composition-root";
import { driverPosition } from "./get-position.test-data";
import { DriverPositionRepository } from "../../../src/infrastructure/repositories/driver-position.repository";

describe("Get position integration test", () => {
	let path = `/api/drivers/${driverPosition.id}/position`;
	let input: any = {};
	let output: any;

	beforeAll(async () => {
		await driverPositionRepository.save(driverPosition);
	});

	afterAll(async () => {
		await redis.zrem(DriverPositionRepository.GEO_KEY, driverPosition.id);
	});

	describe("Normal case", () => {
		beforeAll(async () => {
			output = await request(app).get(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return correct long", () => {
			expect(output.body.long).toBeCloseTo(driverPosition.long);
		});

		it("Should return correct lat", () => {
			expect(output.body.lat).toBeCloseTo(driverPosition.lat);
		});
	});

	describe("Abnormal case", () => {
		describe("Not found driver case", () => {
			beforeAll(async () => {
				let path = `/api/drivers/${driverPosition.id - 1}/position`;
				output = await request(app).get(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty(
					"message",
					"Driver doesn't exist or not in ready state"
				);
			});
		});
	});
});
