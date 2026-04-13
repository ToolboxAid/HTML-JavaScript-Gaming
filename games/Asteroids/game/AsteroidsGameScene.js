/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsGameScene.js
*/
import { AttractModeController, Scene } from '/src/engine/scenes/index.js';
import { ParticleSystem } from '/src/engine/fx/index.js';
import AsteroidsSession from './AsteroidsSession.js';
import AsteroidsWorld from './AsteroidsWorld.js';
import AsteroidsAudio from '../systems/AsteroidsAudio.js';
import ShipDebrisSystem from '../systems/ShipDebrisSystem.js';
import AsteroidsAttractAdapter from './AsteroidsAttractAdapter.js';
import AsteroidsHighScoreService from '../systems/AsteroidsHighScoreService.js';
import AsteroidsInitialsEntry from '../systems/AsteroidsInitialsEntry.js';

const HUD_FONT = '"Vector Battle", monospace';
const SCORE_ONE_X = 136;
const HIGH_SCORE_X = 480;
const SCORE_TWO_X = 824;
const LIFE_SPACING = 22;
const PAUSE_OVERLAY_COLOR = 'rgba(2, 6, 23, 0.58)';
const INITIALS_OVERLAY_COLOR = 'rgba(1, 6, 19, 0.62)';
const GAME_OVER_AUTO_EXIT_SECONDS_DEFAULT = 30;
const GAME_OVER_RETURN_MODE = 'menu';
const GAME_OVER_RETURN_STATUS = 'Press 1 for one player or 2 for two players.';
const LIFE_ICON_POINTS = [
  [14, 0],
  [-10, -8],
  [-6, -3],
  [-6, 3],
  [-10, 8],
];
const ATTRACT_INPUT_CODES = [
  'Digit1',
  'Digit2',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Space',
  'Enter',
  'KeyP',
];
let hasLoggedSceneConstruction = false;
let hasLoggedSceneEnter = false;

function logSceneBootStage(stage, details = null) {
  if (details === null) {
    console.info(`Asteroids scene:${stage}`);
  } else {
    console.info(`Asteroids scene:${stage}`, details);
  }
}

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
  constructor(options = {}) {
    super();
    if (!hasLoggedSceneConstruction) {
      hasLoggedSceneConstruction = true;
      logSceneBootStage('constructed');
    }
    this.devConsoleIntegration = options.devConsoleIntegration || null;
    this.debugConfig = options.debugConfig || {
      debugMode: 'prod',
      debugEnabled: Boolean(this.devConsoleIntegration),
    };
    this.world = new AsteroidsWorld({ width: 960, height: 720 });
    this.highScoreService = new AsteroidsHighScoreService();
    this.highScoreRows = this.highScoreService.loadTable();
    const initialTopScore = this.highScoreService.getTopScore(this.highScoreRows);
    this.session = new AsteroidsSession(this.world, {
      load: () => initialTopScore,
      save: (score) => Math.max(0, Math.trunc(Number(score) || 0)),
    });
    this.gameOverAutoExitSeconds = Math.max(
      1,
      Math.floor(
        Number(this.session.getGameOverAutoExitSeconds?.())
        || GAME_OVER_AUTO_EXIT_SECONDS_DEFAULT,
      ),
    );
    this.gameOverAutoExitRemainingSeconds = 0;
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
    this.initialsEntry = new AsteroidsInitialsEntry();
    this.attractAdapter = new AsteroidsAttractAdapter({ scene: this });
    this.currentInput = null;
    this.debugFrame = 0;
    this.debugEventLimit = 40;
    this.debugEvents = [];
    this.lastThrusting = false;
    this.lastRotateDirection = 0;
    this.lastMode = this.session.mode;
    this.lastWave = this.world.wave;
    this.attractController = new AttractModeController({
      phases: ['title', 'highScores', 'demo'],
      isInputActive: () => this.isAttractExitInputActive(),
      onEnterAttract: () => this.attractAdapter.enter(),
      onExitAttract: () => this.attractAdapter.exit(),
      onEnterDemo: () => this.attractAdapter.startDemo(),
      onExitDemo: () => this.attractAdapter.stopDemo(),
      onPhaseChange: (phase) => this.attractAdapter.setPhase(phase),
    });
    this.session.highScore = initialTopScore;
  }

  isAttractExitInputActive() {
    if (!this.currentInput) {
      return false;
    }

    return ATTRACT_INPUT_CODES.some((code) => this.currentInput.isDown?.(code));
  }

  getQualifyingPlayerScore() {
    if (!Array.isArray(this.session.players) || !this.session.players.length) {
      return null;
    }

    return this.session.players.reduce((best, player) => (
      !best || player.score > best.score
        ? { playerId: player.id, score: player.score }
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
    this.session.highScore = Math.max(this.session.highScore, this.highScoreService.getTopScore(this.highScoreRows));
    this.initialsEntry.cancel();
    this.returnToIntroAttract();
  }

  resetGameOverAutoExitTimer() {
    this.gameOverAutoExitRemainingSeconds = 0;
  }

  armGameOverAutoExitTimer() {
    this.gameOverAutoExitRemainingSeconds = this.gameOverAutoExitSeconds;
  }

  isGameOverScreenVisible() {
    return this.session.mode === 'game-over' && !this.initialsEntry.active;
  }

  returnToIntroAttract() {
    this.session.mode = GAME_OVER_RETURN_MODE;
    this.session.status = GAME_OVER_RETURN_STATUS;
    this.attractController.resetIdle();
    this.resetGameOverAutoExitTimer();
  }

  updateGameOverAutoExitTimer(dtSeconds) {
    if (!this.isGameOverScreenVisible() || this.gameOverAutoExitRemainingSeconds <= 0) {
      return false;
    }

    const safeDt = Number.isFinite(dtSeconds) ? Math.max(0, dtSeconds) : 0;
    this.gameOverAutoExitRemainingSeconds = Math.max(0, this.gameOverAutoExitRemainingSeconds - safeDt);
    if (this.gameOverAutoExitRemainingSeconds > 0) {
      return false;
    }

    this.initialsEntry.cancel();
    this.returnToIntroAttract();
    return true;
  }

  enter(engine) {
    if (!hasLoggedSceneEnter) {
      hasLoggedSceneEnter = true;
      logSceneBootStage('enter');
    }
    if (engine?.canvas) {
      engine.canvas.style.cursor = this.session.mode === 'playing' && !this.isPaused
        ? 'none'
        : 'default';
    }
  }

  exit(engine) {
    this.audio.stopAll();
    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.dispose();
    }
    if (engine?.canvas) {
      engine.canvas.style.cursor = 'default';
    }
  }

  formatDebugEventSummary(details = {}) {
    if (!details || typeof details !== 'object') {
      return '';
    }

    const summaryParts = Object.entries(details)
      .map(([key, value]) => `${key}=${String(value)}`)
      .slice(0, 4);
    return summaryParts.join(' ');
  }

  pushDebugEvent(type, details = {}) {
    const eventType = typeof type === 'string' ? type.trim() : '';
    if (!eventType) {
      return;
    }

    const entry = {
      frame: this.debugFrame,
      type: eventType,
      summary: this.formatDebugEventSummary(details),
      details: { ...details },
      timestamp: Date.now(),
    };
    this.debugEvents.push(entry);

    if (this.debugEvents.length > this.debugEventLimit) {
      this.debugEvents.splice(0, this.debugEvents.length - this.debugEventLimit);
    }
  }

  recordGameplayInputEvents(input) {
    if (!input || this.session.mode !== 'playing' || this.isPaused || !this.world.shipActive) {
      this.lastThrusting = false;
      this.lastRotateDirection = 0;
      return;
    }

    const leftDown = input.isDown?.('ArrowLeft') === true;
    const rightDown = input.isDown?.('ArrowRight') === true;
    const rotateDirection = (rightDown ? 1 : 0) - (leftDown ? 1 : 0);
    const thrusting = this.world.ship.thrusting === true;

    if (thrusting && !this.lastThrusting) {
      this.pushDebugEvent('SHIP_THRUST', {
        shipX: Math.round(this.world.ship.x),
        shipY: Math.round(this.world.ship.y),
      });
    }

    if (rotateDirection !== 0 && rotateDirection !== this.lastRotateDirection) {
      this.pushDebugEvent('SHIP_ROTATE', {
        direction: rotateDirection > 0 ? 'right' : 'left',
        angle: this.world.ship.angle.toFixed(2),
      });
    }

    this.lastThrusting = thrusting;
    this.lastRotateDirection = rotateDirection;
  }

  recordWorldEvents(frameEvents = {}) {
    const events = frameEvents && typeof frameEvents === 'object' ? frameEvents : {};
    const sfx = Array.isArray(events.sfx) ? events.sfx : [];
    const scoreEvents = Array.isArray(events.scoreEvents) ? events.scoreEvents : [];
    const explosions = Array.isArray(events.explosions) ? events.explosions : [];
    const scoreDelta = scoreEvents.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);

    if (sfx.includes('fire')) {
      this.pushDebugEvent('BULLET_FIRED', {
        bullets: this.world.bullets.length,
      });
    }

    if (scoreDelta > 0) {
      this.pushDebugEvent('SCORE_CHANGED', {
        delta: scoreDelta,
        score: this.session.activePlayer?.score || 0,
      });
    }

    if (scoreEvents.some((points) => points === 20 || points === 50 || points === 100)) {
      this.pushDebugEvent('ASTEROID_SPLIT', {
        fragments: this.world.asteroids.length,
      });
    }

    if (explosions.length > 0) {
      this.pushDebugEvent('COLLISION_DETECTED', {
        hits: explosions.length,
      });
    }

    if (events.shipDestroyed) {
      this.pushDebugEvent('LIFE_LOST', {
        lives: this.session.activePlayer?.lives || 0,
      });
    }

    if (events.shipRespawned) {
      this.pushDebugEvent('SHIP_SPAWN', {
        wave: this.world.wave,
      });
    }

    if (events.waveCleared || this.lastWave !== this.world.wave) {
      this.pushDebugEvent('WAVE_STARTED', {
        wave: this.world.wave,
        asteroids: this.world.asteroids.length,
      });
    }

    if (this.lastMode !== this.session.mode && this.session.mode === 'game-over') {
      this.pushDebugEvent('GAME_OVER', {
        score: this.session.activePlayer?.score || 0,
      });
    }

    this.lastMode = this.session.mode;
    this.lastWave = this.world.wave;
  }

  buildDebugDiagnosticsContext(engine, dtSeconds, frameEvents = {}) {
    const safeDt = Number.isFinite(dtSeconds) && dtSeconds > 0 ? dtSeconds : 1 / 60;
    const fps = safeDt > 0 ? Math.round(1 / safeDt) : 0;
    const activePlayer = this.session.activePlayer || { id: 1, score: 0, lives: 0 };
    const recentEvents = this.debugEvents.slice(-12);
    const input = engine?.input;
    const worldStages = ['parallax', 'entities', 'sprite-effects', 'vector-overlay'];

    return {
      runtime: {
        sceneId: 'asteroids-showcase',
        status: this.session.mode,
        fps,
        frameTimeMs: Math.round(safeDt * 1000 * 100) / 100,
        debugMode: this.debugConfig.debugMode,
        debugEnabled: this.debugConfig.debugEnabled === true,
      },
      camera: {
        x: 0,
        y: 0,
        viewportWidth: this.world.bounds.width,
        viewportHeight: this.world.bounds.height,
      },
      entities: {
        count: (this.world.shipActive ? 1 : 0) + this.world.asteroids.length + this.world.bullets.length + this.world.ufoBullets.length + (this.world.ufo ? 1 : 0),
        shipActive: this.world.shipActive,
        asteroidCount: this.world.asteroids.length,
        bulletCount: this.world.bullets.length,
        ufoBulletCount: this.world.ufoBullets.length,
      },
      tilemap: {
        width: 0,
        height: 0,
        tileSize: 0,
      },
      input: {
        left: input?.isDown?.('ArrowLeft') === true,
        right: input?.isDown?.('ArrowRight') === true,
        thrust: input?.isDown?.('ArrowUp') === true,
        fire: input?.isDown?.('Space') === true,
        pause: input?.isDown?.('KeyP') === true,
        consoleToggle: input?.isDown?.('ShiftLeft') === true && input?.isDown?.('Backquote') === true,
        overlayToggle: (input?.isDown?.('ControlLeft') === true || input?.isDown?.('ControlRight') === true) && input?.isDown?.('ShiftLeft') === true && input?.isDown?.('Backquote') === true,
      },
      hotReload: {
        enabled: false,
        pending: false,
        mode: 'showcase-manual',
      },
      validation: {
        errorCount: 0,
        warningCount: 0,
        asteroidsRecentEvents: recentEvents,
        asteroidsFrameEvents: frameEvents,
      },
      render: {
        stages: worldStages,
        debugSurfaceTail: ['debug-overlay', 'dev-console-surface'],
      },
      assets: {
        asteroidsShowcase: {
          session: {
            mode: this.session.mode,
            status: this.session.status,
            activePlayer: activePlayer.id,
            score: activePlayer.score,
            highScore: this.session.highScore,
            lives: activePlayer.lives,
            wave: this.world.wave,
            isPaused: this.isPaused,
          },
          entities: {
            ship: {
              active: this.world.shipActive,
              x: this.world.ship.x,
              y: this.world.ship.y,
              vx: this.world.ship.vx,
              vy: this.world.ship.vy,
              angle: this.world.ship.angle,
            },
            asteroidCount: this.world.asteroids.length,
            bulletCount: this.world.bullets.length,
            ufoBulletCount: this.world.ufoBullets.length,
            ufo: {
              active: Boolean(this.world.ufo),
              type: this.world.ufo?.type || '',
            },
          },
          presets: {
            defaultCommand: 'asteroidsshowcase.preset.default',
            eventsCommand: 'asteroidsshowcase.preset.events',
          },
        },
      },
    };
  }

  updateDebugIntegration(engine, dtSeconds, frameEvents = {}) {
    if (!this.devConsoleIntegration) {
      return;
    }

    this.devConsoleIntegration.update({
      engine,
      scene: this,
      diagnosticsContext: this.buildDebugDiagnosticsContext(engine, dtSeconds, frameEvents),
    });
  }

  update(dtSeconds, engine) {
    this.debugFrame += 1;
    this.currentInput = engine.input ?? null;
    const enterPressed = engine.input?.isDown('Enter');
    const onePressed = engine.input?.isDown('Digit1');
    const twoPressed = engine.input?.isDown('Digit2');
    const pPressed = engine.input?.isDown('KeyP');
    const frameEvents = {
      explosions: [],
      scoreEvents: [],
      shipDestroyed: false,
      shipDestroyedState: null,
      shipRespawned: false,
      waveCleared: false,
      sfx: [],
    };

    if (this.isGameOverScreenVisible() && this.gameOverAutoExitRemainingSeconds <= 0) {
      this.armGameOverAutoExitTimer();
    } else if (!this.isGameOverScreenVisible() && this.gameOverAutoExitRemainingSeconds > 0) {
      this.resetGameOverAutoExitTimer();
    }

    this.recordGameplayInputEvents(engine.input);

    if (this.session.mode === 'menu') {
      this.resetGameOverAutoExitTimer();
      this.attractController.update(dtSeconds);
      this.attractAdapter.update(dtSeconds);
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
        this.attractController.exitAttract();
        this.session.start(1);
        this.pushDebugEvent('SHIP_SPAWN', { player: 1, wave: this.world.wave });
        this.pushDebugEvent('WAVE_STARTED', { wave: this.world.wave, asteroids: this.world.asteroids.length });
      }
      if (twoPressed && !this.lastTwoPressed) {
        this.attractController.exitAttract();
        this.session.start(2);
        this.pushDebugEvent('SHIP_SPAWN', { player: 1, wave: this.world.wave });
        this.pushDebugEvent('WAVE_STARTED', { wave: this.world.wave, asteroids: this.world.asteroids.length });
      }
      this.recordWorldEvents(frameEvents);
      this.updateDebugIntegration(engine, dtSeconds, frameEvents);
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
      // Ensure qualifying game-over scores always enter initials flow before continue/auto-exit paths.
      if (!this.initialsEntry.active) {
        this.tryBeginInitialsEntry();
      }
      if (enterPressed && !this.lastEnterPressed && this.isGameOverScreenVisible()) {
        this.initialsEntry.cancel();
        this.returnToIntroAttract();
        this.recordWorldEvents(frameEvents);
        this.updateDebugIntegration(engine, dtSeconds, frameEvents);
        this.lastEnterPressed = enterPressed;
        this.lastOnePressed = onePressed;
        this.lastTwoPressed = twoPressed;
        this.lastPPressed = pPressed;
        return;
      }
      if (this.updateGameOverAutoExitTimer(dtSeconds)) {
        this.recordWorldEvents(frameEvents);
        this.updateDebugIntegration(engine, dtSeconds, frameEvents);
        this.lastEnterPressed = enterPressed;
        this.lastOnePressed = onePressed;
        this.lastTwoPressed = twoPressed;
        this.lastPPressed = pPressed;
        return;
      }
      if (this.initialsEntry.active) {
        const entryResult = this.initialsEntry.update(engine.input);
        if (entryResult.confirmed) {
          this.finishInitialsEntry(entryResult);
        }
        this.recordWorldEvents(frameEvents);
        this.updateDebugIntegration(engine, dtSeconds, frameEvents);
        this.lastEnterPressed = enterPressed;
        this.lastOnePressed = onePressed;
        this.lastTwoPressed = twoPressed;
        this.lastPPressed = pPressed;
        return;
      }
      this.recordWorldEvents(frameEvents);
      this.updateDebugIntegration(engine, dtSeconds, frameEvents);
      this.lastEnterPressed = enterPressed;
      this.lastOnePressed = onePressed;
      this.lastTwoPressed = twoPressed;
      this.lastPPressed = pPressed;
      return;
    }

    if (pPressed && !this.lastPPressed) {
      this.isPaused = !this.isPaused;
      this.pushDebugEvent(this.isPaused ? 'GAME_PAUSED' : 'GAME_RESUMED', {
        wave: this.world.wave,
        score: this.session.activePlayer?.score || 0,
      });
    }

    if (this.isPaused) {
      this.audio.stopAll();
      this.beatTimer = 0;
      this.shipDebris.update(dtSeconds);
      this.particles.update(dtSeconds);
      if (engine.canvas) {
        engine.canvas.style.cursor = 'none';
      }
      this.recordWorldEvents(frameEvents);
      this.updateDebugIntegration(engine, dtSeconds, frameEvents);
      this.lastEnterPressed = enterPressed;
      this.lastOnePressed = onePressed;
      this.lastTwoPressed = twoPressed;
      this.lastPPressed = pPressed;
      return;
    }

    const events = this.session.update(dtSeconds, engine.input) || { sfx: [] };
    frameEvents.explosions = Array.isArray(events.explosions) ? events.explosions : [];
    frameEvents.scoreEvents = Array.isArray(events.scoreEvents) ? events.scoreEvents : [];
    frameEvents.shipDestroyed = events.shipDestroyed === true;
    frameEvents.shipDestroyedState = events.shipDestroyedState || null;
    frameEvents.shipRespawned = events.shipRespawned === true;
    frameEvents.waveCleared = events.waveCleared === true;
    frameEvents.sfx = Array.isArray(events.sfx) ? events.sfx : [];
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
    this.recordWorldEvents(frameEvents);
    this.updateDebugIntegration(engine, dtSeconds, frameEvents);
    this.lastEnterPressed = enterPressed;
    this.lastOnePressed = onePressed;
    this.lastTwoPressed = twoPressed;
    this.lastPPressed = pPressed;
  }

  render(renderer) {
    const leaderboardTopScore = this.highScoreService.getTopScore(this.highScoreRows);
    const liveHudHighScore = Math.max(this.session.highScore, leaderboardTopScore);
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
      renderer.drawText(`${liveHudHighScore}`.padStart(4, '0'), HIGH_SCORE_X, 62, { color: '#ffffff', font: `24px ${HUD_FONT}`, textAlign: 'center' });
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
      if (this.attractController.active) {
        this.attractAdapter.render(renderer);
      } else {
        renderer.drawText('ASTEROIDS', 480, 220, {
          color: '#ffffff',
          font: `56px ${HUD_FONT}`,
          textAlign: 'center',
        });
        renderer.drawText(`HIGH SCORE ${String(leaderboardTopScore).padStart(4, '0')}`, 480, 286, {
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
      }
    } else if (this.session.mode === 'game-over') {
      renderer.drawText('GAME OVER', 480, 352, {
        color: '#f87171',
        font: `40px ${HUD_FONT}`,
        textAlign: 'center',
      });
      if (this.initialsEntry.active) {
        this.drawInitialsEntry(renderer);
      } else {
        renderer.drawText('PRESS ENTER TO CONTINUE', 480, 398, {
          color: '#ffffff',
          font: `20px ${HUD_FONT}`,
          textAlign: 'center',
        });
      }
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

    if (this.devConsoleIntegration) {
      this.devConsoleIntegration.render(renderer, {
        worldStages: ['parallax', 'entities', 'sprite-effects', 'vector-overlay'],
      });
    }
  }

  drawInitialsEntry(renderer) {
    renderer.drawRect(0, 0, this.world.bounds.width, this.world.bounds.height, INITIALS_OVERLAY_COLOR);
    renderer.drawRect(220, 250, 520, 220, '#020b1e');
    renderer.strokeRect(220, 250, 520, 220, '#94a3b8', 2);

    renderer.drawText('NEW HIGH SCORE', 480, 284, {
      color: '#fbbf24',
      font: `36px ${HUD_FONT}`,
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText(`SCORE ${String(this.initialsEntry.score).padStart(5, '0')}`, 480, 332, {
      color: '#e2e8f0',
      font: `22px ${HUD_FONT}`,
      textAlign: 'center',
      textBaseline: 'top',
    });

    const initials = this.initialsEntry.getInitials().split('');
    initials.forEach((letter, index) => {
      const x = 430 + (index * 50);
      const selected = this.initialsEntry.cursor === index;
      renderer.drawText(letter, x, 378, {
        color: selected ? '#fbbf24' : '#e2e8f0',
        font: selected ? `44px ${HUD_FONT}` : `36px ${HUD_FONT}`,
        textBaseline: 'top',
      });
    });

    renderer.drawText('TYPE A-Z, ARROWS ADJUST, ENTER SAVES', 480, 434, {
      color: '#93a5bc',
      font: `14px ${HUD_FONT}`,
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
