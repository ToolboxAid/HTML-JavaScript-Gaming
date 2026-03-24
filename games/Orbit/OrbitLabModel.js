/*
Toolbox Aid
David Quesenberry
03/24/2026
OrbitLabModel.js
*/
const MAX_STEP_SECONDS = 1 / 120;
const PRESET_ORDER = ['stable', 'elliptical', 'fall', 'escape'];

const PRESETS = {
  stable: {
    label: 'Stable Orbit',
    description: 'Tangential velocity is tuned for a near-circular path.',
    body: { x: 320, y: 212, vx: 51, vy: 0 },
  },
  elliptical: {
    label: 'Elliptical Orbit',
    description: 'Reduced tangential speed creates a longer, oval trajectory.',
    body: { x: 320, y: 204, vx: 43, vy: 0 },
  },
  fall: {
    label: 'Fall Inward',
    description: 'Low side velocity lets gravity pull the body toward the attractor.',
    body: { x: 320, y: 190, vx: 10, vy: 0 },
  },
  escape: {
    label: 'Escape Path',
    description: 'Higher launch speed produces a widening outbound arc.',
    body: { x: 320, y: 214, vx: 102, vy: 0 },
  },
};

function createWorld(width, height) {
  const bounds = {
    left: 56,
    right: 584,
    top: 152,
    bottom: height - 54,
  };

  return {
    width,
    height,
    attractor: {
      x: (bounds.left + bounds.right) / 2,
      y: (bounds.top + bounds.bottom) / 2,
      radius: 28,
      strength: 240000,
    },
    bounds,
  };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default class OrbitLabModel {
  constructor({ width = 960, height = 540 } = {}) {
    this.world = createWorld(width, height);
    this.selectedPresetId = PRESET_ORDER[0];
    this.reset();
  }

  reset() {
    const preset = PRESETS[this.selectedPresetId];
    this.body = {
      x: preset.body.x,
      y: preset.body.y,
      vx: preset.body.vx,
      vy: preset.body.vy,
      radius: 8,
    };
    this.trail = [];
    this.elapsedSeconds = 0;
    this.status = 'live';
    this.statusMessage = `${preset.label} loaded.`;
    this.lastAcceleration = { x: 0, y: 0 };
    this.minDistance = distanceBetween(this.body, this.world.attractor);
    this.maxDistance = this.minDistance;
  }

  selectPreset(presetId) {
    if (!PRESETS[presetId]) {
      return false;
    }
    this.selectedPresetId = presetId;
    this.reset();
    return true;
  }

  getSelectedPreset() {
    return PRESETS[this.selectedPresetId];
  }

  getPresetIds() {
    return [...PRESET_ORDER];
  }

  update(dt, controls = {}) {
    if (controls.resetPressed) {
      this.reset();
      return;
    }

    if (controls.presetPressed) {
      this.selectPreset(controls.presetPressed);
      return;
    }

    let remaining = Math.max(0, Number(dt) || 0);
    while (remaining > 0 && this.status === 'live') {
      const step = Math.min(MAX_STEP_SECONDS, remaining);
      this.updateStep(step);
      remaining -= step;
    }
  }

  updateStep(dt) {
    const { attractor, bounds } = this.world;
    const dx = attractor.x - this.body.x;
    const dy = attractor.y - this.body.y;
    const minRadius = attractor.radius + this.body.radius + 12;
    const distanceSquared = Math.max((dx * dx) + (dy * dy), minRadius * minRadius);
    const distance = Math.sqrt(distanceSquared);
    const acceleration = attractor.strength / distanceSquared;
    const ax = (dx / distance) * acceleration;
    const ay = (dy / distance) * acceleration;

    this.lastAcceleration = { x: ax, y: ay };
    this.body.vx += ax * dt;
    this.body.vy += ay * dt;
    this.body.x += this.body.vx * dt;
    this.body.y += this.body.vy * dt;
    this.elapsedSeconds += dt;

    const currentDistance = distanceBetween(this.body, attractor);
    this.minDistance = Math.min(this.minDistance, currentDistance);
    this.maxDistance = Math.max(this.maxDistance, currentDistance);
    this.updateTrail();

    if (currentDistance <= attractor.radius + this.body.radius) {
      this.status = 'absorbed';
      this.statusMessage = 'The orbiting body fell into the attractor.';
      return;
    }

    if (
      this.body.x < bounds.left ||
      this.body.x > bounds.right ||
      this.body.y < bounds.top ||
      this.body.y > bounds.bottom
    ) {
      this.status = 'escaped';
      this.statusMessage = 'The orbiting body escaped the bounded study frame.';
    }
  }

  updateTrail() {
    this.trail.push({ x: this.body.x, y: this.body.y });
    if (this.trail.length > 220) {
      this.trail.shift();
    }
  }
}

export { PRESET_ORDER, PRESETS };
