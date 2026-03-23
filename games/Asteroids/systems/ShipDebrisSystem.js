/*
Toolbox Aid
David Quesenberry
03/22/2026
ShipDebrisSystem.js
*/
import { randomRange } from '../utils/math.js';

const SHIP_SEGMENTS = [
  [[14, 0], [-10, -8]],
  [[-10, -8], [-6, -3]],
  [[-6, -3], [-6, 3]],
  [[-6, 3], [-10, 8]],
  [[-10, 8], [14, 0]],
];

function rotatePoint([x, y], angle) {
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
  constructor() {
    this.fragments = [];
  }

  spawn({ x, y, angle = -Math.PI / 2, vx = 0, vy = 0, lifeSeconds = 3 }) {
    SHIP_SEGMENTS.forEach((segment, index) => {
      const start = rotatePoint(segment[0], angle);
      const end = rotatePoint(segment[1], angle);
      const burstAngle = angle + (-0.9 + index * 0.45);
      const speed = 90 + index * 26;
      this.fragments.push({
        x,
        y,
        vx: vx + Math.cos(burstAngle) * speed + randomRange(-18, 18),
        vy: vy + Math.sin(burstAngle) * speed + randomRange(-18, 18),
        spin: randomRange(-4.4, 4.4),
        angle: 0,
        lifeSeconds,
        maxLifeSeconds: lifeSeconds,
        start,
        end,
      });
    });
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
      const start = rotatePoint([fragment.start.x, fragment.start.y], fragment.angle);
      const end = rotatePoint([fragment.end.x, fragment.end.y], fragment.angle);
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
