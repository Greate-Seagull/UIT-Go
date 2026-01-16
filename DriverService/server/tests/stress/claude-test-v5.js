import grpc from 'k6/net/grpc';
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
        { duration: '1m', target: 100 },      // Warm up: 100 VUs
        { duration: '2m', target: 400 },     // Ramp to 400 VUs
        { duration: '2m', target: 1000 },     // Ramp to 1000 VUs
        { duration: '3m', target: 2000 },    // Ramp to 2000 VUs (target load)
        { duration: '5m', target: 2000 },    // Sustain at 2000 VUs for 5 minutes
        { duration: '2m', target: 3000 },    // Spike test: 3000 VUs
        { duration: '1m', target: 2000 },    // Return to normal: 2000 VUs
        { duration: '2m', target: 0 },       // Cool down: ramp down to 0
    ],

    thresholds: {
        // gRPC Request thresholds
        'grpc_req_duration': [
            'p(95)<800',              // 95% of requests should be below 800ms
            'p(99)<1500'              // 99% of requests should be below 1500ms
        ],

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
const GRPC_HOST = 'driver-service-prod.southeastasia.cloudapp.azure.com:50051';
const HTTP_BASE_URL = 'http://driver-service-prod.southeastasia.cloudapp.azure.com';

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

// gRPC client (one per VU)
const client = new grpc.Client();
client.load(["../../proto/driver/v1"], ["driver.proto"]);

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
// API FUNCTIONS (HTTP for auth, gRPC for position operations)
// ============================================================================

// Sign in existing driver (still using HTTP REST API)
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

    const response = http.post(`${HTTP_BASE_URL}/api/drivers/sign-in`, payload, params);

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

// Start driver (go online) - still using HTTP REST API
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

    const response = http.put(`${HTTP_BASE_URL}/api/drivers/me/start`, '{}', params);

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

// Update driver position via gRPC
function updatePosition() {
    if (!driverId) {
        console.warn(`VU ${__VU}: Cannot update position - no driverId`);
        return false;
    }

    const startTime = Date.now();
    const coords = getRandomCoordinates();

    const request = {
        id: parseInt(driverId),
        lat: coords.lat,
        long: coords.long
    };

    const response = client.invoke('driver.v1.DriverService/UpdatePosition', request, {
        tags: { name: 'update_position_grpc' }
    });

    positionUpdateLatency.add(Date.now() - startTime);

    const success = check(response, {
        'update_position: status is OK': (r) => r && r.status === grpc.StatusOK,
    });

    if (success) {
        positionUpdates.add(1);
        positionUpdateRate.add(1);
    } else {
        positionUpdateRate.add(0);
        errorRate.add(1);
        if (response && response.error) {
            console.error(`VU ${__VU}: UpdatePosition error: ${response.error.message}`);
        }
    }

    return success;
}

// Get driver position via gRPC
function getPosition(targetDriverId) {
    if (!targetDriverId) {
        return false;
    }

    const startTime = Date.now();

    const request = {
        id: parseInt(targetDriverId)
    };

    const response = client.invoke('driver.v1.DriverService/GetPosition', request, {
        tags: { name: 'get_position_grpc' }
    });

    positionFetchLatency.add(Date.now() - startTime);

    const success = check(response, {
        'get_position: status is OK or NOT_FOUND': (r) => {
            return r && (r.status === grpc.StatusOK || r.status === grpc.StatusNotFound);
        },
        'get_position: valid response': (r) => {
            if (r.status === grpc.StatusNotFound) return true; // Driver not found is acceptable
            return r && r.message !== undefined;
        },
    });

    if (success && response.status === grpc.StatusOK) {
        positionFetchRate.add(1);
    } else if (response.status === grpc.StatusNotFound) {
        // Not an error - driver just doesn't have a position yet
        positionFetchRate.add(1);
    } else {
        positionFetchRate.add(0);
        errorRate.add(1);
        if (response && response.error) {
            console.error(`VU ${__VU}: GetPosition error: ${response.error.message}`);
        }
    }

    return success;
}

// ============================================================================
// MAIN TEST LOGIC
// ============================================================================

export default function () {
    // Connect to gRPC server once per VU (reuse connection)
    if (!client.isConnected) {
        client.connect(GRPC_HOST, {
            plaintext: true, // Set to false if using TLS
            timeout: '30s'
        });
    }

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
        // 50% - Active drivers updating position (most common operation)
        // Simulates drivers moving around while online

        if (isOnline) {
            updatePosition();
            sleep(Math.random() * 0.5 + 0.2); // 0.2-0.7 seconds between updates
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
        // 40% - Users/riders checking driver positions
        // Simulates customers looking for nearby drivers

        if (activeDrivers.length > 0) {
            const randomIndex = Math.floor(Math.random() * activeDrivers.length);
            const randomDriverId = activeDrivers[randomIndex];
            getPosition(randomDriverId);
        }
        sleep(Math.random() * 0.3 + 0.1); // 0.1-0.4 seconds

    } else {
        // 10% - Drivers going online

        if (!isOnline) {
            startDriver();
            sleep(0.5);
            updatePosition();
            sleep(0.5);
        } else {
            updatePosition();
            sleep(0.3);
        }
    }
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export function setup() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DRIVER SERVICE gRPC LOAD TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Target: 2000 concurrent VUs (sustained)`);
    console.log(`  Spike: 3000 concurrent VUs`);
    console.log(`  Test drivers available: ${testDrivers.length}`);
    console.log(`  gRPC Host: ${GRPC_HOST}`);
    console.log(`  HTTP Base URL: ${HTTP_BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════════');

    // Verify we have enough test drivers
    if (testDrivers.length < 2000) {
        console.warn(`⚠️  WARNING: Only ${testDrivers.length} test drivers available for 2000 VUs`);
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

    // Close gRPC connection
    client.close();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  LOAD TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Duration: ${minutes}m ${seconds}s`);
    console.log(`  Test drivers used: ${data.totalDrivers}`);
    console.log('═══════════════════════════════════════════════════════════');
}