/*
Toolbox Aid
David Quesenberry
03/22/2026
Asteroid.js
*/
import { TAU, randomRange, wrap } from '../utils/math.js';

const BASE_VECTOR_MAP = [
  [10, 40],
  [50, 20],
  [45, 5],
  [25, -10],
  [50, -35],
  [30, -45],
  [10, -38],
  [-20, -45],
  [-43, -18],
  [-43, 20],
  [-25, 20],
  [-25, 40],
];

function centerVectorMap(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  return points.map(([x, y]) => [x - centerX, y - centerY]);
}

function maxRadius(points) {
  return Math.max(...points.map(([x, y]) => Math.sqrt(x * x + y * y)));
}

const CENTERED_VECTOR_MAP = centerVectorMap(BASE_VECTOR_MAP);
const BASE_RADIUS = maxRadius(CENTERED_VECTOR_MAP);

const SIZE_PROFILES = {
  SML: { id: 1, targetRadius: 14 },
  MED: { id: 2, targetRadius: 22 },
  LRG: { id: 3, targetRadius: 34 },
};

const SIZE_BY_ID = {
  1: SIZE_PROFILES.SML,
  2: SIZE_PROFILES.MED,
  3: SIZE_PROFILES.LRG,
};

export default class Asteroid {
  constructor(x, y, size = 3, rng = Math.random) {
    const profile = SIZE_BY_ID[size] || SIZE_PROFILES.LRG;
    this.x = x;
    this.y = y;
    this.vx = randomRange(-70, 70, rng);
    this.vy = randomRange(-70, 70, rng);
    this.angle = randomRange(0, TAU, rng);
    this.spin = randomRange(-1.4, 1.4, rng);
    this.size = profile.id;
    this.sizeLabel = Object.entries(SIZE_PROFILES).find(([, value]) => value.id === profile.id)?.[0] || 'LRG';
    this.scale = profile.targetRadius / BASE_RADIUS;
    this.radius = profile.targetRadius;
  }

  update(dtSeconds, bounds) {
    this.x = wrap(this.x + this.vx * dtSeconds, bounds.width);
    this.y = wrap(this.y + this.vy * dtSeconds, bounds.height);
    this.angle += this.spin * dtSeconds;
  }

  getPoints() {
    return CENTERED_VECTOR_MAP.map(([x, y]) => {
      const scaledX = x * this.scale;
      const scaledY = y * this.scale;
      return {
        x: this.x + scaledX * Math.cos(this.angle) - scaledY * Math.sin(this.angle),
        y: this.y + scaledX * Math.sin(this.angle) + scaledY * Math.cos(this.angle),
      };
    });
  }
}
