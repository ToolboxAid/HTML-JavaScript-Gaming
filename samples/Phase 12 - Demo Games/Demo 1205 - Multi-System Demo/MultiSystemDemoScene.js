/*
Toolbox Aid
David Quesenberry
03/31/2026
MultiSystemDemoScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, worldRectToScreen } from '../../../engine/camera/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '../../../engine/tilemap/index.js';

const theme = new Theme(ThemeTokens);

export default class MultiSystemDemoScene extends Scene {
  constructor(options = {}) {
    super();
    this.devConsoleIntegration = options.devConsoleIntegration || null;
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

    this.collectibles = [
      { x: 360, y: this.world.height - this.tilemap.tileSize - 86, radius: 10, collected: false },
      { x: 910, y: this.world.height - this.tilemap.tileSize - 182, radius: 10, collected: false },
      { x: 1450, y: this.world.height - this.tilemap.tileSize - 230, radius: 10, collected: false },
      { x: 2010, y: this.world.height - this.tilemap.tileSize - 182, radius: 10, collected: false },
      { x: 2580, y: this.world.height - this.tilemap.tileSize - 278, radius: 10, collected: false },
      { x: 3160, y: this.world.height - this.tilemap.tileSize - 200, radius: 10, collected: false },
    ];
    this.collectedCount = 0;
    this.totalCollectibles = this.collectibles.length;
    this.lastDeltaTime = 0;
    this.lastResolvedRenderOrder = [];
  }

  exit() {
    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.dispose();
    }
  }

  update(dt, engine) {
    this.lastDeltaTime = dt;
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

    this.collectPickups();

    this.camera.x = this.hero.x + this.hero.width * 0.5 - this.camera.viewportWidth * 0.5;
    this.camera.y = this.fixedCameraY;
    this.camera.clampToWorld();

    if (this.devConsoleIntegration) {
      const diagnosticsContext = this.buildDiagnosticsContext(engine, dt);
      this.devConsoleIntegration.update({
        engine,
        scene: this,
        diagnosticsContext,
      });
    }
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

  collectPickups() {
    for (const pickup of this.collectibles) {
      if (pickup.collected) continue;
      if (!isHeroTouchingCollectible(this.hero, pickup)) continue;
      pickup.collected = true;
      this.collectedCount += 1;
    }
  }

  buildDiagnosticsContext(engine, dt) {
    const fps = dt > 0 ? Math.round(1 / dt) : 0;
    const worldStages = ['parallax', 'tilemap', 'entities', 'sprite-effects', 'vector-overlay'];
    const renderOrder = this.devConsoleIntegration?.getRuntime?.().getDeterministicRenderOrder(worldStages) || worldStages;
    this.lastResolvedRenderOrder = renderOrder.slice();
    const shiftDown = engine.input.isDown('ShiftLeft') || engine.input.isDown('ShiftRight');
    const ctrlDown = engine.input.isDown('ControlLeft') || engine.input.isDown('ControlRight');
    const backquoteDown = engine.input.isDown('Backquote');

    return {
      runtime: {
        sceneId: 'demo-1205-multi-system',
        status: 'running',
        fps,
        frameTimeMs: Math.round(dt * 1000 * 100) / 100,
      },
      camera: {
        x: Math.round(this.camera.x * 100) / 100,
        y: Math.round(this.camera.y * 100) / 100,
        viewportWidth: this.camera.viewportWidth,
        viewportHeight: this.camera.viewportHeight,
      },
      entities: {
        count: 1 + (this.totalCollectibles - this.collectedCount),
        heroState: this.hero.onGround ? 'grounded' : 'airborne',
      },
      tilemap: {
        width: this.tilemap.width,
        height: this.tilemap.height,
        tileSize: this.tilemap.tileSize,
      },
      input: {
        left: engine.input.isDown('ArrowLeft'),
        right: engine.input.isDown('ArrowRight'),
        jump: engine.input.isDown('Space'),
        consoleToggle: shiftDown && !ctrlDown && backquoteDown,
        overlayToggle: ctrlDown && shiftDown && backquoteDown,
        reload: ctrlDown && shiftDown && engine.input.isDown('KeyR'),
        nextPanel: ctrlDown && shiftDown && engine.input.isDown('BracketRight'),
        previousPanel: ctrlDown && shiftDown && engine.input.isDown('BracketLeft'),
      },
      hotReload: {
        enabled: false,
        pending: false,
        mode: 'sample-manual',
      },
      validation: {
        errorCount: 0,
        warningCount: 0,
      },
      render: {
        stages: renderOrder,
        debugSurfaceTail: renderOrder.slice(-2),
      },
      assets: {
        parallaxLayers: this.parallaxLayers.length,
        collectibleTotal: this.totalCollectibles,
      },
    };
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Demo 1205 - Multi-System Demo',
      'Move with Left/Right Arrow. Press Space to jump.',
      'Gameplay contract matches Demo 1204 with one added collectible counter layer.',
      'Collectibles disappear on touch and increment the counter.',
      'No enemies, trigger/switch systems, or broader game systems.',
      'Debug: Shift+` console, Ctrl+Shift+` overlay, Ctrl+Shift+R reload.',
      'Debug Panels: Ctrl+Shift+] next panel, Ctrl+Shift+[ previous panel.',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    this.drawParallax(renderer);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    this.drawCollectibles(renderer);

    const heroScreen = worldRectToScreen(this.camera, this.hero, this.screen.x, this.screen.y);
    renderer.drawRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, theme.getColor('actorFill'));
    renderer.strokeRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, '#ffffff', 1);

    const stateLabel = this.hero.onGround ? (this.landingTimer > 0 ? 'landed' : 'grounded') : 'airborne';
    const complete = this.collectedCount === this.totalCollectibles ? 'All collected' : 'Collect all';
    drawPanel(renderer, 620, 34, 300, 166, 'Multi-System', [
      `State: ${stateLabel}`,
      `Collected: ${this.collectedCount}/${this.totalCollectibles}`,
      `Goal: ${complete}`,
      `Camera X: ${this.camera.x.toFixed(1)}`,
      `Parallax Far/Near: ${this.parallaxLayers[0].speed}/${this.parallaxLayers[2].speed}`,
      'Controls: Left/Right + Space + Shift+` + Ctrl+Shift+`',
    ]);

    if (this.devConsoleIntegration) {
      const debugRender = this.devConsoleIntegration.render(renderer, {
        worldStages: ['parallax', 'tilemap', 'entities', 'sprite-effects', 'vector-overlay'],
      });
      if (Array.isArray(debugRender?.renderOrder)) {
        this.lastResolvedRenderOrder = debugRender.renderOrder.slice();
      }
    }
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

  drawCollectibles(renderer) {
    for (const pickup of this.collectibles) {
      if (pickup.collected) continue;
      const x = pickup.x + this.screen.x - this.camera.x;
      const y = pickup.y + this.screen.y - this.camera.y;
      renderer.drawCircle(x, y, pickup.radius, '#fbbf24');
      renderer.drawCircle(x, y, Math.max(2, pickup.radius * 0.45), '#fef3c7');
    }
  }
}

function isHeroTouchingCollectible(hero, pickup) {
  const closestX = clamp(pickup.x, hero.x, hero.x + hero.width);
  const closestY = clamp(pickup.y, hero.y, hero.y + hero.height);
  const dx = pickup.x - closestX;
  const dy = pickup.y - closestY;
  return (dx * dx + dy * dy) <= pickup.radius * pickup.radius;
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
