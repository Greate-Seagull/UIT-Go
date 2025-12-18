import http from 'k6/http';
import { check, sleep } from 'k6';

// ------------------ CONFIG ------------------
export const options = {
	// Stages: adjust targets/durations to scale load up/down
	stages: [
		{ duration: '30s', target: 500 },   // ramp-up
		{ duration: '2m', target: 2000 },  // sustain heavy load
		{ duration: '30s', target: 4000 },  // spike to very heavy load
		{ duration: '2m', target: 2000 },  // sustain
		{ duration: '30s', target: 0 },     // ramp-down
	],
	// Thresholds: fail the test if too many errors or high p95
	thresholds: {
		http_req_failed: ['rate<0.05'],      // allow up to 5% fails (can tighten)
		http_req_duration: ['p(95)<3000'],  // 95% < 3s (adjust to your SLA)
	},
	// Optional: increase maxRedirects, etc.
	noConnectionReuse: false,
	throw: true,
};

// ------------------ ENDPOINTS ------------------
const BASE = 'http://ec2-54-252-166-150.ap-southeast-2.compute.amazonaws.com';

// Endpoints
const SIGN_UP = `${BASE}/api/drivers/sign-up`;
const SIGN_IN = `${BASE}/api/drivers/sign-in`;
const START = `${BASE}/api/drivers/me/start`;
const UPDATE_POS = `${BASE}/trpc/drivers.updatePosition`;
const GET_POS = (id) => `${BASE}/api/drivers/${id}/position`;

// ------------------ PER-VU STATE ------------------
// These variables live per VU (declared outside default but mutated inside).
let authToken = null;
let driverId = null;
let baseLat = null;
let baseLong = null;

// Utility: build a unique username per VU to avoid collisions
function uniqueUsername() {
	// __VU is the virtual user id assigned by k6
	// include timestamp to reduce collision across repeated runs
	return `load_user_${__VU}_${Date.now() % 100000}`;
}

// Utility: safe JSON parse
function tryParse(body) {
	try {
		return JSON.parse(body);
	} catch (err) {
		return null;
	}
}

// Utility: small random walk around base coords
function jitter(val, meters = 0.0001) {
	return val + (Math.random() - 0.5) * meters;
}

// ------------------ DEFAULT SCENARIO ------------------
export default function () {
	// 1) Sign up (once per VU)
	if (!authToken) {
		const username = uniqueUsername();
		const signupPayload = JSON.stringify({
			name: `load-${username}`,
			licensePlate: `${Math.floor(Math.random() * 100000)}`,
			username: username,
			password: 'testpass',
		});

		const signupRes = http.post(SIGN_UP, signupPayload, {
			headers: { 'Content-Type': 'application/json' },
			tags: { endpoint: 'sign-up' },
		});

		check(signupRes, {
			'sign-up status 200': (r) => r.status === 200,
			'sign-up returned JSON': (r) => tryParse(r.body) !== null,
			'sign-up has token': (r) => {
				const b = tryParse(r.body);
				return b && b.data && b.data.token && b.data.driverId;
			},
		});

		const parsed = tryParse(signupRes.body);
		if (parsed && parsed.data) {
			authToken = parsed.data.token;
			driverId = parsed.data.driverId;
		} else {
			// if sign-up fails, stop further actions in this iteration
			// (k6 will still continue other VUs)
			sleep(1);
			return;
		}

		// set a random starting position for this VU (per-driver)
		baseLat = 10 + Math.random() * 5; // example area; adjust to your domain
		baseLong = 106 + Math.random() * 5;
	}

	// Prepare auth header
	const headers = {
		Authorization: `Bearer ${authToken}`,
		'Content-Type': 'application/json',
	};

	// 2) PUT /me/start — driver goes READY (do once per VU, but harmless to repeat)
	const startRes = http.put(START, null, { headers, tags: { endpoint: 'start' } });
	check(startRes, {
		'start status 200': (r) => r.status === 200,
		'start returned JSON': (r) => tryParse(r.body) !== null,
		'start has READY': (r) => {
			const b = tryParse(r.body);
			return b && b.data && (b.data.state === 'READY' || b.data.state === 'ONLINE' || b.data.state === 'OK');
		},
	});

	// small pause before updates begin
	sleep(0.05 + Math.random() * 0.15);

	// 3) Three updatePosition calls with slight movement between them
	for (let i = 0; i < 3; i++) {
		const payload = JSON.stringify({
			id: driverId,
			lat: jitter(baseLat, 0.0008),
			long: jitter(baseLong, 0.0008),
		});

		const updRes = http.post(UPDATE_POS, payload, { headers, tags: { endpoint: 'updatePosition' } });

		check(updRes, {
			'update status 200': (r) => r.status === 200,
			'update returned JSON': (r) => tryParse(r.body) !== null,
			'update has lat/long': (r) => {
				const b = tryParse(r.body);
				return !!(b && b.result && b.result.data && b.result.data.lat && b.result.data.long);
			},
		});

		// quick jitter between updates — drivers typically send frequent small updates
		sleep(0.05 + Math.random() * 0.2);
	}

	// 4) GET /api/drivers/:id/position
	const getRes = http.get(GET_POS(driverId), { headers, tags: { endpoint: 'getPosition' } });

	check(getRes, {
		'getpos status 200': (r) => r.status === 200,
		'getpos returned JSON': (r) => tryParse(r.body) !== null,
		'getpos contains coordinates': (r) => {
			const b = tryParse(r.body);
			// accept either { lat,long } or { result: { data: { lat,long }}} — be permissive
			if (!b) return false;
			if (b.lat && b.long) return true;
			if (b.result && b.result.data && b.result.data.lat && b.result.data.long) return true;
			if (b.data && b.data.lat && b.data.long) return true;
			return false;
		},
	});

	// Sleep before next iteration: controls per-VU RPS. Lower = more requests.
	sleep(0.2 + Math.random() * 0.6);
}
