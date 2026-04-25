import {
  preloadWorkspaceGameAssetCatalog,
  resolveWorkspaceGameAssetPath
} from "/games/shared/workspaceGameAssetCatalog.js";
import {
  mapSolarSystemObjectsToLegacy,
  validateSolarSystemSkinObjects
} from "/games/SolarSystem/game/solarSkinContract.js";

const SKIN_DOCUMENT_KIND = "game-skin";
const BREAKOUT_BRICK_KEYS = Object.freeze(["brick1", "brick2", "brick3", "brick4", "brick5", "brick6"]);
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

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
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
    return validateSolarSystemSkinObjects(source, {
      hasExpectedShape,
      isHexColor,
      isPositiveNumber
    });
  }

  return true;
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
    return mapSolarSystemObjectsToLegacy(source, entities);
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
  const expectedSchema = normalizeText(options.expectedSchema);
  if (!expectedSchema) {
    return null;
  }
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
  if (normalized.schema !== expectedSchema) {
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
  normalized.objects = deepClone(sourceObjects) || {};
  if (!validateGameSkinObjects(normalized.gameId, normalized.objects)) {
    return null;
  }

  const projectedLegacy = mapObjectsToLegacy(normalized.gameId, normalized.objects, normalized.entities);
  normalized.colors = toObject(projectedLegacy.colors);
  normalized.sizing = toObject(projectedLegacy.sizing);
  normalized.entities = toObject(projectedLegacy.entities);
  return normalized;
}

async function fetchSkinDocumentFromPath(path, expectedGameId, expectedSchema) {
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
    const normalized = normalizeGameSkinDocument(payload, { expectedGameId, expectedSchema });
    if (!normalized) {
      throw new Error(`Skin document is invalid: ${normalizedPath}.`);
    }
    return normalized;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown skin loading failure.");
  }
}

function resolveSkinAssetPath(gameId) {
  return resolveWorkspaceGameAssetPath(gameId, "skin.main");
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
  const expectedSchema = normalizeText(options.expectedSchema);
  if (!expectedSchema) {
    throw new Error("loadGameSkin requires expectedSchema.");
  }

  const explicitCatalogPath = normalizePath(options.catalogPath);
  const catalogPath = explicitCatalogPath || deriveWorkspaceCatalogPath(expectedGameId);
  await preloadWorkspaceGameAssetCatalog(expectedGameId, { catalogPath });

  const skinPath = resolveSkinAssetPath(expectedGameId);
  if (!skinPath) {
    throw new Error(`No skin.main asset path resolved for ${expectedGameId}.`);
  }
  const loadedSkin = await fetchSkinDocumentFromPath(skinPath, expectedGameId, expectedSchema);
  return {
    skin: loadedSkin,
    source: "skin-file",
    path: skinPath
  };

}
