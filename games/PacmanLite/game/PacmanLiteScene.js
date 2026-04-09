/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import PacmanLiteDebugOverlay from './PacmanLiteDebugOverlay.js';
import PacmanLiteInputController from './PacmanLiteInputController.js';
import PacmanLiteWorld from './PacmanLiteWorld.js';

const VIEW = { width: 960, height: 720 };

export default class PacmanLiteScene extends Scene {
  constructor() {
    super();
    this.world = new PacmanLiteWorld(VIEW);
    this.inputController = null;
    this.debugOverlay = new PacmanLiteDebugOverlay();
    this.isPaused = false;
    this.lastEvent = this.world.createEvent();
  }

  enter(engine) {
    this.inputController = new PacmanLiteInputController(engine.input);
    this.world.resetGame();
    this.isPaused = false;
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'none';
    }
  }

  exit(engine) {
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'default';
    }
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
    this.lastEvent = this.world.update(dtSeconds, frame);
  }

  renderMaze(renderer) {
    const grid = this.world.grid;
    const tile = grid.tileSize;
    renderer.clear('#05070f');
    renderer.drawRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#0f172a');
    renderer.strokeRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#38bdf8', 2);
    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        const wx = x * tile;
        const wy = y * tile;
        if (!grid.isWalkable(x, y)) {
          renderer.drawRect(wx + 156, wy + 56, tile, tile, '#1e3a8a');
          continue;
        }
        if (grid.hasPellet(x, y)) {
          const cx = wx + 156 + (tile * 0.5);
          const cy = wy + 56 + (tile * 0.5);
          renderer.drawCircle(cx, cy, 3, '#f8fafc');
        }
      }
    }
  }

  render(renderer) {
    this.renderMaze(renderer);
    const tile = this.world.grid.tileSize;
    const ox = 156;
    const oy = 56;
    renderer.drawCircle(this.world.player.x + ox, this.world.player.y + oy, 12, '#facc15');
    renderer.drawCircle(this.world.ghost.x + ox, this.world.ghost.y + oy, 12, '#ef4444');

    renderer.drawText('PACMAN LITE', 30, 18, { color: '#e2e8f0', font: 'bold 24px monospace', textBaseline: 'top' });
    renderer.drawText(`SCORE ${this.world.score}`, 30, 52, { color: '#94a3b8', font: '16px monospace', textBaseline: 'top' });
    renderer.drawText(`LIVES ${this.world.lives}`, 30, 76, { color: '#94a3b8', font: '16px monospace', textBaseline: 'top' });
    renderer.drawText(`STATUS ${this.world.status.toUpperCase()}`, 932, 18, {
      color: '#e2e8f0', font: '16px monospace', textAlign: 'right', textBaseline: 'top',
    });

    this.debugOverlay.render(renderer, { world: this.world });

    renderer.drawText('ARROWS/WASD MOVE  ENTER/SPACE START  P PAUSE  R RESET', 480, 690, {
      color: '#94a3b8', font: '15px monospace', textAlign: 'center', textBaseline: 'top',
    });

    if (this.world.status === 'menu') {
      renderer.drawRect(234, 280, 492, 130, 'rgba(2, 6, 23, 0.86)');
      renderer.strokeRect(234, 280, 492, 130, '#38bdf8', 2);
      renderer.drawText('PRESS ENTER OR SPACE TO START', 480, 334, {
        color: '#e2e8f0', font: '18px monospace', textAlign: 'center', textBaseline: 'top',
      });
    } else if (this.world.status === 'game-over') {
      renderer.drawRect(264, 280, 432, 130, 'rgba(2, 6, 23, 0.9)');
      renderer.strokeRect(264, 280, 432, 130, '#ef4444', 2);
      renderer.drawText('GAME OVER - PRESS ENTER', 480, 334, {
        color: '#fecaca', font: '20px monospace', textAlign: 'center', textBaseline: 'top',
      });
    }

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0,0,0,0.5)');
      renderer.drawText('PAUSED', 480, 330, {
        color: '#e2e8f0', font: 'bold 30px monospace', textAlign: 'center', textBaseline: 'top',
      });
    }
  }
}
