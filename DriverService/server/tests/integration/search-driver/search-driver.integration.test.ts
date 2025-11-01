import request from "supertest";
import { queryInput } from "./search-driver.test-data";
import app from "../../../src/app";

describe("Search driver integration test", () => {
	let path = "/api/drivers/search";
	let input;
	let output: any;

	describe("Normal case", () => {
		beforeAll(async () => {
			input = queryInput;
			output = await request(app).get(path).query(input);
		});

		it("Should return 200", () => {
			expect(output).toBe(200);
		});
	});
});
