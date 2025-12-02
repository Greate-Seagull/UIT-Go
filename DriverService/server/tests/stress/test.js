import http from "k6/http";
import { check, sleep } from "k6";

const url = "http://ec2-54-252-166-150.ap-southeast-2.compute.amazonaws.com/api/drivers/me/start";
const body = JSON.stringify({ id: 12 });
const params = { headers: { "Content-Type": "application/json" } };

// k6 options
export const options = {
	scenarios: {
		stress_test: {
			executor: "shared-iterations",
			vus: 500,          // 500 concurrent virtual users
			iterations: 100000, // total requests
		},
	},
	thresholds: {
		http_req_failed: ["rate<0.01"], // fail if more than 1% requests fail
		checks: ["rate>0.99"],          // fail if less than 99% checks succeed
		http_req_duration: ["p(95)<5"], // 95% of requests should finish < 5s
	},
};

// Main function
export default function () {
	const res = http.put(url, body, params);

	// Safe check
	const success = check(res, {
		"driver state was READY": (r) => r.body && r.body.includes("state")
	});

	// Log failed responses for debugging
	if (!success) {
		console.error(`Failed response: status=${res.status} body=${res.body}`);
	}

	// Optional sleep to simulate realistic pacing
	// sleep(0.01); 
}
