/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsGameScene.js
*/
import { AttractModeController, Scene } from '/src/engine/scene/index.js';
import { ParticleSystem } from '/src/engine/fx/index.js';
import { asPositiveInteger } from '/src/shared/number/numbers.js';
import AsteroidsSession from './AsteroidsSession.js';
import AsteroidsWorld from './AsteroidsWorld.js';
import AsteroidsAudio from '../systems/AsteroidsAudio.js';
import ShipDebrisSystem from '../systems/ShipDebrisSystem.js';
import AsteroidsAttractAdapter from './AsteroidsAttractAdapter.js';
import AsteroidsHighScoreService from '../systems/AsteroidsHighScoreService.js';
import AsteroidsInitialsEntry from '../systems/AsteroidsInitialsEntry.js';
import { createAsteroidGeometryProfilesFromObjectVectorAssets } from './asteroidObjectGeometry.js';
import {
  ASTEROIDS_DEBUG_WORLD_STAGES,
  buildAsteroidsDebugDiagnosticsContext,
  formatAsteroidsDebugEventSummary
} from './asteroidsDebugDiagnostics.js';
import {
  calculateAsteroidsBeatTiming,
  getAsteroidsBeatWeightedTotal
} from './asteroidsBeatTiming.js';
import {
  ASTEROIDS_OBJECT_GEOMETRY_IDS,
  ASTEROIDS_ASTEROID_SIZE_OBJECT_IDS,
  ASTEROIDS_UFO_TYPE_OBJECT_IDS,
  validateAsteroidsRuntimeObjectIds
} from './asteroidsObjectGeometryManifest.js';
import {
  ASTEROIDS_GAME_OVER_AUTO_EXIT_SECONDS, ASTEROIDS_GAME_OVER_RETURN_MODE
} from "../rules/flowRules.js";
import { ASTEROIDS_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

const HUD_FONT = '"Vector Battle", monospace';
const SCORE_ONE_X = 136;
const HIGH_SCORE_X = 480;
const SCORE_TWO_X = 824;
const LIFE_SPACING = 22;
const PAUSE_OVERLAY_COLOR = 'rgba(2, 6, 23, 0.58)';
const INITIALS_OVERLAY_COLOR = 'rgba(1, 6, 19, 0.62)';
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

function validationFailureMessage(validation) {
  const details = Array.isArray(validation?.errors)
    ? validation.errors.map((entry) => entry.message).filter(Boolean).join(' ')
    : '';
  return `Asteroids Object Vector runtime manifest validation failed${details ? `: ${details}` : '.'}`;
}

function logSceneBootStage(stage, details = null) {
  if (details === null) {
    console.info(`Asteroids scene:${stage}`);
  } else {
    console.info(`Asteroids scene:${stage}`, details);
  }
}

function screenDimensionsFromOptions(options) {
  const width = asPositiveInteger(options?.screenDimensions?.width, 0);
  const height = asPositiveInteger(options?.screenDimensions?.height, 0);
  if (!width || !height) {
    throw new Error('AsteroidsGameScene requires screenDimensions.width and screenDimensions.height from game.manifest.json.');
  }
  return { width, height };
}

export default class AsteroidsGameScene extends Scene {
  constructor(options = {}) {
    super();
    if (!hasLoggedSceneConstruction) {
      hasLoggedSceneConstruction = true;
      logSceneBootStage('constructed');
    }
    this.devConsoleIntegration = options.devConsoleIntegration || null;
    this.objectVectorAssets = options.objectVectorAssets || null;
    this.objectVectorRuntime = options.objectVectorRuntime || null;
    this.objectGeometry = options.objectGeometry || null;
    if (!this.objectGeometry?.objectsById) {
      const message = 'Asteroids Object Vector manifest validation failed: object geometry was not loaded from game.manifest.json.';
      console.error(message);
      throw new Error(message);
    }
    this.objectVectorRuntimeObjectValidation = this.objectVectorAssets
      ? validateAsteroidsRuntimeObjectIds(this.objectVectorAssets.objectsById, {
        logger: this.objectVectorRuntime,
      })
      : { errors: [], objectIds: [], ok: false, warnings: [] };
    if (this.objectVectorAssets && !this.objectVectorRuntimeObjectValidation.ok) {
      const message = validationFailureMessage(this.objectVectorRuntimeObjectValidation);
      this.objectVectorRuntime?.log?.('FAIL', message, {
        errors: this.objectVectorRuntimeObjectValidation.errors,
      });
      console.error(message);
      throw new Error(message);
    }
    this.asteroidGeometryProfiles = options.asteroidGeometryProfiles
      || createAsteroidGeometryProfilesFromObjectVectorAssets(this.objectVectorAssets, {
        logger: this.objectVectorRuntime,
      });
    this.objectVectorPlaybackMs = 0;
    this.objectVectorRenderCounts = {
      asteroids: 0,
      bullet: 0,
      ship: 0,
      ufo: 0,
    };
    this.objectVectorRenderFailures = new Set();
    this.debugConfig = options.debugConfig || {
      debugMode: 'prod',
      debugEnabled: Boolean(this.devConsoleIntegration),
    };
    this.screenDimensions = screenDimensionsFromOptions(options);
    this.world = new AsteroidsWorld(this.screenDimensions, {
      asteroidGeometryProfiles: this.asteroidGeometryProfiles,
      objectGeometry: this.objectGeometry,
    });
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
        || ASTEROIDS_GAME_OVER_AUTO_EXIT_SECONDS,
      ),
    );
    this.gameOverAutoExitRemainingSeconds = 0;
    this.audio = new AsteroidsAudio();
    this.shipDebris = new ShipDebrisSystem({
      rng: this.world.rng,
      shipGeometryPoints: this.world.shipCollisionPoints,
    });
    this.particles = new ParticleSystem();
    this.lastEnterPressed = false;
    this.lastOnePressed = false;
    this.lastTwoPressed = false;
    this.lastPPressed = false;
    this.isPaused = false;
    this.beatTimer = 0;
    this.nextBeatId = 'beat1';
    this.beatMaxWeightedTotal = 1;
    this.resetBeatCadenceBaseline();
    this.scoreFlashTime = 0;
    this.initialsEntry = new AsteroidsInitialsEntry();
    this.attractAdapter = new AsteroidsAttractAdapter({ scene: this });
    this.currentInput = null;
    this.debugFrame = 0;
    this.debugEventLimit = 40;
    this.debugEvents = [];
    this.customBackgroundCallback = (renderer) => {
      this.world.starfield.forEach((star) => {
        renderer.drawRect(star.x, star.y, star.size, star.size, '#94a3b8');
      });
    };
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
    this.publishObjectVectorRuntimeDiagnostics();
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
    this.session.mode = ASTEROIDS_GAME_OVER_RETURN_MODE;
    this.session.status = ASTEROIDS_GAME_OVER_RETURN_STATUS;
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

  pushDebugEvent(type, details = {}) {
    const eventType = typeof type === 'string' ? type.trim() : '';
    if (!eventType) {
      return;
    }

    const entry = {
      frame: this.debugFrame,
      type: eventType,
      summary: formatAsteroidsDebugEventSummary(details),
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

  updateDebugIntegration(engine, dtSeconds, frameEvents = {}) {
    if (!this.devConsoleIntegration) {
      return;
    }

    this.devConsoleIntegration.update({
      engine,
      scene: this,
      diagnosticsContext: buildAsteroidsDebugDiagnosticsContext({
        debugConfig: this.debugConfig,
        debugEvents: this.debugEvents,
        dtSeconds,
        engine,
        frameEvents,
        isPaused: this.isPaused,
        session: this.session,
        world: this.world
      }),
    });
  }

  resetBeatCadenceBaseline() {
    this.beatMaxWeightedTotal = Math.max(1, getAsteroidsBeatWeightedTotal(this.world?.asteroids));
  }

  resolveAsteroidsBeatTiming() {
    const beatTiming = calculateAsteroidsBeatTiming(this.world?.asteroids, this.beatMaxWeightedTotal);
    this.beatMaxWeightedTotal = beatTiming.maxWeightedTotal;
    return beatTiming;
  }

  update(dtSeconds, engine) {
    this.debugFrame += 1;
    this.objectVectorPlaybackMs += Math.max(0, Number.isFinite(dtSeconds) ? dtSeconds * 1000 : 0);
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
        this.resetBeatCadenceBaseline();
        this.pushDebugEvent('SHIP_SPAWN', { player: 1, wave: this.world.wave });
        this.pushDebugEvent('WAVE_STARTED', { wave: this.world.wave, asteroids: this.world.asteroids.length });
      }
      if (twoPressed && !this.lastTwoPressed) {
        this.attractController.exitAttract();
        this.session.start(2);
        this.resetBeatCadenceBaseline();
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
      const beatTiming = this.resolveAsteroidsBeatTiming();
      this.beatTimer -= dtSeconds;
      if (this.beatTimer <= 0) {
        this.audio.play(this.nextBeatId);
        this.nextBeatId = this.nextBeatId === 'beat1' ? 'beat2' : 'beat1';
        this.beatTimer = beatTiming.intervalSeconds;
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

  render(renderer, engine) {
    const leaderboardTopScore = this.highScoreService.getTopScore(this.highScoreRows);
    const liveHudHighScore = Math.max(this.session.highScore, leaderboardTopScore);

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

      this.drawLives(renderer, SCORE_ONE_X, 92, this.session.players[0]?.lives || 0);
      this.drawLives(renderer, SCORE_TWO_X, 92, this.session.players[1]?.lives || 0);
    }

    this.world.asteroids.forEach((asteroid) => {
      const objectId = ASTEROIDS_ASTEROID_SIZE_OBJECT_IDS[asteroid.size] || "";
      this.drawObjectVectorAsset(renderer, "asteroids", {
        elapsedMs: this.objectVectorPlaybackMs,
        fps: 12,
        objectId,
        requireManifestBinding: true,
        rotation: asteroid.angle,
        rotationUnit: 'radians',
        stateId: "active",
        x: asteroid.x,
        y: asteroid.y,
      });
    });

    if (this.world.ufo) {
      const objectId = ASTEROIDS_UFO_TYPE_OBJECT_IDS[this.world.ufo.type] || ASTEROIDS_OBJECT_GEOMETRY_IDS.ufoLarge;
      this.drawObjectVectorAsset(renderer, "ufo", {
        elapsedMs: this.objectVectorPlaybackMs,
        fps: 12,
        objectId,
        requireManifestBinding: true,
        rotation: 0,
        rotationUnit: 'radians',
        stateId: "active",
        x: this.world.ufo.x,
        y: this.world.ufo.y,
      });
    }

    this.world.bullets.forEach((bullet) => {
      this.drawObjectVectorAsset(renderer, "bullet", {
        objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet,
        requireManifestBinding: true,
        rotation: bullet.angle,
        rotationUnit: 'radians',
        stateId: "active",
        x: bullet.x,
        y: bullet.y,
      });
    });

    this.world.ufoBullets.forEach((bullet) => {
      this.drawObjectVectorAsset(renderer, "bullet", {
        objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.bullet,
        requireManifestBinding: true,
        rotation: bullet.angle,
        rotationUnit: 'radians',
        stateId: "active",
        x: bullet.x,
        y: bullet.y,
      });
    });

    this.particles.render(renderer);

    if (this.world.shipActive && !this.session.isTurnIntroActive() && this.session.mode !== 'menu') {
      this.drawObjectVectorAsset(renderer, "ship", {
        elapsedMs: this.objectVectorPlaybackMs,
        fps: 12,
        objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.ship,
        requireManifestBinding: true,
        rotation: this.world.ship.angle,
        rotationUnit: 'radians',
        stateId: this.world.ship.thrusting && this.session.mode === 'playing' ? "move" : "idle",
        x: this.world.ship.x,
        y: this.world.ship.y,
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
        worldStages: [...ASTEROIDS_DEBUG_WORLD_STAGES],
      });
    }
    this.publishObjectVectorRuntimeDiagnostics();
  }

  drawLives(renderer, centerX, y, lives) {
    if (!lives) {
      return;
    }

    const startX = centerX - ((lives - 1) * LIFE_SPACING) / 2;
    Array.from({ length: lives }).forEach((_, index) => {
      this.drawObjectVectorAsset(renderer, "shipLife", {
        elapsedMs: this.objectVectorPlaybackMs,
        fps: 12,
        objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.ship,
        requireManifestBinding: true,
        rotation: -Math.PI / 2,
        rotationUnit: 'radians',
        scale: 1.05,
        stateId: "idle",
        x: startX + index * LIFE_SPACING,
        y,
      });
    });
  }

  getShipVisualStateIds() {
    const states = this.objectVectorAssets?.objectsById?.get(ASTEROIDS_OBJECT_GEOMETRY_IDS.ship)?.states
      || this.objectGeometry?.objectsById?.get(ASTEROIDS_OBJECT_GEOMETRY_IDS.ship)?.states;
    return Array.isArray(states)
      ? states.map((state) => String(state?.id || '').trim()).filter(Boolean)
      : [];
  }

  debugPreviewShipVisualState(renderer, stateId, options = {}) {
    const shipStateId = String(stateId || '').trim();
    const availableStates = this.getShipVisualStateIds();
    if (!renderer || !shipStateId || !availableStates.includes(shipStateId)) {
      return {
        availableStates,
        objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.ship,
        ok: false,
        rendered: false,
        stateId: shipStateId,
      };
    }

    const rendered = this.drawObjectVectorAsset(renderer, "shipVisualStatePreview", {
      elapsedMs: Number.isFinite(options.elapsedMs) ? options.elapsedMs : this.objectVectorPlaybackMs,
      fps: Number.isFinite(options.fps) ? options.fps : 12,
      objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.ship,
      requireManifestBinding: true,
      rotation: Number.isFinite(options.rotation) ? options.rotation : this.world.ship.angle,
      rotationUnit: options.rotationUnit || 'radians',
      stateId: shipStateId,
      x: Number.isFinite(options.x) ? options.x : this.world.ship.x,
      y: Number.isFinite(options.y) ? options.y : this.world.ship.y,
    });
    return {
      availableStates,
      objectId: ASTEROIDS_OBJECT_GEOMETRY_IDS.ship,
      ok: rendered,
      rendered,
      stateId: shipStateId,
    };
  }

  drawObjectVectorAsset(renderer, renderKey, options) {
    if (!this.objectVectorRuntime || !this.objectVectorAssets) {
      this.recordObjectVectorRenderFailure(renderKey, options.assetId || options.objectId, "validated Object Vector runtime assets are not loaded");
      return false;
    }
    const result = this.objectVectorRuntime.renderObject(renderer, this.objectVectorAssets, options);
    if (!result.ok) {
      this.recordObjectVectorRenderFailure(renderKey, options.assetId || options.objectId, "runtime render returned failed result");
      return false;
    }
    this.objectVectorRenderCounts[renderKey] = (this.objectVectorRenderCounts[renderKey] || 0) + 1;
    return true;
  }

  recordObjectVectorRenderFailure(renderKey, objectId, reason) {
    const failureKey = `${renderKey}:${objectId || "unknown"}:${reason}`;
    if (this.objectVectorRenderFailures.has(failureKey)) {
      return;
    }
    this.objectVectorRenderFailures.add(failureKey);
    this.pushDebugEvent('OBJECT_VECTOR_RUNTIME_FAIL', {
      objectId: objectId || "unknown",
      reason,
      renderKey,
    });
    console.error(`FAIL Object Vector runtime render blocked for ${renderKey} ${objectId || "unknown"}: ${reason}.`);
  }

  publishObjectVectorRuntimeDiagnostics() {
    try {
      globalThis.__asteroidsObjectVectorRuntime = {
        ...(this.objectVectorRuntime?.getDiagnostics?.() || {}),
        assetCount: this.objectVectorAssets?.objectsById?.size || 0,
        loaded: Boolean(this.objectVectorAssets),
        objectCount: this.objectVectorAssets?.objectsById?.size || 0,
        objectVectorObjectIds: this.objectGeometry?.objects?.map((object) => object.id) || [],
        runtimeObjectsValid: Boolean(this.objectVectorRuntimeObjectValidation?.ok),
        shipVisualStates: this.getShipVisualStateIds(),
        renderCounts: { ...this.objectVectorRenderCounts },
      };
    } catch {
      // Ignore diagnostics assignment in restricted runtimes.
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
