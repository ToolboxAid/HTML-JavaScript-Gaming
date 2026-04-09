/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersScene.js
*/
import { AttractModeController, Scene } from '/src/engine/scenes/index.js';
import SpaceInvadersAudio from './SpaceInvadersAudio.js';
import { getFontGlyph } from './font8x8.js';
import SpaceInvadersHighScoreService from './SpaceInvadersHighScoreService.js';
import SpaceInvadersInputController from './SpaceInvadersInputController.js';
import SpaceInvadersInitialsEntry from './SpaceInvadersInitialsEntry.js';
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
import PlayerManager from './PlayerManager.js';
import UfoController from './UfoController.js';
import WaveController from './WaveController.js';

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
const ATTRACT_PHASES = ['title', 'highScores', 'demo'];

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
    drawBitmap(renderer, frame, 60 + (index * 52), y, 2, '#66ff66');
  }
}

function drawCenterBanner(renderer, title, subtitle = '') {
  drawPixelText(renderer, title, VIEW.width / 2, 116, {
    color: '#ffffff',
    scale: FONT_SCALE_OVERLAY,
    align: 'center',
  });
  if (subtitle) {
    drawPixelText(renderer, subtitle, VIEW.width / 2, 148, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
  }
}

export default class SpaceInvadersScene extends Scene {
  constructor() {
    super();
    this.world = new SpaceInvadersWorld(VIEW);
    this.highScoreService = new SpaceInvadersHighScoreService();
    this.highScoreRows = this.highScoreService.loadTable();
    this.world.hiScore = this.highScoreService.getTopScore(this.highScoreRows);
    this.initialsEntry = new SpaceInvadersInitialsEntry();
    this.didCheckGameOverQualifying = false;
    this.inputController = null;
    this.audio = new SpaceInvadersAudio();
    this.playerManager = new PlayerManager({ world: this.world });
    this.ufoController = new UfoController({ world: this.world, audio: this.audio });
    this.waveController = new WaveController({ world: this.world });
    this.isPaused = false;
    this.currentFrame = null;
    this.attractDemoTime = 0;
    this.attractController = new AttractModeController({
      phases: ATTRACT_PHASES,
      isInputActive: () => this.isAttractExitInputActive(),
    });
  }

  enter(engine) {
    this.inputController = new SpaceInvadersInputController(engine.input);
    this.world.resetGame();
    this.world.hiScore = this.highScoreService.getTopScore(this.highScoreRows);
    this.initialsEntry.cancel();
    this.didCheckGameOverQualifying = false;
    this.isPaused = false;
    this.currentFrame = null;
    this.attractDemoTime = 0;
    this.attractController.exitAttract();
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'none';
    }
  }

  exit(engine) {
    this.ufoController.stopLoop();
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'default';
    }
  }

  update(dtSeconds) {
    this.playerManager.world = this.world;
    this.waveController.world = this.world;
    this.ufoController.world = this.world;
    this.ufoController.audio = this.audio;

    const frame = this.inputController.getFrameState();
    this.currentFrame = frame;

    if (this.initialsEntry.active) {
      const result = this.initialsEntry.update(this.inputController?.input);
      if (result.confirmed) {
        this.finishInitialsEntry(result);
      }
      this.ufoController.stopLoop();
      return;
    }

    const attractEligible = this.world.status === 'menu' || this.world.status === 'game-over';
    if (attractEligible) {
      this.attractController.update(dtSeconds);
      if (this.attractController.active) {
        this.attractDemoTime += dtSeconds;
        this.ufoController.stopLoop();
        return;
      }
    } else if (this.attractController.active) {
      this.attractController.exitAttract();
    }

    if (frame.menuPressed && this.isPaused) {
      this.world.resetGame();
      this.isPaused = false;
      this.ufoController.stopLoop();
      return;
    }

    const pauseable = this.world.status === 'playing' || this.world.isWaveTransition;
    if (pauseable && frame.pausePressed) {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.ufoController.stopLoop();
      }
      return;
    }

    if (this.isPaused) {
      return;
    }

    const event = this.world.update(dtSeconds, frame);

    if (this.world.status === 'playing') {
      this.didCheckGameOverQualifying = false;
    }
    if (this.world.status === 'game-over' && !this.didCheckGameOverQualifying) {
      this.didCheckGameOverQualifying = true;
      this.tryBeginInitialsEntry();
      if (this.initialsEntry.active) {
        this.ufoController.stopLoop();
        return;
      }
    }

    this.ufoController.playSfx(event);
    this.ufoController.syncLoop({ isPaused: this.isPaused });
  }

  getQualifyingPlayerScore() {
    if (!Array.isArray(this.world.players) || !this.world.players.length) {
      return null;
    }

    return this.world.players.reduce((best, player, index) => (
      !best || player.score > best.score
        ? { playerId: index + 1, score: player.score }
        : best
    ), null);
  }

  tryBeginInitialsEntry() {
    const candidate = this.getQualifyingPlayerScore();
    if (!candidate || candidate.score <= 0) {
      return false;
    }

    const qualifyingIndex = this.highScoreService.getQualifyingIndex(candidate.score, this.highScoreRows);
    if (qualifyingIndex < 0) {
      return false;
    }

    this.initialsEntry.begin(candidate);
    return true;
  }

  finishInitialsEntry(result) {
    this.highScoreRows = this.highScoreService.insertScore({
      initials: result.initials,
      score: result.score,
    }, this.highScoreRows);
    this.world.hiScore = this.highScoreService.getTopScore(this.highScoreRows);
    this.initialsEntry.cancel();
    this.world.resetGame();
    this.world.hiScore = this.highScoreService.getTopScore(this.highScoreRows);
    this.attractController.resetIdle();
    this.didCheckGameOverQualifying = false;
  }

  isAttractExitInputActive() {
    if (!this.currentFrame) {
      return false;
    }

    return Boolean(
      this.currentFrame.startPressed
      || this.currentFrame.firePressed
      || this.currentFrame.menuPressed
      || this.currentFrame.pausePressed
      || this.currentFrame.select1Pressed
      || this.currentFrame.select2Pressed
      || Math.abs(Number(this.currentFrame.moveAxis) || 0) > 0.01,
    );
  }

  render(renderer) {
    if (this.attractController.active) {
      this.renderAttract(renderer);
      return;
    }

    const boundaryY = this.waveController.getBoundaryY();
    const hud = this.playerManager.getHudSnapshot();
    const scoreColorText = '#d0d0d0';
    const scoreColor = '#fbbf24';
    const player1ScoreColor = hud.player1ScoreVisible ? scoreColor : '#000000';
    const player2ScoreColor = hud.player2ScoreVisible ? scoreColor : '#000000';
    renderer.clear('#000000');
    renderer.drawRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#020702');
    renderer.strokeRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#66ff66', 2);

    const ctx = renderer?.ctx;
    if (ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(24, 24, VIEW.width - 48, VIEW.height - 48);
      ctx.clip();
    }

    drawPixelText(renderer, 'PLAYER<1>', 84, 34, {
      color: hud.currentPlayerIndex === 0 ? '#ffffff' : scoreColorText,
      scale: FONT_SCALE_HUD,
    });
    drawPixelText(renderer, 'HI-SCORE', VIEW.width / 2, 34, { color: scoreColorText, scale: FONT_SCALE_HUD, align: 'center' });
    drawPixelText(renderer, 'PLAYER<2>', VIEW.width - 84, 34, {
      color: hud.currentPlayerIndex === 1 ? '#ffffff' : scoreColorText,
      scale: FONT_SCALE_HUD,
      align: 'right',
    });

    drawPixelText(renderer, hud.player1Score, 112, 56, { color: player1ScoreColor, scale: FONT_SCALE_HUD });
    drawPixelText(renderer, hud.hiScore, VIEW.width / 2, 56, { color: scoreColor, scale: FONT_SCALE_HUD, align: 'center' });
    drawPixelText(renderer, hud.player2Score, VIEW.width - 112, 56, { color: player2ScoreColor, scale: FONT_SCALE_HUD, align: 'right' });

    if (this.world.ground) {
      drawBitmap(renderer, this.world.ground.frame, this.world.ground.x, this.world.ground.y, this.world.ground.pixelSize, '#66ff66');
    }
    this.world.shields.forEach((shield) => {
      drawBitmap(renderer, shield.frame, shield.x, shield.y, shield.pixelSize, '#66ff66');
    });

    const aliveAliens = this.world.getAliveAliens();
    aliveAliens.forEach((alien) => drawAlien(renderer, alien));
    this.world.alienDeaths.forEach((death) => drawAlienDeath(renderer, death));

    if (this.world.ufo) {
      drawUfo(renderer, this.world.ufo);
      if (this.world.debugBoxes) {
        const loop = this.audio?.ufoLoop;
        const loopState = !loop
          ? 'none'
          : loop.paused
            ? 'paused'
            : loop.ended
              ? 'ended'
              : 'playing';
        const label = `UFO AUDIO: ${loopState}${this.audio?.muted ? ' (muted)' : ''}`;
        drawPixelText(renderer, label, this.world.ufo.x + (this.world.ufo.width / 2), this.world.ufo.y + this.world.ufo.height + 6, {
          color: '#ffffff',
          scale: FONT_SCALE_SMALL,
          align: 'center',
        });
      }
    }
    if (this.world.ufoDeath) {
      drawUfoDeath(renderer, this.world.ufoDeath);
    }
    this.world.ufoScorePopups.forEach((popup) => {
      if (popup.visibleDelay <= 0) {
        drawPixelText(renderer, String(popup.value), popup.x + 8, popup.y - 12, {
          color: '#ffffff',
          scale: FONT_SCALE_SMALL,
          align: 'center',
        });
      }
    });

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
      this.world.shields.forEach((shield) => stroke(shield.x, shield.y, shield.width, shield.height));
      if (this.world.ground) {
        stroke(this.world.ground.x, this.world.ground.y, this.world.ground.width, this.world.ground.height);
      }
    }

    drawLives(renderer, hud.lives, boundaryY + 12);

    drawPixelText(renderer, `${hud.lives}`, 32, boundaryY + 17, {
      color: '#66ff66',
      scale: FONT_SCALE_HUD,
    });
    drawPixelText(renderer, this.waveController.getBottomHudWaveText(), VIEW.width - 44, boundaryY + 10, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'right',
    });
    const overlay = this.initialsEntry.active ? null : this.playerManager.getOverlayState({ isPaused: this.isPaused });
    const showOverlay = Boolean(overlay);

    if (showOverlay) {
      renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.5)');
    }

    if (overlay) {
      this.drawOverlay(
        renderer,
        overlay.title,
        overlay.prompt,
        overlay.lines,
        overlay.textOffsetY,
        overlay.startOffsetY,
        overlay.controlsOffsetY,
      );
    } else {
      const banner = this.waveController.getCenterBanner();
      if (banner) {
      drawCenterBanner(
        renderer,
        banner.title,
        banner.subtitle,
      );
      }
    }

    if (this.initialsEntry.active) {
      this.drawInitialsEntry(renderer);
    }

    if (ctx) {
      ctx.restore();
    }
  }

  renderAttract(renderer) {
    const phase = this.attractController.phase;
    renderer.clear('#000000');
    renderer.drawRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#020702');
    renderer.strokeRect(24, 24, VIEW.width - 48, VIEW.height - 48, '#66ff66', 2);
    renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.74)');

    if (phase === 'title') {
      drawPixelText(renderer, 'SPACE INVADERS', VIEW.width / 2, 164, {
        color: '#ffffff',
        scale: FONT_SCALE_OVERLAY,
        align: 'center',
      });
      drawPixelText(renderer, 'PRESS 1 OR 2 TO START', VIEW.width / 2, 244, {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      drawPixelText(renderer, 'IDLE ATTRACT MODE', VIEW.width / 2, 282, {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      drawPixelText(renderer, 'ANY GAME INPUT EXITS ATTRACT', VIEW.width / 2, 320, {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      return;
    }

    if (phase === 'highScores') {
      drawPixelText(renderer, 'HIGH SCORES', VIEW.width / 2, 130, {
        color: '#ffffff',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      this.highScoreRows.forEach((row, index) => {
        const y = 182 + (index * 40);
        drawPixelText(renderer, `${index + 1}. ${row.initials}`, 302, y, {
          color: '#8df58d',
          scale: FONT_SCALE_SMALL,
        });
        drawPixelText(renderer, String(row.score).padStart(4, '0'), 658, y, {
          color: '#fbbf24',
          scale: FONT_SCALE_SMALL,
          align: 'right',
        });
      });
      drawPixelText(renderer, 'SCORE ADVANCE TABLE', VIEW.width / 2, 414, {
        color: '#ffffff',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      drawPixelText(renderer, 'SQUID 10  CRAB 20  OCTOPUS 30', VIEW.width / 2, 448, {
        color: '#66ff66',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      drawPixelText(renderer, 'UFO 50 100 150 300', VIEW.width / 2, 480, {
        color: '#ff8b8b',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      drawPixelText(renderer, 'PRESS 1 OR 2 TO START', VIEW.width / 2, 524, {
        color: '#ffffff',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      return;
    }

    if (phase === 'demo') {
      drawPixelText(renderer, 'DEMO LOOP', VIEW.width / 2, 144, {
        color: '#ffffff',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });

      const shipX = 480 + Math.cos(this.attractDemoTime * 0.8) * 190;
      const shipY = 420;// + Math.sin(this.attractDemoTime * 1.2) * 52;
      const ufoX = 480 + Math.sin(this.attractDemoTime * 0.45) * 280;
      drawBitmap(renderer, PLAYER_LIVING_FRAMES[0], shipX, shipY, PLAYER_PIXEL_SIZE, '#66ff66');
      drawBitmap(renderer, UFO_LIVING_FRAMES[0], ufoX, 214, ALIEN_PIXEL_SIZE, '#ff4d4d');

      drawPixelText(renderer, 'PRESS 1 OR 2 TO START', VIEW.width / 2, 510, {
        color: '#ffffff',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
      drawPixelText(renderer, 'ANY GAME INPUT EXITS ATTRACT', VIEW.width / 2, 548, {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
    }
  }

  drawOverlay(renderer, title, prompt, extraLines = [], textOffsetY = 0, startOffsetY = 0, controlsOffsetY = 0) {
    const boxX = 210;
    const boxY = 252;
    const boxW = 540;
    const boxH = 212;
    renderer.drawRect(boxX, boxY, boxW, boxH, 'rgba(0, 0, 0, 0.84)');
    renderer.strokeRect(boxX, boxY, boxW, boxH, '#66ff66', 2);
    drawPixelText(renderer, title, VIEW.width / 2, 284 + textOffsetY, {
      color: '#ffffff',
      scale: FONT_SCALE_OVERLAY,
      align: 'center',
    });
    wrapPixelText(prompt, 480, FONT_SCALE_SMALL).forEach((line, index) => {
      drawPixelText(renderer, line, VIEW.width / 2, 328 + textOffsetY + (index * 18), {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
    });
    extraLines.forEach((line, index) => {
      drawPixelText(renderer, line, VIEW.width / 2, 364 + textOffsetY + (index * 20), {
        color: '#8df58d',
        scale: FONT_SCALE_SMALL,
        align: 'center',
      });
    });
    drawPixelText(renderer, 'LEFT/RIGHT MOVE', VIEW.width / 2, 414 + textOffsetY + controlsOffsetY, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
    drawPixelText(renderer, 'SPACE FIRE  P PAUSE', VIEW.width / 2, 432 + textOffsetY + controlsOffsetY, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
    drawPixelText(renderer, 'PRESS START', VIEW.width / 2, 450 + textOffsetY + startOffsetY, {
      color: '#ffffff',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
  }

  drawInitialsEntry(renderer) {
    renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(0, 0, 0, 0.64)');
    renderer.drawRect(188, 224, 584, 260, 'rgba(0, 0, 0, 0.9)');
    renderer.strokeRect(188, 224, 584, 260, '#66ff66', 2);
    drawPixelText(renderer, 'NEW HIGH SCORE', VIEW.width / 2, 256, {
      color: '#ffffff',
      scale: FONT_SCALE_OVERLAY,
      align: 'center',
    });
    drawPixelText(renderer, `SCORE ${String(this.initialsEntry.score).padStart(4, '0')}`, VIEW.width / 2, 308, {
      color: '#fbbf24',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
    drawPixelText(renderer, 'ENTER INITIALS', VIEW.width / 2, 344, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });

    const initials = this.initialsEntry.getInitials().split('');
    initials.forEach((letter, index) => {
      const x = 430 + (index * 56);
      const selected = this.initialsEntry.cursor === index;
      drawPixelText(renderer, letter, x, 390, {
        color: selected ? '#ffffff' : '#8df58d',
        scale: FONT_SCALE_OVERLAY,
      });
      if (selected) {
        drawPixelText(renderer, '^', x + 12, 372, {
          color: '#ffffff',
          scale: FONT_SCALE_SMALL,
        });
      }
    });

    drawPixelText(renderer, 'A-Z TYPE  ENTER CONFIRM', VIEW.width / 2, 450, {
      color: '#8df58d',
      scale: FONT_SCALE_SMALL,
      align: 'center',
    });
  }
}
