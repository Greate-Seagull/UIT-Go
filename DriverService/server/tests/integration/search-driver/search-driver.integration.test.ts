import request from "supertest";
import { driverPositionData, queryInput } from "./search-driver.test-data";
import app from "../../../src/app";
import { driverPositionRepository, redis } from "../../../src/composition-root";
import { DriverPositionRepository } from "../../../src/infrastructure/repositories/driver-position.repository";

describe("Search driver integration test", () => {
	let path = "/api/drivers/search";
	let input: any;
	let output: any;

	beforeAll(async () => {
		await driverPositionRepository.save(driverPositionData);
	});

	afterAll(async () => {
		await redis.zrem(
			DriverPositionRepository.GEO_KEY,
			driverPositionData.id
		);
	});

	describe("Normal case", () => {
		describe("Searchable driver position case", () => {
			beforeAll(async () => {
				input = queryInput;
				output = await request(app).get(path).query(input);
			});

			it("Should return 200", () => {
				expect(output.status).toBe(200);
			});

			it("Should return correct driver id", () => {
				const uniqueResult = output.body[0];
				expect(uniqueResult.id).toBe(driverPositionData.id);
			});
		});

		describe("Out-ranged driver position case", () => {
			beforeAll(async () => {
				input = structuredClone(queryInput);
				input.radiusMeters = 200;
				output = await request(app).get(path).query(input);
			});

			it("Should return 200", () => {
				expect(output.status).toBe(200);
			});

			it("Should return correct driver id", () => {
				expect(output.body).toHaveLength(0);
			});
		});
	});
});
