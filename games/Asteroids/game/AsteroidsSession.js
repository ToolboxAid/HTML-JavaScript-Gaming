/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsSession.js
*/
function sanitizeNonNegativeInteger(value, fallback = 0) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(value));
}

function sanitizePlayerCount(value) {
  const count = sanitizeNonNegativeInteger(Number(value), 1);
  return Math.max(1, Math.min(2, count || 1));
}

function createFallbackHighScoreStore() {
  return {
    load: () => 0,
    save: (score) => sanitizeNonNegativeInteger(Number(score), 0),
  };
}

function createSilentEvents() {
  return {
    explosions: [],
    scoreEvents: [],
    shipDestroyed: false,
    shipDestroyedState: null,
    shipRespawned: false,
    waveCleared: false,
    sfx: [],
  };
}
let hasLoggedSessionConstruction = false;
let hasLoggedSessionStart = false;

function logSessionBootStage(stage, details = null) {
  if (details === null) {
    console.info(`Asteroids session:${stage}`);
  } else {
    console.info(`Asteroids session:${stage}`, details);
  }
}

export default class AsteroidsSession {
  constructor(world, highScoreStore) {
    if (!hasLoggedSessionConstruction) {
      hasLoggedSessionConstruction = true;
      logSessionBootStage('constructed');
    }
    this.turnIntroTotalFlashes = 10;
    this.turnIntroInterval = 0.2;
    this.world = world;
    this.highScoreStore = highScoreStore
      && typeof highScoreStore.load === 'function'
      && typeof highScoreStore.save === 'function'
      ? highScoreStore
      : createFallbackHighScoreStore();
    this.highScore = sanitizeNonNegativeInteger(Number(this.highScoreStore.load()), 0);
    this.mode = 'menu';
    this.players = [];
    this.activePlayerIndex = 0;
    this.pendingSwapIndex = null;
    this.pendingSwapTimer = 0;
    this.pendingSwapElapsed = 0;
    this.pendingSwapDurationSeconds = 10;
    this.pendingSwapMaxWaitSeconds = 12;
    this.turnIntroFlashesRemaining = 0;
    this.turnIntroTimer = 0;
    this.turnIntroVisible = false;
    this.extraLifeInterval = 10000;
    this.gameOverAutoExitSeconds = 30;
    this.status = 'Press 1 for one player or 2 for two players.';
  }

  getGameOverAutoExitSeconds() {
    return this.gameOverAutoExitSeconds;
  }

  start(playerCount) {
    if (!hasLoggedSessionStart) {
      hasLoggedSessionStart = true;
      logSessionBootStage('start-called', { playerCount });
    }
    const safePlayerCount = sanitizePlayerCount(Number(playerCount));
    this.players = Array.from({ length: safePlayerCount }, (_, index) => ({
      id: index + 1,
      score: 0,
      lives: 3,
      nextExtraLifeScore: this.extraLifeInterval,
      worldState: null,
    }));
    this.activePlayerIndex = 0;
    this.pendingSwapIndex = null;
    this.pendingSwapTimer = 0;
    this.pendingSwapElapsed = 0;
    this.turnIntroFlashesRemaining = 0;
    this.turnIntroTimer = 0;
    this.turnIntroVisible = false;
    this.mode = 'playing';
    this.world.startGame();
    const initialState = this.world.getState();
    this.players[0].worldState = initialState;
    for (let index = 1; index < this.players.length; index += 1) {
      this.players[index].worldState = initialState;
    }
    this.world.loadState(initialState);
    this.status = safePlayerCount === 1
      ? 'Player 1 ready.'
      : '2-player game started. Player 1 up.';
  }

  get activePlayer() {
    return this.players[this.activePlayerIndex] || null;
  }

  isTurnIntroActive() {
    return this.turnIntroFlashesRemaining > 0;
  }

  startTurnIntro() {
    this.turnIntroFlashesRemaining = this.turnIntroTotalFlashes * 2;
    this.turnIntroTimer = this.turnIntroInterval;
    this.turnIntroVisible = true;
  }

  updateTurnIntro(dtSeconds) {
    if (!this.isTurnIntroActive()) {
      return false;
    }

    this.turnIntroTimer -= dtSeconds;
    while (this.turnIntroTimer <= 0 && this.turnIntroFlashesRemaining > 0) {
      this.turnIntroVisible = !this.turnIntroVisible;
      this.turnIntroFlashesRemaining -= 1;
      this.turnIntroTimer += this.turnIntroInterval;
    }

    if (this.turnIntroFlashesRemaining <= 0) {
      this.turnIntroFlashesRemaining = 0;
      this.turnIntroVisible = false;
      this.turnIntroTimer = 0;
      this.world.prepareTurnStart();
      this.world.setRespawnLocked(false);
      this.status = `Player ${this.activePlayer?.id || 1} ready.`;
      return true;
    }

    return false;
  }

  addScore(points) {
    if (!this.activePlayer) {
      return false;
    }

    const safePoints = sanitizeNonNegativeInteger(Number(points), 0);
    this.activePlayer.score += safePoints;
    let awardedExtraLife = false;
    while (this.activePlayer.score >= this.activePlayer.nextExtraLifeScore) {
      this.activePlayer.lives += 1;
      this.activePlayer.nextExtraLifeScore += this.extraLifeInterval;
      awardedExtraLife = true;
    }
    if (this.activePlayer.score > this.highScore) {
      const savedScore = sanitizeNonNegativeInteger(
        Number(this.highScoreStore.save(this.activePlayer.score)),
        this.activePlayer.score,
      );
      this.highScore = Math.max(this.highScore, savedScore);
    }
    return awardedExtraLife;
  }

  handleShipDestroyed() {
    if (!this.activePlayer) {
      return;
    }

    this.activePlayer.lives = Math.max(0, this.activePlayer.lives - 1);
    this.activePlayer.worldState = this.world.getState();
    const nextIndex = this.players.findIndex((player, index) => index !== this.activePlayerIndex && player.lives > 0);
    if (nextIndex >= 0) {
      this.world.setRespawnLocked(true);
      this.activePlayer.worldState = this.world.getState();
      this.pendingSwapIndex = nextIndex;
      this.pendingSwapTimer = this.pendingSwapDurationSeconds;
      this.pendingSwapElapsed = 0;
      this.status = `Player ${this.activePlayer.id} destroyed.`;
      return;
    }

    if (this.activePlayer.lives > 0) {
      this.world.loadState(this.activePlayer.worldState);
      this.status = `Player ${this.activePlayer.id} hit. ${this.activePlayer.lives} lives remaining.`;
      return;
    }

    this.mode = 'game-over';
    this.status = `Game over. Press Enter to return to menu. Auto-return in ${this.gameOverAutoExitSeconds} seconds.`;
  }

  update(dtSeconds, input) {
    if (this.mode !== 'playing') {
      return;
    }

    const safeDtSeconds = Number.isFinite(dtSeconds)
      ? Math.max(0, dtSeconds)
      : 0;

    if (this.isTurnIntroActive()) {
      this.updateTurnIntro(safeDtSeconds);
      return createSilentEvents();
    }

    const worldEvents = this.world.update(safeDtSeconds, input);
    const events = {
      ...createSilentEvents(),
      ...(worldEvents || {}),
      explosions: Array.isArray(worldEvents?.explosions) ? worldEvents.explosions : [],
      scoreEvents: Array.isArray(worldEvents?.scoreEvents) ? worldEvents.scoreEvents : [],
      sfx: Array.isArray(worldEvents?.sfx) ? worldEvents.sfx : [],
    };

    if (this.activePlayer) {
      this.activePlayer.worldState = this.world.getState();
    }
    events.scoreEvents.forEach((points) => {
      if (this.addScore(points)) {
        events.sfx.push('extraShip');
      }
    });
    if (events.shipDestroyed) {
      this.handleShipDestroyed();
    } else if (events.shipRespawned) {
      this.status = `Player ${this.activePlayer?.id || 1} ready.`;
    } else if (events.waveCleared) {
      this.status = `Player ${this.activePlayer?.id || 1} cleared the wave.`;
    } else {
      this.status = this.world.status;
    }

    if (this.pendingSwapIndex !== null) {
      this.pendingSwapTimer = Math.max(0, this.pendingSwapTimer - safeDtSeconds);
      this.pendingSwapElapsed += safeDtSeconds;
      const ufoCleared = !this.world.ufo;
      const swapReady = this.pendingSwapTimer === 0 && ufoCleared;
      const swapForced = this.pendingSwapElapsed >= this.pendingSwapMaxWaitSeconds;
      if (swapReady || swapForced) {
        this.activePlayerIndex = this.pendingSwapIndex;
        this.pendingSwapIndex = null;
        this.pendingSwapElapsed = 0;
        if (!this.players[this.activePlayerIndex].worldState) {
          this.players[this.activePlayerIndex].worldState = this.world.getState();
        }
        this.world.loadState(this.players[this.activePlayerIndex].worldState);
        this.world.setRespawnLocked(true);
        this.startTurnIntro();
        this.status = swapForced && !ufoCleared
          ? `Player ${this.activePlayer?.id || 1} up. Forced swap safety timeout reached.`
          : `Player ${this.activePlayer?.id || 1} up.`;
      } else if (!ufoCleared) {
        this.status = 'Waiting for saucer to clear before player swap.';
      }
    }

    return events;
  }
}
