/*
Toolbox Aid
David Quesenberry
03/21/2026
TileMetadataScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, renderTilemap } from '/src/engine/tilemap/index.js';
import { SpriteAtlas, ImageAssetLoader } from '/src/engine/assets/index.js';
import { AnimationController } from '/src/engine/animation/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';
import { stepArcadeBody, moveRectWithTilemapCollision } from '/src/engine/systems/index.js';
import { createDemoSpriteSheet } from '../0301/demoSpriteFactory.js';

const theme = new Theme(ThemeTokens);
const TILEMAP_PRESET_PATH = '/samples/phase-03/0305/sample-0305-tile-map-editor.json';

const FALLBACK_TILE_ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 0, 0, 0, 3, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const FALLBACK_TILE_METADATA_DEFINITIONS = Object.freeze({
  0: { label: 'floor', color: '#1f2937', solid: false },
  1: { label: 'wall', color: '#4338ca', solid: true },
  2: { label: 'hazard', color: '#dc2626', solid: false, hazard: true, respawnMessage: 'Hazard tile touched. Reset.' },
  3: { label: 'trigger', color: '#059669', solid: false, trigger: 'goal-flag', message: 'Trigger tile activated.' },
  4: { label: 'slope', color: '#a855f7', solid: false, slope: 'placeholder-up-right', message: 'Slope metadata placeholder.' }
});

function cloneRows(rows = []) {
  return rows.map((row) => Array.isArray(row) ? row.map((value) => Number.parseInt(value, 10) || 0) : []);
}

function buildCollisionRows(rows = [], definitions = {}) {
  return rows.map((row) => row.map((tileId) => (definitions[tileId]?.solid ? 1 : 0)));
}

function createFallbackTilemapDocument() {
  const rows = cloneRows(FALLBACK_TILE_ROWS);
  const definitions = JSON.parse(JSON.stringify(FALLBACK_TILE_METADATA_DEFINITIONS));
  return {
    schema: 'toolbox.tilemap/1',
    version: 1,
    map: {
      name: 'sample-0305-tile-metadata',
      width: rows[0]?.length || 14,
      height: rows.length || 7,
      tileSize: 48
    },
    tileset: Object.entries(definitions).map(([id, entry]) => ({
      id: Number(id),
      name: entry.label || `tile-${id}`,
      color: entry.color || '#64748b'
    })),
    layers: [
      {
        id: 'ground',
        name: 'Ground',
        kind: 'tile',
        visible: true,
        locked: false,
        data: rows
      },
      {
        id: 'collision',
        name: 'Collision',
        kind: 'collision',
        visible: true,
        locked: false,
        data: buildCollisionRows(rows, definitions)
      },
      {
        id: 'data',
        name: 'Data',
        kind: 'data',
        visible: true,
        locked: false,
        data: rows.map((row) => row.map(() => 0))
      }
    ],
    markers: [
      { id: 'spawn-1', type: 'spawn', name: 'player-start', col: 12, row: 5, properties: {} }
    ],
    tileMetadataDefinitions: definitions
  };
}

export default class TileMetadataScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 240 };
    this.loader = new ImageAssetLoader();
    this.atlas = new SpriteAtlas({
      frames: {
        idle_0: { x: 0, y: 0, width: 16, height: 16 },
        move_0: { x: 16, y: 0, width: 16, height: 16 },
        move_1: { x: 32, y: 0, width: 16, height: 16 },
      },
    });
    this.asset = { status: 'generated-loaded', image: createDemoSpriteSheet() };
    this.sampleStatus = 'Loading shared tilemap preset...';
    this.sampleError = '';
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
    this.applyTilemapDocument(createFallbackTilemapDocument());
    void this.loadTilemapPreset();
  }

  extractTileMapDocumentFromSamplePreset(rawPreset) {
    if (!rawPreset || typeof rawPreset !== 'object') {
      return null;
    }
    const payload = rawPreset.payload;
    if (payload && typeof payload === 'object') {
      if (payload.tilemapDocument && typeof payload.tilemapDocument === 'object') {
        return payload.tilemapDocument;
      }
      if (payload.tileMapDocument && typeof payload.tileMapDocument === 'object') {
        return payload.tileMapDocument;
      }
      if (payload.tilemap && typeof payload.tilemap === 'object') {
        return payload.tilemap;
      }
      if (payload.tileMap && typeof payload.tileMap === 'object') {
        return payload.tileMap;
      }
      if (typeof payload.tilemapDocumentPath === 'string' && payload.tilemapDocumentPath.trim()) {
        return payload.tilemapDocumentPath.trim();
      }
      if (typeof payload.tileMapDocumentPath === 'string' && payload.tileMapDocumentPath.trim()) {
        return payload.tileMapDocumentPath.trim();
      }
    }
    return null;
  }

  applyTilemapDocument(documentModel) {
    const map = documentModel?.map || {};
    const layers = Array.isArray(documentModel?.layers) ? documentModel.layers : [];
    const tileLayer = layers.find((layer) => layer && layer.kind === 'tile') || layers[0] || null;
    const tileRows = cloneRows(tileLayer?.data || []);
    if (!Array.isArray(tileRows) || tileRows.length === 0) {
      throw new Error('Tilemap document did not include tile rows.');
    }

    const rawDefinitions = documentModel?.tileMetadataDefinitions
      && typeof documentModel.tileMetadataDefinitions === 'object'
      ? documentModel.tileMetadataDefinitions
      : FALLBACK_TILE_METADATA_DEFINITIONS;

    const definitions = {};
    const palette = {};
    Object.entries(rawDefinitions).forEach(([key, raw]) => {
      const tileId = Number.parseInt(key, 10);
      if (!Number.isInteger(tileId) || !raw || typeof raw !== 'object') {
        return;
      }
      definitions[tileId] = {
        label: typeof raw.label === 'string' ? raw.label : `tile-${tileId}`,
        color: typeof raw.color === 'string' ? raw.color : '#64748b',
        solid: raw.solid === true,
        hazard: raw.hazard === true,
        trigger: typeof raw.trigger === 'string' ? raw.trigger : undefined,
        message: typeof raw.message === 'string' ? raw.message : undefined,
        respawnMessage: typeof raw.respawnMessage === 'string' ? raw.respawnMessage : undefined,
        slope: typeof raw.slope === 'string' ? raw.slope : undefined
      };
      palette[tileId] = definitions[tileId].color;
    });

    const tileSize = Number(map.tileSize) > 0 ? Number(map.tileSize) : 48;
    this.tilemap = new Tilemap({
      tileSize,
      tiles: tileRows,
      definitions,
      palette
    });

    this.world = {
      width: this.tilemap.width * this.tilemap.tileSize,
      height: this.tilemap.height * this.tilemap.tileSize
    };
    this.camera = new Camera2D({
      viewportWidth: 860,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height
    });

    const spawnMarker = Array.isArray(documentModel?.markers)
      ? documentModel.markers.find((entry) => entry && entry.type === 'spawn')
      : null;
    const spawnCol = Number.parseInt(spawnMarker?.col, 10);
    const spawnRow = Number.parseInt(spawnMarker?.row, 10);
    if (Number.isInteger(spawnCol) && Number.isInteger(spawnRow)) {
      this.spawn = {
        x: spawnCol * this.tilemap.tileSize + 6,
        y: spawnRow * this.tilemap.tileSize + 6
      };
    }
    this.resetPlayerToSpawn();
  }

  async loadTilemapPreset() {
    try {
      const presetResponse = await fetch(TILEMAP_PRESET_PATH, { cache: 'no-store' });
      if (!presetResponse.ok) {
        throw new Error(`Preset request failed (${presetResponse.status}).`);
      }
      const rawPreset = await presetResponse.json();
      const extracted = this.extractTileMapDocumentFromSamplePreset(rawPreset);
      let documentModel = null;

      if (typeof extracted === 'string' && extracted.trim()) {
        const documentResponse = await fetch(extracted.trim(), { cache: 'no-store' });
        if (!documentResponse.ok) {
          throw new Error(`Tilemap document request failed (${documentResponse.status}).`);
        }
        documentModel = await documentResponse.json();
      } else if (extracted && typeof extracted === 'object') {
        documentModel = extracted;
      }

      if (!documentModel || typeof documentModel !== 'object') {
        throw new Error('Preset payload did not include a tilemap document.');
      }

      this.applyTilemapDocument(documentModel);
      this.sampleStatus = 'Loaded tilemap preset from sample-0305-tile-map-editor.json';
      this.sampleError = '';
    } catch (error) {
      this.sampleStatus = 'Using fallback in-scene tilemap.';
      this.sampleError = error instanceof Error ? error.message : String(error);
    }
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
      'This sample and Tilemap Studio load the same sample-0305-tile-map-editor.json source',
      'Red tiles reset the actor (to spawn point)',
      'Green tiles trigger a flag,',
      'Purple tiles prove schema room for slopes',
      'Only blue wall tiles are solid blockers',
      this.sampleError ? `${this.sampleStatus} (${this.sampleError})` : this.sampleStatus,
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
