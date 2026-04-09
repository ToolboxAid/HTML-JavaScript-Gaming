/*
Toolbox Aid
David Quesenberry
03/24/2026
PaddleInterceptScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import PaddleInterceptAudio from './PaddleInterceptAudio.js';
import PaddleInterceptInputController from './PaddleInterceptInputController.js';
import PaddleInterceptWorld from './PaddleInterceptWorld.js';

const VIEW = { width: 960, height: 720 };

const COLORS = {
  background: '#030712',
  wall: '#e2e8f0',
  text: '#f8fafc',
  muted: '#94a3b8',
  panel: '#0f172a',
  accent: '#38bdf8',
  ball: '#f59e0b',
  paddle: '#f8fafc',
  marker: '#34d399',
  lane: '#111c30',
};

function wrapText(text, maxCharacters = 42) {
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

export default class PaddleInterceptScene extends Scene {
  constructor() {
    super();
    this.world = new PaddleInterceptWorld(VIEW);
    this.inputController = null;
    this.audio = new PaddleInterceptAudio();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new PaddleInterceptInputController(engine.input);
    this.audio.setAudioService(engine.audio ?? null);
    this.world.resetGame();
    this.isPaused = false;
  }

  update(dt) {
    const frame = this.inputController.getFrameState();

    if (frame.resetPressed && this.isPaused) {
      this.isPaused = false;
      const event = this.world.update(0, { resetPressed: true });
      if (event.reset) {
        this.audio.playReset();
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
    if (event.wallBounced) {
      this.audio.playWallBounce();
    }
    if (event.paddleIntercepted) {
      this.audio.playIntercept();
    }
    if (event.reset) {
      this.audio.playReset();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawArena(renderer);
    this.drawHud(renderer);
    this.drawInterceptMarker(renderer);
    this.drawBall(renderer);
    this.drawPaddle(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0,0,0,0.5)');
      this.drawOverlay(renderer, {
        title: 'PAUSED',
        body: 'The prediction is frozen. Resume to watch the paddle continue solving the intercept.',
        prompt: 'Press P to continue.',
      });
    } else if (this.world.status !== 'playing') {
      this.drawOverlay(renderer, {
        title: 'PADDLE INTERCEPT',
        body: 'A one-ball chamber where the paddle uses time-to-intercept prediction with wall-aware Y reflection to meet the shot cleanly.',
        prompt: 'Press Space, Enter, or south button to start.',
      });
    }
  }

  drawArena(renderer) {
    const { playfield, wallThickness } = this.world;
    renderer.drawRect(0, 0, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(VIEW.width - wallThickness, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(0, VIEW.height - wallThickness, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(playfield.left, playfield.top, playfield.right - playfield.left, playfield.bottom - playfield.top, COLORS.lane);
    renderer.strokeRect(playfield.left, playfield.top, playfield.right - playfield.left, playfield.bottom - playfield.top, COLORS.wall, 2);
    renderer.drawLine(playfield.left + 140, playfield.top + 8, playfield.left + 140, playfield.bottom - 8, '#1f2937', 2);
  }

  drawHud(renderer) {
    renderer.drawText('PADDLE INTERCEPT', 28, 20, {
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
    renderer.drawText(`VX ${this.world.ball.vx.toFixed(0)}`, 28, 54, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`VY ${this.world.ball.vy.toFixed(0)}`, 152, 54, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`TARGET ${this.world.interceptMarkerY.toFixed(0)}`, 286, 54, {
      color: COLORS.accent,
      font: '16px monospace',
      textBaseline: 'top',
    });
    renderer.drawRect(724, 120, 188, 148, COLORS.panel);
    renderer.strokeRect(724, 120, 188, 148, '#334155', 2);
    [
      'P Pause',
      'R Reset',
      'Green line =',
      'predicted future',
      'intercept Y',
    ].forEach((line, index) => {
      renderer.drawText(line, 744, 144 + (index * 22), {
        color: index === 0 || index === 1 ? COLORS.text : COLORS.muted,
        font: '16px monospace',
        textBaseline: 'top',
      });
    });
    renderer.drawText(this.world.statusMessage, 56, 699, {
      color: COLORS.text,
      font: '16px monospace',
      textBaseline: 'bottom',
    });
  }

  drawInterceptMarker(renderer) {
    const { playfield } = this.world;
    const markerX = this.world.paddle.x - 56;
    renderer.drawLine(markerX - 22, this.world.interceptMarkerY, markerX + 22, this.world.interceptMarkerY, COLORS.marker, 3);
    renderer.drawLine(markerX, this.world.interceptMarkerY - 18, markerX, this.world.interceptMarkerY + 18, COLORS.marker, 2);
    renderer.drawLine(this.world.ball.centerX, this.world.ball.centerY, markerX, this.world.interceptMarkerY, 'rgba(52, 211, 153, 0.28)', 1);
    renderer.drawLine(playfield.right - 8, this.world.interceptMarkerY, playfield.right - 52, this.world.interceptMarkerY, COLORS.marker, 2);
  }

  drawBall(renderer) {
    const half = this.world.ball.size * 0.5;
    renderer.drawRect(this.world.ball.centerX - half, this.world.ball.centerY - half, this.world.ball.size, this.world.ball.size, COLORS.ball);
  }

  drawPaddle(renderer) {
    const paddle = this.world.getPaddleBounds();
    renderer.drawRect(paddle.left, paddle.top, paddle.right - paddle.left, paddle.bottom - paddle.top, COLORS.paddle);
  }

  drawOverlay(renderer, copy) {
    renderer.drawRect(162, 258, 636, 192, COLORS.panel);
    renderer.strokeRect(162, 258, 636, 192, COLORS.wall, 2);
    renderer.drawText(copy.title, VIEW.width / 2, 292, {
      color: COLORS.text,
      font: 'bold 28px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    wrapText(copy.body).forEach((line, index) => {
      renderer.drawText(line, VIEW.width / 2, 336 + (index * 24), {
        color: COLORS.muted,
        font: '18px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    });
    renderer.drawText(copy.prompt, VIEW.width / 2, 420, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
