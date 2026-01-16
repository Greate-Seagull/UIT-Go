import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend, Gauge } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// ============================================================================
// CUSTOM METRICS
// ============================================================================
const errorRate = new Rate('errors');
const authErrorRate = new Rate('auth_errors');
const positionUpdateRate = new Rate('position_update_success');
const positionFetchRate = new Rate('position_fetch_success');

const signInCounter = new Counter('sign_ins');
const positionUpdates = new Counter('position_updates');
const startCounter = new Counter('driver_starts');

const positionFetchLatency = new Trend('position_fetch_duration');
const positionUpdateLatency = new Trend('position_update_duration');
const authLatency = new Trend('auth_duration');

const authenticatedVUs = new Gauge('authenticated_vus');

// ============================================================================
// SHARED DATA - Load pre-existing test drivers
// ============================================================================
const testDrivers = new SharedArray('test_drivers', function () {
    const csvData = open('../../src/scripts/usernames.csv');
    const parsed = papaparse.parse(csvData, { header: true }).data;

    // Filter out empty rows
    return parsed.filter(row => row.username && row.username.trim() !== '');
});

const activeDrivers = []

// ============================================================================
// TEST CONFIGURATION
// ============================================================================
export const options = {
    stages: [
        { duration: '1m', target: 50 },      // Warm up: 50 VUs
        { duration: '2m', target: 200 },     // Ramp to 200 VUs
        { duration: '2m', target: 500 },     // Ramp to 500 VUs
        { duration: '3m', target: 1000 },    // Ramp to 1000 VUs (target load)
        { duration: '5m', target: 1000 },    // Sustain at 1000 VUs for 5 minutes
        { duration: '2m', target: 1500 },    // Spike test: 1500 VUs
        { duration: '1m', target: 1000 },    // Return to normal: 1000 VUs
        { duration: '2m', target: 0 },       // Cool down: ramp down to 0
    ],

    thresholds: {
        // HTTP Request thresholds
        'http_req_duration': [
            'p(95)<800',              // 95% of requests should be below 800ms
            'p(99)<1500'              // 99% of requests should be below 1500ms
        ],
        'http_req_failed': ['rate<0.01'],     // Less than 1% HTTP errors

        // Custom metric thresholds
        'errors': ['rate<0.05'],                        // Less than 5% total errors
        'auth_errors': ['rate<0.01'],                   // Less than 1% auth errors
        'position_update_success': ['rate>0.95'],       // 95%+ position updates succeed
        'position_fetch_success': ['rate>0.95'],        // 95%+ position fetches succeed

        // Latency thresholds
        'position_fetch_duration': ['p(95)<500'],       // Position lookups: p95 < 500ms
        'position_update_duration': ['p(95)<800'],      // Position updates: p95 < 800ms
        'auth_duration': ['p(95)<1000'],                // Authentication: p95 < 1000ms
    },

    // Graceful shutdown
    gracefulStop: '30s',
};

// ============================================================================
// CONFIGURATION
// ============================================================================
const BASE_URL = 'http://driver-service-prod.southeastasia.cloudapp.azure.com';

// Password for all test drivers (should match what was used during account creation)
const TEST_PASSWORD = 'TestPass123!';

// Per-VU state (each VU maintains its own session)
let driverToken = null;
let driverId = null;
let driverUsername = null;
let isAuthenticated = false;
let isOnline = false;
let authAttempts = 0;
const MAX_AUTH_ATTEMPTS = 3;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate realistic coordinates in Southeast Asia (Vietnam - Ho Chi Minh City area)
function getRandomCoordinates() {
    const baseLat = 10.8231;
    const baseLong = 106.6297;

    return {
        lat: baseLat + (Math.random() - 0.5) * 0.1,    // ~5km radius variation
        long: baseLong + (Math.random() - 0.5) * 0.1
    };
}

// Select a random driver from the test pool
function getRandomDriver() {
    return testDrivers[Math.floor(Math.random() * testDrivers.length)];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Sign in existing driver
function signIn(username, password) {
    const startTime = Date.now();

    const payload = JSON.stringify({
        username: username,
        password: password
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'sign_in' },
    };

    const response = http.post(`${BASE_URL}/api/drivers/sign-in`, payload, params);

    authLatency.add(Date.now() - startTime);

    const success = check(response, {
        'signin: status is 200': (r) => r.status === 200,
        'signin: has token': (r) => {
            try {
                return r.json('data.token') !== undefined;
            } catch (e) {
                return false;
            }
        },
        'signin: has driverId': (r) => {
            try {
                return r.json('data.driverId') !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    if (success && response.status === 200) {
        try {
            const data = response.json('data');
            driverToken = data.token;
            driverId = data.driverId;
            driverUsername = username;
            signInCounter.add(1);
            authErrorRate.add(0);
            return true;
        } catch (e) {
            console.error(`VU ${__VU}: Sign-in JSON parse error: ${e}`);
            authErrorRate.add(1);
            return false;
        }
    }

    authErrorRate.add(1);
    errorRate.add(1);
    return false;
}

// Start driver (go online)
function startDriver() {
    if (!driverToken) {
        console.warn(`VU ${__VU}: Cannot start driver - no token`);
        return false;
    }

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${driverToken}`
        },
        tags: { name: 'start_driver' },
    };

    const response = http.put(`${BASE_URL}/api/drivers/me/start`, '{}', params);

    const success = check(response, {
        'start: status is 200': (r) => r.status === 200,
        'start: state is READY': (r) => {
            try {
                return r.json('data.state') === 'READY';
            } catch (e) {
                return false;
            }
        },
    });

    if (success) {
        startCounter.add(1);
        isOnline = true;
        if (driverId && activeDrivers.indexOf(driverId) === -1)
            activeDrivers.push(driverId)
    } else {
        errorRate.add(1);
    }

    return success;
}

// Update driver position
function updatePosition() {
    if (!driverId) {
        console.warn(`VU ${__VU}: Cannot update position - no driverId`);
        return false;
    }

    const startTime = Date.now();
    const coords = getRandomCoordinates();

    const payload = JSON.stringify({
        id: driverId,
        lat: coords.lat,
        long: coords.long
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'update_position' },
    };

    const response = http.post(`${BASE_URL}/trpc/drivers.updatePosition`, payload, params);

    positionUpdateLatency.add(Date.now() - startTime);

    const success = check(response, {
        'update_position: status is 200': (r) => r.status === 200,
        'update_position: has result': (r) => {
            try {
                const result = r.json('result');
                return result !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    if (success) {
        positionUpdates.add(1);
        positionUpdateRate.add(1);
    } else {
        positionUpdateRate.add(0);
        errorRate.add(1);
    }

    return success;
}

// Get driver position
function getPosition(targetDriverId) {
    if (!targetDriverId) {
        return false;
    }

    const startTime = Date.now();

    const params = {
        tags: { name: 'get_position' },
    };

    const response = http.get(`${BASE_URL}/api/drivers/${targetDriverId}/position`, params);

    positionFetchLatency.add(Date.now() - startTime);

    const success = check(response, {
        'get_position: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
        'get_position: valid response': (r) => {
            if (r.status === 404) return true; // Driver not found is acceptable
            try {
                const data = r.json('data');
                return data !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    if (success && response.status === 200) {
        positionFetchRate.add(1);
    } else if (response.status === 404) {
        // Not an error - driver just doesn't have a position yet
        positionFetchRate.add(1);
    } else {
        positionFetchRate.add(0);
        errorRate.add(1);
    }

    return success;
}

// ============================================================================
// MAIN TEST LOGIC
// ============================================================================

export default function () {
    // ========================================
    // STEP 1: Authenticate (once per VU)
    // ========================================
    if (!isAuthenticated && authAttempts < MAX_AUTH_ATTEMPTS) {
        // Each VU gets assigned a specific driver from the pool
        // Use VU ID to ensure even distribution across all test drivers
        const driverIndex = __VU % testDrivers.length;
        const driver = testDrivers[driverIndex];

        console.log(`VU ${__VU}: Attempting authentication with ${driver.username}`);

        if (signIn(driver.username, TEST_PASSWORD)) {
            isAuthenticated = true;
            authenticatedVUs.add(1);
            console.log(`VU ${__VU}: Successfully authenticated as ${driver.username}`);

            // Go online immediately after authentication
            sleep(0.3);
            startDriver();
            sleep(0.5);
        } else {
            authAttempts++;
            console.error(`VU ${__VU}: Authentication failed (attempt ${authAttempts}/${MAX_AUTH_ATTEMPTS})`);
            sleep(2); // Wait before retry
            return;
        }
    }

    // If authentication failed after max attempts, this VU stops executing
    if (!isAuthenticated) {
        console.error(`VU ${__VU}: Max auth attempts reached, VU will idle`);
        sleep(10);
        return;
    }

    // ========================================
    // STEP 2: Simulate realistic driver behavior
    // ========================================
    const scenario = Math.random() * 100;

    if (scenario < 50) {
        // 75% - Active drivers updating position (most common operation)
        // Simulates drivers moving around while online

        if (isOnline) {
            updatePosition();
            sleep(Math.random() * 5 + 3); // 3-8 seconds between updates (realistic GPS update interval)
        } else {
            // If offline, occasionally go back online
            if (Math.random() < 0.1) { // 10% chance to go online
                startDriver();
                sleep(0.5);
            } else {
                sleep(5); // Offline drivers don't do much
            }
        }

    } else if (scenario < 90) {
        // 15% - Users/riders checking driver positions
        // Simulates customers looking for nearby drivers

        const randomDriver = getRandomDriver();
        if (randomDriver.username) {
            const randomIndex = Math.floor(Math.random() * activeDrivers.length);
            const randomDriverId = activeDrivers[randomIndex];
            getPosition(randomDriverId);
        }
        sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds

    } else {
        // 10% - Drivers going online

        if (!isOnline) {
            startDriver();
            sleep(0.5);
            updatePosition();
            sleep(0.5);
        } else {
            updatePosition();
            sleep(3);
        }
    }
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export function setup() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DRIVER SERVICE LOAD TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Target: 1000 concurrent VUs (sustained)`);
    console.log(`  Spike: 1500 concurrent VUs`);
    console.log(`  Test drivers available: ${testDrivers.length}`);
    console.log(`  Base URL: ${BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════════');

    // Verify we have enough test drivers
    if (testDrivers.length < 1000) {
        console.warn(`⚠️  WARNING: Only ${testDrivers.length} test drivers available for 1000 VUs`);
        console.warn(`    Some VUs will share drivers (not ideal but acceptable)`);
    }

    return {
        startTime: Date.now(),
        totalDrivers: testDrivers.length
    };
}

export function teardown(data) {
    const duration = (Date.now() - data.startTime) / 1000;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  LOAD TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Duration: ${minutes}m ${seconds}s`);
    console.log(`  Test drivers used: ${data.totalDrivers}`);
    console.log('═══════════════════════════════════════════════════════════');
}