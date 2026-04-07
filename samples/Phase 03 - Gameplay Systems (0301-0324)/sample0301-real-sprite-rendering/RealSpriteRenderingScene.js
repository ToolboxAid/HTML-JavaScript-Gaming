/*
Toolbox Aid
David Quesenberry
03/21/2026
RealSpriteRenderingScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../../engine/camera/index.js';
import { Tilemap, renderTilemap } from '../../../engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '../../../engine/assets/index.js';
import { renderSpriteReadyEntities } from '../../../engine/render/index.js';
import { moveRectWithTilemapCollision } from '../../../engine/systems/index.js';
import { createDemoSpriteSheet } from './demoSpriteFactory.js';

const theme = new Theme(ThemeTokens);

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
    drawFrame(renderer, theme, [
      'Engine sample 0301',
      'Promotes real image-backed sprite rendering to the standard actor path',
      'Uses a generated sprite sheet and atlas coordinates, not color-only boxes',
      'Camera + tilemap remain in place so later samples can inherit the path',
      this.message,
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

    renderSpriteReadyEntities(renderer, entities, {
      label: true,
      labelOffsetY: 52,
      getFrame: (entity) => this.atlas.getFrame(entity.frame),
      getImage: () => this.asset?.image || null,
    });

    drawPanel(renderer, 620, 34, 300, 126, 'Sprite Contract', [
      `Asset status: ${this.asset?.status || 'loading'}`,
      `Atlas frames: ${this.atlas.getFrameNames().length}`,
      `Player frame: ${this.player.frame}`,
      'Later samples now inherit image-backed actor rendering',
    ]);
  }
}
