import request from "supertest";
import app from "../../src/app";
import Request from "superagent/lib/node/response";
import { DriverState } from "../../src/domain/driver.entity";
import { prisma } from "../../src/composition-root";

describe("Start accepting integration test", () => {
	const path: string = "/drivers/1/state";
	let input;
	let output: Request;

	describe("Normal case", () => {
		beforeAll(async () => {
			input = { state: "ready" };
			output = await request(app).put(path).send(input);
			console.log(output.body);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return status 'ready'", () => {
			expect(output.body).toHaveProperty("state", DriverState.Ready);
		});
	});
});
