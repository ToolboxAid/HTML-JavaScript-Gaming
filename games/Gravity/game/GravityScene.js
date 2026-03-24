/*
Toolbox Aid
David Quesenberry
03/24/2026
GravityScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import GravityAudio from './GravityAudio.js';
import GravityInputController from './GravityInputController.js';
import GravityWorld from './GravityWorld.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#04070d',
  wall: '#f6f2d8',
  floor: '#f59e0b',
  text: '#f6f2d8',
  muted: '#b4bcc9',
  panel: '#04070d',
  ball: '#f6f2d8',
  gravity: '#f59e0b',
};

function wrapText(text, maxCharacters = 40) {
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

export default class GravityScene extends Scene {
  constructor() {
    super();
    this.world = new GravityWorld(VIEW);
    this.inputController = null;
    this.audio = new GravityAudio();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new GravityInputController(engine.input);
    this.audio.setAudioService(engine.audio ?? null);
    this.world.resetGame();
    this.isPaused = false;
  }

  update(dt) {
    const frame = this.inputController.getFrameState();

    if (frame.resetPressed && this.isPaused) {
      this.isPaused = false;
      this.world.resetGame();
      this.audio.playReset();
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
    if (event.floorBounced) {
      this.audio.playFloorBounce();
    }
    if (event.reset) {
      this.audio.playReset();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawArena(renderer);
    this.drawGravityIndicator(renderer);
    this.drawHud(renderer);
    this.drawBall(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
      this.drawOverlay(renderer, {
        title: 'PAUSED',
        body: 'Gravity is suspended while the chamber is paused. Resume to continue the fall-and-bounce pattern.',
        prompt: 'Press P or Start to continue.',
      });
    } else if (this.world.status !== 'playing') {
      this.drawOverlay(renderer, {
        title: 'GRAVITY',
        body: 'A single ball under constant downward pull with side wall rebounds and a damped floor bounce. This is not Gravity Well.',
        prompt: 'Press Space, Enter, or south button to start.',
      });
    }
  }

  drawArena(renderer) {
    const { playfield, wallThickness } = this.world;
    renderer.drawRect(0, 0, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(VIEW.width - wallThickness, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(0, VIEW.height - wallThickness, VIEW.width, wallThickness, COLORS.floor);
    renderer.strokeRect(
      playfield.left,
      playfield.top,
      playfield.right - playfield.left,
      playfield.bottom - playfield.top,
      COLORS.wall,
      2,
    );
  }

  drawGravityIndicator(renderer) {
    const centerX = VIEW.width - 62;
    renderer.drawText('G', centerX, 108, {
      color: COLORS.gravity,
      font: 'bold 20px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    for (let index = 0; index < 5; index += 1) {
      const segmentY = 144 + (index * 42);
      renderer.drawLine(centerX, segmentY, centerX, segmentY + 22, COLORS.gravity, 3);
    }

    renderer.drawLine(centerX, 364, centerX - 12, 386, COLORS.gravity, 3);
    renderer.drawLine(centerX, 364, centerX + 12, 386, COLORS.gravity, 3);
  }

  drawHud(renderer) {
    renderer.drawText('GRAVITY', 28, 20, {
      color: COLORS.text,
      font: 'bold 24px monospace',
      textBaseline: 'top',
    });

    const statusText = this.world.status === 'playing'
      ? this.world.ball.resting ? 'RESTING' : 'LIVE'
      : 'READY';

    renderer.drawText(statusText, 930, 20, {
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
    renderer.drawText(`VY ${this.world.ball.vy.toFixed(0)}`, 156, 54, {
      color: COLORS.muted,
      font: '16px monospace',
      textBaseline: 'top',
    });

    if (this.world.status === 'playing') {
      renderer.drawText('LEFT/RIGHT steer', 930, 38, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
      renderer.drawText('P pause  R reset', 930, 58, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    }
  }

  drawBall(renderer) {
    renderer.drawRect(
      this.world.ball.x,
      this.world.ball.y,
      this.world.ball.size,
      this.world.ball.size,
      COLORS.ball,
    );
  }

  drawOverlay(renderer, copy) {
    renderer.drawRect(180, 258, 600, 192, COLORS.panel);
    renderer.strokeRect(180, 258, 600, 192, COLORS.wall, 2);
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

    renderer.drawText(copy.prompt, VIEW.width / 2, 422, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
