import request from "supertest";
import app from "../../../src/app";
import { prisma } from "../../../src/composition-root";
import { driver } from "./reject-trip.test-data";

describe("Reject trip integration test", () => {
	let path = "/api/drivers/me/reject";
	let input: any = { driverId: driver.id, offerId: 1 };
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
	});
});
