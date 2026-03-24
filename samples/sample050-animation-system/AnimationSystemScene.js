/*
Toolbox Aid
David Quesenberry
03/21/2026
AnimationSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../engine/camera/index.js';
import { Tilemap, renderTilemap } from '../../engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '../../engine/assets/index.js';
import { AnimationController } from '../../engine/animation/index.js';
import { renderSpriteReadyEntities } from '../../engine/render/index.js';
import { moveRectWithTilemapCollision } from '../../engine/systems/index.js';
import { createDemoSpriteSheet } from '../sample049-real-sprite-rendering/demoSpriteFactory.js';

const theme = new Theme(ThemeTokens);

export default class AnimationSystemScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.loader = new ImageAssetLoader();
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,0,0,0,0,1],
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

    this.atlas = new SpriteAtlas({
      frames: {
        idle_0: { x: 0, y: 0, width: 16, height: 16 },
        move_0: { x: 16, y: 0, width: 16, height: 16 },
        move_1: { x: 32, y: 0, width: 16, height: 16 },
        action_0: { x: 48, y: 0, width: 16, height: 16 },
      },
    });

    this.asset = { status: 'generated-loaded', image: createDemoSpriteSheet() };
    this.player = { x: 80, y: 70, width: 40, height: 40, speed: 220 };
    this.lastActionDown = false;
    this.animation = new AnimationController({
      initial: 'idle',
      animations: {
        idle: { frames: ['idle_0'], frameDuration: 0.25, loop: true },
        move: { frames: ['move_0', 'move_1'], frameDuration: 0.14, loop: true },
        action: { frames: ['action_0', 'move_1', 'idle_0'], frameDuration: 0.11, loop: false },
      },
    });
  }

  update(dt, engine) {
    let moving = false;
    const velocity = { x: 0, y: 0 };

    if (engine.input.isActionDown('move_left')) { velocity.x -= this.player.speed; moving = true; }
    if (engine.input.isActionDown('move_right')) { velocity.x += this.player.speed; moving = true; }
    if (engine.input.isActionDown('move_up')) { velocity.y -= this.player.speed; moving = true; }
    if (engine.input.isActionDown('move_down')) { velocity.y += this.player.speed; moving = true; }

    const actionDown = engine.input.isActionDown('action');
    if (actionDown && !this.lastActionDown) {
      this.animation.play('action', { restart: true });
    } else if (this.animation.getStateName() !== 'action' || this.animation.isFinished()) {
      this.animation.play(moving ? 'move' : 'idle');
    }

    if (this.animation.getStateName() === 'action' && this.animation.isFinished()) {
      this.animation.play(moving ? 'move' : 'idle', { restart: true });
    }

    moveRectWithTilemapCollision(this.player, velocity, dt, this.tilemap);
    this.animation.update(dt);
    this.lastActionDown = actionDown;
    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample50',
      'Adds predictable timing, loop control, and a one-shot action animation',
      'Move with Arrow keys/WASD, press Space for a non-looping test action',
      'Idle and move states no longer flicker or reset on every input poll',
      `State: ${this.animation.getStateName()}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#fbbf24', 2);
    renderTilemap(renderer, this.tilemap, {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    });

    const playerRect = worldRectToScreen(this.camera, this.player, this.screen.x, this.screen.y);
    renderSpriteReadyEntities(renderer, [{
      ...playerRect,
      frame: this.animation.getFrame(),
      label: this.animation.getStateName(),
    }], {
      label: true,
      labelOffsetY: 52,
      getFrame: (entity) => this.atlas.getFrame(entity.frame),
      getImage: () => this.asset?.image || null,
    });

    drawPanel(renderer, 620, 34, 300, 126, 'Animation', [
      `State: ${this.animation.getStateName()}`,
      `Frame: ${this.animation.getFrame()}`,
      `Finished: ${this.animation.isFinished()}`,
      'Action animation is one-shot; move and idle loop',
    ]);
  }
}
