/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import PacmanFullAIDebugOverlay from './PacmanFullAIDebugOverlay.js';
import PacmanFullAIInputController from './PacmanFullAIInputController.js';
import PacmanFullAIWorld from './PacmanFullAIWorld.js';

const VIEW = { width: 960, height: 720 };
const TILE_OFFSET = { x: 176, y: 56 };

function ghostColorForMode(ghost, modeState) {
  if (ghost.eaten) return '#dbeafe';
  if (modeState.mode === 'frightened') {
    return modeState.frightenedFlashing ? '#f8fafc' : '#1d4ed8';
  }
  return ghost.color;
}

export default class PacmanFullAIScene extends Scene {
  constructor() {
    super();
    this.world = new PacmanFullAIWorld(VIEW);
    this.inputController = null;
    this.debugOverlay = new PacmanFullAIDebugOverlay();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new PacmanFullAIInputController(engine.input);
    this.world.resetGame();
    this.isPaused = false;
    if (engine?.canvas) engine.canvas.style.cursor = 'none';
  }

  exit(engine) {
    if (engine?.canvas) engine.canvas.style.cursor = 'default';
  }

  update(dtSeconds) {
    const frame = this.inputController.getFrameState();
    if (frame.pausePressed && this.world.status === 'playing') {
      this.isPaused = !this.isPaused;
      return;
    }
    if (this.isPaused) {
      if (frame.resetPressed) {
        this.world.resetGame();
        this.isPaused = false;
      }
      return;
    }
    this.world.update(dtSeconds, frame);
  }

  renderMaze(renderer) {
    const grid = this.world.grid;
    const tile = grid.tileSize;
    renderer.clear('#020617');
    renderer.drawRect(40, 30, VIEW.width - 80, VIEW.height - 56, '#020b1e');
    renderer.strokeRect(40, 30, VIEW.width - 80, VIEW.height - 56, '#1e3a8a', 2);

    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        const wx = TILE_OFFSET.x + (x * tile);
        const wy = TILE_OFFSET.y + (y * tile);
        if (!grid.isWalkable(x, y)) {
          renderer.drawRect(wx, wy, tile, tile, '#1d4ed8');
          renderer.strokeRect(wx + 1, wy + 1, tile - 2, tile - 2, '#38bdf8', 1);
          continue;
        }
        if (grid.hasPellet(x, y)) {
          renderer.drawCircle(wx + (tile * 0.5), wy + (tile * 0.5), 2.7, '#fde68a');
        } else if (grid.hasPowerPellet(x, y)) {
          renderer.drawCircle(wx + (tile * 0.5), wy + (tile * 0.5), 6, '#fef9c3');
        }
      }
    }
  }

  renderActors(renderer) {
    const { x: ox, y: oy } = TILE_OFFSET;
    renderer.drawCircle(this.world.player.x + ox, this.world.player.y + oy, 12, '#facc15');

    this.world.ghosts.forEach((ghost) => {
      const color = ghostColorForMode(ghost, this.world.modeState);
      renderer.drawCircle(ghost.x + ox, ghost.y + oy, 12, color);
      if (ghost.eaten) {
        renderer.drawCircle(ghost.x + ox - 4, ghost.y + oy - 2, 2, '#0f172a');
        renderer.drawCircle(ghost.x + ox + 4, ghost.y + oy - 2, 2, '#0f172a');
      }
    });
  }

  renderStatus(renderer) {
    renderer.drawText('PAC-MAN FULL AI', 45, 35, { color: '#f8fafc', font: 'bold 24px monospace', textBaseline: 'top' });
    renderer.drawText(`SCORE ${this.world.score}`, 45, 72, { color: '#e2e8f0', font: '16px monospace', textBaseline: 'top' });
    renderer.drawText(`LIVES ${this.world.lives}`, 45, 96, { color: '#e2e8f0', font: '16px monospace', textBaseline: 'top' });
    // renderer.drawText(`MODE ${this.world.modeState.mode.toUpperCase()}`, 930, 18, {
    //   color: '#f8fafc', font: '16px monospace', textAlign: 'right', textBaseline: 'top',
    // });
    renderer.drawText('ARROWS/WASD MOVE  ENTER/SPACE START  P PAUSE  R RESET', 480, 678, {
      color: '#cbd5e1', font: '15px monospace', textAlign: 'center', textBaseline: 'top',
    });
  }

  renderOverlays(renderer) {
    if (this.world.status === 'menu') {
      renderer.drawRect(262, 286, 436, 116, 'rgba(2, 6, 23, 0.86)');
      renderer.strokeRect(262, 286, 436, 116, '#38bdf8', 2);
      renderer.drawText('READY! PRESS ENTER OR SPACE', 480, 330, {
        color: '#f8fafc', font: '18px monospace', textAlign: 'center', textBaseline: 'top',
      });
    }
    if (this.world.status === 'game-over') {
      renderer.drawRect(282, 286, 396, 116, 'rgba(2, 6, 23, 0.9)');
      renderer.strokeRect(282, 286, 396, 116, '#ef4444', 2);
      renderer.drawText('GAME OVER - PRESS ENTER', 480, 330, {
        color: '#fecaca', font: '20px monospace', textAlign: 'center', textBaseline: 'top',
      });
    }
    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
      renderer.drawText('PAUSED', 480, 330, {
        color: '#f8fafc', font: 'bold 30px monospace', textAlign: 'center', textBaseline: 'top',
      });
    }
  }

  render(renderer) {
    this.renderMaze(renderer);
    this.renderActors(renderer);
    this.renderStatus(renderer);
    this.debugOverlay.render(renderer, { world: this.world });
    this.renderOverlays(renderer);
  }
}
