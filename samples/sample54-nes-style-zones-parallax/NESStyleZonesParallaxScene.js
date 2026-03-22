/*
Toolbox Aid
David Quesenberry
03/21/2026
NESStyleZonesParallaxScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../engine/camera/index.js';
import { Tilemap, renderTilemap } from '../../engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '../../engine/assets/index.js';
import { AnimationController } from '../../engine/animation/index.js';
import { renderSpriteReadyEntities } from '../../engine/render/index.js';
import { stepArcadeBody, moveRectWithTilemapCollision } from '../../engine/systems/index.js';
import { createDemoSpriteSheet } from '../sample49-real-sprite-rendering/demoSpriteFactory.js';

const theme = new Theme(ThemeTokens);

export default class NESStyleZonesParallaxScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 288, y: 160 };
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      definitions: {
        0: { label: 'sky', color: 'rgba(15, 23, 42, 0.72)', solid: false },
        1: { label: 'ground', color: '#4338ca', solid: true },
      },
      palette: { 0: 'rgba(15, 23, 42, 0.72)', 1: '#4338ca' },
    });
    this.world = {
      width: this.tilemap.width * this.tilemap.tileSize,
      height: this.tilemap.height * this.tilemap.tileSize,
    };
    this.camera = new Camera2D({
      viewportWidth: 384,
      viewportHeight: 320,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });
    this.zones = [
      { id: 'zone-a', x: 0, y: 0, width: 384, height: this.world.height },
      { id: 'zone-b', x: 384, y: 0, width: 384, height: this.world.height },
      { id: 'zone-c', x: 768, y: 0, width: 384, height: this.world.height },
    ];

    this.loader = new ImageAssetLoader();
    this.asset = { status: 'generated-loaded', image: createDemoSpriteSheet() };
    this.atlas = new SpriteAtlas({
      frames: {
        idle_0: { x: 0, y: 0, width: 16, height: 16 },
        move_0: { x: 16, y: 0, width: 16, height: 16 },
        move_1: { x: 32, y: 0, width: 16, height: 16 },
      },
    });
    this.player = {
      x: 90,
      y: 152,
      width: 40,
      height: 40,
      velocityX: 0,
      velocityY: 0,
      accelerationX: 0,
      accelerationY: 0,
      dragX: 820,
      dragY: 820,
      maxSpeedX: 260,
      maxSpeedY: 260,
      moveAcceleration: 980,
    };
    this.animation = new AnimationController({
      initial: 'idle',
      animations: {
        idle: { frames: ['idle_0'], frameDuration: 0.25, loop: true },
        move: { frames: ['move_0', 'move_1'], frameDuration: 0.12, loop: true },
      },
    });
    this.activeZone = this.zones[0];
  }

  getActiveZone(target) {
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;
    return this.zones.find((entry) =>
      targetCenterX >= entry.x &&
      targetCenterX < entry.x + entry.width &&
      targetCenterY >= entry.y &&
      targetCenterY < entry.y + entry.height) || null;
  }

  update(dt, engine) {
    this.player.accelerationX = 0;
    this.player.accelerationY = 0;

    if (engine.input.isActionDown('move_left')) this.player.accelerationX -= this.player.moveAcceleration;
    if (engine.input.isActionDown('move_right')) this.player.accelerationX += this.player.moveAcceleration;

    stepArcadeBody(this.player, dt);

    const velocity = {
      x: this.player.velocityX,
      y: this.player.velocityY,
    };
    moveRectWithTilemapCollision(this.player, velocity, dt, this.tilemap);
    this.player.velocityX = velocity.x;
    this.player.velocityY = velocity.y;

    followCameraTarget(this.camera, this.player, true);
    this.activeZone = this.getActiveZone(this.player) || this.activeZone;

    const moving = Math.abs(this.player.velocityX) > 8;
    this.animation.play(moving ? 'move' : 'idle');
    this.animation.update(dt);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample54',
      'Shows NES-style scrolling zones with simple parallax layers',
      'Move left and right to cross deliberate camera zones instead of pure free-follow',
      'Foreground tilemap stays sharp while distant layers move at slower rates',
      `Active zone: ${this.activeZone?.id || 'none'}`,
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    this.renderParallaxLayer(renderer, 0.2, 18, 110, '#1e1b4b');
    this.renderParallaxLayer(renderer, 0.45, 32, 140, '#312e81');

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

    this.zones.forEach((zone) => {
      const zoneRect = worldRectToScreen(this.camera, zone, this.screen.x, this.screen.y);
      renderer.strokeRect(zoneRect.x, zoneRect.y, zoneRect.width, zoneRect.height, zone.id === this.activeZone?.id ? '#fbbf24' : '#64748b', 2);
    });

    drawPanel(renderer, 620, 22, 300, 126, 'NES Zones + Parallax', [
      `Active zone: ${this.activeZone?.id || 'none'}`,
      `Camera x: ${this.camera.x.toFixed(1)}`,
      'Dark bands = parallax layers moving slower than the tilemap',
      'Zone outlines show the deliberate section-based camera logic',
    ]);
  }

  renderParallaxLayer(renderer, factor, height, yOffset, color) {
    const bandWidth = 180;
    for (let i = 0; i < 10; i += 1) {
      const x = this.screen.x + i * bandWidth - this.camera.x * factor;
      renderer.drawRect(x, this.screen.y + yOffset, bandWidth - 20, height, color);
      renderer.strokeRect(x, this.screen.y + yOffset, bandWidth - 20, height, '#ffffff', 1);
    }
  }
}
