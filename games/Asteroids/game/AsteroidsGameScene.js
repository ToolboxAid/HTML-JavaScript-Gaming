/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsGameScene.js
*/
import Scene from '../../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import AsteroidsSession from './AsteroidsSession.js';
import AsteroidsWorld from './AsteroidsWorld.js';
import HighScoreStore from '../systems/HighScoreStore.js';
import AsteroidsAudio from '../systems/AsteroidsAudio.js';
import ShipDebrisSystem from '../systems/ShipDebrisSystem.js';
import ParticleSystem from '../../../engine/fx/ParticleSystem.js';

const theme = new Theme(ThemeTokens);
const HUD_FONT = '"Vector Battle", monospace';
const SCORE_ONE_X = 136;
const HIGH_SCORE_X = 480;
const SCORE_TWO_X = 824;
const LIFE_SPACING = 22;
const PAUSE_OVERLAY_COLOR = 'rgba(2, 6, 23, 0.58)';
const LIFE_ICON_POINTS = [
  [14, 0],
  [-10, -8],
  [-6, -3],
  [-6, 3],
  [-10, 8],
];

function getBeatInterval(asteroidCount) {
  if (asteroidCount <= 1) {
    return 0.18;
  }
  if (asteroidCount === 2) {
    return 0.28;
  }
  if (asteroidCount <= 4) {
    return 0.42;
  }
  if (asteroidCount <= 6) {
    return 0.58;
  }
  if (asteroidCount <= 8) {
    return 0.78;
  }
  return 0.98;
}

function drawShipLifeIcon(renderer, x, y) {
  const points = LIFE_ICON_POINTS.map(([offsetX, offsetY]) => ({
    x: x + offsetY * 1.05,
    y: y - offsetX * 1.05,
  }));
  renderer.drawPolygon(points, {
    fillColor: null,
    strokeColor: '#ffffff',
    lineWidth: 1,
  });
}

function drawLives(renderer, centerX, y, lives) {
  if (!lives) {
    return;
  }

  const startX = centerX - ((lives - 1) * LIFE_SPACING) / 2;
  Array.from({ length: lives }).forEach((_, index) => {
    drawShipLifeIcon(renderer, startX + index * LIFE_SPACING, y);
  });
}

export default class AsteroidsGameScene extends Scene {
  constructor() {
    super();
    this.world = new AsteroidsWorld({ width: 960, height: 720 });
    this.session = new AsteroidsSession(this.world, new HighScoreStore());
    this.audio = new AsteroidsAudio();
    this.shipDebris = new ShipDebrisSystem({ rng: this.world.rng });
    this.particles = new ParticleSystem();
    this.lastEnterPressed = false;
    this.lastOnePressed = false;
    this.lastTwoPressed = false;
    this.lastPPressed = false;
    this.isPaused = false;
    this.flamePulseTime = 0;
    this.beatTimer = 0;
    this.nextBeatId = 'beat1';
    this.scoreFlashTime = 0;
  }

  update(dtSeconds, engine) {
    const enterPressed = engine.input?.isDown('Enter');
    const onePressed = engine.input?.isDown('Digit1');
    const twoPressed = engine.input?.isDown('Digit2');
    const pPressed = engine.input?.isDown('KeyP');

    if (this.session.mode === 'menu') {
      this.isPaused = false;
      this.audio.stopAll();
      this.beatTimer = 0;
      this.nextBeatId = 'beat1';
      this.shipDebris.update(dtSeconds);
      this.particles.update(dtSeconds);
      if (engine.canvas) {
        engine.canvas.style.cursor = 'default';
      }
      if (onePressed && !this.lastOnePressed) {
        this.session.start(1);
      }
      if (twoPressed && !this.lastTwoPressed) {
        this.session.start(2);
      }
      this.lastEnterPressed = enterPressed;
      this.lastOnePressed = onePressed;
      this.lastTwoPressed = twoPressed;
      this.lastPPressed = pPressed;
      return;
    }

    if (this.session.mode === 'game-over') {
      this.isPaused = false;
      this.audio.stopAll();
      this.beatTimer = 0;
      this.nextBeatId = 'beat1';
      this.shipDebris.update(dtSeconds);
      this.particles.update(dtSeconds);
      if (engine.canvas) {
        engine.canvas.style.cursor = 'default';
      }
      if (enterPressed && !this.lastEnterPressed) {
        this.session.mode = 'menu';
        this.session.status = 'Press 1 for one player or 2 for two players.';
      }
      this.lastEnterPressed = enterPressed;
      this.lastOnePressed = onePressed;
      this.lastTwoPressed = twoPressed;
      this.lastPPressed = pPressed;
      return;
    }

    if (pPressed && !this.lastPPressed) {
      this.isPaused = !this.isPaused;
    }

    if (this.isPaused) {
      this.audio.stopAll();
      this.beatTimer = 0;
      this.shipDebris.update(dtSeconds);
      this.particles.update(dtSeconds);
      if (engine.canvas) {
        engine.canvas.style.cursor = 'none';
      }
      this.lastEnterPressed = enterPressed;
      this.lastOnePressed = onePressed;
      this.lastTwoPressed = twoPressed;
      this.lastPPressed = pPressed;
      return;
    }

    const events = this.session.update(dtSeconds, engine.input) || { sfx: [] };
    this.shipDebris.update(dtSeconds);
    this.particles.update(dtSeconds);
    this.flamePulseTime += dtSeconds;
    this.scoreFlashTime += dtSeconds;
    if (events.shipDestroyedState) {
      this.shipDebris.spawn({
        ...events.shipDestroyedState,
        lifeSeconds: 3,
      });
    }
    events.explosions?.forEach((explosion) => {
      const profile = explosion.size === 3
        ? { count: 30, speed: 102, color: '#ffffff', shape: 'circle', lifeSeconds: 1.14, minSize: 6, maxSize: 10 }
        : explosion.size === 2
          ? { count: 24, speed: 72, color: '#ffffff', shape: 'circle', lifeSeconds: 0.84, minSize: 4, maxSize: 7 }
          : { count: 18, speed: 42, color: '#ffffff', shape: 'circle', lifeSeconds: 0.6, minSize: 2, maxSize: 4 };
      this.particles.spawnExplosion({
        x: explosion.x,
        y: explosion.y,
        randomize: true,
        ...profile,
      });
    });
    events.sfx.forEach((id) => this.audio.play(id));
    if (this.session.isTurnIntroActive()) {
      this.beatTimer = 0;
      this.audio.updateThrust(false);
      this.audio.updateUfo(null);
    } else {
      const beatInterval = getBeatInterval(this.world.asteroids.length);
      this.beatTimer -= dtSeconds;
      if (this.beatTimer <= 0) {
        this.audio.play(this.nextBeatId);
        this.nextBeatId = this.nextBeatId === 'beat1' ? 'beat2' : 'beat1';
        this.beatTimer = beatInterval;
      }
      this.audio.updateThrust(this.world.ship.thrusting && this.session.mode === 'playing');
      this.audio.updateUfo(this.world.ufo?.type || null);
    }
    if (engine.canvas) {
      engine.canvas.style.cursor = 'none';
    }
    this.lastEnterPressed = enterPressed;
    this.lastOnePressed = onePressed;
    this.lastTwoPressed = twoPressed;
    this.lastPPressed = pPressed;
  }

  render(renderer) {
    renderer.drawRect(0, 0, this.world.bounds.width, this.world.bounds.height, '#020617');
    this.world.starfield.forEach((star) => {
      renderer.drawRect(star.x, star.y, star.size, star.size, '#94a3b8');
    });

    if (this.session.mode !== 'menu') {
      const flashOn = this.session.isTurnIntroActive()
        ? this.session.turnIntroVisible
        : false;
      const scoreOneColor = this.session.activePlayerIndex === 0 && flashOn ? '#fbbf24' : '#ffffff';
      const scoreTwoColor = this.session.activePlayerIndex === 1 && flashOn ? '#fbbf24' : '#ffffff';
      renderer.drawText('SCORE 1', SCORE_ONE_X, 34, { color: '#ffffff', font: `18px ${HUD_FONT}`, textAlign: 'center' });
      renderer.drawText(`${this.session.players[0]?.score || 0}`.padStart(4, '0'), SCORE_ONE_X, 62, { color: scoreOneColor, font: `24px ${HUD_FONT}`, textAlign: 'center' });
      renderer.drawText('HIGH SCORE', HIGH_SCORE_X, 34, { color: '#ffffff', font: `18px ${HUD_FONT}`, textAlign: 'center' });
      renderer.drawText(`${this.session.highScore}`.padStart(4, '0'), HIGH_SCORE_X, 62, { color: '#ffffff', font: `24px ${HUD_FONT}`, textAlign: 'center' });
      renderer.drawText('SCORE 2', SCORE_TWO_X, 34, { color: '#ffffff', font: `18px ${HUD_FONT}`, textAlign: 'center' });
      renderer.drawText(`${this.session.players[1]?.score || 0}`.padStart(4, '0'), SCORE_TWO_X, 62, { color: scoreTwoColor, font: `24px ${HUD_FONT}`, textAlign: 'center' });

      drawLives(renderer, SCORE_ONE_X, 92, this.session.players[0]?.lives || 0);
      drawLives(renderer, SCORE_TWO_X, 92, this.session.players[1]?.lives || 0);
    }

    this.world.asteroids.forEach((asteroid) => {
      renderer.drawPolygon(asteroid.getPoints(), {
        fillColor: null,
        strokeColor: '#cbd5e1',
        lineWidth: 2,
      });
    });

    if (this.world.ufo) {
      this.world.ufo.getBodyLines().forEach((line) => {
        renderer.drawPolygon(line, {
          fillColor: null,
          strokeColor: '#ffffff',
          lineWidth: 2,
          closePath: false,
        });
      });
    }

    this.world.bullets.forEach((bullet) => {
      renderer.drawRect(bullet.x - 2, bullet.y - 2, 4, 4, '#f8fafc');
    });

    this.world.ufoBullets.forEach((bullet) => {
      renderer.drawRect(bullet.x - 2, bullet.y - 2, 4, 4, '#ffffff');
    });

    this.particles.render(renderer);

    if (this.world.shipActive && !this.session.isTurnIntroActive() && this.world.ship.thrusting && this.session.mode === 'playing') {
      const flamePulse = 0.5 + ((Math.sin(this.flamePulseTime * 20) + 1) * 0.5);
      renderer.drawPolygon(this.world.ship.getFlamePoints(flamePulse), {
        fillColor: null,
        strokeColor: '#ffffff',
        lineWidth: 2,
      });
    }
    if (this.world.shipActive && !this.session.isTurnIntroActive() && this.session.mode !== 'menu') {
      renderer.drawPolygon(this.world.ship.getPoints(), {
        fillColor: null,
        strokeColor: '#ffffff',
        lineWidth: 2,
      });
    }

    this.shipDebris.render(renderer);

    if (this.session.mode === 'menu') {
      renderer.drawText('ASTEROIDS', 480, 220, {
        color: '#ffffff',
        font: `56px ${HUD_FONT}`,
        textAlign: 'center',
      });
      renderer.drawText(`HIGH SCORE ${String(this.session.highScore).padStart(4, '0')}`, 480, 286, {
        color: '#ffffff',
        font: `20px ${HUD_FONT}`,
        textAlign: 'center',
      });
      renderer.drawText('PRESS 1 FOR ONE PLAYER', 480, 332, {
        color: '#f8fafc',
        font: `24px ${HUD_FONT}`,
        textAlign: 'center',
      });
      renderer.drawText('PRESS 2 FOR TWO PLAYERS', 480, 376, {
        color: '#f8fafc',
        font: `24px ${HUD_FONT}`,
        textAlign: 'center',
      });
    } else if (this.session.mode === 'game-over') {
      renderer.drawText('GAME OVER', 480, 352, {
        color: '#f87171',
        font: `40px ${HUD_FONT}`,
        textAlign: 'center',
      });
      renderer.drawText('PRESS ENTER FOR MENU', 480, 398, {
        color: '#ffffff',
        font: `20px ${HUD_FONT}`,
        textAlign: 'center',
      });
    } else if (!this.isPaused) {
      renderer.drawText(`PLAYER ${this.session.activePlayer?.id || 1}`, 480, 690, {
        color: '#fbbf24',
        font: `20px ${HUD_FONT}`,
        textAlign: 'center',
      });
    }

    if (this.isPaused && this.session.mode === 'playing') {
      renderer.drawRect(0, 0, this.world.bounds.width, this.world.bounds.height, PAUSE_OVERLAY_COLOR);
      renderer.drawText('PAUSED', 480, 360, {
        color: '#ffffff',
        font: `36px ${HUD_FONT}`,
        textAlign: 'center',
      });
    }
  }
}
