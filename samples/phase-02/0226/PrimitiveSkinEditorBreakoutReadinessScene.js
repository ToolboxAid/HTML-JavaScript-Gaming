/*
Toolbox Aid
David Quesenberry
04/27/2026
PrimitiveSkinEditorBreakoutReadinessScene.js
*/
import { Scene } from "/src/engine/scene/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";
import { drawFrame, drawPanel } from "/src/engine/debug/index.js";

const theme = new Theme(ThemeTokens);

export default class PrimitiveSkinEditorBreakoutReadinessScene extends Scene {
  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      "Engine Sample 0226",
      "Primitive Skin Editor readiness sample for Breakout",
      "Roundtrip link opens Skin Editor with explicit sample.0226.skin-editor.json input",
      "Expected tool behavior: preset skin loads, object workbench is ready"
    ]);

    drawPanel(renderer, 580, 170, 320, 150, "Primitive Skin Input", [
      "Tool: skin-editor",
      "Game: Breakout",
      "Preset: sample.0226.skin-editor.json",
      "Purpose: launch/data/control readiness"
    ]);
  }
}
