/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import BouncingBallAudio from './BouncingBallAudio.js';
import BouncingBallInputController from './BouncingBallInputController.js';
import BouncingBallWorld from './BouncingBallWorld.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#05070a',
  wall: '#f4f4ef',
  text: '#f4f4ef',
  muted: '#9ba3b3',
  panel: '#05070a',
  ball: '#f4f4ef',
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

export default class BouncingBallScene extends Scene {
  constructor() {
    super();
    this.world = new BouncingBallWorld(VIEW);
    this.inputController = null;
    this.audio = new BouncingBallAudio();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new BouncingBallInputController(engine.input);
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
    if (event.bounced) {
      this.audio.playBounce();
    }
    if (event.reset) {
      this.audio.playReset();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawArena(renderer);
    this.drawHud(renderer);
    this.drawBall(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
      this.drawOverlay(renderer, {
        title: 'PAUSED',
        body: 'The ball is frozen in place. Resume when you want to continue the bounce pattern.',
        prompt: 'Press P or Start to continue.',
      });
    } else if (this.world.status !== 'playing') {
      this.drawOverlay(renderer, {
        title: 'BOUNCING BALL',
        body: 'A single ball in a clean bounded arena. No gravity yet, just motion and wall rebound stability.',
        prompt: 'Press Space, Enter, or south button to start.',
      });
    }
  }

  drawArena(renderer) {
    const { playfield, wallThickness } = this.world;
    renderer.drawRect(0, 0, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, VIEW.height - wallThickness, VIEW.width, wallThickness, COLORS.wall);
    renderer.drawRect(0, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(VIEW.width - wallThickness, 0, wallThickness, VIEW.height, COLORS.wall);
    renderer.strokeRect(
      playfield.left,
      playfield.top,
      playfield.right - playfield.left,
      playfield.bottom - playfield.top,
      COLORS.wall,
      2,
    );
  }

  drawHud(renderer) {
    renderer.drawText('BOUNCING BALL', 28, 20, {
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

    if (this.world.status === 'playing') {
      renderer.drawText('P pause', 930, 38, {
        color: COLORS.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
      renderer.drawText('R reset', 930, 58, {
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
