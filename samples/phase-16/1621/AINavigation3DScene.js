/*
Toolbox Aid
David Quesenberry
04/16/2026
AINavigation3DScene.js
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
  projectPoint,
  stepPhase16ViewToggles,
} from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);
const GRID_COLS = 14;
const GRID_ROWS = 10;
const CELL_SIZE = 1.35;
const GRID_ORIGIN_X = -((GRID_COLS * CELL_SIZE) * 0.5);
const GRID_ORIGIN_Z = 6.8;

function cellKey(col, row) {
  return `${col},${row}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function neighbors(cell) {
  return [
    { col: cell.col + 1, row: cell.row },
    { col: cell.col - 1, row: cell.row },
    { col: cell.col, row: cell.row + 1 },
    { col: cell.col, row: cell.row - 1 },
  ];
}

export default class AINavigation3DScene extends Scene {
  constructor() {
    super();
    this.viewState = createPhase16ViewState();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 455,
    };
    this.cameraYaw = 0.44;
    this.cameraAutoOrbit = 0.28;
    this.showPathDebug = true;
    this.pathDebugToggleLatch = false;
    this.repathCount = 0;
    this.completedRuns = 0;
    this.navigationTime = 0;
    this.blockedCells = this.createBlockedCells();
    this.goalCandidates = [
      { col: 11, row: 1 },
      { col: 11, row: 8 },
      { col: 2, row: 8 },
      { col: 7, row: 5 },
    ];
    this.goalIndex = 0;
    this.agent = {
      width: 0.8,
      height: 1.0,
      depth: 0.8,
      speed: 3.1,
      x: 0,
      y: 0,
      z: 0,
    };
    const start = this.cellToWorld({ col: 2, row: 1 });
    this.agent.x = start.x - this.agent.width * 0.5;
    this.agent.z = start.z - this.agent.depth * 0.5;
    this.goalCell = { ...this.goalCandidates[this.goalIndex] };
    this.pathCells = [];
    this.pathWorld = [];
    this.pathIndex = 1;
    this.rebuildPath();
  }

  createBlockedCells() {
    const blocked = new Set();
    const wallCells = [
      [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
      [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
      [10, 2], [10, 3], [10, 4],
      [2, 5], [3, 5], [5, 7], [6, 7], [7, 7],
    ];
    for (let i = 0; i < wallCells.length; i += 1) {
      blocked.add(cellKey(wallCells[i][0], wallCells[i][1]));
    }
    return blocked;
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  isInBounds(cell) {
    return cell.col >= 0 && cell.col < GRID_COLS && cell.row >= 0 && cell.row < GRID_ROWS;
  }

  isBlocked(cell) {
    return this.blockedCells.has(cellKey(cell.col, cell.row));
  }

  cellToWorld(cell) {
    return {
      x: GRID_ORIGIN_X + cell.col * CELL_SIZE + CELL_SIZE * 0.5,
      z: GRID_ORIGIN_Z + cell.row * CELL_SIZE + CELL_SIZE * 0.5,
    };
  }

  worldToCell(position) {
    return {
      col: clamp(Math.floor((position.x - GRID_ORIGIN_X) / CELL_SIZE), 0, GRID_COLS - 1),
      row: clamp(Math.floor((position.z - GRID_ORIGIN_Z) / CELL_SIZE), 0, GRID_ROWS - 1),
    };
  }

  getAgentCenter() {
    return {
      x: this.agent.x + this.agent.width * 0.5,
      z: this.agent.z + this.agent.depth * 0.5,
    };
  }

  runAStar(start, goal) {
    const startKey = cellKey(start.col, start.row);
    const goalKey = cellKey(goal.col, goal.row);
    if (this.isBlocked(start) || this.isBlocked(goal)) {
      return [];
    }

    const open = [{ col: start.col, row: start.row }];
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, manhattan(start, goal)]]);

    while (open.length > 0) {
      open.sort((left, right) => (fScore.get(cellKey(left.col, left.row)) ?? Number.POSITIVE_INFINITY) - (fScore.get(cellKey(right.col, right.row)) ?? Number.POSITIVE_INFINITY));
      const current = open.shift();
      const currentKey = cellKey(current.col, current.row);
      if (currentKey === goalKey) {
        const path = [{ col: current.col, row: current.row }];
        let walkKey = currentKey;
        while (cameFrom.has(walkKey)) {
          const prev = cameFrom.get(walkKey);
          path.push({ col: prev.col, row: prev.row });
          walkKey = cellKey(prev.col, prev.row);
        }
        path.reverse();
        return path;
      }

      const currentG = gScore.get(currentKey) ?? Number.POSITIVE_INFINITY;
      const nextNeighbors = neighbors(current);
      for (let i = 0; i < nextNeighbors.length; i += 1) {
        const neighbor = nextNeighbors[i];
        const neighborKey = cellKey(neighbor.col, neighbor.row);
        if (!this.isInBounds(neighbor) || this.isBlocked(neighbor)) {
          continue;
        }
        const tentativeG = currentG + 1;
        if (tentativeG < (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
          cameFrom.set(neighborKey, { col: current.col, row: current.row });
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + manhattan(neighbor, goal));
          if (!open.some((item) => item.col === neighbor.col && item.row === neighbor.row)) {
            open.push({ col: neighbor.col, row: neighbor.row });
          }
        }
      }
    }

    return [];
  }

  rebuildPath() {
    const start = this.worldToCell(this.getAgentCenter());
    const newPath = this.runAStar(start, this.goalCell);
    this.pathCells = newPath;
    this.pathWorld = newPath.map((cell) => this.cellToWorld(cell));
    this.pathIndex = this.pathWorld.length > 1 ? 1 : 0;
    this.repathCount += 1;
  }

  chooseNextGoal() {
    for (let offset = 1; offset <= this.goalCandidates.length; offset += 1) {
      const nextIndex = (this.goalIndex + offset) % this.goalCandidates.length;
      const candidate = this.goalCandidates[nextIndex];
      const path = this.runAStar(this.worldToCell(this.getAgentCenter()), candidate);
      if (path.length > 1) {
        this.goalIndex = nextIndex;
        this.goalCell = { ...candidate };
        this.pathCells = path;
        this.pathWorld = path.map((cell) => this.cellToWorld(cell));
        this.pathIndex = 1;
        this.repathCount += 1;
        return;
      }
    }
  }

  followPath(dt) {
    if (this.pathWorld.length < 2 || this.pathIndex >= this.pathWorld.length) {
      return;
    }

    const target = this.pathWorld[this.pathIndex];
    const center = this.getAgentCenter();
    const dx = target.x - center.x;
    const dz = target.z - center.z;
    const distance = Math.hypot(dx, dz);

    if (distance <= 0.08) {
      this.pathIndex += 1;
      if (this.pathIndex >= this.pathWorld.length) {
        this.completedRuns += 1;
        this.chooseNextGoal();
      }
      return;
    }

    const moveStep = Math.min(this.agent.speed * dt, distance);
    const inv = 1 / Math.max(0.0001, distance);
    this.agent.x += dx * inv * moveStep;
    this.agent.z += dz * inv * moveStep;
  }

  stepPathDebugToggle(input) {
    const pressed = input?.isDown('KeyB') === true;
    if (pressed && !this.pathDebugToggleLatch) {
      this.showPathDebug = !this.showPathDebug;
    }
    this.pathDebugToggleLatch = pressed;
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }
    const center = this.getAgentCenter();
    const focusPoint = { x: center.x, y: 0.6, z: center.z };
    const basePose = {
      position: {
        x: focusPoint.x + Math.sin(this.cameraYaw) * 9.8,
        y: 8.1,
        z: focusPoint.z - Math.cos(this.cameraYaw) * 10.2,
      },
      rotation: {
        x: -0.5,
        y: this.cameraYaw,
        z: 0,
      },
    };
    applyPhase16CameraMode(this.camera3D, this.viewState, basePose, focusPoint);
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    stepPhase16ViewToggles(this.viewState, input);
    this.stepPathDebugToggle(input);

    this.navigationTime += dt;
    this.cameraYaw += this.cameraAutoOrbit * dt;
    if (input?.isDown('KeyQ')) this.cameraYaw -= 1.05 * dt;
    if (input?.isDown('KeyE')) this.cameraYaw += 1.05 * dt;
    if (input?.isDown('KeyR')) this.rebuildPath();

    this.followPath(dt);
    this.syncCamera();
  }

  drawPathDebug(renderer, cameraState, projectionViewport) {
    if (!this.showPathDebug || this.pathWorld.length < 2) {
      return;
    }

    for (let i = this.pathIndex; i < this.pathWorld.length; i += 1) {
      const node = this.pathWorld[i];
      drawWireBox(
        renderer,
        { x: node.x - 0.14, y: 0.08, z: node.z - 0.14 },
        { width: 0.28, height: 0.28, depth: 0.28 },
        cameraState,
        projectionViewport,
        '#22d3ee',
        { lineWidth: 1.6, depthCueEnabled: false }
      );
    }

    for (let i = this.pathIndex; i < this.pathWorld.length - 1; i += 1) {
      const start = this.pathWorld[i];
      const end = this.pathWorld[i + 1];
      const projectedStart = projectPoint({ x: start.x, y: 0.34, z: start.z }, cameraState, projectionViewport);
      const projectedEnd = projectPoint({ x: end.x, y: 0.34, z: end.z }, cameraState, projectionViewport);
      if (!projectedStart || !projectedEnd) {
        continue;
      }
      renderer.drawLine(projectedStart.x, projectedStart.y, projectedEnd.x, projectedEnd.y, '#06b6d4', 2.1);
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1621 - 3D AI Navigation Demo',
      'One AI agent traverses an A* path across blocked cells with visible in-world path nodes and segments.',
      'Camera orbit: auto + Q/E | Repath: R | Toggle path debug: B | Camera mode: C | Debug: V',
    ]);

    const viewport = this.viewport;
    renderer.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height, '#d8d5ff', 2);
    drawDepthBackdrop(renderer, viewport);
    renderer.drawRect(viewport.x + 10, viewport.y + 8, 158, 20, 'rgba(14, 116, 144, 0.24)');
    renderer.drawText('3D World - AI Nav Grid', viewport.x + 16, viewport.y + 22, { color: '#a5f3fc', font: '12px monospace' });

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 8, y: 8, z: 2 },
      rotation: { x: -0.5, y: this.cameraYaw, z: 0 },
    };
    const projectionViewport = createProjectionViewport(viewport);

    drawGroundGrid(
      renderer,
      {
        minX: GRID_ORIGIN_X,
        maxX: GRID_ORIGIN_X + GRID_COLS * CELL_SIZE,
        minZ: GRID_ORIGIN_Z,
        maxZ: GRID_ORIGIN_Z + GRID_ROWS * CELL_SIZE,
        y: -0.3,
        step: CELL_SIZE,
      },
      cameraState,
      projectionViewport
    );

    this.blockedCells.forEach((key) => {
      const parts = key.split(',');
      const col = Number.parseInt(parts[0], 10);
      const row = Number.parseInt(parts[1], 10);
      const center = this.cellToWorld({ col, row });
      drawWireBox(
        renderer,
        { x: center.x - CELL_SIZE * 0.48, y: -0.2, z: center.z - CELL_SIZE * 0.48 },
        { width: CELL_SIZE * 0.96, height: 1.2, depth: CELL_SIZE * 0.96 },
        cameraState,
        projectionViewport,
        '#64748b',
        1.7
      );
    });

    const goalCenter = this.cellToWorld(this.goalCell);
    drawWireBox(
      renderer,
      { x: goalCenter.x - 0.45, y: 0.08, z: goalCenter.z - 0.45 },
      { width: 0.9, height: 0.9, depth: 0.9 },
      cameraState,
      projectionViewport,
      '#84cc16',
      { lineWidth: 2.2, depthCueEnabled: false }
    );

    this.drawPathDebug(renderer, cameraState, projectionViewport);

    drawWireBox(
      renderer,
      { x: this.agent.x, y: this.agent.y, z: this.agent.z },
      { width: this.agent.width, height: this.agent.height, depth: this.agent.depth },
      cameraState,
      projectionViewport,
      '#f8fafc',
      { lineWidth: 2.4, depthCueEnabled: true }
    );

    renderer.drawRect(52, 34, 304, 120, 'rgba(2, 6, 23, 0.72)');
    renderer.strokeRect(52, 34, 304, 120, '#22d3ee', 1);
    renderer.drawText('UI Layer - Navigation HUD', 64, 52, { color: '#67e8f9', font: '12px monospace' });
    renderer.drawText(`Path nodes: ${this.pathWorld.length}`, 64, 72, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Path step: ${Math.min(this.pathIndex, Math.max(0, this.pathWorld.length - 1))}`, 64, 90, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Goal cell: (${this.goalCell.col}, ${this.goalCell.row})`, 64, 108, { color: '#e2e8f0', font: '12px monospace' });
    renderer.drawText(`Path debug: ${this.showPathDebug ? 'on' : 'off'}`, 64, 126, { color: '#e2e8f0', font: '12px monospace' });

    drawPanel(renderer, 620, 34, 300, 188, 'AI Navigation Runtime', [
      `Agent speed: ${this.agent.speed.toFixed(2)}`,
      `Repaths: ${this.repathCount}`,
      `Completed routes: ${this.completedRuns}`,
      `Nav time: ${this.navigationTime.toFixed(1)} s`,
      `Camera yaw: ${this.cameraYaw.toFixed(2)}`,
      `Camera mode: ${this.viewState.cameraMode}`,
    ]);

    drawPhase16DebugOverlay(renderer, viewport, this.viewState, [
      'Cyan nodes/segments visualize current planned path',
      'Goal marker is green and updates after each completed route',
    ]);
  }
}
