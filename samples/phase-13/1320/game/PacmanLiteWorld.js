/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteWorld.js
*/
import PacmanLiteConfig from './PacmanLiteConfig.js';
import PacmanLiteGhostController from './PacmanLiteGhostController.js';
import PacmanLiteGrid from './PacmanLiteGrid.js';
import PacmanLitePlayerController from './PacmanLitePlayerController.js';

const MAX_STEP_SECONDS = 1 / 120;

export default class PacmanLiteWorld {
  constructor({ width = 960, height = 720, config = PacmanLiteConfig } = {}) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.grid = new PacmanLiteGrid({ tileSize: config.tileSize });
    this.playerController = new PacmanLitePlayerController({ speed: config.playerSpeed });
    this.ghostController = new PacmanLiteGhostController({ speed: config.ghostSpeed });
    this.status = 'menu';
    this.score = 0;
    this.lives = 3;
    this.player = { x: 0, y: 0, direction: null, nextDirection: null };
    this.ghost = { x: 0, y: 0, direction: 'left' };
    this.debug = { playerTile: { x: 0, y: 0 }, ghostTile: { x: 0, y: 0 }, queuedDirection: null, targetTile: { x: 0, y: 0 } };
    this.resetGame();
  }

  placeActors() {
    const p = this.grid.tileToWorld(this.config.spawnPlayerTile.x, this.config.spawnPlayerTile.y);
    const g = this.grid.tileToWorld(this.config.spawnGhostTile.x, this.config.spawnGhostTile.y);
    this.player.x = p.x;
    this.player.y = p.y;
    this.player.direction = null;
    this.player.nextDirection = null;
    this.ghost.x = g.x;
    this.ghost.y = g.y;
    this.ghost.direction = 'left';
  }

  resetRound() {
    this.grid.seedPellets();
    this.placeActors();
  }

  resetGame() {
    this.status = 'menu';
    this.score = 0;
    this.lives = 3;
    this.resetRound();
  }

  startGame() {
    if (this.status === 'menu') {
      this.status = 'playing';
      this.score = 0;
      this.lives = 3;
      this.resetRound();
    }
  }

  createEvent() {
    return {
      status: this.status,
      started: false,
      reset: false,
      pelletEaten: false,
      playerHit: false,
      roundCleared: false,
      gameOver: false,
      scoreDelta: 0,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      reset: base.reset || next.reset,
      pelletEaten: base.pelletEaten || next.pelletEaten,
      playerHit: base.playerHit || next.playerHit,
      roundCleared: base.roundCleared || next.roundCleared,
      gameOver: base.gameOver || next.gameOver,
      scoreDelta: base.scoreDelta + next.scoreDelta,
    };
  }

  updateStep(stepSeconds) {
    const event = this.createEvent();
    const playerTile = this.grid.worldToTile(this.player.x, this.player.y);
    this.playerController.update(stepSeconds, {
      grid: this.grid,
      actor: this.player,
    });
    const playerTileAfter = this.grid.worldToTile(this.player.x, this.player.y);
    this.ghostController.update(stepSeconds, {
      grid: this.grid,
      ghost: this.ghost,
      playerTile: playerTileAfter,
    });
    const ghostTile = this.grid.worldToTile(this.ghost.x, this.ghost.y);

    if (this.grid.consumePellet(playerTileAfter.x, playerTileAfter.y)) {
      this.score += 10;
      event.scoreDelta += 10;
      event.pelletEaten = true;
    }
    if (this.grid.pelletCount() === 0) {
      this.resetRound();
      event.roundCleared = true;
    }

    const dx = this.player.x - this.ghost.x;
    const dy = this.player.y - this.ghost.y;
    if ((dx * dx) + (dy * dy) <= 16 * 16) {
      this.lives -= 1;
      event.playerHit = true;
      if (this.lives <= 0) {
        this.status = 'game-over';
        event.gameOver = true;
      } else {
        this.placeActors();
      }
    }

    this.debug.playerTile = playerTileAfter;
    this.debug.ghostTile = ghostTile;
    this.debug.queuedDirection = this.player.nextDirection;
    this.debug.targetTile = playerTileAfter;
    event.status = this.status;
    return event;
  }

  update(dtSeconds, controls = {}) {
    let remaining = Math.max(0, Number(dtSeconds) || 0);
    let event = this.createEvent();

    if (controls.resetPressed) {
      this.resetGame();
      event.reset = true;
      return event;
    }

    if (controls.startPressed && (this.status === 'menu' || this.status === 'game-over')) {
      this.startGame();
      event.started = true;
    }

    if (controls.queuedDirection) {
      this.player.nextDirection = controls.queuedDirection;
    }

    if (this.status !== 'playing') {
      event.status = this.status;
      return event;
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      event = this.mergeEvents(event, this.updateStep(step));
      remaining -= step;
    }

    if (dtSeconds === 0) {
      event = this.mergeEvents(event, this.updateStep(0));
    }

    return event;
  }
}
