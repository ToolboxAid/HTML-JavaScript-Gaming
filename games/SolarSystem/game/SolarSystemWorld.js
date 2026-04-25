/*
Toolbox Aid
David Quesenberry
03/24/2026
SolarSystemWorld.js
*/
const MAX_STEP_SECONDS = 1 / 60;

const TIME_SCALES = [
  { label: 'x1', daysPerSecond: 1 },
  { label: 'x2', daysPerSecond: 2 },
  { label: 'x3', daysPerSecond: 3 },
  { label: 'x4', daysPerSecond: 4 },
];

const BODY_DEFINITIONS = [
  { id: 'mercury', name: 'Mercury', radius: 4, orbitRadius: 62, periodDays: 88, color: '#9ca3af', angle: 0.2 },
  { id: 'venus', name: 'Venus', radius: 6, orbitRadius: 92, periodDays: 225, color: '#fde68a', angle: 1.3 },
  { id: 'earth', name: 'Earth', radius: 6, orbitRadius: 126, periodDays: 365, color: '#38bdf8', angle: 2.2 },
  { id: 'mars', name: 'Mars', radius: 5, orbitRadius: 162, periodDays: 687, color: '#fb7185', angle: 0.9 },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 14,
    orbitRadius: 228,
    periodDays: 4333,
    color: '#f59e0b',
    angle: 2.8,
    ring: { innerRadius: 18, outerRadius: 22, color: 'rgba(245, 158, 11, 0.22)' },
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 12,
    orbitRadius: 300,
    periodDays: 10759,
    color: '#eab308',
    angle: 4.1,
    ring: { innerRadius: 18, outerRadius: 30, color: 'rgba(253, 230, 138, 0.55)' },
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 10,
    orbitRadius: 364,
    periodDays: 30687,
    color: '#67e8f9',
    angle: 3.3,
    ring: { innerRadius: 15, outerRadius: 20, color: 'rgba(103, 232, 249, 0.28)' },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 10,
    orbitRadius: 420,
    periodDays: 60190,
    color: '#60a5fa',
    angle: 5.1,
    ring: { innerRadius: 15, outerRadius: 19, color: 'rgba(96, 165, 250, 0.24)' },
  },
];

const MOON_DEFINITIONS = [
  { id: 'moon', name: 'Moon', parentId: 'earth', radius: 2, orbitRadius: 14, periodDays: 27.3, color: '#e5e7eb', angle: 1.4 },
  { id: 'io', name: 'Io', parentId: 'jupiter', radius: 2, orbitRadius: 18, periodDays: 1.8, color: '#fde68a', angle: 0.4 },
  { id: 'europa', name: 'Europa', parentId: 'jupiter', radius: 2, orbitRadius: 24, periodDays: 3.6, color: '#dbeafe', angle: 1.9 },
  { id: 'ganymede', name: 'Ganymede', parentId: 'jupiter', radius: 3, orbitRadius: 31, periodDays: 7.2, color: '#cbd5e1', angle: 2.8 },
  { id: 'titan', name: 'Titan', parentId: 'saturn', radius: 3, orbitRadius: 26, periodDays: 16, color: '#fef3c7', angle: 5.2 },
];

const DEFAULT_SOLAR_WORLD_SKIN = Object.freeze({
  entities: {
    sun: {
      color: '#fbbf24',
      radius: 30
    },
    planets: {},
    moons: {},
    rings: {}
  }
});

function clampIndex(value, max) {
  return Math.max(0, Math.min(max, value));
}

function toObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function toFiniteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function sanitizeSolarWorldSkin(skin) {
  const entities = toObject(skin?.entities);
  const sun = toObject(entities.sun);
  return {
    entities: {
      sun: {
        color: typeof sun.color === 'string' && sun.color.trim() ? sun.color.trim() : DEFAULT_SOLAR_WORLD_SKIN.entities.sun.color,
        radius: Math.max(8, toFiniteNumber(sun.radius, DEFAULT_SOLAR_WORLD_SKIN.entities.sun.radius))
      },
      planets: toObject(entities.planets),
      moons: toObject(entities.moons),
      rings: toObject(entities.rings)
    }
  };
}

function bodyPosition(centerX, centerY, orbitRadius, angleRadians, orbitScaleY = 0.72) {
  return {
    x: centerX + Math.cos(angleRadians) * orbitRadius,
    y: centerY + Math.sin(angleRadians) * orbitRadius * orbitScaleY,
  };
}

export default class SolarSystemWorld {
  constructor({ width = 960, height = 720, skin = null } = {}) {
    this.width = width;
    this.height = height;
    this.skin = sanitizeSolarWorldSkin(skin);
    this.bounds = {
      left: 38,
      right: width - 38,
      top: 108,
      bottom: height - 46,
    };
    this.center = {
      x: 352,
      y: 390,
    };
    this.sun = {
      name: 'Sun',
      radius: this.skin.entities.sun.radius,
      color: this.skin.entities.sun.color,
      x: this.center.x,
      y: this.center.y,
    };
    this.timeScaleIndex = 1;
    this.labelsVisible = true;
    this.elapsedDays = 0;
    this.planets = [];
    this.moons = [];
    this.reset();
  }

  applySkin(nextSkin) {
    this.skin = sanitizeSolarWorldSkin(nextSkin);
    this.sun.color = this.skin.entities.sun.color;
    this.sun.radius = this.skin.entities.sun.radius;
    this.applyEntityColors();
  }

  applyEntityColors() {
    this.planets.forEach((planet) => {
      const skinPlanet = toObject(this.skin.entities.planets[planet.id]);
      if (typeof skinPlanet.color === 'string' && skinPlanet.color.trim()) {
        planet.color = skinPlanet.color.trim();
      }
      const ringColor = this.skin.entities.rings[planet.id];
      if (planet.ring) {
        if (typeof ringColor === 'string' && ringColor.trim()) {
          planet.ring.color = ringColor.trim();
        }
      } else if (typeof ringColor === 'string' && ringColor.trim()) {
        planet.ring = {
          innerRadius: Math.max(planet.radius + 2, planet.radius * 1.5),
          outerRadius: Math.max(planet.radius + 5, planet.radius * 2),
          color: ringColor.trim()
        };
      }
    });

    this.moons.forEach((moon) => {
      const skinMoon = toObject(this.skin.entities.moons[moon.id]);
      if (typeof skinMoon.color === 'string' && skinMoon.color.trim()) {
        moon.color = skinMoon.color.trim();
      }
    });
  }

  reset() {
    this.elapsedDays = 0;
    this.planets = BODY_DEFINITIONS.map((body) => ({
      ...body,
      x: 0,
      y: 0,
    }));
    this.moons = MOON_DEFINITIONS.map((body) => ({
      ...body,
      x: 0,
      y: 0,
    }));
    this.applyEntityColors();
    this.recomputePositions();
  }

  getTimeScale() {
    return TIME_SCALES[this.timeScaleIndex];
  }

  setTimeScaleIndex(index) {
    this.timeScaleIndex = clampIndex(index, TIME_SCALES.length - 1);
  }

  toggleLabels() {
    this.labelsVisible = !this.labelsVisible;
  }

  update(dt, controls = {}) {
    if (controls.resetPressed) {
      this.reset();
      return;
    }

    if (controls.toggleLabelsPressed) {
      this.toggleLabels();
    }

    if (Number.isInteger(controls.timeScaleIndex)) {
      this.setTimeScaleIndex(controls.timeScaleIndex);
    }

    let remaining = Math.max(0, Number(dt) || 0);
    while (remaining > 0) {
      const step = Math.min(MAX_STEP_SECONDS, remaining);
      this.elapsedDays += step * this.getTimeScale().daysPerSecond;
      remaining -= step;
    }

    this.recomputePositions();
  }

  recomputePositions() {
    this.planets.forEach((planet) => {
      const angle = planet.angle + ((this.elapsedDays / planet.periodDays) * Math.PI * 2);
      const position = bodyPosition(this.center.x, this.center.y, planet.orbitRadius, angle);
      planet.x = position.x;
      planet.y = position.y;
    });

    this.moons.forEach((moon) => {
      const parent = this.planets.find((planet) => planet.id === moon.parentId);
      const angle = moon.angle + ((this.elapsedDays / moon.periodDays) * Math.PI * 2);
      const position = bodyPosition(parent.x, parent.y, moon.orbitRadius, angle, 0.85);
      moon.x = position.x;
      moon.y = position.y;
    });
  }
}

export { BODY_DEFINITIONS, MOON_DEFINITIONS, TIME_SCALES };
