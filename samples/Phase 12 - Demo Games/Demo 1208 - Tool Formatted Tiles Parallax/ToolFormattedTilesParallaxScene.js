/*
Toolbox Aid
David Quesenberry
03/31/2026
ToolFormattedTilesParallaxScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, worldRectToScreen } from '../../../engine/camera/index.js';
import { Tilemap, resolveRectVsTilemap } from '../../../engine/tilemap/index.js';
import tileMapToolExport from './data/toolFormattedTileMap.export.js';
import parallaxToolExport from './data/toolFormattedParallax.export.js';

const theme = new Theme(ThemeTokens);

export default class ToolFormattedTilesParallaxScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 40, y: 180 };
    this.moveSpeed = 280;
    this.jumpSpeed = 900;
    this.gravity = 2200;
    this.maxFallSpeed = 1100;

    this.hero = {
      x: 120,
      y: 0,
      width: 34,
      height: 42,
      vx: 0,
      vy: 0,
      onGround: true,
    };
    this.lastJumpPressed = false;
    this.landingTimer = 0;

    this.contentStatus = 'Loading tool-formatted tile/parallax content...';
    this.contentLoaded = false;
    this.contentError = null;
    this.tileAssetById = {};
    this.tileImages = new Map();
    this.parallaxLayers = [];

    this.applyTileExportData(getFallbackTileExport());
    this.parallaxLayers = getFallbackParallaxLayerData();
  }

  enter() {
    this.loadToolFormattedContent();
  }

  async loadToolFormattedContent() {
    try {
      this.applyTileExportData(tileMapToolExport);
      await this.loadTileAssets(tileMapToolExport.tilePalette || []);
      this.parallaxLayers = await this.loadParallaxAssets(parallaxToolExport.layers || []);

      this.contentLoaded = true;
      this.contentStatus = 'Loaded tool-formatted tile + SVG parallax assets.';
      this.contentError = null;
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : String(error);
      this.contentStatus = 'Asset/data load failed. Running fallback data.';
    }
  }

  applyTileExportData(tileExport) {
    const tileSize = Number(tileExport?.tileSize) || 48;
    const cells = Array.isArray(tileExport?.cells) ? tileExport.cells : [[]];
    const tilePalette = Array.isArray(tileExport?.tilePalette) ? tileExport.tilePalette : [];
    const definitions = {};
    this.tileAssetById = {};

    for (const tileDefinition of tilePalette) {
      if (!tileDefinition || typeof tileDefinition.id !== 'number') {
        continue;
      }

      definitions[tileDefinition.id] = {
        solid: Boolean(tileDefinition.solid),
        color: tileDefinition.fallbackColor || '#1f2937',
        label: tileDefinition.name || `tile-${tileDefinition.id}`,
      };

      if (tileDefinition.asset) {
        this.tileAssetById[tileDefinition.id] = tileDefinition.asset;
      }
    }

    this.tilemap = new Tilemap({
      tileSize,
      tiles: cells,
      definitions,
      palette: {},
    });

    this.world = {
      width: this.tilemap.width * this.tilemap.tileSize,
      height: this.tilemap.height * this.tilemap.tileSize,
    };

    const viewportWidth = Number(tileExport?.camera?.viewportWidth) || 860;
    const viewportHeight = Number(tileExport?.camera?.viewportHeight) || 300;

    this.camera = new Camera2D({
      viewportWidth,
      viewportHeight,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });

    this.fixedCameraY = clamp(
      this.world.height - this.camera.viewportHeight - 32,
      0,
      this.world.height
    );

    const spawn = tileExport?.heroSpawn || { x: 120, y: this.world.height - tileSize - this.hero.height };
    this.hero.x = clamp(Number(spawn.x) || 120, 0, Math.max(0, this.world.width - this.hero.width));
    this.hero.y = clamp(
      Number(spawn.y) || this.world.height - tileSize - this.hero.height,
      0,
      Math.max(0, this.world.height - this.hero.height)
    );
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.onGround = true;
  }

  async loadTileAssets(tilePalette) {
    this.tileImages.clear();
    const loadOperations = [];

    for (const tileDefinition of tilePalette) {
      if (!tileDefinition?.asset) {
        continue;
      }

      const assetPath = tileDefinition.asset;
      loadOperations.push(
        loadImageFromRelativePath(assetPath, import.meta.url).then((image) => {
          this.tileImages.set(assetPath, image);
        })
      );
    }

    await Promise.all(loadOperations);
  }

  async loadParallaxAssets(layerDefinitions) {
    const loadOperations = layerDefinitions.map(async (layerDefinition) => {
      const image = await loadImageFromRelativePath(layerDefinition.asset, import.meta.url);
      return {
        id: layerDefinition.id,
        image,
        scrollFactor: Number(layerDefinition.scrollFactor) || 0.2,
        y: Number(layerDefinition.y) || 0,
        height: Number(layerDefinition.height) || 90,
        segmentWidth: Number(layerDefinition.segmentWidth) || image.width || 256,
      };
    });

    return Promise.all(loadOperations);
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

    this.hero.x = clamp(this.hero.x, 0, Math.max(0, this.world.width - this.hero.width));
    this.hero.y = clamp(this.hero.y, 0, Math.max(0, this.world.height - this.hero.height));

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
      'Demo 1208 - Tool Formatted Tiles Parallax',
      'Move with Left/Right Arrow. Press Space to jump.',
      'Tilemap and parallax layers load from tool-shaped JSON exports.',
      'World rendering uses real SVG tile and parallax assets.',
      'No extra gameplay systems beyond core traversal and rendering.',
    ]);

    renderer.strokeRect(
      this.screen.x,
      this.screen.y,
      this.camera.viewportWidth,
      this.camera.viewportHeight,
      '#d8d5ff',
      2
    );

    this.drawParallax(renderer);
    this.drawTilemapWithAssets(renderer);

    const heroScreen = worldRectToScreen(this.camera, this.hero, this.screen.x, this.screen.y);
    renderer.drawRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, theme.getColor('actorFill'));
    renderer.strokeRect(heroScreen.x, heroScreen.y, heroScreen.width, heroScreen.height, '#ffffff', 1);

    const stateLabel = this.hero.onGround ? (this.landingTimer > 0 ? 'landed' : 'grounded') : 'airborne';
    const toolLoadStatus = this.contentError ? `Load error: ${this.contentError}` : this.contentStatus;

    drawPanel(renderer, 600, 34, 320, 176, 'Tool Export Validation', [
      `State: ${stateLabel}`,
      `World: ${this.tilemap.width}x${this.tilemap.height} tiles`,
      `Camera X: ${this.camera.x.toFixed(1)}`,
      `SVG Parallax Layers: ${this.parallaxLayers.length}`,
      `SVG Tile Assets: ${this.tileImages.size}`,
      this.contentLoaded ? 'Status: Tool data loaded' : `Status: ${toolLoadStatus}`,
    ]);
  }

  drawParallax(renderer) {
    renderer.drawRect(
      this.screen.x,
      this.screen.y,
      this.camera.viewportWidth,
      this.camera.viewportHeight,
      '#0b1222'
    );

    for (const layer of this.parallaxLayers) {
      const segment = layer.segmentWidth;
      const offset = -((this.camera.x * layer.scrollFactor) % segment);
      const endX = this.screen.x + this.camera.viewportWidth + segment;

      for (let x = this.screen.x + offset - segment; x < endX; x += segment) {
        renderer.drawImageFrame(
          layer.image,
          0,
          0,
          layer.image.width,
          layer.image.height,
          x,
          this.screen.y + layer.y,
          segment,
          layer.height
        );
      }
    }
  }

  drawTilemapWithAssets(renderer) {
    const tileSize = this.tilemap.tileSize;
    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };

    const startCol = Math.max(0, Math.floor(this.camera.x / tileSize) - 1);
    const endCol = Math.min(this.tilemap.width - 1, Math.ceil((this.camera.x + this.camera.viewportWidth) / tileSize) + 1);
    const startRow = Math.max(0, Math.floor(this.camera.y / tileSize) - 1);
    const endRow = Math.min(this.tilemap.height - 1, Math.ceil((this.camera.y + this.camera.viewportHeight) / tileSize) + 1);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const tile = this.tilemap.getTile(col, row);
        if (!tile || tile === 0) {
          continue;
        }

        const x = tileScreen.x + col * tileSize;
        const y = tileScreen.y + row * tileSize;
        const assetPath = this.tileAssetById[tile];
        const image = assetPath ? this.tileImages.get(assetPath) : null;
        const fallbackColor = this.tilemap.getTileColor(col, row);

        if (image) {
          renderer.drawImageFrame(
            image,
            0,
            0,
            image.width,
            image.height,
            x,
            y,
            tileSize,
            tileSize
          );
        } else {
          renderer.drawRect(x, y, tileSize, tileSize, fallbackColor);
        }

        renderer.strokeRect(x, y, tileSize, tileSize, 'rgba(255, 255, 255, 0.18)', 1);
      }
    }
  }
}

function loadImageFromRelativePath(relativePath, baseUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image ${relativePath}`));
    image.src = new URL(relativePath, baseUrl).href;
  });
}

function getFallbackTileExport() {
  const width = 72;
  const height = 18;
  const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));

  for (let x = 0; x < width; x += 1) {
    cells[height - 1][x] = 1;
  }
  for (let y = 0; y < height; y += 1) {
    cells[y][0] = 1;
    cells[y][width - 1] = 1;
  }

  placePlatform(cells, height - 4, 5, 13, 2);
  placePlatform(cells, height - 5, 18, 26, 2);
  placePlatform(cells, height - 6, 31, 39, 2);
  placePlatform(cells, height - 4, 43, 51, 2);
  placePlatform(cells, height - 7, 54, 61, 2);
  placePlatform(cells, height - 8, 64, 69, 2);
  placePlatform(cells, height - 9, 24, 30, 3);
  placePlatform(cells, height - 10, 46, 50, 3);

  return {
    tileSize: 48,
    cells,
    heroSpawn: { x: 120, y: (height - 2) * 48 },
    camera: { viewportWidth: 860, viewportHeight: 300 },
    tilePalette: [
      { id: 0, name: 'air', solid: false, fallbackColor: 'rgba(0, 0, 0, 0)', asset: '' },
      { id: 1, name: 'ground', solid: true, fallbackColor: '#334155', asset: './assets/tiles/tile-ground.svg' },
      { id: 2, name: 'platform', solid: true, fallbackColor: '#1d4ed8', asset: './assets/tiles/tile-platform.svg' },
      { id: 3, name: 'stone', solid: true, fallbackColor: '#0f766e', asset: './assets/tiles/tile-stone.svg' },
    ],
  };
}

function getFallbackParallaxLayerData() {
  return [
    {
      id: 'far',
      image: createFallbackImage('rgba(148, 163, 184, 0.35)'),
      scrollFactor: 0.14,
      y: 20,
      height: 82,
      segmentWidth: 340,
    },
    {
      id: 'mid',
      image: createFallbackImage('rgba(99, 102, 241, 0.30)'),
      scrollFactor: 0.28,
      y: 76,
      height: 116,
      segmentWidth: 300,
    },
    {
      id: 'near',
      image: createFallbackImage('rgba(45, 212, 191, 0.26)'),
      scrollFactor: 0.50,
      y: 132,
      height: 128,
      segmentWidth: 260,
    },
  ];
}

function createFallbackImage(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 36, 256, 92);
  context.fillRect(20, 12, 96, 52);
  context.fillRect(134, 20, 102, 48);
  return canvas;
}

function placePlatform(cells, row, startCol, endCol, tileId) {
  for (let col = startCol; col <= endCol; col += 1) {
    cells[row][col] = tileId;
  }
}
