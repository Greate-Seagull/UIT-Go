import request from "supertest";
import app from "../../../src/app";
import Request from "superagent/lib/node/response";
import { driverPositionInput } from "./update-position.test-data";

describe("Update position integration test", () => {
	let path = "/api/drivers/me/position";
	let input;
	let output: Request;

	describe("Normal case", () => {
		beforeAll(async () => {
			input = driverPositionInput;
			output = await request(app).post(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return correct lat", () => {
			expect(output.body).toHaveProperty("lat", driverPositionInput.lat);
		});

		it("Should return correct long", () => {
			expect(output.body).toHaveProperty(
				"long",
				driverPositionInput.long
			);
		});
	});
});
