import { PaletteUsageService } from "../common/PaletteUsageService.js";
import { PaletteSortService } from "../common/PaletteSortService.js";
import { PaletteManagerApp } from "./modules/PaletteManagerApp.js";

function resolvePaletteSource() {
  const paletteSource = globalThis.paletteList;
  if (!paletteSource || !paletteSource.SOURCE_PALETTES) {
    throw new Error("src/engine/paletteList.js must load before Palette Manager V2.");
  }
  return paletteSource;
}

function reportBootstrapError(error) {
  const status = document.getElementById("paletteStatus");
  if (status) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
  console.error(error);
}

function normalizeSamplePresetPath(samplePresetPath) {
  const cleanPath = typeof samplePresetPath === "string"
    ? samplePresetPath.trim().replace(/\\/g, "/")
    : "";
  if (!cleanPath || cleanPath.includes("..") || !cleanPath.startsWith("/samples/")) {
    return "";
  }
  return cleanPath;
}

function getSamplePresetLabel(searchParams, samplePresetPath) {
  const sampleId = (searchParams.get("sampleId") || "").trim();
  const sampleTitle = (searchParams.get("sampleTitle") || "").trim();
  if (sampleId && sampleTitle) {
    return `sample ${sampleId} (${sampleTitle})`;
  }
  if (sampleId) {
    return `sample ${sampleId}`;
  }
  if (sampleTitle) {
    return sampleTitle;
  }
  return samplePresetPath;
}

async function loadSamplePresetFromUrl(app) {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = searchParams.get("samplePresetPath");
  if (!samplePresetPath) {
    return;
  }

  const presetPath = normalizeSamplePresetPath(samplePresetPath);
  if (!presetPath) {
    app.rejectImport([`samplePresetPath is invalid: ${samplePresetPath}`], "Sample preset load failed.");
    return;
  }

  let response;
  try {
    response = await fetch(presetPath, { cache: "no-store" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    app.rejectImport([`Sample preset fetch failed for ${presetPath}: ${message}`], "Sample preset load failed.");
    return;
  }

  if (!response.ok) {
    app.rejectImport([`Sample preset fetch failed (${response.status}) for ${presetPath}.`], "Sample preset load failed.");
    return;
  }

  let documentValue;
  try {
    documentValue = await response.json();
  } catch {
    app.rejectImport([`Sample preset is not valid JSON: ${presetPath}.`], "Sample preset load failed.");
    return;
  }

  app.importPaletteDocument(documentValue, {
    failureStatus: "Sample preset load failed.",
    successStatus: `Loaded ${getSamplePresetLabel(searchParams, presetPath)} palette preset.`
  });
}

try {
  const app = new PaletteManagerApp({
    documentRef: document,
    paletteSource: resolvePaletteSource(),
    sortService: new PaletteSortService(),
    usageService: new PaletteUsageService()
  });
  app.init();
  window.paletteManagerV2App = app.getPublicApi();
  void loadSamplePresetFromUrl(app);
} catch (error) {
  reportBootstrapError(error);
}
