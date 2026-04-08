/*
Toolbox Aid
David Quesenberry
03/24/2026
ThrusterWorld.js
*/
import { clamp } from '../../../src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;
const SHIP_RADIUS = 16;

function normalizeAngle(angle) {
  let next = angle;
  while (next <= -Math.PI) {
    next += Math.PI * 2;
  }
  while (next > Math.PI) {
    next -= Math.PI * 2;
  }
  return next;
}

export default class ThrusterWorld {
  constructor({ width = 960, height = 720 } = {}) {
    this.width = width;
    this.height = height;
    this.wallThickness = 18;
    this.playfield = {
      left: 54,
      right: width - 54,
      top: 90,
      bottom: height - 54,
    };
    this.rotationSpeed = 2.9;
    this.thrustAcceleration = 260;
    this.linearDrag = 0.32;
    this.wallBounceDamping = 0.82;
    this.maxSpeed = 360;
    this.status = 'menu';
    this.ship = this.createShip();
    this.resetShip();
  }

  createShip() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      radius: SHIP_RADIUS,
      thrusting: false,
    };
  }

  resetShip() {
    this.ship.x = this.width / 2;
    this.ship.y = this.height / 2;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.ship.angle = 0;
    this.ship.thrusting = false;
  }

  resetGame() {
    this.status = 'menu';
    this.resetShip();
  }

  startGame() {
    if (this.status === 'menu') {
      this.status = 'playing';
    }
  }

  update(dt, controls = {}) {
    let remaining = Math.max(0, Number(dt) || 0);
    let latestEvent = this.createEvent();

    if (controls.resetPressed) {
      this.resetGame();
      latestEvent.reset = true;
      latestEvent.status = this.status;
      return latestEvent;
    }

    if (controls.startPressed && this.status === 'menu') {
      this.startGame();
      latestEvent.started = true;
    }

    if (this.status !== 'playing') {
      latestEvent.status = this.status;
      return latestEvent;
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(step, controls));
      remaining -= step;
    }

    if (dt === 0) {
      latestEvent = this.mergeEvents(latestEvent, this.updateStep(0, controls));
    }

    latestEvent.status = this.status;
    return latestEvent;
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      reset: false,
      thrusting: false,
      wallBounced: false,
      bounceCount: 0,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      reset: base.reset || next.reset,
      thrusting: base.thrusting || next.thrusting,
      wallBounced: base.wallBounced || next.wallBounced,
      bounceCount: base.bounceCount + next.bounceCount,
    };
  }

  updateStep(dt, controls = {}) {
    const event = this.createEvent();
    const ship = this.ship;
    const turn = clamp(Number(controls.turn) || 0, -1, 1);
    const thrustDown = Boolean(controls.thrustDown);

    ship.angle = normalizeAngle(ship.angle + (turn * this.rotationSpeed * dt));
    ship.thrusting = thrustDown;

    if (thrustDown) {
      const forwardX = Math.sin(ship.angle);
      const forwardY = -Math.cos(ship.angle);
      ship.vx += forwardX * this.thrustAcceleration * dt;
      ship.vy += forwardY * this.thrustAcceleration * dt;
      event.thrusting = true;
    }

    const dragFactor = Math.max(0, 1 - (this.linearDrag * dt));
    ship.vx *= dragFactor;
    ship.vy *= dragFactor;

    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      ship.vx *= scale;
      ship.vy *= scale;
    }

    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;

    const minX = this.playfield.left + ship.radius;
    const maxX = this.playfield.right - ship.radius;
    const minY = this.playfield.top + ship.radius;
    const maxY = this.playfield.bottom - ship.radius;

    if (ship.x <= minX) {
      ship.x = minX;
      ship.vx = Math.abs(ship.vx) * this.wallBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    } else if (ship.x >= maxX) {
      ship.x = maxX;
      ship.vx = -Math.abs(ship.vx) * this.wallBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    }

    if (ship.y <= minY) {
      ship.y = minY;
      ship.vy = Math.abs(ship.vy) * this.wallBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    } else if (ship.y >= maxY) {
      ship.y = maxY;
      ship.vy = -Math.abs(ship.vy) * this.wallBounceDamping;
      event.wallBounced = true;
      event.bounceCount += 1;
    }

    ship.x = clamp(ship.x, minX, maxX);
    ship.y = clamp(ship.y, minY, maxY);
    event.status = this.status;
    return event;
  }

  getShipPoints() {
    const ship = this.ship;
    const shape = [
      { x: 0, y: -18 },
      { x: 12, y: 14 },
      { x: 0, y: 8 },
      { x: -12, y: 14 },
    ];

    return shape.map((point) => {
      const cos = Math.cos(ship.angle);
      const sin = Math.sin(ship.angle);
      return {
        x: ship.x + (point.x * cos) - (point.y * sin),
        y: ship.y + (point.x * sin) + (point.y * cos),
      };
    });
  }

  getFlamePoints() {
    const ship = this.ship;
    const flame = [
      { x: -6, y: 12 },
      { x: 0, y: 24 },
      { x: 6, y: 12 },
    ];

    return flame.map((point) => {
      const cos = Math.cos(ship.angle);
      const sin = Math.sin(ship.angle);
      return {
        x: ship.x + (point.x * cos) - (point.y * sin),
        y: ship.y + (point.x * sin) + (point.y * cos),
      };
    });
  }
}
