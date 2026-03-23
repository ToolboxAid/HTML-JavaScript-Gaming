/*
Toolbox Aid
David Quesenberry
03/22/2026
AsteroidsSession.js
*/
export default class AsteroidsSession {
  constructor(world, highScoreStore) {
    this.turnIntroTotalFlashes = 10;
    this.turnIntroInterval = 0.2;
    this.world = world;
    this.highScoreStore = highScoreStore;
    this.highScore = this.highScoreStore.load();
    this.mode = 'menu';
    this.players = [];
    this.activePlayerIndex = 0;
    this.pendingSwapIndex = null;
    this.pendingSwapTimer = 0;
    this.turnIntroFlashesRemaining = 0;
    this.turnIntroTimer = 0;
    this.turnIntroVisible = false;
    this.extraLifeInterval = 10000;
    this.status = 'Press 1 for one player or 2 for two players.';
  }

  start(playerCount) {
    this.players = Array.from({ length: playerCount }, (_, index) => ({
      id: index + 1,
      score: 0,
      lives: 3,
      nextExtraLifeScore: this.extraLifeInterval,
      worldState: null,
    }));
    this.activePlayerIndex = 0;
    this.pendingSwapIndex = null;
    this.pendingSwapTimer = 0;
    this.turnIntroFlashesRemaining = 0;
    this.turnIntroTimer = 0;
    this.turnIntroVisible = false;
    this.mode = 'playing';
    this.world.startGame();
    this.players[0].worldState = this.world.getState();
    for (let index = 1; index < this.players.length; index += 1) {
      this.players[index].worldState = this.world.getState();
    }
    this.world.loadState(this.players[0].worldState);
    this.status = playerCount === 1
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
    this.activePlayer.score += points;
    let awardedExtraLife = false;
    while (this.activePlayer.score >= this.activePlayer.nextExtraLifeScore) {
      this.activePlayer.lives += 1;
      this.activePlayer.nextExtraLifeScore += this.extraLifeInterval;
      awardedExtraLife = true;
    }
    if (this.activePlayer.score > this.highScore) {
      this.highScore = this.highScoreStore.save(this.activePlayer.score);
    }
    return awardedExtraLife;
  }

  handleShipDestroyed() {
    if (!this.activePlayer) {
      return;
    }

    this.activePlayer.lives -= 1;
    this.activePlayer.worldState = this.world.getState();
    const nextIndex = this.players.findIndex((player, index) => index !== this.activePlayerIndex && player.lives > 0);
    if (nextIndex >= 0) {
      this.world.setRespawnLocked(true);
      this.activePlayer.worldState = this.world.getState();
      this.pendingSwapIndex = nextIndex;
      this.pendingSwapTimer = 10;
      this.status = `Player ${this.activePlayer.id} destroyed.`;
      return;
    }

    if (this.activePlayer.lives > 0) {
      this.world.loadState(this.activePlayer.worldState);
      this.status = `Player ${this.activePlayer.id} hit. ${this.activePlayer.lives} lives remaining.`;
      return;
    }

    this.mode = 'game-over';
    this.status = 'Game over. Press Enter to return to menu.';
  }

  update(dtSeconds, input) {
    if (this.mode !== 'playing') {
      return;
    }

    if (this.isTurnIntroActive()) {
      this.updateTurnIntro(dtSeconds);
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

    const events = this.world.update(dtSeconds, input);
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
      this.pendingSwapTimer = Math.max(0, this.pendingSwapTimer - dtSeconds);
      const ufoCleared = !this.world.ufo;
      if (this.pendingSwapTimer === 0 && ufoCleared) {
        this.activePlayerIndex = this.pendingSwapIndex;
        this.pendingSwapIndex = null;
        if (!this.players[this.activePlayerIndex].worldState) {
          this.players[this.activePlayerIndex].worldState = this.world.getState();
        }
        this.world.loadState(this.players[this.activePlayerIndex].worldState);
        this.world.setRespawnLocked(true);
        this.startTurnIntro();
        this.status = `Player ${this.activePlayer?.id || 1} up.`;
      } else if (!ufoCleared) {
        this.status = 'Waiting for saucer to clear before player swap.';
      }
    }

    return events;
  }
}
