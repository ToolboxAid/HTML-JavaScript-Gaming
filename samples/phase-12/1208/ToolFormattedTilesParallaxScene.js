/*
Toolbox Aid
David Quesenberry
03/31/2026
ToolFormattedTilesParallaxScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { Camera2D, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, resolveRectVsTilemap } from '/src/engine/tilemap/index.js';
import { isFiniteNumber } from '../../shared/numberUtils.js';
import tileMapToolExport from './data/toolFormattedTileMap.js';
import fallbackParallaxToolExport from './data/toolFormattedParallax.js';

const theme = new Theme(ThemeTokens);

export default class ToolFormattedTilesParallaxScene extends Scene {
  constructor(options = {}) {
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
    this.liveSyncVersion = 0;
    this.liveSyncPending = Promise.resolve();
    this.runtimeBindingPublisher = null;
    this.lastRuntimeBindingTimestamp = 0;
    this.tilesetAssetPath = '';
    this.tilesetAssetCandidates = [];
    this.tilesetImage = null;
    this.tileFrameById = {};
    this.parallaxLayers = [];
    this.samplePreset = options && typeof options.samplePreset === 'object' ? options.samplePreset : null;

    this.applyTileExportData(getFallbackTileExport());
  }

  enter() {
    this.loadToolFormattedContent();
  }

  async loadToolFormattedContent() {
    try {
      this.applyTileExportData(tileMapToolExport);
      const tileAssetCount = await this.loadTileAssets(extractTileEntries(tileMapToolExport));
      const presetParallaxDocument = extractParallaxDocumentFromSamplePreset(this.samplePreset);
      const parallaxDocument = presetParallaxDocument || await loadParallaxDocument(fallbackParallaxToolExport);
      this.parallaxLayers = await this.loadParallaxAssets(extractParallaxLayers(parallaxDocument));

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
    const atlas = extractTilesetAtlas(tileExport);
    const primaryLayer = getPrimaryTileLayer(tileExport);
    const cells = extractTileCells(tileExport, primaryLayer);
    const tileSize = extractTileSize(tileExport);
    const tilePalette = extractTileEntries(tileExport);
    const definitions = {};
    this.tilesetAssetPath = extractTilesetImagePath(tileExport, atlas);
    this.tilesetAssetCandidates = extractTilesetImageCandidates(tileExport, atlas);
    this.tilesetImage = null;
    this.tileFrameById = {};
    const atlasColumns = Number(atlas?.columns)
      || ((Number(atlas?.imageWidth) > 0 && Number(atlas?.tileWidth) > 0)
        ? Math.floor(Number(atlas.imageWidth) / Number(atlas.tileWidth))
        : 0);

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
          w: Number(source.w ?? source.width) || tileSize,
          h: Number(source.h ?? source.height) || tileSize,
        };
      } else if (atlasColumns > 0 && tileId > 0) {
        const index = tileId - 1;
        const col = index % atlasColumns;
        const row = Math.floor(index / atlasColumns);
        const atlasTileWidth = Number(atlas?.tileWidth) || tileSize;
        const atlasTileHeight = Number(atlas?.tileHeight) || tileSize;
        const spacing = Number(atlas?.spacing) || 0;
        const margin = Number(atlas?.margin) || 0;
        this.tileFrameById[tileId] = {
          x: margin + col * (atlasTileWidth + spacing),
          y: margin + row * (atlasTileHeight + spacing),
          w: atlasTileWidth,
          h: atlasTileHeight,
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

    const { viewportWidth, viewportHeight } = extractCameraViewport(tileExport);

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

    const spawn = extractSpawnPoint(tileExport, tileSize, this.hero)
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

    const candidates = this.tilesetAssetCandidates && this.tilesetAssetCandidates.length > 0
      ? this.tilesetAssetCandidates
      : [this.tilesetAssetPath];

    let lastError = null;
    for (const candidate of candidates) {
      if (typeof candidate !== 'string' || !candidate.trim()) {
        continue;
      }
      try {
        this.tilesetImage = await loadImageFromRelativePath(candidate, import.meta.url);
        this.tilesetAssetPath = candidate;
        return 1;
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(
      `Unable to load tileset atlas image from candidates: ${candidates.join(', ')}`
        + (lastError ? ` (${lastError.message || String(lastError)})` : '')
    );
  }

  async loadParallaxAssets(layerDefinitions) {
    if (!Array.isArray(layerDefinitions) || layerDefinitions.length !== 3) {
      throw new Error('Parallax export must provide exactly 3 layers.');
    }

    const loadOperations = layerDefinitions.map(async (layerDefinition, index) => {
      const assetPath = layerDefinition.asset
        || layerDefinition.imageSource;
      if (!assetPath) {
        throw new Error(`Parallax layer ${layerDefinition.id || index} missing image source.`);
      }

      const image = await loadImageFromRelativePath(assetPath, import.meta.url);
      const sourceWidth = Number(layerDefinition.sourceWidth)
        || image.naturalWidth
        || image.width
        || Number(layerDefinition.segmentWidth)
        || 1024;
      const sourceHeight = Number(layerDefinition.sourceHeight)
        || image.naturalHeight
        || image.height
        || Number(layerDefinition.height)
        || 300;
      return {
        id: layerDefinition.id || `layer-${index}`,
        image,
        sourceWidth,
        sourceHeight,
        scrollFactor: Number(layerDefinition.scrollFactor ?? layerDefinition.scrollFactorX) || [0.2, 0.45, 0.7][index],
        y: Number(layerDefinition.y ?? layerDefinition.offsetY) || 0,
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
    this.publishRuntimeBindingState(engine);
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
      'Sample 1208 - Tool Formatted Tiles Parallax',
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
    for (const layer of this.parallaxLayers) {
      const segment = Math.max(1, layer.segmentWidth);
      const offset = -((this.camera.x * layer.scrollFactor) % segment);
      const endX = this.screen.x + this.camera.viewportWidth + segment;
      const layerTop = this.screen.y + layer.y;
      const viewportBottom = this.screen.y + this.camera.viewportHeight;
      const layerHeight = Math.max(1, viewportBottom - layerTop);

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

  applyLivePreviewUpdate(update = {}) {
    this.liveSyncPending = this.liveSyncPending
      .then(() => this.applyLivePreviewUpdateInternal(update))
      .catch(() => {});
    return this.liveSyncPending;
  }

  async applyLivePreviewUpdateInternal(update = {}) {
    const nextTileDocument = update && typeof update.tileMapDocument === 'object' ? update.tileMapDocument : null;
    const nextParallaxDocument = update && typeof update.parallaxDocument === 'object' ? update.parallaxDocument : null;
    if (!nextTileDocument && !nextParallaxDocument) {
      return;
    }

    try {
      let tileAssetCount = this.tilesetImage ? 1 : 0;
      if (nextTileDocument) {
        this.applyTileExportData(nextTileDocument);
        tileAssetCount = await this.loadTileAssets(extractTileEntries(nextTileDocument));
      }

      if (nextParallaxDocument) {
        this.parallaxLayers = await this.loadParallaxAssets(extractParallaxLayers(nextParallaxDocument));
      }

      this.liveSyncVersion += 1;
      this.contentLoaded = tileAssetCount > 0 && this.parallaxLayers.length > 0;
      this.contentError = null;
      this.contentStatus = `Live preview synced (${this.liveSyncVersion}).`;
    } catch (error) {
      this.contentError = error instanceof Error ? error.message : String(error);
      this.contentStatus = 'Live preview sync failed.';
    }
  }

  setRuntimeBindingPublisher(publisher) {
    this.runtimeBindingPublisher = typeof publisher === 'function' ? publisher : null;
  }

  publishRuntimeBindingState(engine) {
    if (!this.runtimeBindingPublisher) {
      return;
    }
    const now = (engine && Number.isFinite(Number(engine.time?.nowMs))) ? Number(engine.time.nowMs) : Date.now();
    if ((now - this.lastRuntimeBindingTimestamp) < 125) {
      return;
    }
    this.lastRuntimeBindingTimestamp = now;
    this.runtimeBindingPublisher({
      toolId: 'sample-1208-runtime',
      runtimeState: {
        heroX: Number(this.hero.x) || 0,
        heroY: Number(this.hero.y) || 0,
        cameraX: Number(this.camera?.x) || 0,
        cameraY: Number(this.camera?.y) || 0,
      },
    });
  }
}

function extractParallaxDocumentFromSamplePreset(samplePreset) {
  if (!samplePreset || typeof samplePreset !== 'object') {
    return null;
  }
  const payload = samplePreset.payload;
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const document = payload.parallaxDocument;
  if (!document || typeof document !== 'object') {
    return null;
  }
  if (document.schema !== 'toolbox.parallax/1') {
    return null;
  }
  return document;
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
  if (tileExport?.schema === 'toolbox.tilemap/1' && Array.isArray(tileExport?.tileset)) {
    return tileExport.tileset
      .map((entry) => ({
        tileId: Number(entry?.id),
        name: entry?.name || `tile-${entry?.id}`,
        solid: Number(entry?.id) > 0,
        fallbackColor: entry?.color || '#1f2937',
        source: normalizeTilesetSource(entry?.source),
      }))
      .filter((entry) => Number.isInteger(entry.tileId) && entry.tileId > 0);
  }

  if (Array.isArray(tileExport?.tileset?.entries)) {
    return tileExport.tileset.entries;
  }
  if (Array.isArray(tileExport?.tilePalette)) {
    return tileExport.tilePalette;
  }
  return [];
}

function extractParallaxLayers(parallaxExport) {
  if (!Array.isArray(parallaxExport?.layers)) {
    return [];
  }

  if (parallaxExport?.schema === 'toolbox.parallax/1') {
    const normalized = parallaxExport.layers
      .filter((layer) => layer?.visible !== false)
      .sort((a, b) => (Number(a?.drawOrder) || 0) - (Number(b?.drawOrder) || 0))
      .map((layer) => ({
        id: layer.id,
        imageSource: layer.imageSource,
        scrollFactorX: Number(layer.scrollFactorX),
        offsetY: Number(layer.offsetY) || 0,
        opacity: Number(layer.opacity),
        segmentWidth: Number(layer.segmentWidth) || undefined,
      }));
    return normalized;
  }

  return parallaxExport.layers;
}

function placePlatform(cells, row, startCol, endCol, tileId) {
  for (let col = startCol; col <= endCol; col += 1) {
    cells[row][col] = tileId;
  }
}

async function loadParallaxDocument(fallbackDocument) {
  try {
    const response = await fetch(new URL('./data/toolFormattedParallax.json', import.meta.url), {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (_error) {
    return fallbackDocument;
  }
}

function getPrimaryTileLayer(tileExport) {
  if (!Array.isArray(tileExport?.layers)) {
    return null;
  }
  if (tileExport?.schema === 'toolbox.tilemap/1') {
    return tileExport.layers.find((layer) => layer?.kind === 'tile') || null;
  }
  return tileExport.layers.find((layer) => layer?.kind === 'tile-layer') || null;
}

function extractTileCells(tileExport, primaryLayer) {
  if (tileExport?.schema === 'toolbox.tilemap/1') {
    if (Array.isArray(primaryLayer?.data)) {
      return primaryLayer.data;
    }
  } else if (Array.isArray(primaryLayer?.cells)) {
    return primaryLayer.cells;
  }

  if (Array.isArray(tileExport?.cells)) {
    return tileExport.cells;
  }
  return [[]];
}

function extractTileSize(tileExport) {
  if (tileExport?.schema === 'toolbox.tilemap/1') {
    return Number(tileExport?.map?.tileSize)
      || Number(tileExport?.tilesetAtlas?.tileWidth)
      || 48;
  }
  return Number(tileExport?.tileSize || tileExport?.tileset?.tileWidth) || 48;
}

function extractTilesetAtlas(tileExport) {
  if (tileExport?.schema === 'toolbox.tilemap/1') {
    return tileExport?.tilesetAtlas || null;
  }
  return tileExport?.tileset || null;
}

function extractTilesetImagePath(tileExport, atlas) {
  if (typeof tileExport?.tileset?.image === 'string' && tileExport.tileset.image) {
    return tileExport.tileset.image;
  }
  if (typeof atlas?.imageName === 'string' && atlas.imageName) {
    return atlas.imageName;
  }
  return '';
}

function extractTilesetImageCandidates(tileExport, atlas) {
  const candidates = [];
  const add = (value) => {
    if (typeof value !== 'string' || !value.trim()) {
      return;
    }
    if (!candidates.includes(value)) {
      candidates.push(value);
    }
  };

  add(tileExport?.tileset?.image);
  add(atlas?.imageName);
  if (typeof atlas?.imageName === 'string' && atlas.imageName.includes('/assets/tileset/')) {
    add(atlas.imageName.replace('/assets/tileset/', '/assets/images/tileset/'));
  }

  return candidates;
}

function extractCameraViewport(tileExport) {
  const markerCamera = Array.isArray(tileExport?.markers)
    ? tileExport.markers.find((marker) => marker?.type === 'spawn' && marker?.properties)
    : null;

  return {
    viewportWidth: Number(tileExport?.camera?.viewportWidth)
      || Number(tileExport?.map?.viewportWidth)
      || Number(markerCamera?.properties?.cameraViewportWidth)
      || 860,
    viewportHeight: Number(tileExport?.camera?.viewportHeight)
      || Number(tileExport?.map?.viewportHeight)
      || Number(markerCamera?.properties?.cameraViewportHeight)
      || 300,
  };
}

function extractSpawnPoint(tileExport, tileSize, hero) {
  const explicit = tileExport?.spawnPoints?.hero || tileExport?.heroSpawn || null;
  if (explicit && isFiniteNumber(Number(explicit.x)) && isFiniteNumber(Number(explicit.y))) {
    return { x: Number(explicit.x), y: Number(explicit.y) };
  }

  if (Array.isArray(tileExport?.markers)) {
    const spawnMarker = tileExport.markers.find((marker) => marker?.type === 'spawn');
    if (spawnMarker?.properties) {
      const px = Number(spawnMarker.properties.spawnX);
      const py = Number(spawnMarker.properties.spawnY);
      if (isFiniteNumber(px) && isFiniteNumber(py)) {
        return { x: px, y: py };
      }
    }
    if (spawnMarker && isFiniteNumber(Number(spawnMarker.col)) && isFiniteNumber(Number(spawnMarker.row))) {
      const col = Number(spawnMarker.col);
      const row = Number(spawnMarker.row);
      return {
        x: col * tileSize + (tileSize - hero.width) * 0.5,
        y: (row + 1) * tileSize - hero.height,
      };
    }
  }

  return null;
}

function normalizeTilesetSource(source) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  if (source.kind === 'atlas' || ('x' in source && 'y' in source)) {
    return {
      x: Number(source.x) || 0,
      y: Number(source.y) || 0,
      w: Number(source.width ?? source.w) || 0,
      h: Number(source.height ?? source.h) || 0,
    };
  }

  return null;
}
