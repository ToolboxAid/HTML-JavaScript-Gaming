/*
Toolbox Aid
David Quesenberry
03/21/2026
PhysicsSystemScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../../src/engine/camera/index.js';
import { Tilemap, renderTilemap } from '../../../src/engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '../../../src/engine/assets/index.js';
import { AnimationController } from '../../../src/engine/animation/index.js';
import { renderSpriteReadyEntities } from '../../../src/engine/render/index.js';
import { stepArcadeBody } from '../../../src/engine/systems/index.js';
import { createDemoSpriteSheet } from '../sample0301-real-sprite-rendering/demoSpriteFactory.js';

const theme = new Theme(ThemeTokens);

export default class PhysicsSystemScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.loader = new ImageAssetLoader();
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
      },
    });
    this.asset = { status: 'generated-loaded', image: createDemoSpriteSheet() };
    this.player = {
      x: 90,
      y: 85,
      width: 40,
      height: 40,
      velocityX: 0,
      velocityY: 0,
      accelerationX: 0,
      accelerationY: 0,
      dragX: 780,
      dragY: 780,
      maxSpeedX: 240,
      maxSpeedY: 240,
      moveAcceleration: 920,
    };
    this.animation = new AnimationController({
      initial: 'idle',
      animations: {
        idle: { frames: ['idle_0'], frameDuration: 0.25, loop: true },
        move: { frames: ['move_0', 'move_1'], frameDuration: 0.12, loop: true },
      },
    });
  }

  update(dt, engine) {
    this.player.accelerationX = 0;
    this.player.accelerationY = 0;

    if (engine.input.isActionDown('move_left')) this.player.accelerationX -= this.player.moveAcceleration;
    if (engine.input.isActionDown('move_right')) this.player.accelerationX += this.player.moveAcceleration;
    if (engine.input.isActionDown('move_up')) this.player.accelerationY -= this.player.moveAcceleration;
    if (engine.input.isActionDown('move_down')) this.player.accelerationY += this.player.moveAcceleration;

    stepArcadeBody(this.player, dt);
    this.player.x += this.player.velocityX * dt;
    this.player.y += this.player.velocityY * dt;

    this.player.x = Math.max(48, Math.min(this.world.width - 48 - this.player.width, this.player.x));
    this.player.y = Math.max(48, Math.min(this.world.height - 48 - this.player.height, this.player.y));

    const moving = Math.abs(this.player.velocityX) > 8 || Math.abs(this.player.velocityY) > 8;
    this.animation.play(moving ? 'move' : 'idle');
    this.animation.update(dt);
    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0303',
      'Shifts movement to velocity, acceleration, and drag instead of raw position nudging',
      'Move with Arrow keys or WASD and release to watch drag settle the actor',
      'This is the motion base for better collision response in sample 0304',
      `Velocity: ${this.player.velocityX.toFixed(1)}, ${this.player.velocityY.toFixed(1)}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);
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

    drawPanel(renderer, 620, 34, 300, 126, 'Physics', [
      `vx: ${this.player.velocityX.toFixed(1)}`,
      `vy: ${this.player.velocityY.toFixed(1)}`,
      `accel: ${this.player.moveAcceleration}`,
      'Drag settles speed instead of instant stop',
    ]);
  }
}
