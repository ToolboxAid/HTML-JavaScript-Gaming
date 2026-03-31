/*
Toolbox Aid
David Quesenberry
03/22/2026
ResolutionScalingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { ResolutionScaler } from '../../../engine/render/index.js';

const theme = new Theme(ThemeTokens);

export default class ResolutionScalingScene extends Scene {
  constructor() {
    super();
    this.scaler = new ResolutionScaler({ baseWidth: 320, baseHeight: 180, scale: 1 });
  }

  update(_dt, engine) {
    if (engine.input.isActionPressed('scale_up')) this.scaler.setScale(this.scaler.scale + 0.5);
    if (engine.input.isActionPressed('scale_down')) this.scaler.setScale(this.scaler.scale - 0.5);
  }

  render(renderer) {
    const scaled = this.scaler.getScaledSize();
    drawFrame(renderer, theme, [
      'Engine Sample111',
      'Resolution scaling stays engine-owned and exposes predictable scaled sizes.',
      'Press = to scale up and - to scale down.',
    ]);
    renderer.drawRect(140, 200, scaled.width * 0.5, scaled.height * 0.5, '#60a5fa');
    renderer.strokeRect(140, 200, scaled.width * 0.5, scaled.height * 0.5, '#ffffff', 2);
    drawPanel(renderer, 620, 34, 300, 126, 'Resolution Scaling', [
      `Scale: ${this.scaler.scale.toFixed(1)}`,
      `Scaled width: ${scaled.width}`,
      `Scaled height: ${scaled.height}`,
      'Rendering reads scaled size data.',
    ]);
  }
}
