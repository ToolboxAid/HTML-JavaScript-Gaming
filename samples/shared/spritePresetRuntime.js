function asNonEmptyString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function asObject(value) {
  return value && typeof value === "object" ? value : null;
}

function toHexByte(value) {
  const clamped = Math.max(0, Math.min(255, Number.isFinite(Number(value)) ? Number(value) : 255));
  return Math.round(clamped).toString(16).padStart(2, "0");
}

function normalizeHexColor(color) {
  const raw = asNonEmptyString(color);
  if (!raw) {
    return null;
  }

  const normalized = raw.startsWith("#") ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{8}$/.test(normalized)) {
    return `#${normalized.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `#${normalized.toUpperCase()}FF`;
  }
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    return `#${normalized[0]}${normalized[0]}${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}FF`.toUpperCase();
  }
  if (/^rgba?\(/i.test(raw)) {
    const parts = raw
      .replace(/rgba?\(/i, "")
      .replace(")", "")
      .split(",")
      .map((part) => Number(part.trim()));
    if (parts.length >= 3) {
      const red = toHexByte(parts[0]);
      const green = toHexByte(parts[1]);
      const blue = toHexByte(parts[2]);
      const alpha = parts.length >= 4 ? toHexByte(parts[3] * 255) : "FF";
      return `#${red}${green}${blue}${alpha}`.toUpperCase();
    }
  }
  return null;
}

function sanitizeFrame(frame, width, height) {
  const expected = width * height;
  const sourcePixels = Array.isArray(frame?.pixels) ? frame.pixels : [];
  const pixels = new Array(expected).fill(null);

  for (let index = 0; index < expected; index += 1) {
    const normalized = normalizeHexColor(sourcePixels[index]);
    pixels[index] = normalized;
  }

  return { pixels };
}

export function extractSpriteProjectFromPreset(rawPreset) {
  const presetObject = asObject(rawPreset);
  if (!presetObject) {
    return null;
  }

  const payload = asObject(presetObject.payload) || presetObject;
  const rawProject = asObject(payload.spriteProject)
    || asObject(payload.project)
    || (Array.isArray(payload.frames) ? payload : null);
  if (!rawProject) {
    return null;
  }

  const width = Math.max(1, Math.min(256, Number.parseInt(rawProject.width, 10) || 16));
  const height = Math.max(1, Math.min(256, Number.parseInt(rawProject.height, 10) || 16));
  const frames = Array.isArray(rawProject.frames) && rawProject.frames.length > 0
    ? rawProject.frames.map((frame) => sanitizeFrame(frame, width, height))
    : [sanitizeFrame({}, width, height)];

  return {
    width,
    height,
    frames
  };
}

export async function loadSpriteProjectPreset(presetPath) {
  const path = asNonEmptyString(presetPath);
  if (!path) {
    throw new Error("Preset path is required.");
  }
  const presetUrl = new URL(path, window.location.href);
  const response = await fetch(presetUrl.toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Preset request failed (${response.status}).`);
  }
  const rawPreset = await response.json();
  const project = extractSpriteProjectFromPreset(rawPreset);
  if (!project) {
    throw new Error("Preset payload did not include a sprite project.");
  }
  return project;
}

export function drawSpriteProjectFrame(renderer, project, frameIndex, options = {}) {
  if (!renderer || !project || !Array.isArray(project.frames) || project.frames.length === 0) {
    return false;
  }

  const frame = project.frames[Math.max(0, Math.min(project.frames.length - 1, frameIndex | 0))];
  if (!frame || !Array.isArray(frame.pixels)) {
    return false;
  }

  const x = Number.isFinite(Number(options.x)) ? Number(options.x) : 0;
  const y = Number.isFinite(Number(options.y)) ? Number(options.y) : 0;
  const pixelSize = Math.max(1, Number.parseInt(options.pixelSize, 10) || 3);

  for (let row = 0; row < project.height; row += 1) {
    for (let column = 0; column < project.width; column += 1) {
      const index = (row * project.width) + column;
      const color = frame.pixels[index];
      if (!color || String(color).endsWith("00")) {
        continue;
      }
      renderer.drawRect(
        x + (column * pixelSize),
        y + (row * pixelSize),
        pixelSize,
        pixelSize,
        color
      );
    }
  }

  return true;
}
