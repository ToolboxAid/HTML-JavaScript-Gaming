/*
Toolbox Aid
David Quesenberry
03/24/2026
BouncingBallScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import BouncingBallAudio from './BouncingBallAudio.js';
import BouncingBallInputController from './BouncingBallInputController.js';
import BouncingBallWorld from './BouncingBallWorld.js';
import { wrapTextByCharacterCount } from '/src/shared/utils/index.js';

const VIEW = {
  width: 960,
  height: 720,
};

const DEFAULT_COLORS = {
  background: '#05070a',
  wall: '#f4f4ef',
  text: '#f4f4ef',
  muted: '#9ba3b3',
  panel: '#05070a',
  ball: '#f4f4ef',
};

function toObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function sanitizeBouncingBallSceneColors(skin) {
  const colors = toObject(skin?.colors);
  return {
    background: typeof colors.background === 'string' && colors.background.trim() ? colors.background.trim() : DEFAULT_COLORS.background,
    wall: typeof colors.wall === 'string' && colors.wall.trim() ? colors.wall.trim() : DEFAULT_COLORS.wall,
    text: typeof colors.text === 'string' && colors.text.trim() ? colors.text.trim() : DEFAULT_COLORS.text,
    muted: typeof colors.muted === 'string' && colors.muted.trim() ? colors.muted.trim() : DEFAULT_COLORS.muted,
    panel: typeof colors.panel === 'string' && colors.panel.trim() ? colors.panel.trim() : DEFAULT_COLORS.panel,
    ball: typeof colors.ball === 'string' && colors.ball.trim() ? colors.ball.trim() : DEFAULT_COLORS.ball
  };
}

export default class BouncingBallScene extends Scene {
  constructor(options = {}) {
    super();
    this.world = new BouncingBallWorld({ ...VIEW, skin: options.skin || null });
    this.colors = sanitizeBouncingBallSceneColors(options.skin);
    this.inputController = null;
    this.audio = new BouncingBallAudio();
    this.isPaused = false;
  }

  applySkin(nextSkin) {
    this.colors = sanitizeBouncingBallSceneColors(nextSkin);
    this.world.applySkin(nextSkin);
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
    renderer.clear(this.colors.background);
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
    renderer.drawRect(0, 0, VIEW.width, wallThickness, this.colors.wall);
    renderer.drawRect(0, VIEW.height - wallThickness, VIEW.width, wallThickness, this.colors.wall);
    renderer.drawRect(0, 0, wallThickness, VIEW.height, this.colors.wall);
    renderer.drawRect(VIEW.width - wallThickness, 0, wallThickness, VIEW.height, this.colors.wall);
    renderer.strokeRect(
      playfield.left,
      playfield.top,
      playfield.right - playfield.left,
      playfield.bottom - playfield.top,
      this.colors.wall,
      2,
    );
  }

  drawHud(renderer) {
    renderer.drawText('BOUNCING BALL', 28, 20, {
      color: this.colors.text,
      font: 'bold 24px monospace',
      textBaseline: 'top',
    });

    renderer.drawText(this.world.status === 'playing' ? 'LIVE' : 'READY', 930, 20, {
      color: this.colors.text,
      font: '18px monospace',
      textAlign: 'right',
      textBaseline: 'top',
    });

    if (this.world.status === 'playing') {
      renderer.drawText('P pause', 930, 38, {
        color: this.colors.muted,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
      renderer.drawText('R reset', 930, 58, {
        color: this.colors.muted,
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
      this.colors.ball,
    );
  }

  drawOverlay(renderer, copy) {
    renderer.drawRect(180, 258, 600, 192, this.colors.panel);
    renderer.strokeRect(180, 258, 600, 192, this.colors.wall, 2);
    renderer.drawText(copy.title, VIEW.width / 2, 292, {
      color: this.colors.text,
      font: 'bold 28px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    wrapTextByCharacterCount(copy.body, 38).forEach((line, index) => {
      renderer.drawText(line, VIEW.width / 2, 336 + (index * 24), {
        color: this.colors.muted,
        font: '18px monospace',
        textAlign: 'center',
        textBaseline: 'top',
      });
    });

    renderer.drawText(copy.prompt, VIEW.width / 2, 422, {
      color: this.colors.text,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
