/*
Toolbox Aid
David Quesenberry
03/22/2026
Asteroid.js
*/
import { TAU, randomRange, wrap } from '/src/shared/math/scalars.js';
import { transformCollisionPoints } from '/src/engine/collision/index.js';

const SIZE_PROFILES = {
  SML: { id: 1 },
  MED: { id: 2 },
  LRG: { id: 3 },
};

const SIZE_BY_ID = {
  1: SIZE_PROFILES.SML,
  2: SIZE_PROFILES.MED,
  3: SIZE_PROFILES.LRG,
};

function resolveGeometryProfile(geometryProfiles, sizeId) {
  if (geometryProfiles instanceof Map) {
    return geometryProfiles.get(sizeId) || geometryProfiles.get(String(sizeId)) || null;
  }
  if (geometryProfiles && typeof geometryProfiles === 'object') {
    return geometryProfiles[sizeId] || geometryProfiles[String(sizeId)] || null;
  }
  return null;
}

export default class Asteroid {
  constructor(x, y, size = 3, rng = Math.random, geometryProfiles = null) {
    const profile = SIZE_BY_ID[size] || SIZE_PROFILES.LRG;
    const geometryProfile = resolveGeometryProfile(geometryProfiles, profile.id);
    this.x = x;
    this.y = y;
    this.vx = randomRange(-70, 70, rng);
    this.vy = randomRange(-70, 70, rng);
    this.angle = randomRange(0, TAU, rng);
    this.spin = randomRange(-1.4, 1.4, rng);
    this.size = profile.id;
    this.sizeLabel = geometryProfile?.label || Object.entries(SIZE_PROFILES).find(([, value]) => value.id === profile.id)?.[0] || 'LRG';
    this.objectId = geometryProfile?.objectId || '';
    this.collisionPoints = Array.isArray(geometryProfile?.points) ? geometryProfile.points : [];
    this.scale = 1;
    this.radius = geometryProfile?.radius || 0;
  }

  update(dtSeconds, bounds) {
    this.x = wrap(this.x + this.vx * dtSeconds, bounds.width);
    this.y = wrap(this.y + this.vy * dtSeconds, bounds.height);
    this.angle += this.spin * dtSeconds;
  }

  getPoints() {
    if (!this.collisionPoints.length) {
      return [];
    }
    return transformCollisionPoints(this.collisionPoints, {
      x: this.x,
      y: this.y,
      rotation: this.angle,
      rotationUnit: 'radians',
      scale: this.scale,
    });
  }
}
