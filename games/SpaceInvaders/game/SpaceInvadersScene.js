/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import SpaceInvadersAudio from './SpaceInvadersAudio.js';
import { getFontGlyph } from './font8x8.js';
import SpaceInvadersInputController from './SpaceInvadersInputController.js';
import {
  ALIEN_DYING_FRAMES,
  BOMB_DYING_FRAMES,
  BOMB_SPRITES_BY_TYPE,
  PLAYER_DYING_FRAMES,
  PLAYER_LASER_LIVING_FRAMES,
  PLAYER_LIVING_FRAMES,
  SPRITES_BY_TYPE,
  UFO_DYING_FRAMES,
  UFO_LIVING_FRAMES,
} from './SpaceInvadersSpriteData.js';
import SpaceInvadersWorld from './SpaceInvadersWorld.js';

const VIEW = { width: 960, height: 720 };
const ALIEN_PIXEL_SIZE = 3;
const BOMB_PIXEL_SIZE = 3;
const PLAYER_PIXEL_SIZE = 3;
const ALIEN_DEATH_DURATION = 0.28;
const BOMB_DEATH_DURATION = 0.28;
const PLAYER_DEATH_DURATION = 0.5;
const UFO_DEATH_DURATION = 0.36;
const FONT_SCALE_HUD = 2;
const FONT_SCALE_OVERLAY = 3;
const FONT_SCALE_SMALL = 2;
const DEBUG_BOX_COLOR = '#39ff14';

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

function measurePixelText(text, scale = FONT_SCALE_HUD) {
  const characters = Array.from(String(text ?? ''));
  const glyphWidth = 8 * scale;
  const gap = scale;
  return Math.max(0, (characters.length * glyphWidth) + (Math.max(0, characters.length - 1) * gap));
}

function drawPixelText(renderer, text, x, y, {
  color = '#ffffff',
  scale = FONT_SCALE_HUD,
  align = 'left',
} = {}) {
  const content = String(text ?? '').toUpperCase();
  const textWidth = measurePixelText(content, scale);
  const glyphWidth = 8 * scale;
  const gap = scale;
  let drawX = x;

  if (align === 'center') {
    drawX -= textWidth / 2;
  } else if (align === 'right') {
    drawX -= textWidth;
  }

  Array.from(content).forEach((character, index) => {
    drawBitmap(renderer, getFontGlyph(character), drawX + (index * (glyphWidth + gap)), y, scale, color);
  });
}

function wrapPixelText(text, maxWidth, scale = FONT_SCALE_SMALL) {
  const words = String(text ?? '').toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (measurePixelText(next, scale) > maxWidth && current) {
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

function getBombFrame(bomb) {
  const frames = BOMB_SPRITES_BY_TYPE[bomb.type] ?? BOMB_SPRITES_BY_TYPE.bomb1;
  return frames[bomb.animationFrame % frames.length];
}

function getBombDeathFrame(elapsed) {
  const index = Math.min(
    BOMB_DYING_FRAMES.length - 1,
    Math.floor((elapsed / BOMB_DEATH_DURATION) * BOMB_DYING_FRAMES.length),
  );
  return BOMB_DYING_FRAMES[index];
}

function getUfoDeathFrame(elapsed) {
  const index = Math.min(
    UFO_DYING_FRAMES.length - 1,
    Math.floor((elapsed / UFO_DEATH_DURATION) * UFO_DYING_FRAMES.length),
  );
  return UFO_DYING_FRAMES[index];
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
  drawBitmap(renderer, UFO_LIVING_FRAMES[0], ufo.x, ufo.y, ALIEN_PIXEL_SIZE, '#ff4d4d');
}

function drawUfoDeath(renderer, death) {
  drawBitmap(renderer, getUfoDeathFrame(death.elapsed), death.x, death.y, ALIEN_PIXEL_SIZE, '#ffd1d1');
}

function drawBomb(renderer, bomb) {
  drawBitmap(renderer, getBombFrame(bomb), bomb.x, bomb.y, BOMB_PIXEL_SIZE, '#ff6666');
}

function drawBombDeath(renderer, death) {
  drawBitmap(renderer, getBombDeathFrame(death.elapsed), death.x, death.y, BOMB_PIXEL_SIZE, '#ffd1d1');
}

function drawLives(renderer, lives, y) {
  const frame = PLAYER_LIVING_FRAMES[0];
  for (let index = 0; index < Math.max(0, lives - 1); index += 1) {
    drawBitmap(renderer, frame, 44 + (index * 58), y, 2, '#66ff66');
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
    this.audio.stopUfoLoop();
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
    if (this.world.ufo) {
      this.audio.startUfoLoop(this.world.ufoDirection);
    } else {
      this.audio.stopUfoLoop();
    }
  }

  render(renderer) {
    const boundaryY = this.world.player.y + 21;
    renderer.clear('#000000');
    renderer.drawRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#020702');
    renderer.strokeRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#66ff66', 2);
    renderer.drawLine(44, boundaryY, VIEW.width - 44, boundaryY, '#66ff66', 2);

    const scoreColorText = '#d0d0d0';
    drawPixelText(renderer, 'PLAYER 1', 84, 34, { color: scoreColorText, scale: FONT_SCALE_HUD });
    drawPixelText(renderer, 'HI-SCORE', VIEW.width / 2, 34, { color: scoreColorText, scale: FONT_SCALE_HUD, align: 'center' });
    drawPixelText(renderer, 'PLAYER 2', VIEW.width - 84, 34, { color: scoreColorText, scale: FONT_SCALE_HUD, align: 'right' });

    const scoreColor = '#fbbf24';
    drawPixelText(renderer, String(this.world.score).padStart(4, '0'), 112, 56, { color: scoreColor, scale: FONT_SCALE_HUD });
    drawPixelText(renderer, String(this.world.score).padStart(4, '0'), VIEW.width / 2, 56, { color: scoreColor, scale: FONT_SCALE_HUD, align: 'center' });
    drawPixelText(renderer, '0000', VIEW.width - 112, 56, { color: scoreColor, scale: FONT_SCALE_HUD, align: 'right' });

    this.world.getAliveAliens().forEach((alien) => drawAlien(renderer, alien));
    this.world.alienDeaths.forEach((death) => drawAlienDeath(renderer, death));

    if (this.world.ufo) {
      drawUfo(renderer, this.world.ufo);
    }
    if (this.world.ufoDeath) {
      drawUfoDeath(renderer, this.world.ufoDeath);
    }

    if (this.world.player.alive) {
      drawPlayer(renderer, this.world.player);
    }

    if (this.world.playerDeath) {
      drawPlayerDeath(renderer, this.world.playerDeath);
    }

    if (this.world.playerShot) {
      drawBitmap(renderer, PLAYER_LASER_LIVING_FRAMES, this.world.playerShot.x, this.world.playerShot.y, PLAYER_PIXEL_SIZE, '#ffffff');
    }

    this.world.alienShots.forEach((shot) => {
      drawBomb(renderer, shot);
    });
    this.world.bombDeaths.forEach((death) => drawBombDeath(renderer, death));

    if (this.world.debugBoxes) {
      const stroke = (x, y, w, h) => renderer.strokeRect(x, y, w, h, DEBUG_BOX_COLOR, 1);
      if (this.world.player.alive) {
        stroke(this.world.player.x, this.world.player.y - 20, this.world.player.width, this.world.player.height);
      }
      if (this.world.playerShot) {
        stroke(this.world.playerShot.x, this.world.playerShot.y, this.world.playerShot.width, this.world.playerShot.height);
      }
      this.world.getAliveAliens().forEach((alien) => {
        stroke(alien.x, alien.y, alien.width, alien.height);
      });
      this.world.alienShots.forEach((shot) => {
        stroke(shot.x, shot.y, shot.width, shot.height);
      });
      if (this.world.ufo) {
        stroke(this.world.ufo.x, this.world.ufo.y, this.world.ufo.width, this.world.ufo.height);
      }
    }

    drawLives(renderer, this.world.lives, boundaryY + 12);

    drawPixelText(renderer, `${Math.max(0, this.world.lives)}`, 180, boundaryY + 10, {
      color: '#66ff66',
      scale: FONT_SCALE_HUD,
    });
    drawPixelText(renderer, `WAVE ${this.world.wave}`, VIEW.width - 44, boundaryY + 10, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'right',
    });
    // control hint now shown only in overlays

    const showOverlay = this.isPaused || this.world.status === 'menu' || this.world.status === 'game-over' || this.world.isWaveTransition;

    // Dim first so overlays render above the darkness.
    if (showOverlay) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
    }

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
    const boxX = 210;
    const boxY = 268; // move up 20px
    const boxW = 540;
    const boxH = 180; // increase height by 30px
    renderer.drawRect(boxX, boxY, boxW, boxH, 'rgba(0, 0, 0, 0.84)');
    renderer.strokeRect(boxX, boxY, boxW, boxH, '#66ff66', 2);
    drawPixelText(renderer, title, VIEW.width / 2, 284, {
      color: '#ffffff',
      scale: FONT_SCALE_OVERLAY,
      align: 'center',
    });
    wrapPixelText(prompt, 480, FONT_SCALE_SMALL).forEach((line, index) => {
      drawPixelText(renderer, line, VIEW.width / 2, 332 + (index * 18), {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
    });
    drawPixelText(renderer, 'LEFT/RIGHT MOVE', VIEW.width / 2, 376, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
    drawPixelText(renderer, 'SPACE FIRE  P PAUSE', VIEW.width / 2, 394, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
    drawPixelText(renderer, 'PRESS START', VIEW.width / 2, 418, {
      color: '#ffffff',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
  }
}
