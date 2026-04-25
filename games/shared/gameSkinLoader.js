import {
  preloadWorkspaceGameAssetCatalog,
  resolveWorkspaceGameAssetPath
} from "/games/shared/workspaceGameAssetCatalog.js";

const SKIN_OVERRIDE_STORAGE_PREFIX = "toolbox.game.skin.override.";
const SKIN_DOCUMENT_KIND = "game-skin";
const SKIN_DOCUMENT_VERSION = 1;
const BREAKOUT_BRICK_KEYS = Object.freeze(["brick1", "brick2", "brick3", "brick4", "brick5", "brick6"]);
const SOLAR_SUN_DEFAULT = Object.freeze({ color: "#fbbf24", radius: 30 });
const SOLAR_PLANET_DEFAULTS = Object.freeze({
  mercury: Object.freeze({ color: "#9ca3af", radius: 4 }),
  venus: Object.freeze({ color: "#fde68a", radius: 6 }),
  earth: Object.freeze({ color: "#38bdf8", radius: 6 }),
  mars: Object.freeze({ color: "#fb7185", radius: 5 }),
  jupiter: Object.freeze({ color: "#f59e0b", radius: 14 }),
  saturn: Object.freeze({ color: "#eab308", radius: 12 }),
  uranus: Object.freeze({ color: "#67e8f9", radius: 10 }),
  neptune: Object.freeze({ color: "#60a5fa", radius: 10 })
});
const SOLAR_MOON_DEFAULTS = Object.freeze({
  moon: Object.freeze({ color: "#e5e7eb", radius: 2 }),
  io: Object.freeze({ color: "#fde68a", radius: 2 }),
  europa: Object.freeze({ color: "#dbeafe", radius: 2 }),
  ganymede: Object.freeze({ color: "#cbd5e1", radius: 3 }),
  titan: Object.freeze({ color: "#fef3c7", radius: 3 })
});
const SOLAR_RING_DEFAULTS = Object.freeze({
  jupiter: Object.freeze({ color: "#f59e0b", innerRadius: 18, outerRadius: 22 }),
  saturn: Object.freeze({ color: "#fde68a", innerRadius: 18, outerRadius: 30 }),
  uranus: Object.freeze({ color: "#67e8f9", innerRadius: 15, outerRadius: 20 }),
  neptune: Object.freeze({ color: "#60a5fa", innerRadius: 15, outerRadius: 19 })
});
const SOLAR_RING_KEY_BY_PLANET = Object.freeze({
  jupiter: "ringJupiter",
  saturn: "ringSaturn",
  uranus: "ringUranus",
  neptune: "ringNeptune"
});
const SUPPORTED_OBJECT_SHAPES = Object.freeze([
  "circle",
  "oval",
  "rectangle",
  "square",
  "triangle",
  "line",
  "arc",
  "sector",
  "capsule",
  "polygon",
  "star",
  "ring",
  "flattened",
  "hud-color",
  "wall",
  "wall-multi-side"
]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGameId(value) {
  return normalizeText(value).toLowerCase();
}

function normalizePath(value) {
  const path = normalizeText(value).replace(/\\/g, "/");
  if (!path || path.includes("..")) {
    return "";
  }
  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }
  return path.startsWith("/") ? path : `/${path.replace(/^\.?\//, "")}`;
}

function toObject(value) {
  return value && typeof value === "object" ? value : {};
}

function toNonEmptyString(value, fallback = "") {
  const normalized = normalizeText(value);
  return normalized || fallback;
}

function toFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function deepMerge(baseValue, patchValue) {
  if (Array.isArray(baseValue) || Array.isArray(patchValue)) {
    return Array.isArray(patchValue) ? patchValue.slice() : [];
  }
  const base = toObject(baseValue);
  const patch = toObject(patchValue);
  const merged = { ...base };
  Object.keys(patch).forEach((key) => {
    const baseChild = base[key];
    const patchChild = patch[key];
    if (patchChild && typeof patchChild === "object" && !Array.isArray(patchChild)) {
      merged[key] = deepMerge(baseChild, patchChild);
      return;
    }
    merged[key] = patchChild;
  });
  return merged;
}

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(normalizeText(value));
}

function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function isNonNegativeNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

function hasKeys(value) {
  return Object.keys(toObject(value)).length > 0;
}

function hasExpectedShape(value, expectedShapes = []) {
  const shape = normalizeText(toObject(value).shape).toLowerCase();
  if (!shape || !SUPPORTED_OBJECT_SHAPES.includes(shape)) {
    return false;
  }
  if (!Array.isArray(expectedShapes) || expectedShapes.length === 0) {
    return true;
  }
  return expectedShapes.includes(shape);
}

function normalizeFlatObjects(gameId, objects) {
  const normalizedGameId = normalizeGameId(gameId);
  const source = deepClone(toObject(objects)) || {};

  if (normalizedGameId === "breakout") {
    const legacyBrick = toObject(source.brick);
    const legacyHud = toObject(source.hud);
    const legacyRows = Array.isArray(legacyBrick.rows) ? legacyBrick.rows : [];
    const result = { ...source };

    if (!hasKeys(result.hudText) && normalizeText(legacyHud.textColor)) {
      result.hudText = { color: normalizeText(legacyHud.textColor) };
    }
    if (!hasKeys(result.hudMuted) && normalizeText(legacyHud.mutedColor)) {
      result.hudMuted = { color: normalizeText(legacyHud.mutedColor) };
    }
    if (!hasKeys(result.hudPanel) && normalizeText(legacyHud.panelColor)) {
      result.hudPanel = { color: normalizeText(legacyHud.panelColor) };
    }
    if (!hasKeys(result.brickLayout) && Number.isFinite(Number(legacyBrick.gap))) {
      result.brickLayout = { gap: Number(legacyBrick.gap) };
    }
    BREAKOUT_BRICK_KEYS.forEach((brickKey, index) => {
      if (hasKeys(result[brickKey])) {
        return;
      }
      const legacyColor = normalizeText(legacyRows[index]);
      if (!legacyColor && !Number.isFinite(Number(legacyBrick.width)) && !Number.isFinite(Number(legacyBrick.height))) {
        return;
      }
      result[brickKey] = {
        color: legacyColor,
        width: Number(legacyBrick.width),
        height: Number(legacyBrick.height)
      };
    });
    delete result.brick;
    delete result.hud;
    return result;
  }

  if (normalizedGameId === "pong") {
    const legacyHud = toObject(source.hud);
    const result = { ...source };
    if (!hasKeys(result.hudInk) && normalizeText(legacyHud.inkColor)) {
      result.hudInk = { color: normalizeText(legacyHud.inkColor) };
    }
    if (!hasKeys(result.hudMuted) && normalizeText(legacyHud.mutedColor)) {
      result.hudMuted = { color: normalizeText(legacyHud.mutedColor) };
    }
    if (!hasKeys(result.hudAccent) && normalizeText(legacyHud.accentColor)) {
      result.hudAccent = { color: normalizeText(legacyHud.accentColor) };
    }
    if (!hasKeys(result.hudGood) && normalizeText(legacyHud.goodColor)) {
      result.hudGood = { color: normalizeText(legacyHud.goodColor) };
    }
    if (!hasKeys(result.hudWarn) && normalizeText(legacyHud.warnColor)) {
      result.hudWarn = { color: normalizeText(legacyHud.warnColor) };
    }
    if (!hasKeys(result.hudDanger) && normalizeText(legacyHud.dangerColor)) {
      result.hudDanger = { color: normalizeText(legacyHud.dangerColor) };
    }
    delete result.hud;
    return result;
  }

  if (normalizedGameId === "bouncing-ball") {
    const legacyHud = toObject(source.hud);
    const result = { ...source };
    if (!hasKeys(result.hudText) && normalizeText(legacyHud.textColor)) {
      result.hudText = { color: normalizeText(legacyHud.textColor) };
    }
    if (!hasKeys(result.hudMuted) && normalizeText(legacyHud.mutedColor)) {
      result.hudMuted = { color: normalizeText(legacyHud.mutedColor) };
    }
    if (!hasKeys(result.hudPanel) && normalizeText(legacyHud.panelColor)) {
      result.hudPanel = { color: normalizeText(legacyHud.panelColor) };
    }
    delete result.hud;
    return result;
  }

  if (normalizedGameId === "solarsystem") {
    const legacyHud = toObject(source.hud);
    const legacyPlanets = toObject(source.planets);
    const legacyMoons = toObject(source.moons);
    const legacyRings = toObject(source.rings);
    const result = { ...source };
    if (!hasKeys(result.hudText) && normalizeText(legacyHud.textColor)) {
      result.hudText = { color: normalizeText(legacyHud.textColor) };
    }
    if (!hasKeys(result.hudMuted) && normalizeText(legacyHud.mutedColor)) {
      result.hudMuted = { color: normalizeText(legacyHud.mutedColor) };
    }
    if (!hasKeys(result.hudPanel) && normalizeText(legacyHud.panelColor)) {
      result.hudPanel = { color: normalizeText(legacyHud.panelColor) };
    }
    Object.keys(SOLAR_PLANET_DEFAULTS).forEach((planetId) => {
      if (hasKeys(result[planetId])) {
        return;
      }
      const body = toObject(legacyPlanets[planetId]);
      if (!hasKeys(body)) {
        return;
      }
      result[planetId] = {
        color: normalizeText(body.color),
        radius: Number(body.radius)
      };
    });
    Object.keys(SOLAR_MOON_DEFAULTS).forEach((moonId) => {
      if (hasKeys(result[moonId])) {
        return;
      }
      const body = toObject(legacyMoons[moonId]);
      if (!hasKeys(body)) {
        return;
      }
      result[moonId] = {
        color: normalizeText(body.color),
        radius: Number(body.radius)
      };
    });
    Object.entries(SOLAR_RING_KEY_BY_PLANET).forEach(([planetId, ringObjectKey]) => {
      if (hasKeys(result[ringObjectKey])) {
        return;
      }
      const ring = toObject(legacyRings[planetId]);
      if (!hasKeys(ring)) {
        return;
      }
      result[ringObjectKey] = {
        color: normalizeText(ring.color),
        innerRadius: Number(ring.innerRadius),
        outerRadius: Number(ring.outerRadius)
      };
    });
    delete result.hud;
    delete result.planets;
    delete result.moons;
    delete result.rings;
    return result;
  }

  return source;
}

function validateGameSkinObjects(gameId, objects) {
  const normalizedGameId = normalizeGameId(gameId);
  const source = toObject(objects);
  if (!hasKeys(source)) {
    return false;
  }

  if (normalizedGameId === "breakout") {
    return hasExpectedShape(source?.background, ["hud-color"])
      && isHexColor(source?.background?.color)
      && hasExpectedShape(source?.wall, ["flattened", "wall", "wall-multi-side"])
      && isHexColor(source?.wall?.color)
      && isPositiveNumber(source?.wall?.thickness)
      && hasExpectedShape(source?.paddle, ["rectangle", "capsule", "square"])
      && isHexColor(source?.paddle?.color)
      && isPositiveNumber(source?.paddle?.width)
      && isPositiveNumber(source?.paddle?.height)
      && hasExpectedShape(source?.ball, ["square", "circle"])
      && isHexColor(source?.ball?.color)
      && isPositiveNumber(source?.ball?.size)
      && hasExpectedShape(source?.brickLayout, ["rectangle", "hud-color"])
      && isNonNegativeNumber(source?.brickLayout?.gap)
      && BREAKOUT_BRICK_KEYS.every((brickKey) => (
        hasExpectedShape(source?.[brickKey], ["rectangle", "square"])
        && isHexColor(source?.[brickKey]?.color)
        && isPositiveNumber(source?.[brickKey]?.width)
        && isPositiveNumber(source?.[brickKey]?.height)
      ))
      && hasExpectedShape(source?.hudText, ["hud-color"])
      && isHexColor(source?.hudText?.color)
      && hasExpectedShape(source?.hudMuted, ["hud-color"])
      && isHexColor(source?.hudMuted?.color)
      && hasExpectedShape(source?.hudPanel, ["hud-color"])
      && isHexColor(source?.hudPanel?.color);
  }

  if (normalizedGameId === "pong") {
    return hasExpectedShape(source?.background, ["hud-color"])
      && isHexColor(source?.background?.color)
      && hasExpectedShape(source?.paddle, ["rectangle", "capsule"])
      && isHexColor(source?.paddle?.color)
      && isPositiveNumber(source?.paddle?.width)
      && hasExpectedShape(source?.ball, ["circle", "ring"])
      && isHexColor(source?.ball?.color)
      && isPositiveNumber(source?.ball?.radius)
      && hasExpectedShape(source?.hudInk, ["hud-color"])
      && isHexColor(source?.hudInk?.color)
      && hasExpectedShape(source?.hudMuted, ["hud-color"])
      && isHexColor(source?.hudMuted?.color)
      && hasExpectedShape(source?.hudAccent, ["hud-color"])
      && isHexColor(source?.hudAccent?.color)
      && hasExpectedShape(source?.hudGood, ["hud-color"])
      && isHexColor(source?.hudGood?.color)
      && hasExpectedShape(source?.hudWarn, ["hud-color"])
      && isHexColor(source?.hudWarn?.color)
      && hasExpectedShape(source?.hudDanger, ["hud-color"])
      && isHexColor(source?.hudDanger?.color);
  }

  if (normalizedGameId === "bouncing-ball") {
    return hasExpectedShape(source?.background, ["hud-color"])
      && isHexColor(source?.background?.color)
      && hasExpectedShape(source?.wall, ["wall", "flattened", "wall-multi-side"])
      && isHexColor(source?.wall?.color)
      && isPositiveNumber(source?.wall?.thickness)
      && hasExpectedShape(source?.ball, ["square", "circle"])
      && isHexColor(source?.ball?.color)
      && isPositiveNumber(source?.ball?.size)
      && hasExpectedShape(source?.hudText, ["hud-color"])
      && isHexColor(source?.hudText?.color)
      && hasExpectedShape(source?.hudMuted, ["hud-color"])
      && isHexColor(source?.hudMuted?.color)
      && hasExpectedShape(source?.hudPanel, ["hud-color"])
      && isHexColor(source?.hudPanel?.color);
  }

  if (normalizedGameId === "solarsystem") {
    const requiredPlanets = Object.keys(SOLAR_PLANET_DEFAULTS);
    const requiredMoons = Object.keys(SOLAR_MOON_DEFAULTS);
    const requiredRings = Object.keys(SOLAR_RING_DEFAULTS);
    return hasExpectedShape(source?.background, ["hud-color"])
      && isHexColor(source?.background?.color)
      && hasExpectedShape(source?.frame, ["hud-color"])
      && isHexColor(source?.frame?.color)
      && hasExpectedShape(source?.orbit, ["hud-color"])
      && isHexColor(source?.orbit?.color)
      && hasExpectedShape(source?.hudText, ["hud-color"])
      && isHexColor(source?.hudText?.color)
      && hasExpectedShape(source?.hudMuted, ["hud-color"])
      && isHexColor(source?.hudMuted?.color)
      && hasExpectedShape(source?.hudPanel, ["hud-color"])
      && isHexColor(source?.hudPanel?.color)
      && hasExpectedShape(source?.sun, ["circle"])
      && isHexColor(source?.sun?.color)
      && isPositiveNumber(source?.sun?.radius)
      && requiredPlanets.every((id) => (
        hasExpectedShape(source?.[id], ["circle"])
        && isHexColor(source?.[id]?.color)
        && isPositiveNumber(source?.[id]?.radius)
      ))
      && requiredMoons.every((id) => (
        hasExpectedShape(source?.[id], ["circle"])
        && isHexColor(source?.[id]?.color)
        && isPositiveNumber(source?.[id]?.radius)
      ))
      && requiredRings.every((id) => {
        const ringObjectKey = SOLAR_RING_KEY_BY_PLANET[id];
        const ring = source?.[ringObjectKey];
        return hasExpectedShape(ring, ["ring"])
          && isHexColor(ring?.color)
          && isPositiveNumber(ring?.innerRadius)
          && isPositiveNumber(ring?.outerRadius)
          && Number(ring.outerRadius) > Number(ring.innerRadius);
      });
  }

  return true;
}

function mapSolarBodyDefaults(sourceBodies, defaults) {
  const source = toObject(sourceBodies);
  return Object.fromEntries(
    Object.entries(defaults).map(([id, fallback]) => {
      const entry = toObject(source[id]);
      return [
        id,
        {
          color: toNonEmptyString(entry.color, fallback.color),
          radius: Math.max(1, toFiniteNumber(entry.radius, fallback.radius))
        }
      ];
    })
  );
}

function mapSolarRingDefaults(sourceRings, defaults) {
  const source = toObject(sourceRings);
  return Object.fromEntries(
    Object.entries(defaults).map(([id, fallback]) => {
      const entry = source[id];
      if (typeof entry === "string") {
        return [
          id,
          {
            color: toNonEmptyString(entry, fallback.color),
            innerRadius: Math.max(1, toFiniteNumber(fallback.innerRadius, 1)),
            outerRadius: Math.max(1, toFiniteNumber(fallback.outerRadius, 2))
          }
        ];
      }
      const entryObject = toObject(entry);
      return [
        id,
        {
          color: toNonEmptyString(entryObject.color, fallback.color),
          innerRadius: Math.max(1, toFiniteNumber(entryObject.innerRadius, fallback.innerRadius)),
          outerRadius: Math.max(1, toFiniteNumber(entryObject.outerRadius, fallback.outerRadius))
        }
      ];
    })
  );
}

function extractSkinObject(rawValue) {
  const raw = toObject(rawValue);
  if (raw.documentKind === SKIN_DOCUMENT_KIND) {
    return raw;
  }
  if (raw.skin && typeof raw.skin === "object") {
    return raw.skin;
  }
  if (raw.payload && typeof raw.payload === "object" && raw.payload.skin && typeof raw.payload.skin === "object") {
    return raw.payload.skin;
  }
  return raw;
}

function mapLegacyToObjects(gameId, source) {
  const normalizedGameId = normalizeGameId(gameId);
  const colors = toObject(source?.colors);
  const sizing = toObject(source?.sizing);

  if (normalizedGameId === "breakout") {
    return {
      background: {
        color: toNonEmptyString(colors.background, "#000000")
      },
      wall: {
        color: toNonEmptyString(colors.wall, "#f8f8f2"),
        thickness: Math.max(8, toFiniteNumber(sizing.wallThickness, 16))
      },
      paddle: {
        color: toNonEmptyString(colors.paddle, "#f8f8f2"),
        width: Math.max(40, toFiniteNumber(sizing.paddleWidth, 118)),
        height: Math.max(8, toFiniteNumber(sizing.paddleHeight, 18))
      },
      ball: {
        color: toNonEmptyString(colors.ball, "#f8f8f2"),
        size: Math.max(6, toFiniteNumber(sizing.ballSize, 14))
      },
      brick: {
        width: Math.max(24, toFiniteNumber(sizing.brickWidth, 78)),
        height: Math.max(10, toFiniteNumber(sizing.brickHeight, 24)),
        gap: Math.max(0, toFiniteNumber(sizing.brickGap, 6)),
        rows: Array.isArray(colors.brickRows)
          ? colors.brickRows.map((entry) => normalizeText(entry)).filter(Boolean)
          : []
      },
      hud: {
        textColor: toNonEmptyString(colors.text, "#04040A"),
        mutedColor: toNonEmptyString(colors.muted, "#a0a0a0"),
        panelColor: toNonEmptyString(colors.panel, "#000000")
      }
    };
  }

  if (normalizedGameId === "pong") {
    return {
      background: {
        color: toNonEmptyString(colors.background, "#05070a")
      },
      paddle: {
        color: toNonEmptyString(colors.ink, "#f4f7fb"),
        width: Math.max(8, toFiniteNumber(sizing.paddleWidth, 14))
      },
      ball: {
        color: toNonEmptyString(colors.ink, "#f4f7fb"),
        radius: Math.max(3, toFiniteNumber(sizing.ballRadius, 8))
      },
      hud: {
        inkColor: toNonEmptyString(colors.ink, "#f4f7fb"),
        mutedColor: toNonEmptyString(colors.muted, "#a6b0bf"),
        accentColor: toNonEmptyString(colors.accent, "#7de2ff"),
        goodColor: toNonEmptyString(colors.good, "#8bf0c8"),
        warnColor: toNonEmptyString(colors.warn, "#ffd37d"),
        dangerColor: toNonEmptyString(colors.danger, "#ff9a9a")
      }
    };
  }

  if (normalizedGameId === "solarsystem") {
    const entities = toObject(source?.entities);
    const sun = toObject(entities.sun);
    return {
      background: {
        color: toNonEmptyString(colors.background, "#030712")
      },
      frame: {
        color: toNonEmptyString(colors.frame, "#dbeafe")
      },
      orbit: {
        color: toNonEmptyString(colors.orbit, "#334155")
      },
      hud: {
        textColor: toNonEmptyString(colors.text, "#dbeafe"),
        mutedColor: toNonEmptyString(colors.muted, "#94a3b8"),
        panelColor: toNonEmptyString(colors.panel, "#07101d")
      },
      sun: {
        color: toNonEmptyString(sun.color, SOLAR_SUN_DEFAULT.color),
        radius: Math.max(8, toFiniteNumber(sun.radius, SOLAR_SUN_DEFAULT.radius))
      },
      planets: mapSolarBodyDefaults(entities.planets, SOLAR_PLANET_DEFAULTS),
      moons: mapSolarBodyDefaults(entities.moons, SOLAR_MOON_DEFAULTS),
      rings: mapSolarRingDefaults(entities.rings, SOLAR_RING_DEFAULTS)
    };
  }

  if (normalizedGameId === "bouncing-ball") {
    return {
      background: {
        color: toNonEmptyString(colors.background, "#05070a")
      },
      wall: {
        color: toNonEmptyString(colors.wall, "#f4f4ef"),
        thickness: Math.max(8, toFiniteNumber(sizing.wallThickness, 18))
      },
      ball: {
        color: toNonEmptyString(colors.ball, "#f4f4ef"),
        size: Math.max(8, toFiniteNumber(sizing.ballSize, 22))
      },
      hud: {
        textColor: toNonEmptyString(colors.text, "#f4f4ef"),
        mutedColor: toNonEmptyString(colors.muted, "#9ba3b3"),
        panelColor: toNonEmptyString(colors.panel, "#05070a")
      }
    };
  }

  return {
    colors: toObject(source?.colors),
    sizing: toObject(source?.sizing)
  };
}

function mapObjectsToLegacy(gameId, objects, entities) {
  const normalizedGameId = normalizeGameId(gameId);
  const source = toObject(objects);

  if (normalizedGameId === "breakout") {
    const brickRows = BREAKOUT_BRICK_KEYS.map((brickKey) => normalizeText(source?.[brickKey]?.color));
    const primaryBrick = toObject(source?.brick1);
    return {
      colors: {
        background: normalizeText(source?.background?.color),
        wall: normalizeText(source?.wall?.color),
        paddle: normalizeText(source?.paddle?.color),
        ball: normalizeText(source?.ball?.color),
        text: normalizeText(source?.hudText?.color),
        muted: normalizeText(source?.hudMuted?.color),
        panel: normalizeText(source?.hudPanel?.color),
        brickRows
      },
      sizing: {
        paddleWidth: Number(source?.paddle?.width),
        paddleHeight: Number(source?.paddle?.height),
        ballSize: Number(source?.ball?.size),
        brickWidth: Number(primaryBrick?.width),
        brickHeight: Number(primaryBrick?.height),
        brickGap: Number(source?.brickLayout?.gap),
        wallThickness: Number(source?.wall?.thickness)
      },
      entities: toObject(entities)
    };
  }

  if (normalizedGameId === "pong") {
    const ink = normalizeText(source?.hudInk?.color);
    return {
      colors: {
        background: normalizeText(source?.background?.color),
        ink,
        muted: normalizeText(source?.hudMuted?.color),
        accent: normalizeText(source?.hudAccent?.color),
        good: normalizeText(source?.hudGood?.color),
        warn: normalizeText(source?.hudWarn?.color),
        danger: normalizeText(source?.hudDanger?.color)
      },
      sizing: {
        paddleWidth: Number(source?.paddle?.width),
        ballRadius: Number(source?.ball?.radius)
      },
      entities: toObject(entities)
    };
  }

  if (normalizedGameId === "solarsystem") {
    return {
      colors: {
        background: normalizeText(source?.background?.color),
        frame: normalizeText(source?.frame?.color),
        orbit: normalizeText(source?.orbit?.color),
        text: normalizeText(source?.hudText?.color),
        muted: normalizeText(source?.hudMuted?.color),
        panel: normalizeText(source?.hudPanel?.color)
      },
      sizing: {},
      entities: {
        sun: {
          color: normalizeText(source?.sun?.color),
          radius: Number(source?.sun?.radius)
        },
        planets: Object.fromEntries(
          Object.keys(SOLAR_PLANET_DEFAULTS).map((id) => {
            const body = toObject(source?.[id]);
            return [id, {
              color: normalizeText(body.color),
              radius: Number(body.radius)
            }];
          })
        ),
        moons: Object.fromEntries(
          Object.keys(SOLAR_MOON_DEFAULTS).map((id) => {
            const body = toObject(source?.[id]);
            return [id, {
              color: normalizeText(body.color),
              radius: Number(body.radius)
            }];
          })
        ),
        rings: Object.fromEntries(
          Object.keys(SOLAR_RING_DEFAULTS).map((id) => {
            const ringObjectKey = SOLAR_RING_KEY_BY_PLANET[id];
            const ring = toObject(source?.[ringObjectKey]);
            return [id, {
              color: normalizeText(ring.color),
              innerRadius: Number(ring.innerRadius),
              outerRadius: Number(ring.outerRadius)
            }];
          })
        )
      }
    };
  }

  if (normalizedGameId === "bouncing-ball") {
    return {
      colors: {
        background: normalizeText(source?.background?.color),
        wall: normalizeText(source?.wall?.color),
        ball: normalizeText(source?.ball?.color),
        text: normalizeText(source?.hudText?.color),
        muted: normalizeText(source?.hudMuted?.color),
        panel: normalizeText(source?.hudPanel?.color)
      },
      sizing: {
        wallThickness: Number(source?.wall?.thickness),
        ballSize: Number(source?.ball?.size)
      },
      entities: toObject(entities)
    };
  }

  return {
    colors: toObject(source?.colors),
    sizing: toObject(source?.sizing),
    entities: toObject(entities)
  };
}

export function normalizeGameSkinDocument(rawValue, options = {}) {
  const expectedGameId = normalizeText(options.expectedGameId);
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";
  const source = extractSkinObject(rawValue);
  if (!source || typeof source !== "object" || Object.keys(source).length === 0) {
    return null;
  }
  const normalized = deepClone(source) || {};
  if (normalizeText(normalized.documentKind) !== SKIN_DOCUMENT_KIND) {
    return null;
  }
  const version = Number(normalized.version);
  if (!Number.isFinite(version) || version <= 0) {
    return null;
  }
  normalized.version = version;
  normalized.schema = normalizeText(normalized.schema);
  if (!normalized.schema) {
    return null;
  }
  if (fallbackSchema && fallbackSchema !== "games.generic.skin/1" && normalized.schema !== fallbackSchema) {
    return null;
  }
  normalized.gameId = normalizeText(normalized.gameId) || expectedGameId;
  if (!normalized.gameId) {
    return null;
  }
  if (expectedGameId && normalizeGameId(normalized.gameId) !== normalizeGameId(expectedGameId)) {
    return null;
  }
  normalized.name = normalizeText(normalized.name);
  if (!normalized.name) {
    return null;
  }
  normalized.entities = toObject(normalized.entities);

  const sourceObjects = toObject(normalized.objects);
  if (!hasKeys(sourceObjects)) {
    return null;
  }
  normalized.objects = normalizeFlatObjects(normalized.gameId, sourceObjects);
  if (!validateGameSkinObjects(normalized.gameId, normalized.objects)) {
    return null;
  }

  const projectedLegacy = mapObjectsToLegacy(normalized.gameId, normalized.objects, normalized.entities);
  normalized.colors = deepMerge(toObject(normalized.colors), toObject(projectedLegacy.colors));
  normalized.sizing = deepMerge(toObject(normalized.sizing), toObject(projectedLegacy.sizing));
  normalized.entities = deepMerge(toObject(projectedLegacy.entities), toObject(normalized.entities));
  return normalized;
}

function toStorageSkinDocument(normalizedSkin) {
  const source = toObject(normalizedSkin);
  return {
    documentKind: SKIN_DOCUMENT_KIND,
    version: Number.isFinite(Number(source.version)) ? Number(source.version) : SKIN_DOCUMENT_VERSION,
    schema: normalizeText(source.schema) || "games.generic.skin/1",
    gameId: normalizeText(source.gameId),
    name: normalizeText(source.name) || `${normalizeText(source.gameId) || "Game"} Skin`,
    objects: deepClone(toObject(source.objects)) || {},
    entities: {}
  };
}

function getStorageKey(gameId) {
  const safeGameId = normalizeGameId(gameId);
  return safeGameId ? `${SKIN_OVERRIDE_STORAGE_PREFIX}${safeGameId}` : "";
}

export function readGameSkinOverride(gameId, options = {}) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const storageKey = getStorageKey(gameId);
  if (!storageKey) {
    return null;
  }
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return null;
    }
    const parsed = JSON.parse(rawValue);
    return normalizeGameSkinDocument(parsed, { expectedGameId: normalizeText(gameId), fallbackSchema });
  } catch {
    return null;
  }
}

export function writeGameSkinOverride(gameId, skinDocument, options = {}) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  const storageKey = getStorageKey(gameId);
  if (!storageKey) {
    return false;
  }
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";
  const normalized = normalizeGameSkinDocument(skinDocument, { expectedGameId: normalizeText(gameId), fallbackSchema });
  if (!normalized) {
    return false;
  }
  const storageDocument = toStorageSkinDocument(normalized);
  window.localStorage.setItem(storageKey, JSON.stringify(storageDocument, null, 2));
  return true;
}

export function clearGameSkinOverride(gameId) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  const storageKey = getStorageKey(gameId);
  if (!storageKey) {
    return false;
  }
  window.localStorage.removeItem(storageKey);
  return true;
}

async function fetchSkinDocumentFromPath(path, expectedGameId, fallbackSchema) {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    throw new Error("Skin path is missing or invalid.");
  }
  if (typeof fetch !== "function") {
    throw new Error("Fetch API is unavailable.");
  }
  try {
    const response = await fetch(normalizedPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Skin request failed (${response.status}) for ${normalizedPath}.`);
    }
    const payload = await response.json();
    const normalized = normalizeGameSkinDocument(payload, { expectedGameId, fallbackSchema });
    if (!normalized) {
      throw new Error(`Skin document is invalid: ${normalizedPath}.`);
    }
    return normalized;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown skin loading failure.");
  }
}

function resolveSkinAssetPath(gameId) {
  return resolveWorkspaceGameAssetPath(gameId, "skin.main", "");
}

function deriveWorkspaceCatalogPath(gameId) {
  const normalizedGameId = normalizeText(gameId);
  if (!normalizedGameId) {
    return "";
  }
  return normalizePath(`/games/${encodeURIComponent(normalizedGameId)}/assets/workspace.asset-catalog.json`);
}

export async function loadGameSkin(options = {}) {
  const expectedGameId = normalizeText(options.gameId);
  if (!expectedGameId) {
    throw new Error("loadGameSkin requires gameId.");
  }
  const fallbackSchema = normalizeText(options.fallbackSchema) || "games.generic.skin/1";

  const storedSkin = readGameSkinOverride(expectedGameId, { fallbackSchema });
  if (storedSkin) {
    return {
      skin: storedSkin,
      source: "local-storage",
      path: ""
    };
  }

  const explicitCatalogPath = normalizePath(options.catalogPath);
  const catalogPath = explicitCatalogPath || deriveWorkspaceCatalogPath(expectedGameId);
  await preloadWorkspaceGameAssetCatalog(expectedGameId, { catalogPath });

  const skinPath = resolveSkinAssetPath(expectedGameId);
  if (!skinPath) {
    throw new Error(`No skin.main asset path resolved for ${expectedGameId}.`);
  }
  const loadedSkin = await fetchSkinDocumentFromPath(skinPath, expectedGameId, fallbackSchema);
  return {
    skin: loadedSkin,
    source: "skin-file",
    path: skinPath
  };

}
