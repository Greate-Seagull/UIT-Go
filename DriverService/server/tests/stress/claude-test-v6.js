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
const activeConnections = new Gauge('grpc_active_connections');

// ============================================================================
// SHARED DATA
// ============================================================================
const testDrivers = new SharedArray('test_drivers', function () {
    const csvData = open('../../src/scripts/usernames.csv');
    const parsed = papaparse.parse(csvData, { header: true }).data;
    return parsed.filter(row => row.username && row.username.trim() !== '');
});

const activeDrivers = [];

// ============================================================================
// CONFIGURATION
// ============================================================================
const GRPC_HOST = 'driver-service-prod.southeastasia.cloudapp.azure.com:50051';
const HTTP_BASE_URL = 'http://driver-service-prod.southeastasia.cloudapp.azure.com';
const TEST_PASSWORD = 'TestPass123!';

// Connection pooling: Create pool of shared clients
const CONNECTION_POOL_SIZE = 100;
const connectionPool = [];

// ============================================================================
// INIT CONTEXT - Create connection pool ONCE
// ============================================================================
for (let i = 0; i < CONNECTION_POOL_SIZE; i++) {
    const client = new grpc.Client();
    client.load(["../../proto/driver/v1"], ["driver.proto"]);
    connectionPool.push(client);
}

console.log(`✅ Initialized ${connectionPool.length} gRPC client templates`);

// ============================================================================
// TEST CONFIGURATION
// ============================================================================
export const options = {
    stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 1000 },
        { duration: '3m', target: 2000 },
        { duration: '5m', target: 2000 },
        { duration: '2m', target: 3000 },
        { duration: '1m', target: 2000 },
        { duration: '2m', target: 0 },
    ],

    thresholds: {
        'grpc_req_duration': ['p(95)<100', 'p(99)<200'],
        'errors': ['rate<0.01'],
        'auth_errors': ['rate<0.01'],
        'position_update_success': ['rate>0.99'],
        'position_fetch_success': ['rate>0.99'],
        'position_fetch_duration': ['p(95)<100'],
        'position_update_duration': ['p(95)<100'],
        'auth_duration': ['p(95)<2000'],
    },
};

// ============================================================================
// PER-VU STATE
// ============================================================================
let driverToken = null;
let driverId = null;
let driverUsername = null;
let isAuthenticated = false;
let isOnline = false;
let authAttempts = 0;
const MAX_AUTH_ATTEMPTS = 3;

// Track which client this VU uses (assigned once, reused)
let myClientIndex = null;
let myClient = null;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getRandomCoordinates() {
    const baseLat = 10.8231;
    const baseLong = 106.6297;
    return {
        lat: baseLat + (Math.random() - 0.5) * 0.1,
        long: baseLong + (Math.random() - 0.5) * 0.1
    };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
function signIn(username, password) {
    const startTime = Date.now();
    const payload = JSON.stringify({ username, password });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
        },
        tags: { name: 'sign_in' },
    };

    const response = http.post(`${HTTP_BASE_URL}/api/drivers/sign-in`, payload, params);
    authLatency.add(Date.now() - startTime);

    const success = check(response, {
        'signin: status is 200': (r) => r.status === 200,
        'signin: has token': (r) => {
            try { return r.json('data.token') !== undefined; }
            catch (e) { return false; }
        },
        'signin: has driverId': (r) => {
            try { return r.json('data.driverId') !== undefined; }
            catch (e) { return false; }
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
            console.error(`VU ${__VU}: Sign-in parse error: ${e}`);
            authErrorRate.add(1);
            return false;
        }
    }

    authErrorRate.add(1);
    errorRate.add(1);
    return false;
}

function startDriver() {
    if (!driverToken) return false;

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${driverToken}`,
            'Connection': 'keep-alive',
        },
        tags: { name: 'start_driver' },
    };

    const response = http.put(`${HTTP_BASE_URL}/api/drivers/me/start`, '{}', params);

    const success = check(response, {
        'start: status is 200': (r) => r.status === 200,
        'start: state is READY': (r) => {
            try { return r.json('data.state') === 'READY'; }
            catch (e) { return false; }
        },
    });

    if (success) {
        startCounter.add(1);
        isOnline = true;
        if (driverId && activeDrivers.indexOf(driverId) === -1) {
            activeDrivers.push(driverId);
        }
    } else {
        errorRate.add(1);
    }

    return success;
}

function updatePosition() {
    if (!driverId || !myClient) return false;

    const startTime = Date.now();
    const coords = getRandomCoordinates();

    const request = {
        id: parseInt(driverId),
        lat: coords.lat,
        long: coords.long
    };

    const response = myClient.invoke('driver.v1.DriverService/UpdatePosition', request, {
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

function getPosition(targetDriverId) {
    if (!targetDriverId || !myClient) return false;

    const startTime = Date.now();
    const request = { id: parseInt(targetDriverId) };

    const response = myClient.invoke('driver.v1.DriverService/GetPosition', request, {
        tags: { name: 'get_position_grpc' }
    });

    positionFetchLatency.add(Date.now() - startTime);

    const success = check(response, {
        'get_position: status is OK or NOT_FOUND': (r) => {
            return r && (r.status === grpc.StatusOK || r.status === grpc.StatusNotFound);
        },
        'get_position: valid response': (r) => {
            if (r && r.status === grpc.StatusNotFound) return true;
            return r && r.message !== undefined;
        },
    });

    if (success && response.status === grpc.StatusOK) {
        positionFetchRate.add(1);
    } else if (response.status === grpc.StatusNotFound) {
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
    // Assign this VU to a client from the pool (once per VU)
    if (myClient === null) {
        myClientIndex = __VU % connectionPool.length;
        myClient = connectionPool[myClientIndex];

        // Connect this client if not already connected
        if (!myClient.isConnected) {
            try {
                myClient.connect(GRPC_HOST, {
                    plaintext: true,
                    timeout: '30s'
                });
            } catch (error) {
                console.error(`VU ${__VU}: Failed to connect client ${myClientIndex}: ${error}`);
                return;
            }
        }
    }

    // Authenticate once per VU
    if (!isAuthenticated && authAttempts < MAX_AUTH_ATTEMPTS) {
        const driverIndex = __VU % testDrivers.length;
        const driver = testDrivers[driverIndex];

        if (signIn(driver.username, TEST_PASSWORD)) {
            isAuthenticated = true;
            authenticatedVUs.add(1);
            sleep(0.3);
            startDriver();
            sleep(0.5);
        } else {
            authAttempts++;
            sleep(2);
            return;
        }
    }

    if (!isAuthenticated) {
        sleep(10);
        return;
    }

    // Simulate realistic driver behavior
    const scenario = Math.random() * 100;

    if (scenario < 50) {
        // 50% - Update position
        if (isOnline) {
            updatePosition();
            sleep(Math.random() * 0.5 + 0.2);
        } else {
            if (Math.random() < 0.1) {
                startDriver();
                sleep(0.5);
            } else {
                sleep(5);
            }
        }
    } else if (scenario < 90) {
        // 40% - Fetch position
        if (activeDrivers.length > 0) {
            const randomIndex = Math.floor(Math.random() * activeDrivers.length);
            const randomDriverId = activeDrivers[randomIndex];
            getPosition(randomDriverId);
        }
        sleep(Math.random() * 0.3 + 0.1);
    } else {
        // 10% - Go online
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
    console.log('  DRIVER SERVICE LOAD TEST - WITH CONNECTION POOLING');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Max VUs: 3000`);
    console.log(`  Connection Pool Size: ${CONNECTION_POOL_SIZE}`);
    console.log(`  VUs per connection: ~${Math.ceil(3000 / CONNECTION_POOL_SIZE)}`);
    console.log(`  Test drivers: ${testDrivers.length}`);
    console.log(`  Instances: 2 (load balanced)`);
    console.log('═══════════════════════════════════════════════════════════');

    activeConnections.add(CONNECTION_POOL_SIZE);

    return {
        startTime: Date.now(),
        totalDrivers: testDrivers.length,
    };
}

export function teardown(data) {
    const duration = (Date.now() - data.startTime) / 1000;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);

    // Close all connections
    console.log('\nClosing connection pool...');
    let closed = 0;
    connectionPool.forEach((client, index) => {
        try {
            if (client.isConnected) {
                client.close();
                closed++;
            }
        } catch (error) {
            console.error(`Error closing connection ${index}: ${error}`);
        }
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  LOAD TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Duration: ${minutes}m ${seconds}s`);
    console.log(`  Test drivers: ${data.totalDrivers}`);
    console.log(`  Connections closed: ${closed}/${CONNECTION_POOL_SIZE}`);
    console.log('═══════════════════════════════════════════════════════════');
}