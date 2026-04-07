/*
Toolbox Aid
David Quesenberry
03/31/2026
TilemapHeroJumpCollisionScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, worldRectToScreen } from '../../../engine/camera/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '../../../engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class TilemapHeroJumpCollisionScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 40, y: 180 };
    this.moveSpeed = 280;
    this.jumpSpeed = 900;
    this.gravity = 2200;
    this.maxFallSpeed = 1100;

    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: buildTiles(60, 18),
      palette: {
        0: '#111827',
        1: '#4f46e5',
      },
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
    this.fixedCameraY = clamp(this.world.height - this.camera.viewportHeight - 32, 0, this.world.height);

    this.hero = {
      x: 120,
      y: this.world.height - this.tilemap.tileSize - 42,
      width: 34,
      height: 42,
      vx: 0,
      vy: 0,
      onGround: true,
    };
    this.lastJumpPressed = false;
    this.landingTimer = 0;
  }

  update(dt, engine) {
    const left = engine.input.isDown('ArrowLeft');
    const right = engine.input.isDown('ArrowRight');
    const jumpPressed = engine.input.isDown('Space');
    const direction = (right ? 1 : 0) - (left ? 1 : 0);

    this.hero.vx = direction * this.moveSpeed;

    if (jumpPressed && !this.lastJumpPressed && this.hero.onGround) {
      this.hero.vy = -this.jumpSpeed;
      this.hero.onGround = false;
    }
    this.lastJumpPressed = jumpPressed;

    this.hero.vy = Math.min(this.hero.vy + this.gravity * dt, this.maxFallSpeed);

    this.moveHeroHorizontally(this.hero.vx * dt);

    const wasGrounded = this.hero.onGround;
    this.hero.onGround = false;
    this.moveHeroVertically(this.hero.vy * dt);

    if (!wasGrounded && this.hero.onGround) {
      this.landingTimer = 0.12;
    }
    if (this.landingTimer > 0) {
      this.landingTimer = Math.max(0, this.landingTimer - dt);
    }

    this.hero.x = clamp(this.hero.x, 0, this.world.width - this.hero.width);
    this.hero.y = clamp(this.hero.y, 0, this.world.height - this.hero.height);

    this.camera.x = this.hero.x + this.hero.width * 0.5 - this.camera.viewportWidth * 0.5;
    this.camera.y = this.fixedCameraY;
    this.camera.clampToWorld();
  }

  moveHeroHorizontally(distance) {
    if (distance === 0) {
      return;
    }

    const steps = Math.max(1, Math.ceil(Math.abs(distance) / 12));
    const step = distance / steps;
    for (let index = 0; index < steps; index += 1) {
      this.hero.x += step;
      const hit = resolveRectVsTilemap(this.hero, this.tilemap);
      if (!hit) {
        continue;
      }

      if (step > 0) {
        this.hero.x = hit.x - this.hero.width;
      } else {
        this.hero.x = hit.x + hit.width;
      }
      this.hero.vx = 0;
      break;
    }
  }

  moveHeroVertically(distance) {
    if (distance === 0) {
      return;
    }

    const steps = Math.max(1, Math.ceil(Math.abs(distance) / 12));
    const step = distance / steps;
    for (let index = 0; index < steps; index += 1) {
      this.hero.y += step;
      const hit = resolveRectVsTilemap(this.hero, this.tilemap);
      if (!hit) {
        continue;
      }

      if (step > 0) {
        this.hero.y = hit.y - this.hero.height;
        this.hero.vy = 0;
        this.hero.onGround = true;
      } else {
        this.hero.y = hit.y + hit.height;
        this.hero.vy = 0;
      }
      break;
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1203 - Tilemap Hero Jump Collision',
      'Move with Left/Right Arrow. Press Space to jump.',
      'Gravity, grounded state, and landing are active.',
      'Tile collision blocks normal pass-through in play.',
      'No parallax or broader gameplay systems.',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    const heroScreen = worldRectToScreen(this.camera, this.hero, this.screen.x, this.screen.y);
    renderer.drawRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, theme.getColor('actorFill'));
    renderer.strokeRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, '#ffffff', 1);

    const stateLabel = this.hero.onGround ? (this.landingTimer > 0 ? 'landed' : 'grounded') : 'airborne';
    drawPanel(renderer, 620, 34, 300, 126, 'Hero', [
      `State: ${stateLabel}`,
      `vx: ${this.hero.vx.toFixed(1)} / vy: ${this.hero.vy.toFixed(1)}`,
      `World: ${this.tilemap.width}x${this.tilemap.height} tiles`,
      `Camera X: ${this.camera.x.toFixed(1)}`,
    ]);
  }
}

function buildTiles(width, height) {
  const tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));

  for (let x = 0; x < width; x += 1) {
    tiles[height - 1][x] = 1;
  }
  for (let y = 0; y < height; y += 1) {
    tiles[y][0] = 1;
    tiles[y][width - 1] = 1;
  }

  placePlatform(tiles, height - 4, 5, 13);
  placePlatform(tiles, height - 5, 18, 26);
  placePlatform(tiles, height - 6, 31, 38);
  placePlatform(tiles, height - 4, 42, 50);
  placePlatform(tiles, height - 7, 53, 58);
  placePlatform(tiles, height - 9, 23, 29);

  placePlatform(tiles, height - 3, 10, 11);
  placePlatform(tiles, height - 3, 27, 28);
  placePlatform(tiles, height - 3, 39, 40);

  return tiles;
}

function placePlatform(tiles, row, startCol, endCol) {
  for (let col = startCol; col <= endCol; col += 1) {
    tiles[row][col] = 1;
  }
}
