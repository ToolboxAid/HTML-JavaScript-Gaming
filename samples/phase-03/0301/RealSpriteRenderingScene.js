/*
Toolbox Aid
David Quesenberry
03/21/2026
RealSpriteRenderingScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, renderTilemap } from '/src/engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '/src/engine/assets/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';
import { moveRectWithTilemapCollision } from '/src/engine/systems/index.js';
import { createDemoSpriteSheet } from './demoSpriteFactory.js';
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-03/0301/sample-0301-sprite-editor.json';

export default class RealSpriteRenderingScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.loader = new ImageAssetLoader();
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      palette: { 0: '#1f2937', 1: '#4338ca' },
    });
    this.world = {
      width: this.tilemap.width * this.tilemap.tileSize,
      height: this.tilemap.height * this.tilemap.tileSize,
    };
    this.camera = new Camera2D({
      viewportWidth: 860,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });

    this.asset = { status: 'generated-loaded', image: createDemoSpriteSheet() };
    this.atlas = new SpriteAtlas({
      frames: {
        hero_idle: { x: 0, y: 0, width: 16, height: 16 },
        hero_walk: { x: 16, y: 0, width: 16, height: 16 },
        hero_npc: { x: 32, y: 0, width: 16, height: 16 },
        hero_goal: { x: 48, y: 0, width: 16, height: 16 },
      },
    });

    this.player = { x: 52, y: 50, width: 40, height: 40, speed: 220, frame: 'hero_idle' };
    this.npc = { x: 435, y: 100, width: 40, height: 40, frame: 'hero_npc', label: 'npc' };
    this.goal = { x: 532, y: 245, width: 40, height: 40, frame: 'hero_goal', label: 'goal' };
    this.message = 'Image-backed sprites are now the primary actor path.';
    this.spriteProject = null;
    this.spriteStatus = 'loading';
    this.spriteError = '';
    this.frameIndexByName = {
      hero_idle: 0,
      hero_walk: 1,
      hero_npc: 2,
      hero_goal: 3
    };
    void this.loadSpriteProject();
  }

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
    const safe = Number.isInteger(mapped) ? mapped : 0;
    return safe % this.spriteProject.frames.length;
  }

  update(dt, engine) {
    let moving = false;
    const velocity = { x: 0, y: 0 };

    if (engine.input.isActionDown('move_left')) {
      velocity.x -= this.player.speed;
      moving = true;
    }
    if (engine.input.isActionDown('move_right')) {
      velocity.x += this.player.speed;
      moving = true;
    }
    if (engine.input.isActionDown('move_up')) {
      velocity.y -= this.player.speed;
      moving = true;
    }
    if (engine.input.isActionDown('move_down')) {
      velocity.y += this.player.speed;
      moving = true;
    }

    moveRectWithTilemapCollision(this.player, velocity, dt, this.tilemap);
    this.player.frame = moving ? 'hero_walk' : 'hero_idle';
    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    const presetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite preset loaded from sample-0301-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback'})`;

    drawFrame(renderer, theme, [
      'Engine sample 0301',
      'Promotes real image-backed sprite rendering to the standard actor path',
      'Uses shared sample-0301-sprite-editor.json frames as the sprite source',
      'Camera + tilemap remain in place so later samples can inherit the path',
      this.message,
      presetStatus
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
    renderTilemap(renderer, this.tilemap, {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    });

    const entities = [this.player, this.npc, this.goal].map((entity) => ({
      ...worldRectToScreen(this.camera, entity, this.screen.x, this.screen.y),
      frame: entity.frame,
      label: entity.label || entity.frame,
    }));

    if (this.spriteProject) {
      entities.forEach((entity) => {
        const pixelSize = Math.max(2, Math.floor(entity.width / this.spriteProject.width));
        drawSpriteProjectFrame(renderer, this.spriteProject, this.resolveFrameIndex(entity.frame), {
          x: entity.x,
          y: entity.y,
          pixelSize
        });
        renderer.drawText(entity.label, entity.x + ((this.spriteProject.width * pixelSize) / 2), entity.y + (this.spriteProject.height * pixelSize) + 12, {
          color: '#d8d5ff',
          font: '12px monospace',
          textAlign: 'center'
        });
      });
    } else {
      renderSpriteReadyEntities(renderer, entities, {
        label: true,
        labelOffsetY: 52,
        getFrame: (entity) => this.atlas.getFrame(entity.frame),
        getImage: () => this.asset?.image || null,
      });
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Sprite Contract', [
      `Asset status: ${this.spriteProject ? 'preset-loaded' : this.asset?.status || 'loading'}`,
      `Atlas frames: ${this.spriteProject ? this.spriteProject.frames.length : this.atlas.getFrameNames().length}`,
      `Player frame: ${this.player.frame}`,
      'Source: sample-0301-sprite-editor.json',
    ]);
  }
}
