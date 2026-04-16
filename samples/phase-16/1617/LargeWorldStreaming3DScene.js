/*
Toolbox Aid
David Quesenberry
04/16/2026
LargeWorldStreaming3DScene.js
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
const CELL_SIZE = 6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default class LargeWorldStreaming3DScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 450,
    };
    this.world = {
      minCellX: -12,
      maxCellX: 12,
      minCellZ: 2,
      maxCellZ: 36,
    };
    this.streamDistance = 3;
    this.maxVisibleCells = 95;
    this.anchor = { x: 0, y: 0, z: 22, width: 1.2, height: 1.2, depth: 1.2 };
    this.visibleCells = [];
    this.rebuildVisibleCells();
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  getAnchorCell() {
    return {
      cx: Math.floor(this.anchor.x / CELL_SIZE),
      cz: Math.floor(this.anchor.z / CELL_SIZE),
    };
  }

  rebuildVisibleCells() {
    const { cx, cz } = this.getAnchorCell();
    this.visibleCells = [];

    for (let ring = 0; ring <= this.streamDistance; ring += 1) {
      for (let dz = -ring; dz <= ring; dz += 1) {
        for (let dx = -ring; dx <= ring; dx += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) {
            continue;
          }
          const cellX = cx + dx;
          const cellZ = cz + dz;
          if (
            cellX < this.world.minCellX ||
            cellX > this.world.maxCellX ||
            cellZ < this.world.minCellZ ||
            cellZ > this.world.maxCellZ
          ) {
            continue;
          }
          const manhattan = Math.abs(dx) + Math.abs(dz);
          this.visibleCells.push({
            cx: cellX,
            cz: cellZ,
            x: cellX * CELL_SIZE + 0.4,
            y: -0.4,
            z: cellZ * CELL_SIZE + 0.4,
            color: manhattan <= 1 ? '#38bdf8' : (ring <= 1 ? '#34d399' : '#64748b'),
            size: ring <= 1 ? 5.2 : 4.4,
          });

          if (this.visibleCells.length >= this.maxVisibleCells) {
            return;
          }
        }
      }
    }
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const focusPoint = {
      x: this.anchor.x + this.anchor.width * 0.5,
      y: this.anchor.y + 0.6,
      z: this.anchor.z + this.anchor.depth * 0.5,
    };
    const basePose = {
      position: {
        x: focusPoint.x + 11.5,
        y: focusPoint.y + 9.5,
        z: focusPoint.z - 14,
      },
      rotation: {
        x: -0.5,
        y: 0.52,
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
    const speed = (input?.isDown('ShiftLeft') || input?.isDown('ShiftRight')) ? 16 : 9;
    this.anchor.x += (moveX / length) * speed * dt;
    this.anchor.z += (moveZ / length) * speed * dt;

    const minX = this.world.minCellX * CELL_SIZE;
    const maxX = this.world.maxCellX * CELL_SIZE + CELL_SIZE - this.anchor.width;
    const minZ = this.world.minCellZ * CELL_SIZE;
    const maxZ = this.world.maxCellZ * CELL_SIZE + CELL_SIZE - this.anchor.depth;
    this.anchor.x = clamp(this.anchor.x, minX, maxX);
    this.anchor.z = clamp(this.anchor.z, minZ, maxZ);

    if (input?.isDown('ArrowUp')) this.streamDistance = Math.min(6, this.streamDistance + 1 * dt * 8);
    if (input?.isDown('ArrowDown')) this.streamDistance = Math.max(2, this.streamDistance - 1 * dt * 8);
    this.streamDistance = Math.round(this.streamDistance);

    this.rebuildVisibleCells();
    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1617 - 3D Large World Streaming',
      'Applies capped streaming windows to a larger grid while preserving playable camera context.',
      'Move: W A S D | Sprint: Shift | Stream distance: Up/Down | Camera: C | Debug: V',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, this.viewport);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 10, y: 10, z: 4 },
      rotation: { x: -0.5, y: 0.52, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);
    drawGroundGrid(
      renderer,
      {
        minX: this.world.minCellX * CELL_SIZE,
        maxX: this.world.maxCellX * CELL_SIZE + CELL_SIZE,
        minZ: this.world.minCellZ * CELL_SIZE,
        maxZ: this.world.maxCellZ * CELL_SIZE + CELL_SIZE,
        y: -0.7,
        step: CELL_SIZE,
      },
      cameraState,
      projectionViewport
    );

    for (let i = 0; i < this.visibleCells.length; i += 1) {
      const cell = this.visibleCells[i];
      drawWireBox(
        renderer,
        { x: cell.x, y: cell.y, z: cell.z },
        { width: cell.size, height: 0.35, depth: cell.size },
        cameraState,
        projectionViewport,
        cell.color,
        { lineWidth: 1.4, depthCueEnabled: true }
      );
    }

    drawWireBox(
      renderer,
      { x: this.anchor.x, y: this.anchor.y, z: this.anchor.z },
      { width: this.anchor.width, height: this.anchor.height, depth: this.anchor.depth },
      cameraState,
      projectionViewport,
      '#fbbf24',
      { lineWidth: 2.4, depthCueEnabled: true }
    );

    const anchorCell = this.getAnchorCell();
    drawPanel(renderer, 620, 34, 300, 206, 'Large Stream Runtime', [
      `Anchor cell: (${anchorCell.cx}, ${anchorCell.cz})`,
      `Stream distance: ${this.streamDistance}`,
      `Visible cells: ${this.visibleCells.length}`,
      `Visibility budget: ${this.maxVisibleCells}`,
      `Anchor: x=${this.anchor.x.toFixed(1)} z=${this.anchor.z.toFixed(1)}`,
      `World cells: ${(this.world.maxCellX - this.world.minCellX + 1) * (this.world.maxCellZ - this.world.minCellZ + 1)}`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, this.viewport, this.viewState, [
      'Streaming grows by ring distance around anchor cell',
      'Visibility budget caps far-ring expansion',
    ]);
  }
}
