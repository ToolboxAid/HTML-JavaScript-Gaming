/*
Toolbox Aid
David Quesenberry
03/22/2026
MobileSupportScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { MobileRuntimeTweaks } from '/src/engine/runtime/index.js';

const theme = new Theme(ThemeTokens);

export default class MobileSupportScene extends Scene {
  constructor() {
    super();
    this.tweaks = MobileRuntimeTweaks.createDefault();
  }

  update() {}

  render(renderer) {
    const buttonSize = 48 * this.tweaks.uiScale + this.tweaks.touchPadding;
    drawFrame(renderer, theme, [
      'Engine sample 0704',
      'Mobile-friendly runtime tweaks stay reusable and engine-owned instead of living in scene hacks.',
      'Touch-capable runtimes get larger controls and padding defaults.',
    ]);
    renderer.drawRect(120, 300, buttonSize, buttonSize, '#60a5fa');
    renderer.drawRect(220, 300, buttonSize, buttonSize, '#34d399');
    drawPanel(renderer, 620, 34, 300, 126, 'Mobile Tweaks', [
      `Touch mode: ${this.tweaks.isTouch}`,
      `UI scale: ${this.tweaks.uiScale}`,
      `Touch padding: ${this.tweaks.touchPadding}`,
      'Buttons expand on touch devices.',
    ]);
  }
}
