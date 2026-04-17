/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIWorld.js
*/
import PacmanFullAIConfig from './PacmanFullAIConfig.js';
import PacmanFullAIGhostController from './PacmanFullAIGhostController.js';
import PacmanFullAIGhostHouseController from './PacmanFullAIGhostHouseController.js';
import PacmanFullAIGhostModeScheduler from './PacmanFullAIGhostModeScheduler.js';
import PacmanFullAIGrid from './PacmanFullAIGrid.js';
import { DIRS } from './PacmanFullAINavigator.js';
import { oppositeCardinalDirection } from '/src/shared/utils/index.js';

const MAX_STEP_SECONDS = 1 / 120;

function near(a, b, epsilon = 0.5) {
  return Math.abs(a - b) <= epsilon;
}

function isOppositePair(a, b) {
  return Boolean(a && b && oppositeCardinalDirection(a) === b);
}

function canMove(grid, tile, dirName) {
  const d = DIRS[dirName];
  if (!d) return false;
  return grid.isWalkable(tile.x + d.x, tile.y + d.y);
}

export default class PacmanFullAIWorld {
  constructor({ width = 960, height = 720, config = PacmanFullAIConfig } = {}) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.grid = new PacmanFullAIGrid({ tileSize: config.tileSize });
    this.modeScheduler = new PacmanFullAIGhostModeScheduler(config);
    this.ghostController = new PacmanFullAIGhostController({ config });
    this.ghostHouse = new PacmanFullAIGhostHouseController({ releaseCfg: config.ghostRelease });
    this.status = 'menu';
    this.score = 0;
    this.lives = 3;
    this.pelletsEaten = 0;
    this.player = { x: 0, y: 0, direction: null, nextDirection: null };
    this.ghosts = [];
    this.modeState = { mode: 'scatter', frightenedMs: 0, frightenedFlashing: false };
    this.debug = { playerTile: { x: 0, y: 0 } };
    this.resetGame();
  }

  createGhost(id, name, color, tile) {
    const p = this.grid.tileToWorld(tile.x, tile.y);
    return {
      id,
      name,
      color,
      x: p.x,
      y: p.y,
      direction: 'left',
      inHouse: id !== 'blinky',
      eaten: false,
      targetTile: { x: tile.x, y: tile.y },
      housePhase: 0,
    };
  }

  placeActors() {
    const p = this.grid.tileToWorld(this.config.spawn.player.x, this.config.spawn.player.y);
    this.player.x = p.x;
    this.player.y = p.y;
    this.player.direction = null;
    this.player.nextDirection = null;
    this.ghosts = [
      this.createGhost('blinky', 'BLINKY', '#ef4444', this.config.spawn.blinky),
      this.createGhost('pinky', 'PINKY', '#f472b6', this.config.spawn.pinky),
      this.createGhost('inky', 'INKY', '#22d3ee', this.config.spawn.inky),
      this.createGhost('clyde', 'CLYDE', '#fb923c', this.config.spawn.clyde),
    ];
  }

  resetRound() {
    this.grid.seedPellets();
    this.pelletsEaten = 0;
    this.modeScheduler.reset();
    this.modeState = { mode: 'scatter', frightenedMs: 0, frightenedFlashing: false };
    this.ghostHouse.reset();
    this.placeActors();
  }

  resetGame() {
    this.status = 'menu';
    this.score = 0;
    this.lives = 3;
    this.resetRound();
  }

  startGame() {
    if (this.status === 'menu' || this.status === 'game-over') {
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
      powerPelletEaten: false,
      ghostEaten: false,
      playerHit: false,
      gameOver: false,
      roundCleared: false,
      modeChanged: false,
      scoreDelta: 0,
    };
  }

  mergeEvents(base, next) {
    return {
      status: next.status,
      started: base.started || next.started,
      reset: base.reset || next.reset,
      pelletEaten: base.pelletEaten || next.pelletEaten,
      powerPelletEaten: base.powerPelletEaten || next.powerPelletEaten,
      ghostEaten: base.ghostEaten || next.ghostEaten,
      playerHit: base.playerHit || next.playerHit,
      gameOver: base.gameOver || next.gameOver,
      roundCleared: base.roundCleared || next.roundCleared,
      modeChanged: base.modeChanged || next.modeChanged,
      scoreDelta: base.scoreDelta + next.scoreDelta,
    };
  }

  updatePlayer(dtSeconds) {
    const tile = this.grid.worldToTile(this.player.x, this.player.y);
    const center = this.grid.tileToWorld(tile.x, tile.y);
    const atCenter = near(this.player.x, center.x) && near(this.player.y, center.y);
    if (this.player.nextDirection && isOppositePair(this.player.direction, this.player.nextDirection)) {
      this.player.direction = this.player.nextDirection;
    }
    if (atCenter) {
      this.player.x = center.x;
      this.player.y = center.y;
      if (this.player.nextDirection && canMove(this.grid, tile, this.player.nextDirection)) {
        this.player.direction = this.player.nextDirection;
      } else if (!canMove(this.grid, tile, this.player.direction)) {
        this.player.direction = null;
      }
    }
    if (!this.player.direction) return;
    const v = DIRS[this.player.direction];
    // Keep actors aligned to the travel axis so tiny drift cannot wedge against side walls.
    if (v.x !== 0) {
      this.player.y = center.y;
    } else if (v.y !== 0) {
      this.player.x = center.x;
    }
    const nextX = this.player.x + (v.x * this.config.playerSpeed * dtSeconds);
    const nextY = this.player.y + (v.y * this.config.playerSpeed * dtSeconds);
    const nextTile = this.grid.worldToTile(nextX, nextY);
    if (!this.grid.isWalkable(nextTile.x, nextTile.y)) {
      this.player.x = center.x;
      this.player.y = center.y;
      this.player.direction = null;
      return;
    }
    this.player.x = nextX;
    this.player.y = nextY;
  }

  handlePellets(event) {
    const tile = this.grid.worldToTile(this.player.x, this.player.y);
    if (this.grid.consumePellet(tile.x, tile.y)) {
      this.score += 10;
      this.pelletsEaten += 1;
      event.pelletEaten = true;
      event.scoreDelta += 10;
    }
    if (this.grid.consumePowerPellet(tile.x, tile.y)) {
      this.score += 50;
      this.pelletsEaten += 1;
      event.powerPelletEaten = true;
      event.scoreDelta += 50;
      this.modeScheduler.triggerFrightened();
      this.ghostController.reverseAll(this.ghosts);
    }
    if (this.grid.pelletCount() === 0) {
      this.resetRound();
      event.roundCleared = true;
    }
  }

  handleCollisions(event) {
    this.ghosts.forEach((g) => {
      const dx = this.player.x - g.x;
      const dy = this.player.y - g.y;
      if ((dx * dx) + (dy * dy) > 14 * 14) return;
      if (g.eaten || g.inHouse) return;
      if (this.modeState.mode === 'frightened') {
        g.eaten = true;
        event.ghostEaten = true;
        this.score += 200;
        event.scoreDelta += 200;
      } else {
        event.playerHit = true;
      }
    });

    if (event.playerHit) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.status = 'game-over';
        event.gameOver = true;
      } else {
        this.placeActors();
      }
    }
  }

  updateStep(dtSeconds) {
    const event = this.createEvent();
    const modeTick = this.modeScheduler.update(dtSeconds * 1000);
    if (modeTick.modeChanged && modeTick.reversedOnChange && modeTick.mode !== 'frightened') {
      this.ghostController.reverseAll(this.ghosts);
    }
    this.modeState = modeTick;
    event.modeChanged = modeTick.modeChanged;

    this.ghostHouse.update(dtSeconds * 1000, {
      ghosts: this.ghosts,
      pelletsEaten: this.pelletsEaten,
    });
    this.updatePlayer(dtSeconds);
    const playerTile = this.grid.worldToTile(this.player.x, this.player.y);
    this.debug.playerTile = playerTile;

    this.ghostController.update(dtSeconds, {
      grid: this.grid,
      ghosts: this.ghosts,
      mode: this.modeState.mode,
      playerTile,
      playerDirection: this.player.direction || 'left',
      houseDoorTile: this.config.spawn.houseDoor,
    });

    this.handlePellets(event);
    this.handleCollisions(event);
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
