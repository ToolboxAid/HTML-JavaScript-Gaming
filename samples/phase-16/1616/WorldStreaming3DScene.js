/*
Toolbox Aid
David Quesenberry
04/16/2026
WorldStreaming3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import {
  applyPhase16CameraMode,
  createPhase16ViewState,
  createProjectionViewport,
  drawDepthBackdrop,
  drawGroundGrid,
  drawPhase16DebugOverlay,
  drawWireBox,
  stepPhase16ViewToggles,
} from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);
const CHUNK_SIZE = 4;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class WorldStreaming3DScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.bounds = {
      minX: -24,
      maxX: 24,
      minZ: 8,
      maxZ: 56,
    };
    this.player = {
      x: -2,
      y: 0,
      z: 12,
      width: 1.1,
      height: 1.1,
      depth: 1.1,
    };
    this.streamRadius = 1;
    this.baseSpeed = 7.6;
    this.activeChunks = [];
    this.chunkKeySet = new Set();
    this.rebuildActiveChunks();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  getPlayerChunk() {
    return {
      cx: Math.floor(this.player.x / CHUNK_SIZE),
      cz: Math.floor(this.player.z / CHUNK_SIZE),
    };
  }

  rebuildActiveChunks() {
    const { cx, cz } = this.getPlayerChunk();
    this.activeChunks = [];
    this.chunkKeySet.clear();

    for (let dz = -this.streamRadius; dz <= this.streamRadius; dz += 1) {
      for (let dx = -this.streamRadius; dx <= this.streamRadius; dx += 1) {
        const chunkX = cx + dx;
        const chunkZ = cz + dz;
        const worldX = chunkX * CHUNK_SIZE;
        const worldZ = chunkZ * CHUNK_SIZE;
        if (
          worldX < this.bounds.minX - CHUNK_SIZE ||
          worldX > this.bounds.maxX ||
          worldZ < this.bounds.minZ - CHUNK_SIZE ||
          worldZ > this.bounds.maxZ
        ) {
          continue;
        }

        const key = `${chunkX},${chunkZ}`;
        if (this.chunkKeySet.has(key)) {
          continue;
        }
        this.chunkKeySet.add(key);
        this.activeChunks.push({
          cx: chunkX,
          cz: chunkZ,
          x: worldX + 0.22,
          y: -0.3,
          z: worldZ + 0.22,
          color: dx === 0 && dz === 0 ? '#38bdf8' : (Math.abs(dx) + Math.abs(dz) <= 1 ? '#34d399' : '#64748b'),
        });
      }
    }
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = {
      x: this.player.x + this.player.width * 0.5,
      y: this.player.y + 0.6,
      z: this.player.z + this.player.depth * 0.5,
    };
    const basePose = {
      position: {
        x: focusPoint.x + 9,
        y: focusPoint.y + 8.6,
        z: focusPoint.z - 11,
      },
      rotation: {
        x: -0.52,
        y: 0.48,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);

    const moveX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const moveZ = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const length = Math.hypot(moveX, moveZ) || 1;
    const speed = this.baseSpeed;
    this.player.x += (moveX / length) * speed * dt;
    this.player.z += (moveZ / length) * speed * dt;

    this.player.x = clamp(this.player.x, this.bounds.minX, this.bounds.maxX - this.player.width);
    this.player.z = clamp(this.player.z, this.bounds.minZ, this.bounds.maxZ - this.player.depth);

    if (input?.isDown('ArrowUp')) this.streamRadius = Math.min(3, this.streamRadius + 1 * dt * 8);
    if (input?.isDown('ArrowDown')) this.streamRadius = Math.max(1, this.streamRadius - 1 * dt * 8);
    this.streamRadius = Math.round(this.streamRadius);

    this.rebuildActiveChunks();
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1616 - 3D World Streaming',
      'Streams world chunks around a moving anchor to visualize load/unload boundaries.',
      'Move: W A S D | Stream radius: Up/Down | Camera: C | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 8, z: -1 },
      rotation: { x: -0.52, y: 0.48, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(
      renderer,
      {
        minX: this.bounds.minX,
        maxX: this.bounds.maxX,
        minZ: this.bounds.minZ,
        maxZ: this.bounds.maxZ,
        y: -0.6,
        step: CHUNK_SIZE,
      },
      cameraState,
      projectionViewport
    );

    for (let i = 0; i < this.activeChunks.length; i += 1) {
      const chunk = this.activeChunks[i];
      drawWireBox(
        renderer,
        { x: chunk.x, y: chunk.y, z: chunk.z },
        { width: 3.55, height: 0.32, depth: 3.55 },
        cameraState,
        projectionViewport,
        chunk.color,
        { lineWidth: 1.7, depthCueEnabled: true }
      );
    }

    drawWireBox(
      renderer,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      { width: this.player.width, height: this.player.height, depth: this.player.depth },
      cameraState,
      projectionViewport,
      '#fbbf24',
      { lineWidth: 2.2, depthCueEnabled: true }
    );

    const chunk = this.getPlayerChunk();
    drawPanel(renderer, 620, 34, 300, 206, 'Streaming Runtime', [
      `Anchor chunk: (${chunk.cx}, ${chunk.cz})`,
      `Stream radius: ${this.streamRadius}`,
      `Active chunks: ${this.activeChunks.length}`,
      `Loaded keys: ${this.chunkKeySet.size}`,
      `Player: x=${this.player.x.toFixed(2)} z=${this.player.z.toFixed(2)}`,
      `Chunk size: ${CHUNK_SIZE} units`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      'Chunk activation ring updates from player position',
      'Center tile marks currently anchored chunk',
    ]);
  }
}
