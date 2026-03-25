/*
Toolbox Aid
David Quesenberry
03/25/2026
ScoreManager.js
*/
const STARTING_LIVES = 3;
const EXTRA_LIFE_STEP = 10000;

export default class ScoreManager {
  constructor() {
    this.players = [];
    this.highScore = 0;
    this.wave = 1;
  }

  start(playerCount = 1) {
    this.players = Array.from({ length: playerCount }).map((_, index) => ({
      id: index + 1,
      score: 0,
      lives: STARTING_LIVES,
      nextExtraLifeAt: EXTRA_LIFE_STEP,
    }));
    this.wave = 1;
  }

  setWave(waveNumber) {
    this.wave = Math.max(1, Math.floor(waveNumber || 1));
  }

  getPlayerState(playerId) {
    return this.players.find((player) => player.id === playerId) ?? null;
  }

  addScore(playerId, points) {
    const player = this.getPlayerState(playerId);
    if (!player) {
      return { extraLifeAwarded: false, score: 0 };
    }

    player.score += Math.max(0, Math.floor(points || 0));
    this.highScore = Math.max(this.highScore, player.score);

    let extraLifeAwarded = false;
    while (player.score >= player.nextExtraLifeAt) {
      player.lives += 1;
      player.nextExtraLifeAt += EXTRA_LIFE_STEP;
      extraLifeAwarded = true;
    }

    return { extraLifeAwarded, score: player.score };
  }

  loseLife(playerId) {
    const player = this.getPlayerState(playerId);
    if (!player || player.lives <= 0) {
      return 0;
    }

    player.lives -= 1;
    return player.lives;
  }

  hasLives(playerId) {
    const player = this.getPlayerState(playerId);
    return Boolean(player && player.lives > 0);
  }

  hasAnyLifeRemaining() {
    return this.players.some((player) => player.lives > 0);
  }
}
