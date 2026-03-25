/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import SpaceInvadersAudio from './SpaceInvadersAudio.js';
import SpaceInvadersInputController from './SpaceInvadersInputController.js';
import SpaceInvadersWorld from './SpaceInvadersWorld.js';

const VIEW = { width: 960, height: 720 };
const HUD_FONT = 'bold 24px monospace';
const TEXT_FONT = '18px monospace';

function drawAlien(renderer, alien) {
  const color = '#66ff66';
  if (alien.type === 'squid') {
    renderer.drawRect(alien.x + 8, alien.y, 8, 4, color);
    renderer.drawRect(alien.x + 4, alien.y + 4, 16, 6, color);
    renderer.drawRect(alien.x, alien.y + 10, 24, 4, color);
    renderer.drawRect(alien.x + (alien.animationFrame ? 2 : 0), alien.y + 14, 4, 4, color);
    renderer.drawRect(alien.x + 18 - (alien.animationFrame ? 2 : 0), alien.y + 14, 4, 4, color);
    return;
  }
  if (alien.type === 'crab') {
    renderer.drawRect(alien.x + 4, alien.y, 18, 4, color);
    renderer.drawRect(alien.x, alien.y + 4, 26, 6, color);
    renderer.drawRect(alien.x + 4, alien.y + 10, 18, 4, color);
    renderer.drawRect(alien.x + (alien.animationFrame ? 0 : 4), alien.y + 14, 4, 4, color);
    renderer.drawRect(alien.x + (alien.animationFrame ? 22 : 18), alien.y + 14, 4, 4, color);
    return;
  }
  renderer.drawRect(alien.x + 6, alien.y, 12, 4, color);
  renderer.drawRect(alien.x + 2, alien.y + 4, 20, 6, color);
  renderer.drawRect(alien.x, alien.y + 10, 24, 4, color);
  renderer.drawRect(alien.x + (alien.animationFrame ? 2 : 6), alien.y + 14, 4, 4, color);
  renderer.drawRect(alien.x + (alien.animationFrame ? 18 : 14), alien.y + 14, 4, 4, color);
}

export default class SpaceInvadersScene extends Scene {
  constructor() {
    super();
    this.world = new SpaceInvadersWorld(VIEW);
    this.inputController = null;
    this.audio = new SpaceInvadersAudio();
    this.isPaused = false;
  }

  enter(engine) {
    this.inputController = new SpaceInvadersInputController(engine.input);
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

    if (frame.menuPressed && this.isPaused) {
      this.world.resetGame();
      this.isPaused = false;
      return;
    }

    const pauseable = this.world.status === 'playing' || this.world.isWaveTransition;
    if (pauseable && frame.pausePressed) {
      this.isPaused = !this.isPaused;
      return;
    }

    if (this.isPaused) {
      return;
    }

    const event = this.world.update(dtSeconds, frame);
    event.sfx.forEach((effectId) => this.audio.play(effectId));
  }

  render(renderer) {
    renderer.clear('#000000');
    renderer.drawRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#020702');
    renderer.strokeRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#66ff66', 2);
    renderer.drawLine(44, this.world.player.y + 36, VIEW.width - 44, this.world.player.y + 36, '#66ff66', 2);

    renderer.drawText(`SCORE<1> ${String(this.world.score).padStart(4, '0')}`, 44, 30, {
      color: '#ffffff',
      font: HUD_FONT,
      textBaseline: 'top',
    });
    renderer.drawText(`HI-SCORE ${String(this.world.score).padStart(4, '0')}`, VIEW.width / 2, 30, {
      color: '#ffffff',
      font: HUD_FONT,
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText(`WAVE ${this.world.wave}`, VIEW.width - 44, 30, {
      color: '#ffffff',
      font: HUD_FONT,
      textAlign: 'right',
      textBaseline: 'top',
    });

    this.world.getAliveAliens().forEach((alien) => drawAlien(renderer, alien));

    if (this.world.ufo) {
      renderer.drawRect(this.world.ufo.x + 10, this.world.ufo.y, 32, 4, '#ff4d4d');
      renderer.drawRect(this.world.ufo.x + 4, this.world.ufo.y + 4, 44, 8, '#ff4d4d');
      renderer.drawRect(this.world.ufo.x, this.world.ufo.y + 12, 52, 6, '#ff4d4d');
    }

    if (this.world.player.alive) {
      const playerColor = this.world.player.invulnerabilityTimer > 0 ? '#b6ffb6' : '#66ff66';
      renderer.drawRect(this.world.player.x, this.world.player.y, this.world.player.width, 8, playerColor);
      renderer.drawRect(this.world.player.x + 12, this.world.player.y - 10, 20, 10, playerColor);
    }

    if (this.world.playerShot) {
      renderer.drawRect(this.world.playerShot.x, this.world.playerShot.y, this.world.playerShot.width, this.world.playerShot.height, '#ffffff');
    }

    this.world.alienShots.forEach((shot) => {
      renderer.drawRect(shot.x, shot.y, shot.width, shot.height, '#ff6666');
    });

    for (let index = 0; index < Math.max(0, this.world.lives - 1); index += 1) {
      const x = 44 + (index * 40);
      const y = VIEW.height - 42;
      renderer.drawRect(x, y, 28, 6, '#66ff66');
      renderer.drawRect(x + 8, y - 8, 12, 8, '#66ff66');
    }

    renderer.drawText(`${Math.max(0, this.world.lives)}`, 180, VIEW.height - 56, {
      color: '#66ff66',
      font: HUD_FONT,
      textBaseline: 'top',
    });

    renderer.drawText('LEFT/RIGHT MOVE  SPACE FIRE  P PAUSE', VIEW.width / 2, VIEW.height - 44, {
      color: '#8df58d',
      font: TEXT_FONT,
      textAlign: 'center',
      textBaseline: 'top',
    });

    if (this.world.status === 'menu') {
      this.drawOverlay(renderer, 'SPACE INVADERS', 'Press Space or Enter to start.');
    } else if (this.world.status === 'game-over') {
      this.drawOverlay(renderer, 'GAME OVER', 'Press Space or Enter to restart.');
    } else if (this.world.isWaveTransition) {
      this.drawOverlay(renderer, `WAVE ${this.world.wave}`, 'Next formation incoming.');
    } else if (this.isPaused) {
      this.drawOverlay(renderer, 'PAUSED', 'Press P to resume or X for menu.');
    }
  }

  drawOverlay(renderer, title, prompt) {
    renderer.drawRect(210, 268, 540, 150, 'rgba(0, 0, 0, 0.84)');
    renderer.strokeRect(210, 268, 540, 150, '#66ff66', 2);
    renderer.drawText(title, VIEW.width / 2, 308, {
      color: '#ffffff',
      font: 'bold 34px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText(prompt, VIEW.width / 2, 360, {
      color: '#8df58d',
      font: TEXT_FONT,
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
