/*
Toolbox Aid
David Quesenberry
04/25/2026

normalize-games-presentation.mjs

How to run:
1) npm run normalize:games-presentation
2) Reload /games/index.html to refresh the Class dropdown from engineClassesUsed
*/

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GAMES_DIR = path.join(ROOT, "games");
const METADATA_PATH = path.join(GAMES_DIR, "metadata", "games.index.metadata.json");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEngineReference(rawRef) {
  const text = normalizeWhitespace(rawRef).replace(/\\/g, "/");
  if (!text) {
    return "";
  }

  const marker = "src/engine/";
  const markerIndex = text.indexOf(marker);
  const normalized = markerIndex >= 0 ? text.slice(markerIndex + marker.length) : text;
  const cleaned = normalized
    .replace(/\.js$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+/g, "/");
  if (!cleaned) {
    return "";
  }

  const segments = cleaned.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[segments.length - 1] === segments[segments.length - 2]) {
    segments.pop();
  }

  return `engine/${segments.join("/")}`;
}

function isThemeEngineClass(value) {
  const normalized = normalizeEngineReference(value);
  if (!normalized) {
    return false;
  }
  const leaf = normalized.split("/").pop() || "";
  return /^theme/i.test(leaf);
}

function walkJsFiles(dirPath) {
  const out = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "assets" || entry.name === "node_modules") {
        continue;
      }
      out.push(...walkJsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && /\.(m?js)$/i.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function parseImportSymbols(specifierText) {
  const text = normalizeWhitespace(specifierText);
  if (!text) {
    return [];
  }

  if (text.startsWith("{") && text.endsWith("}")) {
    return text
      .slice(1, -1)
      .split(",")
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean)
      .map((part) => normalizeWhitespace(part.split(/\s+as\s+/i)[0]))
      .filter(Boolean);
  }

  if (text.startsWith("*")) {
    const match = text.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
    return match ? [match[1]] : [];
  }

  if (text.includes(",")) {
    const [defaultPart, namedPart] = text.split(",", 2);
    const symbols = [];
    const defaultSymbol = normalizeWhitespace(defaultPart);
    if (defaultSymbol) {
      symbols.push(defaultSymbol);
    }
    if (namedPart && namedPart.includes("{")) {
      symbols.push(...parseImportSymbols(namedPart.slice(namedPart.indexOf("{"))));
    }
    return symbols;
  }

  return [text];
}

function collectFromImportSource(importSource, symbols, refs) {
  const source = String(importSource || "").replace(/\\/g, "/");
  const marker = "src/engine/";
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    return;
  }

  const afterMarker = source.slice(markerIndex + marker.length).replace(/^\//, "");
  if (!afterMarker) {
    return;
  }

  const modulePath = afterMarker.replace(/\.js$/i, "");
  if (!modulePath) {
    return;
  }

  if (!symbols || symbols.length === 0) {
    refs.add(normalizeEngineReference(`src/engine/${modulePath}`));
    return;
  }

  for (const symbol of symbols) {
    const cleanSymbol = normalizeWhitespace(symbol);
    if (!cleanSymbol) {
      continue;
    }
    refs.add(normalizeEngineReference(`src/engine/${modulePath}/${cleanSymbol}`));
  }
}

function collectEngineClassReferencesFromJs(gameDir) {
  const files = walkJsFiles(gameDir);
  const refs = new Set();

  for (const filePath of files) {
    const source = readFile(filePath);
    const importRegex = /(?:^|\n)\s*import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
    const exportRegex = /(?:^|\n)\s*export\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g;
    const bareImportRegex = /(?:^|\n)\s*import\s+["']([^"']+)["']/g;

    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const specifier = match[1];
      const importSource = match[2];
      collectFromImportSource(importSource, parseImportSymbols(specifier), refs);
    }

    while ((match = exportRegex.exec(source)) !== null) {
      const importSource = match[1];
      collectFromImportSource(importSource, [], refs);
    }

    while ((match = bareImportRegex.exec(source)) !== null) {
      const importSource = match[1];
      collectFromImportSource(importSource, [], refs);
    }
  }

  return [...refs]
    .filter(Boolean)
    .filter((value) => !isThemeEngineClass(value))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    throw new Error("Missing metadata file: " + path.relative(ROOT, METADATA_PATH));
  }

  let parsed;
  try {
    parsed = JSON.parse(readFile(METADATA_PATH));
  } catch (error) {
    throw new Error("Invalid metadata JSON: " + error.message);
  }

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.games)) {
    throw new Error('Metadata must contain a "games" array.');
  }
  return parsed;
}

function toGameDirFromHref(href) {
  const normalizedHref = String(href || "").replace(/\\/g, "/").trim();
  if (!normalizedHref.startsWith("/games/") || !normalizedHref.endsWith("/index.html")) {
    return "";
  }
  return path.join(ROOT, normalizedHref.slice(1, -"/index.html".length));
}

function normalizeGamesPresentation() {
  const metadata = loadMetadata();
  let updatedCount = 0;

  for (const game of metadata.games) {
    const gameDir = toGameDirFromHref(game?.href);
    if (!gameDir || !fs.existsSync(gameDir)) {
      continue;
    }

    const engineClassesUsed = collectEngineClassReferencesFromJs(gameDir);
    const previous = JSON.stringify(Array.isArray(game.engineClassesUsed) ? game.engineClassesUsed : []);
    const next = JSON.stringify(engineClassesUsed);
    if (previous !== next) {
      game.engineClassesUsed = engineClassesUsed;
      updatedCount += 1;
    }
  }

  writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2) + "\n");
  return { updatedCount, totalGames: metadata.games.length };
}

function main() {
  const result = normalizeGamesPresentation();
  console.log(`OK updated=${result.updatedCount} games=${result.totalGames}`);
}

try {
  main();
} catch (error) {
  console.error("FAIL " + error.message);
  process.exit(1);
}
