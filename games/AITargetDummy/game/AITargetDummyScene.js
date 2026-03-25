/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import AITargetDummyInputController from './AITargetDummyInputController.js';
import AITargetDummyWorld from './AITargetDummyWorld.js';

const VIEW = { width: 960, height: 720 };
const COLORS = {
  bg: '#070b14',
  panel: '#0f172a',
  line: '#38bdf8',
  text: '#e2e8f0',
  muted: '#94a3b8',
  player: '#22c55e',
  dummy: '#ef4444',
  sense: 'rgba(14, 165, 233, 0.18)',
  attack: 'rgba(239, 68, 68, 0.22)',
};

export default class AITargetDummyScene extends Scene {
  constructor() {
    super();
    this.world = new AITargetDummyWorld(VIEW);
    this.inputController = null;
    this.isPaused = false;
    this.lastEvent = this.world.createEvent();
  }

  enter(engine) {
    this.inputController = new AITargetDummyInputController(engine.input);
    this.world.resetGame();
    this.lastEvent = this.world.createEvent();
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
        this.lastEvent = this.world.createEvent();
        this.isPaused = false;
      }
      return;
    }

    this.lastEvent = this.world.update(dtSeconds, frame);
  }

  drawArena(renderer) {
    const { left, top, right, bottom } = this.world.playfield;
    renderer.drawRect(24, 24, VIEW.width - 48, VIEW.height - 48, COLORS.panel);
    renderer.strokeRect(24, 24, VIEW.width - 48, VIEW.height - 48, COLORS.line, 2);
    renderer.strokeRect(left, top, right - left, bottom - top, COLORS.line, 1.5);
  }

  drawAgent(renderer, actor, color) {
    renderer.drawCircle(actor.x, actor.y, actor.radius, color);
  }

  render(renderer) {
    renderer.clear(COLORS.bg);
    this.drawArena(renderer);

    const dummy = this.world.dummy;
    const player = this.world.player;
    renderer.drawCircle(dummy.x, dummy.y, dummy.senseRadius, COLORS.sense);
    renderer.drawCircle(dummy.x, dummy.y, dummy.attackRadius, COLORS.attack);
    this.drawAgent(renderer, player, COLORS.player);
    this.drawAgent(renderer, dummy, COLORS.dummy);
    renderer.drawLine(dummy.x, dummy.y, player.x, player.y, '#64748b', 1);

    renderer.drawText('AI TARGET DUMMY', 28, 20, {
      color: COLORS.text,
      font: 'bold 22px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`STATUS ${this.world.status.toUpperCase()}`, 932, 20, {
      color: COLORS.text,
      font: '16px monospace',
      textAlign: 'right',
      textBaseline: 'top',
    });

    renderer.drawRect(660, 88, 272, 192, 'rgba(2, 6, 23, 0.82)');
    renderer.strokeRect(660, 88, 272, 192, '#334155', 1);
    const lines = [
      `STATE: ${dummy.state.toUpperCase()}`,
      `DIST: ${dummy.lastDistance.toFixed(1)}`,
      `ATTACKS: ${dummy.attacksLanded}`,
      `EVENT ATTACK: ${this.lastEvent.attackTriggered}`,
      `STATE CHANGED: ${this.lastEvent.stateChanged}`,
      `TIMER: ${this.world.stateTimer.toFixed(2)}`,
    ];
    lines.forEach((line, index) => {
      renderer.drawText(line, 676, 106 + (index * 26), {
        color: index === 0 ? COLORS.text : COLORS.muted,
        font: '15px monospace',
        textBaseline: 'top',
      });
    });

    renderer.drawText('MOVE: WASD/ARROWS OR LEFT STICK', 28, 662, {
      color: COLORS.muted,
      font: '15px monospace',
      textBaseline: 'top',
    });
    renderer.drawText('ENTER/SPACE START  P PAUSE  R RESET', 28, 686, {
      color: COLORS.muted,
      font: '15px monospace',
      textBaseline: 'top',
    });

    if (this.world.status === 'menu') {
      renderer.drawRect(202, 274, 556, 168, 'rgba(2, 6, 23, 0.88)');
      renderer.strokeRect(202, 274, 556, 168, '#38bdf8', 2);
      renderer.drawText('AI TARGET DUMMY LAB', VIEW.width / 2, 304, {
        color: COLORS.text,
        font: 'bold 28px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
      renderer.drawText('PRESS ENTER OR SPACE TO START', VIEW.width / 2, 352, {
        color: COLORS.muted,
        font: '18px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    }

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.54)');
      renderer.drawText('PAUSED', VIEW.width / 2, 332, {
        color: COLORS.text,
        font: 'bold 32px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    }
  }
}
