/*
Toolbox Aid
David Quesenberry
03/24/2026
BreakoutScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import BreakoutAudio from './BreakoutAudio.js';
import BreakoutInputController from './BreakoutInputController.js';
import BreakoutWorld from './BreakoutWorld.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#000000',
  wall: '#f8f8f2',
  paddle: '#f8f8f2',
  ball: '#f8f8f2',
  text: '#04040A', //f8f8f2
  muted: '#a0a0a0',
  panel: '#000000',
};

function wrapText(text, maxCharacters = 34) {
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

export default class BreakoutScene extends Scene {
  constructor(options = {}) {
    super();
    this.devConsoleIntegration = options.devConsoleIntegration || null;
    this.debugConfig = options.debugConfig || {
      debugMode: 'prod',
      debugEnabled: Boolean(this.devConsoleIntegration),
    };
    this.world = new BreakoutWorld(VIEW);
    this.inputController = null;
    this.audio = new BreakoutAudio();
    this.isPaused = false;
    this.engineRef = null;
  }

  enter(engine) {
    this.engineRef = engine || null;
    this.inputController = new BreakoutInputController(engine.input);
    this.audio.setAudioService(engine.audio ?? null);
    this.world.resetGame();
    this.isPaused = false;
  }

  exit() {
    this.devConsoleIntegration?.dispose?.();
  }

  buildDebugDiagnosticsContext(engine, dt) {
    const safeDt = Number.isFinite(dt) && dt > 0 ? dt : 1 / 60;
    const fps = Math.round(1 / safeDt);
    const input = engine?.input ?? this.inputController?.input ?? null;

    return {
      runtime: {
        sceneId: 'breakout-debug-showcase',
        status: this.world.status,
        fps,
        frameTimeMs: Math.round(safeDt * 1000 * 100) / 100,
        debugMode: this.debugConfig.debugMode,
        debugEnabled: this.debugConfig.debugEnabled === true,
      },
      entities: {
        count: this.world.remainingBricks + 2,
        bricksRemaining: this.world.remainingBricks,
        lives: this.world.lives,
        score: this.world.score,
      },
      input: {
        left: input?.isDown?.('ArrowLeft') === true || input?.isDown?.('KeyA') === true,
        right: input?.isDown?.('ArrowRight') === true || input?.isDown?.('KeyD') === true,
        launch: input?.isDown?.('Space') === true || input?.isDown?.('Enter') === true,
        pause: input?.isDown?.('KeyP') === true,
      },
      render: {
        stages: ['entities', 'vector-overlay'],
        debugSurfaceTail: ['debug-overlay', 'dev-console-surface'],
      },
      validation: {
        errorCount: 0,
        warningCount: 0,
      },
    };
  }

  updateDebugIntegration(engine, dt) {
    if (!this.devConsoleIntegration) {
      return;
    }

    this.devConsoleIntegration.update({
      engine,
      scene: this,
      diagnosticsContext: this.buildDebugDiagnosticsContext(engine, dt),
    });
  }

  update(dt, engine = null) {
    const engineRef = engine || this.engineRef || { input: this.inputController?.input ?? null };
    const frame = this.inputController.getFrameState();

    if (frame.exitPressed && this.isPaused) {
      this.isPaused = false;
      this.world.resetGame();
      this.updateDebugIntegration(engineRef, dt);
      return;
    }

    const canPause = this.world.status === 'playing' || this.world.status === 'serve';
    if (canPause && frame.pausePressed) {
      this.isPaused = !this.isPaused;
      this.updateDebugIntegration(engineRef, dt);
      return;
    }

    if (this.isPaused) {
      this.updateDebugIntegration(engineRef, dt);
      return;
    }

    const event = this.world.update(dt, frame);

    if (frame.servePressed && (event.served || this.world.status === 'playing')) {
      this.audio.playServe();
    }
    if (event.wallHit) {
      this.audio.playWallHit();
    }
    if (event.paddleHit) {
      this.audio.playPaddleHit();
    }
    if (event.brickHit) {
      this.audio.playBrickHit();
    }
    if (event.lifeLost || event.lost) {
      this.audio.playLoseLife();
    }
    if (event.won) {
      this.audio.playWin();
    }

    this.updateDebugIntegration(engineRef, dt);
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawWalls(renderer);
    this.drawBricks(renderer);
    this.drawHud(renderer);
    this.drawPaddle(renderer);
    this.drawBall(renderer);

    if (this.isPaused) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
      this.drawOverlay(renderer, {
        title: 'PAUSED',
        body: 'Break the wall of bricks when you are ready to resume.',
        prompt: 'Press P or Start to continue.',
      });
    } else if (this.world.status !== 'playing') {
      this.drawOverlay(renderer);
    }

    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.render(renderer, {
        worldStages: ['entities', 'vector-overlay'],
      });
    }
  }

  drawWalls(renderer) {
    renderer.drawRect(0, 0, VIEW.width, this.world.topBoundary, COLORS.wall);
    renderer.drawRect(0, 0, this.world.wallThickness, VIEW.height, COLORS.wall);
    renderer.drawRect(VIEW.width - this.world.wallThickness, 0, this.world.wallThickness, VIEW.height, COLORS.wall);
  }

  drawBricks(renderer) {
    this.world.bricks.forEach((brick) => {
      if (!brick.alive) {
        return;
      }
      renderer.drawRect(brick.x, brick.y, brick.width, brick.height, brick.color);
    });
  }

  drawHud(renderer) {
    renderer.drawText('BREAKOUT', 28, 18, {
      color: COLORS.text,
      font: 'bold 26px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Score ${this.world.score}`, 350, 18, {
      color: COLORS.text,
      font: 'bold 22px monospace',
      textBaseline: 'top',
    });
    renderer.drawText(`Lives ${this.world.lives}`, 744, 18, {
      color: COLORS.text,
      font: 'bold 22px monospace',
      textBaseline: 'top',
    });

    if (this.world.status === 'playing' || this.world.status === 'serve') {
      renderer.drawText('P pause', 928, 10, {
        color: COLORS.text,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
      renderer.drawText('X menu', 928, 30, {
        color: COLORS.text,
        font: '16px monospace',
        textAlign: 'right',
        textBaseline: 'top',
      });
    }
  }

  drawPaddle(renderer) {
    renderer.drawRect(
      this.world.paddle.x,
      this.world.paddle.y,
      this.world.paddle.width,
      this.world.paddle.height,
      COLORS.paddle,
    );
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

  drawOverlay(renderer, copy = this.getOverlayCopy()) {
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

    renderer.drawText(copy.prompt, VIEW.width / 2, 426, {
      color: COLORS.text,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  getOverlayCopy() {
    if (this.world.status === 'won') {
      return {
        title: 'YOU WIN',
        body: `Final score ${this.world.score}. Every brick is cleared.`,
        prompt: 'Press Space, Enter, or south button to play again.',
      };
    }

    if (this.world.status === 'lost') {
      return {
        title: 'GAME OVER',
        body: `Final score ${this.world.score}. The last ball slipped past the paddle.`,
        prompt: 'Press Space, Enter, or south button to restart.',
      };
    }

    if (this.world.status === 'serve') {
      return {
        title: 'READY',
        body: 'Move with Left and Right or A and D. Break every brick without letting the ball fall.',
        prompt: 'Press Space, Enter, or south button to launch.',
      };
    }

    return {
      title: 'BREAKOUT',
      body: 'Classic brick breaking with immediate paddle control, score chase, and three-ball survival.',
      prompt: 'Press Space, Enter, or south button to start.',
    };
  }
}
