/*
Toolbox Aid
David Quesenberry
03/22/2026
ShipDebrisSystem.js
*/
import { randomRange } from '../../../src/shared/utils/mathUtils.js';
import { normalizePoints } from '../../../src/shared/utils/geometryUtils.js';

function createShipSegments(points) {
  const normalized = normalizePoints(points);
  return normalized.slice(0, -1).map((start, index) => ({
    end: normalized[index + 1],
    start,
  })).filter((segment) => (
    segment.start.x !== segment.end.x
    || segment.start.y !== segment.end.y
  ));
}

function rotatePoint(point, angle) {
  const x = Number(point?.x ?? 0);
  const y = Number(point?.y ?? 0);
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

function whiteWithAlpha(alpha) {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(255, 255, 255, ${safeAlpha})`;
}

export default class ShipDebrisSystem {
  constructor({ rng = Math.random, shipGeometryPoints = [] } = {}) {
    this.fragments = [];
    this.rng = typeof rng === 'function' ? rng : Math.random;
    this.shipSegments = createShipSegments(shipGeometryPoints);
  }

  spawn({ x, y, angle = -Math.PI / 2, vx = 0, vy = 0, lifeSeconds = 3 }) {
    if (!this.shipSegments.length) {
      console.error('FAIL Asteroids ship debris render blocked: manifest ship geometry did not provide debris hull segments.');
      return false;
    }
    this.shipSegments.forEach((segment, index) => {
      const start = rotatePoint(segment.start, angle);
      const end = rotatePoint(segment.end, angle);
      const burstAngle = angle + (-0.9 + index * 0.45);
      const speed = 90 + index * 26;
      this.fragments.push({
        x,
        y,
        vx: vx + Math.cos(burstAngle) * speed + randomRange(-18, 18, this.rng),
        vy: vy + Math.sin(burstAngle) * speed + randomRange(-18, 18, this.rng),
        spin: randomRange(-4.4, 4.4, this.rng),
        angle: 0,
        lifeSeconds,
        maxLifeSeconds: lifeSeconds,
        start,
        end,
      });
    });
    return true;
  }

  clear() {
    this.fragments = [];
  }

  update(dtSeconds) {
    for (let index = this.fragments.length - 1; index >= 0; index -= 1) {
      const fragment = this.fragments[index];
      fragment.x += fragment.vx * dtSeconds;
      fragment.y += fragment.vy * dtSeconds;
      fragment.vx *= 0.992;
      fragment.vy *= 0.992;
      fragment.angle += fragment.spin * dtSeconds;
      fragment.lifeSeconds -= dtSeconds;
      if (fragment.lifeSeconds <= 0) {
        this.fragments.splice(index, 1);
      }
    }
  }

  render(renderer) {
    this.fragments.forEach((fragment) => {
      const start = rotatePoint(fragment.start, fragment.angle);
      const end = rotatePoint(fragment.end, fragment.angle);
      const lifeRatio = fragment.maxLifeSeconds > 0
        ? fragment.lifeSeconds / fragment.maxLifeSeconds
        : 0;
      renderer.drawLine(
        fragment.x + start.x,
        fragment.y + start.y,
        fragment.x + end.x,
        fragment.y + end.y,
        whiteWithAlpha(lifeRatio),
        2,
      );
    });
  }
}
