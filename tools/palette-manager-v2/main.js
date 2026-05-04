import { PaletteUsageService } from "../common/PaletteUsageService.js";
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

try {
  const app = new PaletteManagerApp({
    documentRef: document,
    paletteSource: resolvePaletteSource(),
    usageService: new PaletteUsageService()
  });
  app.init();
  window.paletteManagerV2App = app.getPublicApi();
} catch (error) {
  reportBootstrapError(error);
}
