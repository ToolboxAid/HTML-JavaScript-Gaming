/*
Toolbox Aid
David Quesenberry
03/31/2026
TriggerZoneDemoScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '/src/engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class TriggerZoneDemoScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 40, y: 180 };
    this.moveSpeed = 280;
    this.jumpSpeed = 900;
    this.gravity = 2200;
    this.maxFallSpeed = 1100;

    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: buildTiles(72, 18),
      palette: {
        0: 'rgba(17, 24, 39, 0.62)',
        1: '#4338ca',
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

    this.parallaxLayers = [
      { speed: 0.16, y: 16, height: 56, width: 210, gap: 70, color: 'rgba(148, 163, 184, 0.34)' },
      { speed: 0.30, y: 72, height: 96, width: 180, gap: 36, color: 'rgba(99, 102, 241, 0.28)' },
      { speed: 0.52, y: 128, height: 92, width: 140, gap: 24, color: 'rgba(45, 212, 191, 0.22)' },
    ];

    this.triggerZone = {
      x: 3050,
      y: this.world.height - this.tilemap.tileSize - 84,
      width: 88,
      height: 84,
    };
    this.triggered = false;
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

    if (!this.triggered && isRectOverlap(this.hero, this.triggerZone)) {
      this.triggered = true;
    }

    this.camera.x = this.hero.x + this.hero.width * 0.5 - this.camera.viewportWidth * 0.5;
    this.camera.y = this.fixedCameraY;
    this.camera.clampToWorld();
  }

  moveHeroHorizontally(distance) {
    if (distance === 0) return;

    const steps = Math.max(1, Math.ceil(Math.abs(distance) / 12));
    const step = distance / steps;
    for (let index = 0; index < steps; index += 1) {
      this.hero.x += step;
      const hit = resolveRectVsTilemap(this.hero, this.tilemap);
      if (!hit) continue;

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
    if (distance === 0) return;

    const steps = Math.max(1, Math.ceil(Math.abs(distance) / 12));
    const step = distance / steps;
    for (let index = 0; index < steps; index += 1) {
      this.hero.y += step;
      const hit = resolveRectVsTilemap(this.hero, this.tilemap);
      if (!hit) continue;

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
      'Sample 1206 - Trigger Zone',
      'Move with Left/Right Arrow. Press Space to jump.',
      'Gameplay contract matches Sample 1204/1205 with one added trigger-zone interaction.',
      'Enter the trigger zone to activate success state.',
      'No collectibles, switch/checkpoint systems, or broader game systems.',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    this.drawParallax(renderer);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    this.drawTriggerZone(renderer);

    const heroScreen = worldRectToScreen(this.camera, this.hero, this.screen.x, this.screen.y);
    renderer.drawRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, theme.getColor('actorFill'));
    renderer.strokeRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, '#ffffff', 1);

    const stateLabel = this.hero.onGround ? (this.landingTimer > 0 ? 'landed' : 'grounded') : 'airborne';
    const triggerState = this.triggered ? 'Success: Triggered' : 'Goal: Reach trigger zone';
    drawPanel(renderer, 620, 34, 300, 166, 'Trigger Zone', [
      `State: ${stateLabel}`,
      triggerState,
      `Camera X: ${this.camera.x.toFixed(1)}`,
      `Parallax Far/Near: ${this.parallaxLayers[0].speed}/${this.parallaxLayers[2].speed}`,
      'Controls: Left/Right + Space',
      'Interaction: Trigger zone only',
    ]);
  }

  drawParallax(renderer) {
    renderer.drawRect(
      this.screen.x,
      this.screen.y,
      this.camera.viewportWidth,
      this.camera.viewportHeight,
      '#0f172a'
    );

    for (const layer of this.parallaxLayers) {
      this.drawParallaxLayer(renderer, layer);
    }
  }

  drawParallaxLayer(renderer, layer) {
    const segment = layer.width + layer.gap;
    const offset = -((this.camera.x * layer.speed) % segment);
    const endX = this.screen.x + this.camera.viewportWidth + segment;

    for (let x = this.screen.x + offset - segment; x < endX; x += segment) {
      renderer.drawRect(
        x,
        this.screen.y + layer.y,
        layer.width,
        layer.height,
        layer.color
      );
      renderer.drawRect(
        x + layer.width * 0.2,
        this.screen.y + layer.y - layer.height * 0.25,
        layer.width * 0.35,
        layer.height * 0.35,
        layer.color
      );
    }
  }

  drawTriggerZone(renderer) {
    const zoneScreen = worldRectToScreen(this.camera, this.triggerZone, this.screen.x, this.screen.y);
    const fill = this.triggered ? 'rgba(34, 197, 94, 0.55)' : 'rgba(251, 191, 36, 0.45)';
    const stroke = this.triggered ? '#22c55e' : '#fbbf24';
    renderer.drawRect(zoneScreen.x, zoneScreen.y, zoneScreen.width, zoneScreen.height, fill);
    renderer.strokeRect(zoneScreen.x, zoneScreen.y, zoneScreen.width, zoneScreen.height, stroke, 2);
  }
}

function isRectOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
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
  placePlatform(tiles, height - 6, 31, 39);
  placePlatform(tiles, height - 4, 43, 51);
  placePlatform(tiles, height - 7, 54, 61);
  placePlatform(tiles, height - 8, 64, 69);
  placePlatform(tiles, height - 9, 24, 30);
  placePlatform(tiles, height - 10, 46, 50);

  placePlatform(tiles, height - 3, 10, 11);
  placePlatform(tiles, height - 3, 28, 29);
  placePlatform(tiles, height - 3, 40, 41);
  placePlatform(tiles, height - 3, 58, 59);

  return tiles;
}

function placePlatform(tiles, row, startCol, endCol) {
  for (let col = startCol; col <= endCol; col += 1) {
    tiles[row][col] = 1;
  }
}
