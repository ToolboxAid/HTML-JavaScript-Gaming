function toObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

const PLANET_IDS = Object.freeze([
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune"
]);

const MOON_IDS = Object.freeze(["moon", "io", "europa", "ganymede", "titan"]);
const RING_IDS = Object.freeze(["jupiter", "saturn", "uranus", "neptune"]);

const RING_KEY_BY_PLANET = Object.freeze({
  jupiter: "ringJupiter",
  saturn: "ringSaturn",
  uranus: "ringUranus",
  neptune: "ringNeptune"
});

export function validateSolarSystemSkinObjects(source, helpers = {}) {
  const hasExpectedShape = typeof helpers.hasExpectedShape === "function" ? helpers.hasExpectedShape : () => false;
  const isHexColor = typeof helpers.isHexColor === "function" ? helpers.isHexColor : () => false;
  const isPositiveNumber = typeof helpers.isPositiveNumber === "function" ? helpers.isPositiveNumber : () => false;
  const skinObjects = toObject(source);

  return hasExpectedShape(skinObjects.background, ["hud-color"])
    && isHexColor(skinObjects.background?.color)
    && hasExpectedShape(skinObjects.frame, ["hud-color"])
    && isHexColor(skinObjects.frame?.color)
    && hasExpectedShape(skinObjects.orbit, ["hud-color"])
    && isHexColor(skinObjects.orbit?.color)
    && hasExpectedShape(skinObjects.hudText, ["hud-color"])
    && isHexColor(skinObjects.hudText?.color)
    && hasExpectedShape(skinObjects.hudMuted, ["hud-color"])
    && isHexColor(skinObjects.hudMuted?.color)
    && hasExpectedShape(skinObjects.hudPanel, ["hud-color"])
    && isHexColor(skinObjects.hudPanel?.color)
    && hasExpectedShape(skinObjects.sun, ["circle"])
    && isHexColor(skinObjects.sun?.color)
    && isPositiveNumber(skinObjects.sun?.radius)
    && PLANET_IDS.every((id) => (
      hasExpectedShape(skinObjects[id], ["circle"])
      && isHexColor(skinObjects[id]?.color)
      && isPositiveNumber(skinObjects[id]?.radius)
    ))
    && MOON_IDS.every((id) => (
      hasExpectedShape(skinObjects[id], ["circle"])
      && isHexColor(skinObjects[id]?.color)
      && isPositiveNumber(skinObjects[id]?.radius)
    ))
    && RING_IDS.every((id) => {
      const ringObjectKey = RING_KEY_BY_PLANET[id];
      const ring = skinObjects[ringObjectKey];
      return hasExpectedShape(ring, ["ring"])
        && isHexColor(ring?.color)
        && isPositiveNumber(ring?.innerRadius)
        && isPositiveNumber(ring?.outerRadius)
        && Number(ring.outerRadius) > Number(ring.innerRadius);
    });
}

export function mapSolarSystemObjectsToLegacy(source, entities) {
  const skinObjects = toObject(source);
  return {
    colors: {
      background: normalizeText(skinObjects.background?.color),
      frame: normalizeText(skinObjects.frame?.color),
      orbit: normalizeText(skinObjects.orbit?.color),
      text: normalizeText(skinObjects.hudText?.color),
      muted: normalizeText(skinObjects.hudMuted?.color),
      panel: normalizeText(skinObjects.hudPanel?.color)
    },
    sizing: {},
    entities: {
      sun: {
        color: normalizeText(skinObjects.sun?.color),
        radius: Number(skinObjects.sun?.radius)
      },
      planets: Object.fromEntries(
        PLANET_IDS.map((id) => {
          const body = toObject(skinObjects[id]);
          return [id, {
            color: normalizeText(body.color),
            radius: Number(body.radius)
          }];
        })
      ),
      moons: Object.fromEntries(
        MOON_IDS.map((id) => {
          const body = toObject(skinObjects[id]);
          return [id, {
            color: normalizeText(body.color),
            radius: Number(body.radius)
          }];
        })
      ),
      rings: Object.fromEntries(
        RING_IDS.map((id) => {
          const ringObjectKey = RING_KEY_BY_PLANET[id];
          const ring = toObject(skinObjects[ringObjectKey]);
          return [id, {
            color: normalizeText(ring.color),
            innerRadius: Number(ring.innerRadius),
            outerRadius: Number(ring.outerRadius)
          }];
        })
      ),
      ...toObject(entities)
    }
  };
}
