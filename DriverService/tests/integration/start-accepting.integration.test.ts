import request from "supertest";
import app from "../../src/app";
import Request from "superagent/lib/node/response";
import { DriverState } from "../../src/domain/driver.entity";
import { prisma } from "../../src/composition-root";

describe("Start accepting integration test", () => {
	let path: string = "/drivers/1/state";
	let input;
	let output: Request;

	describe("Normal case", () => {
		beforeAll(async () => {
			input = { state: "ready" };
			output = await request(app).put(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return status 'ready'", () => {
			expect(output.body).toHaveProperty("state", DriverState.READY);
		});
	});

	describe("Abnormal case", () => {
		describe("Unexisting id case", () => {
			beforeAll(async () => {
				path = "/drivers/123/state";
				input = { state: "ready" };
				output = await request(app).put(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty(
					"message",
					"Cannot find driver with id: 123"
				);
			});
		});

		describe("Sending wrong state case", () => {
			beforeAll(async () => {
				path = "/drivers/1/state";
				input = { state: "unavailable" };
				output = await request(app).put(path).send(input);
			});

			it("Should return error message", () => {
				expect(output.body).toHaveProperty(
					"message",
					"Expect driver state: READY"
				);
			});
		});
	});
});
