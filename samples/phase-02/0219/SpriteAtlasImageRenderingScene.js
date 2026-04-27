/*
Toolbox Aid
David Quesenberry
03/21/2026
SpriteAtlasImageRenderingScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';
import { SpriteAtlas, ImageAssetLoader } from '/src/engine/assets/index.js';
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-02/0219/sample-0219-sprite-editor.json';

export default class SpriteAtlasImageRenderingScene extends Scene {
  constructor() {
    super();
    this.loader = new ImageAssetLoader();
    this.loader.load('playerSheet', '/assets/player-sheet.png');

    this.atlas = new SpriteAtlas({
      imagePath: '/assets/player-sheet.png',
      frames: {
        idle_0: { color: '#7dd3fc' },
        idle_1: { color: '#60a5fa' },
        walk_0: { color: '#34d399' },
        walk_1: { color: '#10b981' },
      },
    });

    this.entities = [
      { x: 140, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'idle_0', label: 'idle_0' },
      { x: 280, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'idle_1', label: 'idle_1' },
      { x: 420, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'walk_0', label: 'walk_0' },
      { x: 560, y: 260, width: 64, height: 64, atlas: 'playerSheet', frame: 'walk_1', label: 'walk_1' },
    ];
    this.spriteProject = null;
    this.spriteStatus = 'loading';
    this.spriteError = '';
    this.frameIndexByName = {
      idle_0: 0,
      idle_1: 1,
      walk_0: 2,
      walk_1: 3
    };
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

  resolveFrameIndex(frameName) {
    if (!this.spriteProject || !Array.isArray(this.spriteProject.frames) || this.spriteProject.frames.length === 0) {
      return 0;
    }
    const mapped = this.frameIndexByName[String(frameName || '')];
    const index = Number.isInteger(mapped) ? mapped : 0;
    return index % this.spriteProject.frames.length;
  }

  render(renderer) {
    const presetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite preset loaded from sample-0219-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback'})`;

    drawFrame(renderer, theme, [
      'Engine Sample 0219',
      'Demonstrates sprite atlas frame lookup and image-loader-ready output',
      'Static sample: animation playback is not required for this scenario',
      'Current rendering uses shared sprite preset frame pixels when available',
      'This sample and Sprite Editor load the same sample-0219-sprite-editor.json source',
      'Each entity references atlas/frame instead of raw color only',
      presetStatus
    ]);

    if (this.spriteProject) {
      const pixelSize = Math.max(2, Math.floor(64 / this.spriteProject.height));
      this.entities.forEach((entity) => {
        drawSpriteProjectFrame(renderer, this.spriteProject, this.resolveFrameIndex(entity.frame), {
          x: entity.x,
          y: entity.y,
          pixelSize
        });
        renderer.drawText(entity.label, entity.x + ((this.spriteProject.width * pixelSize) / 2), entity.y + (this.spriteProject.height * pixelSize) + 22, {
          color: '#d8d5ff',
          font: '14px monospace',
          textAlign: 'center'
        });
      });
    } else {
      renderSpriteReadyEntities(renderer, this.entities, {
        label: true,
        labelOffsetY: 86,
        getFrameColor: (entity) => this.atlas.getFrame(entity.frame)?.color || '#8888ff',
      });
    }

    drawPanel(renderer, 620, 184, 300, 126, 'Atlas', [
      `Image: ${this.atlas.imagePath}`,
      `Frames: ${this.atlas.getFrameNames().length}`,
      this.spriteProject ? 'Rendering preset frame pixels' : `Loader status: ${this.loader.get('playerSheet')?.status || 'none'}`,
      'Source: sample-0219-sprite-editor.json',
    ]);
  }
}
