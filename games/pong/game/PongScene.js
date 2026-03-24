/*
Toolbox Aid
David Quesenberry
03/24/2026
PongScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import PongControls from './PongControls.js';
import PongWorld, { PONG_MODE_LIST } from './PongWorld.js';

function wrapIndex(index, length) {
  if (length <= 0) {
    return 0;
  }
  return ((index % length) + length) % length;
}

export default class PongScene extends Scene {
  constructor() {
    super();
    this.world = new PongWorld({ width: 960, height: 720 });
    this.controls = new PongControls();
    this.phase = 'menu';
    this.selectedModeIndex = 0;
    this.lastMenuUp = false;
    this.lastMenuDown = false;
  }

  startSelectedMode() {
    const mode = PONG_MODE_LIST[this.selectedModeIndex] ?? PONG_MODE_LIST[0];
    this.world.setMode(mode.key);
    this.phase = 'playing';
  }

  update(dtSeconds, engine) {
    const menuInput = this.controls.readMenu(engine.input);

    if (this.phase === 'menu') {
      const menuUp = menuInput.moveY < -0.6;
      const menuDown = menuInput.moveY > 0.6;

      if (menuUp && !this.lastMenuUp) {
        this.selectedModeIndex = wrapIndex(this.selectedModeIndex - 1, PONG_MODE_LIST.length);
      }

      if (menuDown && !this.lastMenuDown) {
        this.selectedModeIndex = wrapIndex(this.selectedModeIndex + 1, PONG_MODE_LIST.length);
      }

      this.lastMenuUp = menuUp;
      this.lastMenuDown = menuDown;

      if (menuInput.confirmPressed) {
        this.startSelectedMode();
      }
      return;
    }

    const gameplayInput = this.controls.readGameplay(engine.input, {
      allowHorizontal: this.world.mode.allowHorizontal,
    });

    if (gameplayInput.backPressed) {
      this.phase = 'menu';
      return;
    }

    this.world.update(dtSeconds, gameplayInput);

    if ((this.world.status === 'won' || this.world.status === 'lost') && gameplayInput.confirmPressed) {
      this.world.resetMatch();
    }
  }

  render(renderer) {
    renderer.clear('#06111b');
    renderer.drawRect(20, 20, this.world.width - 40, this.world.height - 40, this.world.mode.arenaColor);
    renderer.strokeRect(20, 20, this.world.width - 40, this.world.height - 40, this.world.mode.accent, 2);

    this.renderArenaLines(renderer);
    this.renderTrail(renderer);
    this.renderPaddles(renderer);
    this.renderBall(renderer);
    this.renderHud(renderer);

    if (this.phase === 'menu') {
      this.renderMenu(renderer);
      return;
    }

    if (this.world.status !== 'playing') {
      this.renderOverlay(renderer);
    }
  }

  renderArenaLines(renderer) {
    if (this.world.mode.goalType === 'goal-mouth') {
      const goals = this.world.getGoalBounds();
      renderer.drawRect(goals.left.x + 20, goals.left.y + 20, 12, goals.left.height, 'rgba(147, 197, 253, 0.3)');
      renderer.drawRect(goals.right.x + 18, goals.right.y + 20, 12, goals.right.height, 'rgba(147, 197, 253, 0.3)');
      renderer.strokeRect((this.world.width * 0.5) - 1, 24, 2, this.world.height - 48, 'rgba(255,255,255,0.18)', 1);
      return;
    }

    if (this.world.mode.goalType === 'front-wall') {
      renderer.drawRect(this.world.width - 38, 22, 16, this.world.height - 44, 'rgba(251, 191, 36, 0.15)');
      renderer.strokeRect(this.world.width - 38, 22, 16, this.world.height - 44, this.world.mode.accent, 1);
      return;
    }

    for (let y = 34; y < this.world.height - 34; y += 28) {
      renderer.drawRect((this.world.width * 0.5) - 2, y, 4, 16, 'rgba(255,255,255,0.18)');
    }
  }

  renderTrail(renderer) {
    for (let index = 1; index < this.world.trail.length; index += 1) {
      const previous = this.world.trail[index - 1];
      const current = this.world.trail[index];
      renderer.drawLine(
        previous.x,
        previous.y,
        current.x,
        current.y,
        `rgba(255, 255, 255, ${index / (this.world.trail.length * 2.6)})`,
        2,
      );
    }
  }

  renderPaddles(renderer) {
    renderer.drawRect(
      this.world.player.x - (this.world.player.width * 0.5),
      this.world.player.y - (this.world.player.height * 0.5),
      this.world.player.width,
      this.world.player.height,
      '#f8fafc',
    );

    if (!this.world.opponent) {
      return;
    }

    renderer.drawRect(
      this.world.opponent.x - (this.world.opponent.width * 0.5),
      this.world.opponent.y - (this.world.opponent.height * 0.5),
      this.world.opponent.width,
      this.world.opponent.height,
      '#cbd5e1',
    );
  }

  renderBall(renderer) {
    renderer.drawCircle(this.world.ball.x, this.world.ball.y, this.world.ball.radius + 2, 'rgba(255,255,255,0.15)');
    renderer.drawCircle(this.world.ball.x, this.world.ball.y, this.world.ball.radius, this.world.mode.accent);
  }

  renderHud(renderer) {
    renderer.drawText(`MODE ${this.world.mode.title.toUpperCase()}`, 36, 44, {
      color: '#f8fafc',
      font: '24px monospace',
    });

    if (this.world.mode.hasOpponent) {
      renderer.drawText(`${this.world.scores[0]}`, 416, 44, {
        color: '#f8fafc',
        font: '34px monospace',
        textAlign: 'center',
      });
      renderer.drawText(`${this.world.scores[1]}`, 544, 44, {
        color: '#cbd5e1',
        font: '34px monospace',
        textAlign: 'center',
      });
    } else {
      renderer.drawText(`SCORE ${this.world.scores[0]}`, 700, 44, {
        color: '#f8fafc',
        font: '24px monospace',
      });
      renderer.drawText(`LIVES ${this.world.playerLives}`, 700, 74, {
        color: '#f8fafc',
        font: '24px monospace',
      });
    }

    renderer.drawText(this.world.statusMessage, 36, 692, {
      color: '#cbd5e1',
      font: '18px monospace',
    });
  }

  renderMenu(renderer) {
    renderer.drawRect(160, 88, 640, 544, 'rgba(3, 10, 18, 0.9)');
    renderer.strokeRect(160, 88, 640, 544, '#7dd3fc', 2);
    renderer.drawText('PONG', 480, 138, {
      color: '#f8fafc',
      font: '40px monospace',
      textAlign: 'center',
    });
    renderer.drawText('Choose a ruleset and launch.', 480, 172, {
      color: '#cbd5e1',
      font: '18px monospace',
      textAlign: 'center',
    });

    PONG_MODE_LIST.forEach((mode, index) => {
      const isSelected = index === this.selectedModeIndex;
      const y = 228 + (index * 82);
      renderer.drawRect(210, y, 540, 62, isSelected ? 'rgba(125, 211, 252, 0.16)' : 'rgba(255,255,255,0.03)');
      renderer.strokeRect(210, y, 540, 62, isSelected ? mode.accent : 'rgba(255,255,255,0.14)', isSelected ? 2 : 1);
      renderer.drawText(mode.title, 236, y + 24, {
        color: '#f8fafc',
        font: '22px monospace',
      });
      renderer.drawText(mode.description, 236, y + 48, {
        color: '#cbd5e1',
        font: '14px monospace',
      });
    });

    renderer.drawText('Arrow keys / stick to choose. Enter / A to play.', 480, 590, {
      color: '#cbd5e1',
      font: '16px monospace',
      textAlign: 'center',
    });
  }

  renderOverlay(renderer) {
    renderer.drawRect(232, 272, 496, 156, 'rgba(4, 10, 18, 0.88)');
    renderer.strokeRect(232, 272, 496, 156, this.world.mode.accent, 2);
    const title = this.world.status === 'serve'
      ? 'READY'
      : this.world.status === 'won'
        ? 'MATCH WON'
        : 'MATCH LOST';
    const hint = this.world.status === 'serve'
      ? 'Press Enter, Space, or A to serve.'
      : 'Press Enter or A to restart. Esc or B returns to menu.';

    renderer.drawText(title, 480, 324, {
      color: '#f8fafc',
      font: '32px monospace',
      textAlign: 'center',
    });
    renderer.drawText(this.world.statusMessage, 480, 360, {
      color: '#cbd5e1',
      font: '18px monospace',
      textAlign: 'center',
    });
    renderer.drawText(hint, 480, 394, {
      color: '#cbd5e1',
      font: '16px monospace',
      textAlign: 'center',
    });
  }
}
