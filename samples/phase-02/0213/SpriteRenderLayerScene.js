/*
Toolbox Aid
David Quesenberry
03/21/2026
SpriteRenderLayerScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-02/0213/sample-0213-sprite-editor.json';

export default class SpriteRenderLayerScene extends Scene {
  constructor() {
    super();
    this.entities = [
      { x: 140, y: 250, width: 58, height: 58, color: theme.getColor('actorFill'), label: 'colorRect' },
      { x: 300, y: 250, width: 58, height: 58, spriteColor: '#60a5fa', label: 'spriteReady' },
      { x: 460, y: 250, width: 58, height: 58, spriteColor: '#f59e0b', label: 'frameProxy' },
    ];
    this.spriteProject = null;
    this.spriteStatus = 'loading';
    this.spriteError = '';
    void this.loadSpriteProject();
  }

  update() {}

  async loadSpriteProject() {
    try {
      this.spriteProject = await loadSpriteProjectPreset(SPRITE_PRESET_PATH);
      this.spriteStatus = 'loaded';
      this.spriteError = '';
    } catch (error) {
      this.spriteProject = null;
      this.spriteStatus = 'fallback';
      this.spriteError = error instanceof Error ? error.message : 'unknown preset error';
    }
  }

  render(renderer) {
    const presetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite preset loaded from sample-0213-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback'})`;

    drawFrame(renderer, theme, [
      'Engine Sample 213',
      'Demonstrates a sprite-ready render path using shared sprite preset data',
      'Entities can provide a sprite-ready color proxy or a plain fallback color',
      'This sample and Sprite Editor load the same sample-0213-sprite-editor.json source',
      'Labels identify the current render source style',
      presetStatus
    ]);

    if (this.spriteProject) {
      const positions = [
        { x: 126, y: 236, label: 'colorRect', frameIndex: 0 },
        { x: 286, y: 236, label: 'spriteReady', frameIndex: 1 },
        { x: 446, y: 236, label: 'frameProxy', frameIndex: 2 }
      ];
      const frameCount = this.spriteProject.frames.length;
      positions.forEach((item) => {
        const safeFrameIndex = frameCount > 0 ? item.frameIndex % frameCount : 0;
        drawSpriteProjectFrame(renderer, this.spriteProject, safeFrameIndex, {
          x: item.x,
          y: item.y,
          pixelSize: 3
        });
        renderer.drawText(item.label, item.x + 20, item.y + 66, {
          color: '#d8d5ff',
          font: '14px monospace',
          textAlign: 'center'
        });
      });
    } else {
      renderSpriteReadyEntities(renderer, this.entities, { label: true, labelOffsetY: 80 });
    }

    drawPanel(renderer, 620, 184, 300, 126, 'Sprite Render Layer', [
      'Fallback: color',
      'Sprite-ready: shared sprite preset frame data',
      'Source: sample-0213-sprite-editor.json',
      this.spriteProject ? 'Rendering preset frames' : 'Rendering fallback proxies',
    ]);
  }
}
