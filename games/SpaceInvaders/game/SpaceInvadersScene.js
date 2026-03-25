/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import SpaceInvadersAudio from './SpaceInvadersAudio.js';
import SpaceInvadersInputController from './SpaceInvadersInputController.js';
import {
  ALIEN_DYING_FRAMES,
  PLAYER_DYING_FRAMES,
  PLAYER_LIVING_FRAMES,
  SPRITES_BY_TYPE,
} from './SpaceInvadersSpriteData.js';
import SpaceInvadersWorld from './SpaceInvadersWorld.js';

const VIEW = { width: 960, height: 720 };
const HUD_FONT = 'bold 24px monospace';
const TEXT_FONT = '18px monospace';
const ALIEN_PIXEL_SIZE = 3;
const PLAYER_PIXEL_SIZE = 3;
const ALIEN_DEATH_DURATION = 0.28;
const PLAYER_DEATH_DURATION = 0.5;

function getBitmapWidth(frame) {
  return frame?.[0]?.length ?? 0;
}

function drawBitmap(renderer, frame, x, y, pixelSize, color) {
  if (!frame) {
    return;
  }

  frame.forEach((row, rowIndex) => {
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (row[columnIndex] !== '1') {
        continue;
      }
      renderer.drawRect(
        x + (columnIndex * pixelSize),
        y + (rowIndex * pixelSize),
        pixelSize,
        pixelSize,
        color,
      );
    }
  });
}

function getAlienFrame(alien) {
  const frames = SPRITES_BY_TYPE[alien.type] ?? SPRITES_BY_TYPE.octopus;
  return frames[alien.animationFrame % frames.length];
}

function getAlienDeathFrame(elapsed) {
  const index = Math.min(
    ALIEN_DYING_FRAMES.length - 1,
    Math.floor((elapsed / ALIEN_DEATH_DURATION) * ALIEN_DYING_FRAMES.length),
  );
  return ALIEN_DYING_FRAMES[index];
}

function getPlayerDeathFrame(elapsed) {
  const index = Math.min(
    PLAYER_DYING_FRAMES.length - 1,
    Math.floor((elapsed / PLAYER_DEATH_DURATION) * PLAYER_DYING_FRAMES.length),
  );
  return PLAYER_DYING_FRAMES[index];
}

function drawAlien(renderer, alien) {
  const frame = getAlienFrame(alien);
  drawBitmap(renderer, frame, alien.x, alien.y, ALIEN_PIXEL_SIZE, '#66ff66');
}

function drawAlienDeath(renderer, death) {
  const frame = getAlienDeathFrame(death.elapsed);
  drawBitmap(renderer, frame, death.x, death.y + 2, ALIEN_PIXEL_SIZE, '#d7ffd7');
}

function drawPlayer(renderer, player) {
  const frame = PLAYER_LIVING_FRAMES[0];
  drawBitmap(renderer, frame, player.x - 4, player.y - 20, PLAYER_PIXEL_SIZE, player.invulnerabilityTimer > 0 ? '#b6ffb6' : '#66ff66');
}

function drawPlayerDeath(renderer, death) {
  const frame = getPlayerDeathFrame(death.elapsed);
  drawBitmap(renderer, frame, death.x - 4, death.y, PLAYER_PIXEL_SIZE, '#d7ffd7');
}

function drawUfo(renderer, ufo) {
  renderer.drawRect(ufo.x + 10, ufo.y, 32, 4, '#ff4d4d');
  renderer.drawRect(ufo.x + 4, ufo.y + 4, 44, 8, '#ff4d4d');
  renderer.drawRect(ufo.x, ufo.y + 12, 52, 6, '#ff4d4d');
  renderer.drawRect(ufo.x + 18, ufo.y + 18, 6, 4, '#ff4d4d');
  renderer.drawRect(ufo.x + 28, ufo.y + 18, 6, 4, '#ff4d4d');
}

function drawLives(renderer, lives) {
  const frame = PLAYER_LIVING_FRAMES[0];
  for (let index = 0; index < Math.max(0, lives - 1); index += 1) {
    drawBitmap(renderer, frame, 44 + (index * 58), VIEW.height - 76, 2, '#66ff66');
  }
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
    this.world.alienDeaths.forEach((death) => drawAlienDeath(renderer, death));

    if (this.world.ufo) {
      drawUfo(renderer, this.world.ufo);
    }

    if (this.world.player.alive) {
      drawPlayer(renderer, this.world.player);
    }

    if (this.world.playerDeath) {
      drawPlayerDeath(renderer, this.world.playerDeath);
    }

    if (this.world.playerShot) {
      renderer.drawRect(this.world.playerShot.x, this.world.playerShot.y, this.world.playerShot.width, this.world.playerShot.height, '#ffffff');
    }

    this.world.alienShots.forEach((shot) => {
      renderer.drawRect(shot.x, shot.y, shot.width, shot.height, '#ff6666');
    });

    drawLives(renderer, this.world.lives);

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
