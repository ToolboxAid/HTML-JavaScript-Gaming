/*
Toolbox Aid
David Quesenberry
03/23/2026
GravityWellWorld.js
*/
import { clamp, distance } from '../../../src/engine/utils/index.js';
import { transformPoints, vectorFromAngle } from '../../../src/engine/vector/index.js';

const SHIP_SHAPE = [
  { x: 0, y: -16 },
  { x: 11, y: 14 },
  { x: 0, y: 8 },
  { x: -11, y: 14 },
];

const BEACON_SHAPE = [
  { x: 0, y: -10 },
  { x: 8, y: 0 },
  { x: 0, y: 10 },
  { x: -8, y: 0 },
];

const DEFAULT_PLANETS = [
  { x: 280, y: 220, radius: 54, strength: 280000, color: '#38bdf8' },
  { x: 700, y: 240, radius: 70, strength: 430000, color: '#fb7185' },
  { x: 560, y: 520, radius: 46, strength: 210000, color: '#f59e0b' },
];

const DEFAULT_BEACONS = [
  { x: 192, y: 116, radius: 14, color: '#f8fafc' },
  { x: 848, y: 350, radius: 14, color: '#fde68a' },
  { x: 444, y: 654, radius: 14, color: '#86efac' },
];

const WORLD_MARGIN = 90;
const SHIP_RADIUS = 12;
const ROTATION_SPEED = 2.9;
const THRUST_ACCELERATION = 210;
const BRAKE_FACTOR = 2.6;
const MAX_SPEED = 450;
const MAX_UPDATE_STEP_SECONDS = 1 / 60;

function createShip() {
  return {
    x: 112,
    y: 620,
    vx: 32,
    vy: -14,
    angle: 0.88,
    radius: SHIP_RADIUS,
    thrusting: false,
  };
}

function createBeacon(beacon) {
  return {
    ...beacon,
    collected: false,
  };
}

function createTrailPoint(point) {
  return {
    x: point?.x ?? 0,
    y: point?.y ?? 0,
  };
}

function createInputSnapshot(input = null) {
  return {
    left: Boolean(input?.isDown?.('ArrowLeft')),
    right: Boolean(input?.isDown?.('ArrowRight')),
    thrust: Boolean(input?.isDown?.('ArrowUp')),
    brake: Boolean(input?.isDown?.('Space')),
  };
}

export default class GravityWellWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.planets = DEFAULT_PLANETS.map((planet) => ({ ...planet }));
    this.beaconSeed = DEFAULT_BEACONS.map((beacon) => ({ ...beacon }));
    this.reset();
  }

  reset() {
    this.ship = createShip();
    this.beacons = this.beaconSeed.map(createBeacon);
    this.status = 'running';
    this.statusMessage = 'Collect every beacon.';
    this.elapsedSeconds = 0;
    this.collectedCount = 0;
    this.lastGravity = { x: 0, y: 0 };
    this.trail = [];
  }

  get remainingBeacons() {
    return this.beacons.filter((beacon) => !beacon.collected).length;
  }

  getShipSpeed() {
    return Math.hypot(this.ship.vx, this.ship.vy);
  }

  getState() {
    return {
      ship: {
        x: this.ship.x,
        y: this.ship.y,
        vx: this.ship.vx,
        vy: this.ship.vy,
        angle: this.ship.angle,
        radius: this.ship.radius,
        thrusting: this.ship.thrusting,
      },
      beacons: this.beacons.map((beacon) => ({
        x: beacon.x,
        y: beacon.y,
        radius: beacon.radius,
        color: beacon.color,
        collected: beacon.collected,
      })),
      status: this.status,
      statusMessage: this.statusMessage,
      elapsedSeconds: this.elapsedSeconds,
      collectedCount: this.collectedCount,
      lastGravity: {
        x: this.lastGravity.x,
        y: this.lastGravity.y,
      },
      trail: this.trail.map(createTrailPoint),
    };
  }

  loadState(state) {
    if (!state || typeof state !== 'object') {
      this.reset();
      return;
    }

    this.ship = {
      ...this.ship,
      ...state.ship,
    };
    this.beacons = Array.isArray(state.beacons)
      ? state.beacons.map((beacon) => ({
          ...beacon,
        }))
      : this.beaconSeed.map(createBeacon);
    this.status = typeof state.status === 'string' ? state.status : 'running';
    this.statusMessage = typeof state.statusMessage === 'string'
      ? state.statusMessage
      : 'Collect every beacon.';
    this.elapsedSeconds = Number.isFinite(state.elapsedSeconds) ? state.elapsedSeconds : 0;
    this.collectedCount = Number.isFinite(state.collectedCount) ? state.collectedCount : 0;
    this.lastGravity = {
      x: Number.isFinite(state?.lastGravity?.x) ? state.lastGravity.x : 0,
      y: Number.isFinite(state?.lastGravity?.y) ? state.lastGravity.y : 0,
    };
    this.trail = Array.isArray(state.trail) ? state.trail.map(createTrailPoint) : [];
  }

  update(dtSeconds, input = null) {
    if (this.status !== 'running') {
      return { status: this.status, collectedBeacon: false };
    }

    const safeDtSeconds = Number.isFinite(dtSeconds)
      ? Math.max(0, dtSeconds)
      : 0;

    if (safeDtSeconds > MAX_UPDATE_STEP_SECONDS) {
      let remainingSeconds = safeDtSeconds;
      let collectedBeacon = false;

      while (remainingSeconds > 1e-9 && this.status === 'running') {
        const stepSeconds = Math.min(MAX_UPDATE_STEP_SECONDS, remainingSeconds);
        const stepResult = this.update(stepSeconds, input);
        collectedBeacon = collectedBeacon || stepResult.collectedBeacon;
        remainingSeconds -= stepSeconds;
      }

      return { status: this.status, collectedBeacon };
    }

    this.elapsedSeconds += safeDtSeconds;
    const controls = createInputSnapshot(input);
    const ship = this.ship;

    ship.angle += ((controls.right ? 1 : 0) - (controls.left ? 1 : 0)) * ROTATION_SPEED * safeDtSeconds;

    let ax = 0;
    let ay = 0;

    this.planets.forEach((planet) => {
      const dx = planet.x - ship.x;
      const dy = planet.y - ship.y;
      const distanceSquared = Math.max((dx * dx) + (dy * dy), (planet.radius + 18) ** 2);
      const distanceToPlanet = Math.sqrt(distanceSquared);
      const acceleration = planet.strength / distanceSquared;
      ax += (dx / distanceToPlanet) * acceleration;
      ay += (dy / distanceToPlanet) * acceleration;
    });

    if (controls.thrust) {
      const forward = vectorFromAngle(ship.angle - (Math.PI / 2));
      ax += forward.x * THRUST_ACCELERATION;
      ay += forward.y * THRUST_ACCELERATION;
    }

    ship.thrusting = controls.thrust;
    ship.vx += ax * safeDtSeconds;
    ship.vy += ay * safeDtSeconds;

    if (controls.brake) {
      const damp = Math.max(0, 1 - (BRAKE_FACTOR * safeDtSeconds));
      ship.vx *= damp;
      ship.vy *= damp;
    }

    const speed = this.getShipSpeed();
    if (speed > MAX_SPEED) {
      const speedScale = MAX_SPEED / speed;
      ship.vx *= speedScale;
      ship.vy *= speedScale;
    }

    ship.x += ship.vx * safeDtSeconds;
    ship.y += ship.vy * safeDtSeconds;
    this.lastGravity = { x: ax, y: ay };
    this.updateTrail();

    if (this.checkPlanetCollision()) {
      this.status = 'lost';
      this.statusMessage = 'Your ship was consumed by a gravity well.';
      return { status: this.status, collectedBeacon: false };
    }

    if (this.isOutOfBounds()) {
      this.status = 'lost';
      this.statusMessage = 'You drifted out of the safe flight corridor.';
      return { status: this.status, collectedBeacon: false };
    }

    let collectedBeacon = false;
    this.beacons.forEach((beacon) => {
      if (beacon.collected) {
        return;
      }

      if (distance(ship, beacon) <= ship.radius + beacon.radius + 2) {
        beacon.collected = true;
        this.collectedCount += 1;
        collectedBeacon = true;
      }
    });

    if (this.remainingBeacons === 0) {
      this.status = 'won';
      this.statusMessage = `All beacons secured in ${this.elapsedSeconds.toFixed(1)}s.`;
    }

    return { status: this.status, collectedBeacon };
  }

  updateTrail() {
    this.trail.push({ x: this.ship.x, y: this.ship.y });
    if (this.trail.length > 120) {
      this.trail.shift();
    }
  }

  isOutOfBounds() {
    return this.ship.x < -WORLD_MARGIN
      || this.ship.x > this.width + WORLD_MARGIN
      || this.ship.y < -WORLD_MARGIN
      || this.ship.y > this.height + WORLD_MARGIN;
  }

  checkPlanetCollision() {
    return this.planets.some((planet) => (
      distance(this.ship, planet) <= planet.radius + this.ship.radius
    ));
  }

  getShipPoints() {
    return transformPoints(SHIP_SHAPE, {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.angle,
      scale: 1.2,
    });
  }

  getFlamePoints() {
    const flameLength = 18 + (Math.sin(this.elapsedSeconds * 16) * 4);
    return transformPoints([
      { x: -6, y: 11 },
      { x: 0, y: 11 + flameLength },
      { x: 6, y: 11 },
    ], {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.angle,
      scale: 1.2,
    });
  }

  getBeaconPoints(beacon) {
    return transformPoints(BEACON_SHAPE, {
      x: beacon.x,
      y: beacon.y,
      rotation: this.elapsedSeconds * 2.4,
      scale: beacon.collected ? 0.5 : 1.05,
    });
  }

  getGravityPercent() {
    return clamp(Math.hypot(this.lastGravity.x, this.lastGravity.y) / 8, 0, 1);
  }
}
