import { Scene } from "/src/engine/scene/index.js";
import { drawFrame, drawPanel } from "/src/engine/debug/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";
import { TexturePreprocessPipeline } from "/tools/shared/pipeline/index.js";
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from "/samples/shared/spritePresetRuntime.js";

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = "/samples/phase-14/1414/sample-1414-sprite-editor.json";

export default class TextureSpritePreprocessPipelineScene extends Scene {
  constructor() {
    super();
    this.pipeline = new TexturePreprocessPipeline();
    this.texture = null;
    this.status = "Preprocess a texture record.";
    this.spriteProject = null;
    this.spriteStatus = "loading";
    this.spriteError = "";
    void this.loadSpriteProject();
  }

  async loadSpriteProject() {
    try {
      this.spriteProject = await loadSpriteProjectPreset(SPRITE_PRESET_PATH);
      this.spriteStatus = "loaded";
      this.spriteError = "";
    } catch (error) {
      this.spriteProject = null;
      this.spriteStatus = "fallback";
      this.spriteError = error instanceof Error ? error.message : "unknown preset error";
    }
  }

  run() {
    this.texture = this.pipeline.run({ width: 64, height: 32 });
    this.status = "Texture preprocessing complete.";
  }

  render(renderer) {
    const presetStatus = this.spriteStatus === "loaded"
      ? "Sprite preset loaded from sample-1414-sprite-editor.json"
      : this.spriteStatus === "loading"
        ? "Loading shared sprite preset..."
        : `Sprite preset unavailable (${this.spriteError || "using pipeline-only view"})`;

    drawFrame(renderer, theme, [
      "Engine Sample 1414",
      "Texture preprocessing normalizes visual content in one centralized step.",
      "This sample and Sprite Editor load the same sample-1414-sprite-editor.json source.",
      this.status,
      presetStatus
    ]);

    drawPanel(renderer, 120, 220, 540, 220, "Texture Output", [
      `Width: ${this.texture?.width ?? 0}`,
      `Height: ${this.texture?.height ?? 0}`,
      `Padded: ${this.texture?.padded ?? false}`,
      `Atlas Ready: ${this.texture?.atlasReady ?? false}`,
      `Preset Frames: ${this.spriteProject?.frames?.length ?? 0}`
    ]);

    if (!this.spriteProject) {
      return;
    }

    const previewPanel = { x: 660, y: 220, width: 240, height: 220 };
    drawPanel(renderer, previewPanel.x, previewPanel.y, previewPanel.width, previewPanel.height, "Sprite Preset Preview", [
      "Frame source: sample-1414-sprite-editor.json",
      `Size: ${this.spriteProject.width}x${this.spriteProject.height}`,
      "Edit in Sprite Editor, then relaunch sample."
    ]);

    drawSpriteProjectFrame(renderer, this.spriteProject, 0, {
      x: previewPanel.x + 16,
      y: previewPanel.y + 98,
      pixelSize: 4
    });
  }
}
