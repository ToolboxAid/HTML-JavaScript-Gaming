/*
Toolbox Aid
David Quesenberry
03/24/2026
MultiBallChaosScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import MultiBallChaosAudio from './MultiBallChaosAudio.js';
import MultiBallChaosInputController from './MultiBallChaosInputController.js';
import MultiBallChaosWorld from './MultiBallChaosWorld.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#020617',
  wall: '#e2e8f0',
  panel: '#0f172a',
  panelBorder: '#334155',
  text: '#f8fafc',
  muted: '#94a3b8',
  accent: '#f59e0b',
  lane: '#142033',
};

function wrapText(text, maxCharacters = 38) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharacters && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

export default class MultiBallChaosScene extends Scene {
  constructor() {
    super();
    this.world = new MultiBallChaosWorld(VIEW);
    this.inputController = null;
    this.audio = new MultiBallChaosAudio();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new MultiBallChaosInputController(engine.input);
    this.audio.setAudioService(engine.audio ?? null);
    this.world.resetGame();
    this.isPaused = false;
  }

  update(dt) {
    const frame = this.inputController.getFrameState(this.world.selectedPresetId);

    if (frame.resetPressed && this.isPaused) {
      this.isPaused = false;
      const event = this.world.update(0, { resetPressed: true });
      if (event.reset) {
        this.audio.playReset();
      }
      return;
    }

    if (frame.presetPressed && this.isPaused) {
      this.isPaused = false;
      const event = this.world.update(0, { presetPressed: frame.presetPressed });
      if (event.presetChanged) {
        this.audio.playPreset();
      }
      return;
    }

    if (frame.pausePressed && this.world.status === 'playing') {
      this.isPaused = !this.isPaused;
      return;
    }

    if (this.isPaused) {
      return;
    }

    const event = this.world.update(dt, frame);
    if (event.started) {
      this.audio.playStart();
    }
    if (event.presetChanged) {
      this.audio.playPreset();
    }
    if (event.reset) {
      this.audio.playReset();
    }
    if (event.bounceCount > 0) {
      this.audio.playBounce();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawArena(renderer);
    this.drawBalls(renderer);
    this.drawHud(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
      this.drawOverlay(renderer, {
        title: 'PAUSED',
        body: 'The chamber is frozen. Resume to continue the wall-bounce pattern or reset to rebuild the preset.',
        prompt: 'Press P to continue.',
      });
    } else if (this.world.status !== 'playing') {
      this.drawOverlay(renderer, {
        title: 'MULTI-BALL CHAOS',
        body: 'A beginner-friendly multi-ball chamber that demonstrates stable wall rebounds in a bounded playfield, without gravity or ball-ball collision.',
        prompt: 'Press Space, Enter, or south button to start.',
      });
    }
  }

  drawArena(renderer) {
    const { playfield, wallThickness } = this.world;
    renderer.drawRect(0, 0, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(playfield.right + 22, 0, 2, VIEW.height, COLORS.panelBorder);
    renderer.drawRect(0, VIEW.height - wallThickness, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(VIEW.width - wallThickness, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(playfield.left, playfield.top, playfield.right - playfield.left, playfield.bottom - playfield.top, COLORS.lane);
    renderer.strokeRect(
      playfield.left,
      playfield.top,
      playfield.right - playfield.left,
      playfield.bottom - playfield.top,
      COLORS.wall,
      2,
    );

    for (let index = 1; index < 4; index += 1) {
      const stripeX = playfield.left + (((playfield.right - playfield.left) / 4) * index);
      renderer.drawLine(stripeX, playfield.top + 10, stripeX, playfield.bottom - 10, '#1e293b', 1);
    }
  }

  drawBalls(renderer) {
    this.world.balls.forEach((ball) => {
      renderer.drawRect(ball.x, ball.y, ball.size, ball.size, ball.color);
      renderer.strokeRect(ball.x, ball.y, ball.size, ball.size, COLORS.text, 1);
    });
  }

  drawHud(renderer) {
    const preset = this.world.getSelectedPreset();
    const sidebarX = 700;
    const speedSummary = this.world.balls
      .map((ball) => Math.hypot(ball.vx, ball.vy))
      .reduce((total, speed) => total + speed, 0) / Math.max(1, this.world.balls.length);

    renderer.drawText('MULTI-BALL CHAOS', 28, 20, {
      color: COLORS.text,
      font: 'bold 24px monospace',
      textBaseline: 'top',
    });

    renderer.drawText(this.world.status === 'playing' ? 'LIVE' : 'READY', 930, 20, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'right',
      textBaseline: 'top',
    });

    renderer.drawRect(sidebarX, 112, 216, 208, COLORS.panel);
    renderer.strokeRect(sidebarX, 112, 216, 208, COLORS.panelBorder, 2);
    renderer.drawText('Preset', sidebarX + 18, 132, {
      color: COLORS.accent,
      font: 'bold 18px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(preset.label, sidebarX + 18, 162, {
      color: COLORS.text,
      font: '18px monospace',
      textBaseline: 'top',
    });
    wrapText(preset.description, 24).forEach((line, index) => {
      renderer.drawText(line, sidebarX + 18, 194 + (index * 20), {
        color: COLORS.muted,
        font: '15px monospace',
        textBaseline: 'top',
      });
    });
    renderer.drawText(`Balls ${this.world.balls.length}`, sidebarX + 18, 258, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Avg speed ${speedSummary.toFixed(0)}`, sidebarX + 18, 282, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'top',
    });

    renderer.drawRect(sidebarX, 338, 216, 192, COLORS.panel);
    renderer.strokeRect(sidebarX, 338, 216, 192, COLORS.panelBorder, 2);
    renderer.drawText('Controls', sidebarX + 18, 358, {
      color: COLORS.accent,
      font: 'bold 18px monospace',
      textBaseline: 'top',
    });
    [
      '1  3 Balls',
      '2  6 Balls',
      '3  10 Balls',
      '4  Fast Chaos',
      'P  Pause',
      'R  Reset',
    ].forEach((line, index) => {
      renderer.drawText(line, sidebarX + 18, 392 + (index * 22), {
        color: COLORS.text,
        font: '16px monospace',
        textBaseline: 'top',
      });
    });

    renderer.drawText(this.world.statusMessage, 54, 684, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'bottom',
    });
    renderer.drawText(`Elapsed ${this.world.elapsedSeconds.toFixed(1)}s`, 930, 684, {
      color: COLORS.muted,
      font: '16px monospace',
      textAlign: 'right',
      textBaseline: 'bottom',
    });
  }

  drawOverlay(renderer, copy) {
    renderer.drawRect(150, 258, 660, 192, COLORS.panel);
    renderer.strokeRect(150, 258, 660, 192, COLORS.wall, 2);
    renderer.drawText(copy.title, VIEW.width / 2, 292, {
      color: COLORS.text,
      font: 'bold 28px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    wrapText(copy.body, 54).forEach((line, index) => {
      renderer.drawText(line, VIEW.width / 2, 336 + (index * 24), {
        color: COLORS.muted,
        font: '18px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    });

    renderer.drawText(copy.prompt, VIEW.width / 2, 418, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
