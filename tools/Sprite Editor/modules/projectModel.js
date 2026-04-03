/*
Toolbox Aid
David Quesenberry
04/03/2026
projectModel.js
*/
import {
  DEFAULT_HEIGHT,
  DEFAULT_PIXEL_SIZE,
  DEFAULT_WIDTH,
  MAX_RECENT_COLORS,
  NO_PALETTE_ID,
  PALETTE_SOURCE_ID,
  PROJECT_FORMAT,
  PROJECT_VERSION
} from "./constants.js";
import { dedupeColors, normalizeColor } from "./colorUtils.js";

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function normalizePaletteRef(rawPaletteRef) {
  if (!rawPaletteRef || typeof rawPaletteRef !== "object") {
    return {
      source: PALETTE_SOURCE_ID,
      id: NO_PALETTE_ID,
      locked: false
    };
  }

  const source = typeof rawPaletteRef.source === "string" && rawPaletteRef.source.trim()
    ? rawPaletteRef.source.trim()
    : PALETTE_SOURCE_ID;
  const id = typeof rawPaletteRef.id === "string" && rawPaletteRef.id.trim()
    ? rawPaletteRef.id.trim()
    : NO_PALETTE_ID;
  const locked = rawPaletteRef.locked === true && id !== NO_PALETTE_ID;

  return { source, id, locked };
}

export function createEmptyFrame(width, height) {
  return {
    pixels: new Array(width * height).fill(null)
  };
}

export function cloneFrame(frame) {
  return {
    pixels: frame.pixels.slice()
  };
}

export function frameIndex(width, x, y) {
  return y * width + x;
}

export function createNewProject(options = {}) {
  const width = clampInt(options.width, 1, 256, DEFAULT_WIDTH);
  const height = clampInt(options.height, 1, 256, DEFAULT_HEIGHT);
  const pixelSize = clampInt(options.pixelSize, 4, 40, DEFAULT_PIXEL_SIZE);
  const palette = dedupeColors(Array.isArray(options.palette) ? options.palette : []).slice(0, 256);

  let activeColor = null;
  if (typeof options.activeColor === "string") {
    activeColor = normalizeColor(options.activeColor);
  } else if (palette.length > 0) {
    activeColor = normalizeColor(palette[0]);
  }

  const recentColors = activeColor ? [activeColor] : [];
  const paletteRef = normalizePaletteRef(options.paletteRef);

  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    width,
    height,
    pixelSize,
    showGrid: options.showGrid !== false,
    onionSkin: options.onionSkin === true,
    activeColor,
    palette,
    paletteRef,
    recentColors,
    frames: [createEmptyFrame(width, height)],
    currentFrameIndex: 0
  };
}

export function ensureProjectShape(rawProject) {
  if (!rawProject || typeof rawProject !== "object") {
    throw new Error("Project must be an object.");
  }

  const width = clampInt(rawProject.width, 1, 256, DEFAULT_WIDTH);
  const height = clampInt(rawProject.height, 1, 256, DEFAULT_HEIGHT);
  const pixelSize = clampInt(rawProject.pixelSize, 4, 40, DEFAULT_PIXEL_SIZE);

  const frames = Array.isArray(rawProject.frames) ? rawProject.frames : [];
  if (frames.length === 0) {
    throw new Error("Project must include at least one frame.");
  }

  const sanitizedFrames = frames.map((frame) => {
    const source = Array.isArray(frame?.pixels) ? frame.pixels : [];
    const pixels = new Array(width * height).fill(null);
    for (let i = 0; i < pixels.length; i += 1) {
      const value = source[i];
      pixels[i] = value ? normalizeColor(value) : null;
    }
    return { pixels };
  });

  const palette = dedupeColors(Array.isArray(rawProject.palette) ? rawProject.palette : []).slice(0, 256);
  const paletteRef = normalizePaletteRef(rawProject.paletteRef);

  let activeColor = null;
  if (typeof rawProject.activeColor === "string") {
    activeColor = normalizeColor(rawProject.activeColor);
  } else if (palette.length > 0) {
    activeColor = normalizeColor(palette[0]);
  }

  let recentColors = dedupeColors(Array.isArray(rawProject.recentColors) ? rawProject.recentColors : []).slice(0, MAX_RECENT_COLORS);
  if (activeColor && !recentColors.includes(activeColor)) {
    recentColors.unshift(activeColor);
  }
  recentColors = recentColors.slice(0, MAX_RECENT_COLORS);

  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    width,
    height,
    pixelSize,
    showGrid: rawProject.showGrid !== false,
    onionSkin: rawProject.onionSkin === true,
    activeColor,
    palette,
    paletteRef,
    recentColors,
    frames: sanitizedFrames,
    currentFrameIndex: clampInt(rawProject.currentFrameIndex, 0, sanitizedFrames.length - 1, 0)
  };
}

export function resizeProject(project, nextWidth, nextHeight) {
  const width = clampInt(nextWidth, 1, 256, project.width);
  const height = clampInt(nextHeight, 1, 256, project.height);

  if (width === project.width && height === project.height) {
    return project;
  }

  const resizedFrames = project.frames.map((frame) => {
    const pixels = new Array(width * height).fill(null);
    for (let y = 0; y < height; y += 1) {
      const sourceY = Math.floor((y * project.height) / height);
      for (let x = 0; x < width; x += 1) {
        const sourceX = Math.floor((x * project.width) / width);
        const sourceIndex = frameIndex(project.width, sourceX, sourceY);
        const targetIndex = frameIndex(width, x, y);
        pixels[targetIndex] = frame.pixels[sourceIndex] ?? null;
      }
    }
    return { pixels };
  });

  return {
    ...project,
    width,
    height,
    frames: resizedFrames
  };
}

export function serializeProject(project, options = {}) {
  const output = {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    width: project.width,
    height: project.height,
    pixelSize: project.pixelSize,
    showGrid: project.showGrid,
    onionSkin: project.onionSkin,
    activeColor: project.activeColor,
    paletteRef: {
      source: project.paletteRef?.source ?? PALETTE_SOURCE_ID,
      id: project.paletteRef?.id ?? NO_PALETTE_ID,
      locked: project.paletteRef?.locked === true
    },
    recentColors: project.recentColors,
    currentFrameIndex: project.currentFrameIndex,
    frames: project.frames.map((frame) => ({
      pixels: frame.pixels.map((color) => (color ? normalizeColor(color) : null))
    }))
  };

  if (options.includePalette === true) {
    output.palette = project.palette;
  }

  return output;
}
