/*
Toolbox Aid
David Quesenberry
03/21/2026
TileCameraSpriteSliceScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '/src/engine/camera/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '/src/engine/tilemap/index.js';
import { SpriteAtlas } from '/src/engine/assets/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';
import { serializeWorldState, deserializeWorldState } from '/src/engine/persistence/index.js';
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-02/0224/sample-0224-sprite-editor.json';
const TILEMAP_PRESET_PATH = '/samples/phase-02/0224/sample-0224-tile-map-editor.json';
const FALLBACK_TILEMAP_ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
const FALLBACK_TILEMAP_COLLISION_ROWS = FALLBACK_TILEMAP_ROWS.map((row) => row.map((value) => (value === 1 ? 1 : 0)));

export default class TileCameraSpriteSliceScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.tilemapStatus = 'loading';
    this.tilemapError = '';
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: FALLBACK_TILEMAP_ROWS,
      palette: { 0: '#1f2937', 1: '#4f46e5' },
      definitions: {
        1: { solid: true, color: '#4f46e5', label: 'wall' }
      }
    });
    this.worldOffset = { x: 0, y: 0 };
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
        idle_0: { color: '#7dd3fc' },
        move_0: { color: '#34d399' },
      },
    });

    this.player = { x: 56, y: 56, width: 34, height: 34, speed: 220, frame: 'idle_0' };
    this.goal = { x: 630, y: 195, width: 36, height: 36 };
    this.message = 'Reach the goal.';
    this.saved = '';
    this.lastK = false;
    this.lastL = false;
    this.spriteProject = null;
    this.spriteStatus = 'loading';
    this.spriteError = '';
    void this.loadTileMapProject();
    void this.loadSpriteProject();
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

  applyTileMapDocument(documentModel) {
    if (!documentModel || typeof documentModel !== 'object') {
      throw new Error('Tilemap document is missing.');
    }

    const map = documentModel.map || {};
    const tileSize = Number(map.tileSize) > 0 ? Number(map.tileSize) : 48;
    const layers = Array.isArray(documentModel.layers) ? documentModel.layers : [];
    const tileLayer = layers.find((layer) => layer && layer.kind === 'tile') || layers[0] || null;
    const collisionLayer = layers.find((layer) => layer && layer.kind === 'collision') || null;

    if (!tileLayer || !Array.isArray(tileLayer.data) || tileLayer.data.length === 0) {
      throw new Error('Tilemap document did not include tile rows.');
    }

    const tileRows = tileLayer.data.map((row) => Array.isArray(row) ? row.map((value) => Number.parseInt(value, 10) || 0) : []);
    const collisionRows = collisionLayer && Array.isArray(collisionLayer.data)
      ? collisionLayer.data.map((row) => Array.isArray(row) ? row.map((value) => Number.parseInt(value, 10) || 0) : [])
      : FALLBACK_TILEMAP_COLLISION_ROWS;

    const tilesetEntries = Array.isArray(documentModel.tileset) ? documentModel.tileset : [];
    const palette = {};
    tilesetEntries.forEach((entry) => {
      const tileId = Number.parseInt(entry?.id, 10);
      const color = typeof entry?.color === 'string' ? entry.color : '';
      if (Number.isInteger(tileId) && color) {
        palette[tileId] = color;
      }
    });
    if (!palette[0]) {
      palette[0] = '#1f2937';
    }
    if (!palette[1]) {
      palette[1] = '#4f46e5';
    }

    const definitions = {};
    collisionRows.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        return;
      }
      row.forEach((cell, colIndex) => {
        if (Number(cell) === 1) {
          const tileId = Number(tileRows[rowIndex]?.[colIndex]) || 0;
          if (tileId > 0) {
            definitions[tileId] = {
              solid: true,
              color: palette[tileId] || '#4f46e5',
              label: `tile-${tileId}`
            };
          }
        }
      });
    });

    this.tilemap = new Tilemap({
      tileSize,
      tiles: tileRows,
      palette,
      definitions
    });

    this.world.width = this.tilemap.width * this.tilemap.tileSize;
    this.world.height = this.tilemap.height * this.tilemap.tileSize;
    this.camera.worldWidth = this.world.width;
    this.camera.worldHeight = this.world.height;

    const markers = Array.isArray(documentModel.markers) ? documentModel.markers : [];
    const spawnMarker = markers.find((marker) => marker && marker.type === 'spawn');
    const goalMarker = markers.find((marker) => marker && marker.type === 'goal');
    const spawnCol = Number.parseInt(spawnMarker?.col, 10);
    const spawnRow = Number.parseInt(spawnMarker?.row, 10);
    if (Number.isInteger(spawnCol) && Number.isInteger(spawnRow)) {
      this.player.x = (spawnCol * this.tilemap.tileSize) + 8;
      this.player.y = (spawnRow * this.tilemap.tileSize) + 8;
    }

    const goalCol = Number.parseInt(goalMarker?.col, 10);
    const goalRow = Number.parseInt(goalMarker?.row, 10);
    if (Number.isInteger(goalCol) && Number.isInteger(goalRow)) {
      this.goal.x = (goalCol * this.tilemap.tileSize) + 6;
      this.goal.y = (goalRow * this.tilemap.tileSize) + 6;
    }
  }

  async loadTileMapProject() {
    try {
      const presetResponse = await fetch(TILEMAP_PRESET_PATH, { cache: 'no-store' });
      if (!presetResponse.ok) {
        throw new Error(`Preset request failed (${presetResponse.status}).`);
      }
      const samplePreset = await presetResponse.json();
      const extracted = this.extractTileMapDocumentFromSamplePreset(samplePreset);
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

      this.applyTileMapDocument(documentModel);
      this.tilemapStatus = 'loaded';
      this.tilemapError = '';
    } catch (error) {
      this.tilemapStatus = 'fallback';
      this.tilemapError = error instanceof Error ? error.message : String(error);
    }
  }

  async loadSpriteProject() {
    try {
      this.spriteProject = await loadSpriteProjectPreset(SPRITE_PRESET_PATH);
      this.spriteStatus = 'loaded';
      this.spriteError = '';
    } catch (error) {
      this.spriteProject = null;
      this.spriteStatus = 'fallback';
      this.spriteError = error instanceof Error ? error.message : 'unknown preset error';
    }
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    let dx = 0;
    let dy = 0;

    if (engine.input.isActionDown('move_left')) {
      dx -= move;
    }
    if (engine.input.isActionDown('move_right')) {
      dx += move;
    }
    if (engine.input.isActionDown('move_up')) {
      dy -= move;
    }
    if (engine.input.isActionDown('move_down')) {
      dy += move;
    }

    const moving = dx !== 0 || dy !== 0;
    this.player.frame = moving ? 'move_0' : 'idle_0';

    if (dx !== 0) {
      this.player.x += dx;
      const hitX = resolveRectVsTilemap(this.player, this.tilemap, this.worldOffset);
      if (hitX) {
        if (dx > 0) {
          this.player.x = hitX.x - this.player.width;
        } else {
          this.player.x = hitX.x + hitX.width;
        }
      }
    }

    if (dy !== 0) {
      this.player.y += dy;
      const hitY = resolveRectVsTilemap(this.player, this.tilemap, this.worldOffset);
      if (hitY) {
        if (dy > 0) {
          this.player.y = hitY.y - this.player.height;
        } else {
          this.player.y = hitY.y + hitY.height;
        }
      }
    }

    followCameraTarget(this.camera, this.player, true);

    const savePressed = engine.input.isDown('KeyK');
    const loadPressed = engine.input.isDown('KeyL');

    if (savePressed && !this.lastK) {
      this.saved = serializeWorldState({ player: this.player });
      this.message = 'Saved snapshot.';
    }

    if (loadPressed && !this.lastL && this.saved) {
      const state = deserializeWorldState(this.saved);
      this.player = { ...this.player, ...state.player };
      this.message = 'Loaded snapshot.';
    }

    this.lastK = savePressed;
    this.lastL = loadPressed;

    const reachedGoal =
      this.player.x < this.goal.x + this.goal.width &&
      this.player.x + this.player.width > this.goal.x &&
      this.player.y < this.goal.y + this.goal.height &&
      this.player.y + this.player.height > this.goal.y;

    if (reachedGoal) {
      this.message = 'Goal reached.';
    }
  }

  render(renderer) {
    const spritePresetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite preset loaded from sample-0224-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback'})`;
    const tileMapPresetStatus = this.tilemapStatus === 'loaded'
      ? 'Tilemap preset loaded from sample-0224-tile-map-editor.json'
      : this.tilemapStatus === 'loading'
        ? 'Loading shared tilemap preset...'
        : `Tilemap preset unavailable (${this.tilemapError || 'using fallback'})`;

    drawFrame(renderer, theme, [
      'Engine Sample 0224',
      'Combines tilemap, camera, action input, sprite-style frames, and snapshots',
      'Use Arrow keys or WASD to move, KeyK to save, KeyL to load',
      this.message,
      'This sample and Tilemap Studio load the same sample-0224-tile-map-editor.json source',
      'This sample and Sprite Editor load the same sample-0224-sprite-editor.json source',
      tileMapPresetStatus,
      spritePresetStatus
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    const goalRect = worldRectToScreen(this.camera, this.goal, this.screen.x, this.screen.y);
    renderer.drawRect(goalRect.x, goalRect.y, goalRect.width, goalRect.height, '#fbbf24');
    renderer.strokeRect(goalRect.x, goalRect.y, goalRect.width, goalRect.height, '#ffffff', 1);

    const playerRect = worldRectToScreen(this.camera, this.player, this.screen.x, this.screen.y);
    if (this.spriteProject) {
      const frameIndex = this.player.frame === 'move_0' ? 1 : 0;
      const pixelSize = Math.max(2, Math.floor(this.player.width / this.spriteProject.width));
      drawSpriteProjectFrame(renderer, this.spriteProject, frameIndex, {
        x: playerRect.x,
        y: playerRect.y,
        pixelSize
      });
      renderer.drawText(this.player.frame, playerRect.x + ((this.spriteProject.width * pixelSize) / 2), playerRect.y - 8, {
        color: '#d8d5ff',
        font: '12px monospace',
        textAlign: 'center'
      });
    } else {
      renderSpriteReadyEntities(renderer, [{
        ...playerRect,
        spriteColor: this.atlas.getFrame(this.player.frame)?.color || theme.getColor('actorFill'),
        label: this.player.frame,
      }], { label: true, labelOffsetY: -8 });
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Slice', [
      `Frame: ${this.player.frame}`,
      `Camera: ${this.camera.x.toFixed(1)}, ${this.camera.y.toFixed(1)}`,
      `Saved text: ${this.saved.length}`,
      this.spriteProject ? 'Rendering preset frame pixels' : 'Goal is the yellow tile',
    ]);
  }
}
