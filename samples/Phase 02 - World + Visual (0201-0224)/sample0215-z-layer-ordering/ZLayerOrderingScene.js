/*
Toolbox Aid
David Quesenberry
03/21/2026
ZLayerOrderingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { renderByLayers } from '../../../engine/render/index.js';

const theme = new Theme(ThemeTokens);

export default class ZLayerOrderingScene extends Scene {
  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 215',
      'Demonstrates explicit layered draw ordering for runtime rendering',
      'The scene renders background, world, actors, projectiles, UI, and debug in order',
      'This sample defines the engine draw-order boundary for future games',
      'Layer order is visible through overlapping shapes and panels',
    ]);

    renderByLayers(renderer, [
      { z: 0, render: (r) => r.drawRect(100, 210, 700, 220, '#1e293b') },
      { z: 10, render: (r) => { r.drawRect(180, 260, 220, 120, '#8888ff'); r.strokeRect(180, 260, 220, 120, '#ffffff', 1); } },
      { z: 20, render: (r) => { r.drawRect(300, 290, 70, 70, '#34d399'); r.strokeRect(300, 290, 70, 70, '#ffffff', 1); } },
      { z: 30, render: (r) => { r.drawRect(390, 318, 80, 16, '#ffd166'); r.strokeRect(390, 318, 80, 16, '#ffffff', 1); } },
      { z: 40, render: (r) => drawPanel(r, 620, 184, 300, 126, 'UI Layer', ['z=40', 'HUD sits above world', 'Gameplay info panel']) },
      { z: 50, render: (r) => drawPanel(r, 620, 326, 300, 106, 'Debug Layer', ['z=50', 'Debug sits on top', 'Final visible layer']) },
    ]);
  }
}
