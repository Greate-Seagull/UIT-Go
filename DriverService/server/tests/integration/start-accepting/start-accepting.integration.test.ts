import request from "supertest";
import app from "../../../src/app";
import Request from "superagent/lib/node/response";
import { DriverState } from "../../../src/domain/driver.entity";
import { prisma } from "../../../src/composition-root";
import { driver } from "./start-accepting.test-data";

describe("Start accepting integration test", () => {
	let path: string = "/api/drivers/me/start";
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
			input = { id: 1 };
			output = await request(app).put(path).send(input);
		});

		it("Should return 200", () => {
			expect(output.status).toBe(200);
		});

		it("Should return state 'ready'", () => {
			expect(output.body).toHaveProperty("state", DriverState.READY);
		});
	});

	// No abnormal case
	// describe("Abnormal case", () => {});
});
