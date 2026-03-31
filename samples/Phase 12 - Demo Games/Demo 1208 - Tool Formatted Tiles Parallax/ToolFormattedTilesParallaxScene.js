/*
Toolbox Aid
David Quesenberry
03/31/2026
ToolFormattedTilesParallaxScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { clamp } from '../../../engine/utils/index.js';
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
    this.tilesetAssetPath = '';
    this.tilesetImage = null;
    this.tileFrameById = {};
    this.parallaxLayers = [];

    this.applyTileExportData(getFallbackTileExport());
  }

  enter() {
    this.loadToolFormattedContent();
  }

  async loadToolFormattedContent() {
    try {
      this.applyTileExportData(tileMapToolExport);
      const tileAssetCount = await this.loadTileAssets(extractTileEntries(tileMapToolExport));
      this.parallaxLayers = await this.loadParallaxAssets(extractParallaxLayers(parallaxToolExport));

      this.contentLoaded = tileAssetCount > 0 && this.parallaxLayers.length === 3;
      this.contentStatus = `Loaded ${tileAssetCount} PNG atlas image and ${this.parallaxLayers.length} SVG parallax layers.`;
      this.contentError = null;
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : String(error);
      this.contentStatus = 'Asset/data load failed.';
      this.parallaxLayers = [];
    }
  }

  applyTileExportData(tileExport) {
    const tileset = tileExport?.tileset || null;
    const primaryLayer = Array.isArray(tileExport?.layers)
      ? tileExport.layers.find((layer) => layer?.kind === 'tile-layer')
      : null;
    const cells = Array.isArray(primaryLayer?.cells)
      ? primaryLayer.cells
      : (Array.isArray(tileExport?.cells) ? tileExport.cells : [[]]);
    const tileSize = Number(tileExport?.tileSize || tileset?.tileWidth) || 48;
    const tilePalette = extractTileEntries(tileExport);
    const definitions = {};
    this.tilesetAssetPath = typeof tileset?.image === 'string' ? tileset.image : '';
    this.tilesetImage = null;
    this.tileFrameById = {};

    for (const tileDefinition of tilePalette) {
      const tileId = Number(tileDefinition?.tileId ?? tileDefinition?.id);
      if (!Number.isInteger(tileId)) {
        continue;
      }

      definitions[tileId] = {
        solid: Boolean(tileDefinition.solid),
        color: tileDefinition.fallbackColor || '#1f2937',
        label: tileDefinition.name || `tile-${tileId}`,
      };

      if (tileDefinition?.source) {
        const source = tileDefinition.source;
        this.tileFrameById[tileId] = {
          x: Number(source.x) || 0,
          y: Number(source.y) || 0,
          w: Number(source.w) || tileSize,
          h: Number(source.h) || tileSize,
        };
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

    const spawn = tileExport?.spawnPoints?.hero
      || tileExport?.heroSpawn
      || { x: 120, y: this.world.height - tileSize - this.hero.height };
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
    this.tilesetImage = null;
    if (!this.tilesetAssetPath) {
      throw new Error('Missing tileset atlas image path.');
    }

    for (const tileDefinition of tilePalette) {
      const tileId = Number(tileDefinition?.tileId ?? tileDefinition?.id);
      if (!Number.isInteger(tileId) || !this.tileFrameById[tileId]) {
        throw new Error(`Missing tile frame for tileId ${tileId}.`);
      }
    }

    this.tilesetImage = await loadImageFromRelativePath(this.tilesetAssetPath, import.meta.url);
    return 1;
  }

  async loadParallaxAssets(layerDefinitions) {
    if (!Array.isArray(layerDefinitions) || layerDefinitions.length !== 3) {
      throw new Error('Parallax export must provide exactly 3 layers.');
    }

    const loadOperations = layerDefinitions.map(async (layerDefinition, index) => {
      const image = await loadImageFromRelativePath(layerDefinition.asset, import.meta.url);
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      return {
        id: layerDefinition.id || `layer-${index}`,
        image,
        sourceWidth,
        sourceHeight,
        scrollFactor: Number(layerDefinition.scrollFactor) || [0.2, 0.45, 0.7][index],
        y: Number(layerDefinition.y) || 0,
        height: Number(layerDefinition.height) || 90,
        segmentWidth: Number(layerDefinition.segmentWidth) || sourceWidth || 1024,
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
    renderer.clear('#0d1220');
    this.drawHeaderText(renderer);

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
    const toolLoadStatus = this.contentError ? `Error: ${this.contentError}` : this.contentStatus;
    const statusLines = [
      'Tool Export Validation',
      `State: ${stateLabel}`,
      `World: ${this.tilemap.width}x${this.tilemap.height} tiles`,
      `Camera X: ${this.camera.x.toFixed(1)}`,
      `SVG Parallax Layers: ${this.parallaxLayers.length}`,
      `PNG Tileset Atlas: ${this.tilesetImage ? 'loaded' : 'missing'}`,
      this.contentLoaded ? 'Status: Tool data loaded' : `Status: ${toolLoadStatus}`,
    ];
    statusLines.forEach((line, index) => {
      renderer.drawText(line, 600, 34 + index * 18, {
        color: index === 0 ? '#f8fafc' : '#dbeafe',
        font: index === 0 ? '16px monospace' : '13px monospace',
      });
    });
  }

  drawHeaderText(renderer) {
    const lines = [
      'Demo 1208 - Tool Formatted Tiles Parallax',
      'Move with Left/Right Arrow. Press Space to jump.',
      'PNG atlas tiles + SVG parallax layers rendered by canvas drawImage.',
      'Parallax draw order: far -> mid -> near -> tilemap -> hero.',
    ];
    lines.forEach((line, index) => {
      renderer.drawText(line, 34, 34 + index * 24, {
        color: '#f8fafc',
        font: index === 0 ? '28px monospace' : '14px monospace',
      });
    });
  }

  drawParallax(renderer) {
    renderer.drawRect(
      this.screen.x,
      this.screen.y,
      this.camera.viewportWidth,
      this.camera.viewportHeight,
      '#9fd2ff'
    );
    renderer.drawCircle(
      this.screen.x + 160,
      this.screen.y + 54,
      28,
      'rgba(255, 245, 190, 0.75)'
    );

    for (const layer of this.parallaxLayers) {
      const segment = layer.segmentWidth;
      const offset = -((this.camera.x * layer.scrollFactor) % segment);
      const endX = this.screen.x + this.camera.viewportWidth + segment;
      const layerTop = this.screen.y + layer.y;
      const layerHeight = Math.max(1, this.camera.viewportHeight - layer.y);

      for (let x = this.screen.x + offset - segment; x < endX; x += segment) {
        renderer.drawImageFrame(
          layer.image,
          0,
          0,
          layer.sourceWidth,
          layer.sourceHeight,
          x,
          layerTop,
          segment,
          layerHeight
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
        const frame = this.tileFrameById[tile];
        if (!frame || !this.tilesetImage) continue;

        renderer.drawImageFrame(
          this.tilesetImage,
          frame.x,
          frame.y,
          frame.w,
          frame.h,
          x,
          y,
          tileSize,
          tileSize
        );

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
    tool: 'Tile Map Editor',
    formatVersion: 2,
    exportProfile: 'demo1208-fallback-tilemap',
    tileset: {
      id: 'terrain-main',
      image: './assets/tileset/demo1208-terrain-tileset.png',
      tileWidth: 48,
      tileHeight: 48,
      columns: 3,
      rows: 1,
      entries: [
        {
          tileId: 1,
          name: 'ground_grass',
          solid: true,
          fallbackColor: '#4b5563',
          source: { x: 0, y: 0, w: 48, h: 48 },
        },
        {
          tileId: 2,
          name: 'platform_blue',
          solid: true,
          fallbackColor: '#1d4ed8',
          source: { x: 48, y: 0, w: 48, h: 48 },
        },
        {
          tileId: 3,
          name: 'stone_teal',
          solid: true,
          fallbackColor: '#115e59',
          source: { x: 96, y: 0, w: 48, h: 48 },
        },
      ],
    },
    layers: [
      {
        id: 'terrain_layer_01',
        kind: 'tile-layer',
        width,
        height,
        cells,
      },
    ],
    spawnPoints: { hero: { x: 120, y: (height - 2) * 48 } },
    camera: { viewportWidth: 860, viewportHeight: 300 },
  };
}

function extractTileEntries(tileExport) {
  if (Array.isArray(tileExport?.tileset?.entries)) {
    return tileExport.tileset.entries;
  }
  if (Array.isArray(tileExport?.tilePalette)) {
    return tileExport.tilePalette;
  }
  return [];
}

function extractParallaxLayers(parallaxExport) {
  return Array.isArray(parallaxExport?.layers) ? parallaxExport.layers : [];
}

function placePlatform(cells, row, startCol, endCol, tileId) {
  for (let col = startCol; col <= endCol; col += 1) {
    cells[row][col] = tileId;
  }
}
