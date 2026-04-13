/*
Toolbox Aid
David Quesenberry
03/21/2026
TileMetadataScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, renderTilemap } from '/src/engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '/src/engine/assets/index.js';
import { AnimationController } from '/src/engine/animation/index.js';
import { renderSpriteReadyEntities } from '/src/engine/render/index.js';
import { stepArcadeBody, moveRectWithTilemapCollision } from '/src/engine/systems/index.js';
import { createDemoSpriteSheet } from '../0301/demoSpriteFactory.js';

const theme = new Theme(ThemeTokens);

export default class TileMetadataScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 240 };
    this.loader = new ImageAssetLoader();
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0, 1],
        [1, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      definitions: {
        0: { label: 'floor', color: '#1f2937', solid: false },
        1: { label: 'wall', color: '#4338ca', solid: true },
        2: { label: 'hazard', color: '#dc2626', solid: false, hazard: true, respawnMessage: 'Hazard tile touched. Reset.' },
        3: { label: 'trigger', color: '#059669', solid: false, trigger: 'goal-flag', message: 'Trigger tile activated.' },
        4: { label: 'slope', color: '#a855f7', solid: false, slope: 'placeholder-up-right', message: 'Slope metadata placeholder.' },
      },
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
    //this.spawn = { x: 48, y: 48 };
    this.spawn = { x: 582, y: 246 };
    this.player = {
      x: this.spawn.x,
      y: this.spawn.y,
      width: 36,
      height: 36,
      velocityX: 0,
      velocityY: 0,
      accelerationX: 0,
      accelerationY: 0,
      dragX: 820,
      dragY: 820,
      maxSpeedX: 250,
      maxSpeedY: 250,
      moveAcceleration: 980,
    };
    this.animation = new AnimationController({
      initial: 'idle',
      animations: {
        idle: { frames: ['idle_0'], frameDuration: 0.25, loop: true },
        move: { frames: ['move_0', 'move_1'], frameDuration: 0.12, loop: true },
      },
    });
    this.metadataNote = 'Walk onto colored metadata tiles.';
    this.flags = { goalTriggered: false };
  }

  getOverlappedMetadata() {
    const tileSize = this.tilemap.tileSize;
    const startCol = Math.floor(this.player.x / tileSize);
    const endCol = Math.floor((this.player.x + this.player.width - 1) / tileSize);
    const startRow = Math.floor(this.player.y / tileSize);
    const endRow = Math.floor((this.player.y + this.player.height - 1) / tileSize);

    const metadataList = [];
    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const definition = this.tilemap.getDefinition(col, row);
        if (definition) {
          metadataList.push(definition);
        }
      }
    }
    return metadataList;
  }

  resetPlayerToSpawn() {
    this.player.x = this.spawn.x;
    this.player.y = this.spawn.y;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.accelerationX = 0;
    this.player.accelerationY = 0;
  }

  update(dt, engine) {
    this.player.accelerationX = 0;
    this.player.accelerationY = 0;

    if (engine.input.isActionDown('move_left')) this.player.accelerationX -= this.player.moveAcceleration;
    if (engine.input.isActionDown('move_right')) this.player.accelerationX += this.player.moveAcceleration;
    if (engine.input.isActionDown('move_up')) this.player.accelerationY -= this.player.moveAcceleration;
    if (engine.input.isActionDown('move_down')) this.player.accelerationY += this.player.moveAcceleration;

    stepArcadeBody(this.player, dt);

    const velocity = {
      x: this.player.velocityX,
      y: this.player.velocityY,
    };
    moveRectWithTilemapCollision(this.player, velocity, dt, this.tilemap);
    this.player.velocityX = velocity.x;
    this.player.velocityY = velocity.y;

    const metadataList = this.getOverlappedMetadata();
    const hazard = metadataList.find((item) => item.hazard);
    const trigger = metadataList.find((item) => item.trigger);
    const slope = metadataList.find((item) => item.slope);

    if (hazard) {
      this.resetPlayerToSpawn();
      this.metadataNote = hazard.respawnMessage;
      this.animation.play('idle');
      this.animation.update(0);
      followCameraTarget(this.camera, this.player, true);
      return;
    }

    if (trigger) {
      this.flags.goalTriggered = true;
      this.metadataNote = trigger.message;
    } else if (slope) {
      this.metadataNote = slope.message;
    } else {
      this.metadataNote = 'Walk onto colored metadata tiles.';
    }

    const moving = Math.abs(this.player.velocityX) > 8 || Math.abs(this.player.velocityY) > 8;
    this.animation.play(moving ? 'move' : 'idle');
    this.animation.update(dt);
    followCameraTarget(this.camera, this.player, true);
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 0305',
      'Extends the tilemap from solid/not-solid into hazard, trigger, and slope-style metadata',
      'Red tiles reset the actor (to spawn point)',
      'Green tiles trigger a flag,',
      'Purple tiles prove schema room for slopes',
      'Only blue wall tiles are solid blockers',
      this.metadataNote,
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

    drawPanel(renderer, 620, 34, 300, 126, 'Tile Metadata', [
      `Goal triggered: ${this.flags.goalTriggered}`,
      this.metadataNote,
      'Hazard and trigger behavior come from tile definitions',
      'Slope tile is a schema placeholder for future movement work',
    ]);
  }
}
