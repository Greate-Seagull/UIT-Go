import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const signUpCounter = new Counter('sign_ups');
const signInCounter = new Counter('sign_ins');
const positionUpdates = new Counter('position_updates');
const startCounter = new Counter('driver_starts');
const positionFetchLatency = new Trend('position_fetch_duration');

const activeDriverIds = [];
const usernames = new SharedArray('usernames', function () {
  const csvData = open('../../src/scripts/usernames.csv');
  return papaparse.parse(csvData, { header: true }).data.map(row => row.username);
});

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Warm up
    { duration: '2m', target: 200 },   // Ramp to 200 rps
    { duration: '2m', target: 500 },   // Ramp to 500 rps
    { duration: '3m', target: 1000 },  // Ramp to 1000 rps
    { duration: '5m', target: 1000 },  // Sustain at 1000 rps
    { duration: '2m', target: 1500 },  // Spike test - beyond target
    { duration: '1m', target: 1000 },  // Back to target
    { duration: '2m', target: 0 },     // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<800', 'p(99)<1500'], // 95% under 800ms
    'http_req_failed': ['rate<0.01'],  // Less than 1% errors
    'errors': ['rate<0.01'],
    'position_fetch_duration': ['p(95)<500'], // Position lookups should be fast
  },
};

const BASE_URL = 'http://driver-service-prod.southeastasia.cloudapp.azure.com';

// Store driver sessions (simple in-memory store per VU)
let driverToken = null;
let driverId = null;

// Simulate realistic coordinates in Southeast Asia (Vietnam area)
function getRandomCoordinates() {
  const baseLat = 10.8231; // Ho Chi Minh City area
  const baseLong = 106.6297;

  return {
    lat: baseLat + (Math.random() - 0.5) * 0.1, // ~5km radius
    long: baseLong + (Math.random() - 0.5) * 0.1
  };
}

// Sign up a new driver
function signUp() {
  const payload = JSON.stringify({
    name: `Driver_${__VU}_${__ITER}_${Date.now()}`,
    licensePlate: `${__VU}${__ITER}-${Math.floor(Math.random() * 10000)}`,
    username: `driver_${__VU}_${__ITER}_${Date.now()}`,
    password: 'TestPass123!'
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${BASE_URL}/api/drivers/sign-up`, payload, params);

  const success = check(response, {
    'signup: status is 200': (r) => r.status === 200,
    'signup: has token': (r) => r.json('data.token') !== undefined,
    'signup: has driverId': (r) => r.json('data.driverId') !== undefined,
    'signup: status is success': (r) => r.json('status') === 'success',
  });

  if (success && response.status === 200) {
    const data = response.json('data');
    driverToken = data.token;
    driverId = data.driverId;
    signUpCounter.add(1);
  }

  errorRate.add(!success);
  return success;
}

// Sign in existing driver
function signIn(username, password) {
  const payload = JSON.stringify({
    username: username,
    password: password
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${BASE_URL}/api/drivers/sign-in`, payload, params);

  const success = check(response, {
    'signin: status is 200': (r) => r.status === 200,
    'signin: has token': (r) => r.json('data.token') !== undefined,
    'signin: has driverId': (r) => r.json('data.driverId') !== undefined,
  });

  if (success && response.status === 200) {
    const data = response.json('data');
    driverToken = data.token;
    driverId = data.driverId;
    signInCounter.add(1);
  }

  errorRate.add(!success);
  return success;
}

// Start driver (go online)
function startDriver() {
  if (!driverToken) return false;

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${driverToken}`
    },
  };

  const response = http.put(`${BASE_URL}/api/drivers/me/start`, '{}', params);

  const success = check(response, {
    'start: status is 200': (r) => r.status === 200,
    'start: state is READY': (r) => r.json('data.state') === 'READY',
  });

  if (success) {
    startCounter.add(1);

    if (driverId && activeDriverIds.indexOf(driverId) === -1) {
      activeDriverIds.push(driverId);
    }
  }

  errorRate.add(!success);
  return success;
}

// Update driver position
function updatePosition() {
  if (!driverId) return false;

  const coords = getRandomCoordinates();
  const payload = JSON.stringify({
    id: driverId,
    lat: coords.lat,
    long: coords.long
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${BASE_URL}/trpc/drivers.updatePosition`, payload, params);

  const success = check(response, {
    'update_position: status is 200': (r) => r.status === 200,
    'update_position: has lat': (r) => r.json('data.lat') !== undefined,
    'update_position: has long': (r) => r.json('data.long') !== undefined,
  });

  if (success) {
    positionUpdates.add(1);
  }

  errorRate.add(!success);
  return success;
}

// Get driver position
function getPosition(targetDriverId) {
  if (!targetDriverId)
    return false;

  const response = http.get(`${BASE_URL}/api/drivers/${targetDriverId}/position`);

  const success = check(response, {
    'get_position: status is 200': (r) => r.status === 200,
    'get_position: has coordinates': (r) => {
      return r.json('data.lat') !== undefined && r.json('data.long') !== undefined;
    },
  });

  positionFetchLatency.add(response.timings.duration);
  errorRate.add(!success);
  return success;
}

export default function () {
  // Simulate different driver behaviors with realistic distribution
  const scenario = Math.random() * 100;

  if (scenario < 5) {
    // 5% - New driver signs up and goes online
    if (signUp()) {
      sleep(1); // Think time after signup
      startDriver();
      sleep(0.5);
      updatePosition();
    }

  } else if (scenario < 15) {
    // 10% - Existing driver signs in and goes online
    const username = usernames[__VU % usernames.length];
    const password = 'TestPass123!';

    if (signIn(username, password)) {
      sleep(0.5);
      startDriver();
      sleep(0.5);
      updatePosition();
    }

  } else if (scenario < 70) {
    // 55% - Active drivers updating position (most common operation)
    // Simulate driver that's already logged in
    if (!driverToken) {
      signUp(); // Quick signup if not authenticated
      sleep(0.3);
    }
    updatePosition();

  } else {
    // 30% - Users/system checking driver positions
    const randomIndex = Math.floor(Math.random() * activeDriverIds.length);
    const randomDriverId = activeDriverIds[randomIndex];
    getPosition(randomDriverId);
  }

  // Realistic think time between requests
  // Position updates happen frequently (every 3-10 seconds when driving)
  // Other operations have longer pauses
  if (scenario < 70) {
    sleep(Math.random() * 7 + 3); // 3-10 seconds for position updates
  } else {
    sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds for lookups
  }
}

// Setup function - runs once at the start
export function setup() {
  console.log('Starting load test for driver service...');
  console.log(`Target: 1000 RPS sustained`);

  // Optional: Pre-create some test drivers for sign-in scenarios
  // This would require storing credentials somewhere accessible

  return { startTime: Date.now() };
}

// Teardown function - runs once at the end
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration} seconds`);
}