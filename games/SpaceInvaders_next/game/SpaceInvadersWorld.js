/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersWorld.js
*/
import { SHIELD_BOMB_OVERLAY, SHIELD_FRAME } from './SpaceInvadersSpriteData.js';
import { clamp } from '/src/engine/utils/math.js';

const MAX_STEP_SECONDS = 1 / 120;
const PLAYER_WIDTH = 51;
const PLAYER_HEIGHT = 33;
const PLAYER_SPEED = 250;
const PLAYER_SHOT_SPEED = 520;
const ALIEN_SHOT_SPEED = 220;
const ALIEN_COLUMNS = 11;
const ALIEN_ROWS = 5;
const FORMATION_STEP_DOWN = 22;
const FORMATION_LEFT_BOUND = 64;
const FORMATION_RIGHT_BOUND = 896;
const INITIAL_MARCH_INTERVAL = 0.68;
const MIN_MARCH_INTERVAL = 0.09;
const WAVE_ENTRY_DELAY = 1.2;
const LIFE_RESPAWN_DELAY = 1.1;
const PLAYER_RESPAWN_INVULNERABILITY = 1.25;
const SPAWN_INTERVAL = 0.016;
const ALIEN_DEATH_DURATION = 0.28;
const BOMB_DEATH_DURATION = 0.28;
const PLAYER_DEATH_DURATION = 0.5;
const UFO_DEATH_DURATION = 0.36;
const UFO_SCORE_POPUP_DURATION = 1.1;
const UFO_SCORE_CYCLE = [100, 50, 50, 100, 150, 100, 100, 50, 300, 100, 100, 100, 50, 150, 100];
const BOMB_TYPES = ['bomb1', 'bomb2', 'bomb3'];
const SHIELD_PIXEL_SIZE = 3;
const SHIELD_COUNT = 4;
const GROUND_PIXEL_SIZE = 3;
const GROUND_ROWS = 2;
const BOMB_FIRE_MULTIPLIER = 10;
const EXTRA_LIFE_SCORE = 1500;
const PLAYER_SWAP_DURATION = 5;
const PLAYER_SWAP_BLINK_INTERVAL = 0.5;
const DESCENT_INTERVAL = SPAWN_INTERVAL * 0.5;
const WAVE_CLEAR_DELAY = 0.45;
const READY_BANNER_DURATION = 0.8;
const PLAYER_Y_OFFSET = 26;

const ROW_TYPES = [
  { type: 'octopus', points: 30, width: 24, height: 24 },
  { type: 'crab', points: 20, width: 36, height: 24 },
  { type: 'crab', points: 20, width: 36, height: 24 },
  { type: 'squid', points: 10, width: 33, height: 24 },
  { type: 'squid', points: 10, width: 33, height: 24 },
];

function randomChoice(list, rng) {
  if (!list.length) {
    return null;
  }
  return list[Math.floor(rng() * list.length)];
}

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function makeEvent() {
  return {
    sfx: [],
    playerFired: false,
    alienFired: false,
    alienHit: false,
    playerHit: false,
    waveStarted: false,
    waveCleared: false,
    gameOver: false,
    scoreDelta: 0,
    ufoSpawned: false,
    ufoHit: false,
    extraLifeAwarded: false,
    playerSwitched: false,
  };
}

function mergeEvents(base, next) {
  return {
    sfx: [...base.sfx, ...(next.sfx || [])],
    playerFired: base.playerFired || next.playerFired,
    alienFired: base.alienFired || next.alienFired,
    alienHit: base.alienHit || next.alienHit,
    playerHit: base.playerHit || next.playerHit,
    waveStarted: base.waveStarted || next.waveStarted,
    waveCleared: base.waveCleared || next.waveCleared,
    gameOver: base.gameOver || next.gameOver,
    scoreDelta: base.scoreDelta + (next.scoreDelta || 0),
    ufoSpawned: base.ufoSpawned || next.ufoSpawned,
    ufoHit: base.ufoHit || next.ufoHit,
    extraLifeAwarded: base.extraLifeAwarded || next.extraLifeAwarded,
    playerSwitched: base.playerSwitched || next.playerSwitched,
  };
}

function overlapsRect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function cloneFrame(frame) {
  return frame.map((row) => row.split('').join(''));
}

function makeEmptyBoardState() {
  return {
    spawnQueue: [],
    spawnTimer: 0,
    formationReady: false,
    shields: [],
    ground: null,
    playerShot: null,
    alienShots: [],
    alienDeaths: [],
    bombDeaths: [],
    playerDeath: null,
    ufo: null,
    ufoDeath: null,
    ufoScorePopups: [],
    aliens: [],
  };
}

export default class SpaceInvadersWorld {
  constructor({ width = 960, height = 720, rng = Math.random } = {}) {
    this.width = width;
    this.height = height;
    this.rng = typeof rng === 'function' ? rng : Math.random;
    this.playerBaseY = this.height - 94;
    this.player = this.createPlayer();
    this.debugBoxes = false;
    this.hiScore = 0;
    this.selectedPlayerCount = 1;
    this.playerCount = 1;
    this.currentPlayerIndex = 0;
    this.players = [];
    this.pendingTurnSwitch = null;
    this.turnAnnouncementTimer = 0;
    this.introBlinkTimer = 0;
    this.introBlinkDuration = PLAYER_SWAP_DURATION;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.formationReady = false;
    this.descentQueue = [];
    this.descentTimer = 0;
    this.descentActive = false;
    this.playerShotsFired = 0;
    this.ufoScorePopups = [];
    this.extraLifeAwarded = false;
    this.resetGame();
  }

  createPlayer() {
    return {
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      x: 0,
      y: this.playerBaseY - PLAYER_Y_OFFSET,
      speed: PLAYER_SPEED,
      alive: true,
      respawnTimer: 0,
      invulnerabilityTimer: 0,
    };
  }

  setPlayerHomePosition() {
    this.player.x = (this.width - this.player.width) / 2;
    this.player.y = this.playerBaseY - PLAYER_Y_OFFSET;
  }

  createShot({ x, y, vy, owner }) {
    return {
      x,
      y,
      width: owner === 'player' ? 3 : 9,
      height: owner === 'player' ? 30 : 24,
      vy,
      owner,
      type: owner === 'player' ? 'laser' : this.getNextBombType(),
      animationFrame: 0,
      animationElapsed: 0,
      active: true,
    };
  }

  createAlien(row, column, x, y) {
    const rowType = ROW_TYPES[row];
    const rowOffsetX = row === 0 ? 6 : 0;
    return {
      row,
      column,
      type: rowType.type,
      points: rowType.points,
      width: rowType.width,
      height: rowType.height,
      x: x + rowOffsetX,
      y,
      alive: true,
      animationFrame: 0,
    };
  }

  createShields() {
    const shieldWidth = 25 * SHIELD_PIXEL_SIZE;
    const margin = 140;
    const spacing = (this.width - (margin * 2)) / (SHIELD_COUNT - 1);
    const y = this.playerBaseY - 140;
    const shields = [];
    for (let index = 0; index < SHIELD_COUNT; index += 1) {
      const centerX = margin + (spacing * index);
      shields.push({
        x: Math.round(centerX - (shieldWidth / 2)),
        y,
        width: shieldWidth,
        height: 19 * SHIELD_PIXEL_SIZE,
        pixelSize: SHIELD_PIXEL_SIZE,
        frame: cloneFrame(SHIELD_FRAME),
      });
    }
    return shields;
  }

  createGround() {
    const columns = Math.floor((this.width - 104) / GROUND_PIXEL_SIZE);
    const frameRow = '1'.repeat(columns);
    const frame = Array.from({ length: GROUND_ROWS }, () => frameRow);
    const height = GROUND_ROWS * GROUND_PIXEL_SIZE;
    const y = (this.playerBaseY + 21) - height;
    return {
      x: 52,
      y,
      width: columns * GROUND_PIXEL_SIZE,
      height,
      pixelSize: GROUND_PIXEL_SIZE,
      frame,
    };
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.extraLifeAwarded = false;
    this.playerCount = this.selectedPlayerCount;
    this.currentPlayerIndex = 0;
    this.players = [];
    this.status = 'menu';
    this.statusMessage = '1 OR 2 PLAYERS';
    this.isWaveTransition = false;
    this.transitionTimer = 0;
    this.gameOver = false;
    this.pendingTurnSwitch = null;
    this.turnAnnouncementTimer = 0;
    this.introBlinkTimer = 0;
    this.introBlinkDuration = PLAYER_SWAP_DURATION;
    this.debugBoxes = this.debugBoxes || false;
    Object.assign(this, makeEmptyBoardState());
    this.ufoScoreCycleIndex = 0;
    this.playerShotsFired = 0;
    this.bombTypeIndex = 0;
    this.ufoDirection = 1;
    this.ufoTimer = 12;
    this.setPlayerHomePosition();
    this.player.alive = true;
    this.player.respawnTimer = 0;
    this.player.invulnerabilityTimer = 0;
    this.entryDelay = 0;
    this.turnAnnouncementTimer = 0;
  }

  setupWave(waveNumber) {
    const left = 154;
    const top = 148;
    const horizontalSpacing = 56;
    const verticalSpacing = 44;
    this.wave = waveNumber;
    this.aliens = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.formationReady = false;
    this.descentQueue = [];
    this.descentTimer = 0;
    this.descentActive = false;
    for (let row = ALIEN_ROWS - 1; row >= 0; row -= 1) {
      for (let column = 0; column < ALIEN_COLUMNS; column += 1) {
        this.spawnQueue.push({
          row,
          column,
          x: left + (column * horizontalSpacing),
          y: top + (row * verticalSpacing),
        });
      }
    }
    this.formationDirection = 1;
    this.marchInterval = Math.max(
      MIN_MARCH_INTERVAL,
      INITIAL_MARCH_INTERVAL - ((waveNumber - 1) * 0.04),
    );
    this.marchTimer = this.marchInterval;
    this.formationStepX = 14;
    this.playerShot = null;
    this.alienShots = [];
    this.alienDeaths = [];
    this.bombDeaths = [];
    this.playerDeath = null;
    this.entryDelay = waveNumber === 1 ? READY_BANNER_DURATION : WAVE_ENTRY_DELAY * 0.5;
    this.ufo = null;
    this.ufoDeath = null;
    this.bombTypeIndex = 0;
    this.ufoTimer = clamp(11 - (waveNumber * 0.35), 5.5, 12);
    this.setPlayerHomePosition();
    this.player.alive = true;
    this.player.respawnTimer = 0;
    this.player.invulnerabilityTimer = PLAYER_RESPAWN_INVULNERABILITY;
    this.shields = this.createShields();
    this.ground = this.createGround();
    this.status = 'playing';
    this.statusMessage = `PLAYER ${this.currentPlayerIndex + 1}`;
    this.gameOver = false;
    this.isWaveTransition = false;
  }

  startGame(playerCount = this.selectedPlayerCount) {
    this.selectedPlayerCount = clamp(Number(playerCount) || 1, 1, 2);
    this.playerCount = this.selectedPlayerCount;
    this.currentPlayerIndex = 0;
    this.pendingTurnSwitch = null;
    this.turnAnnouncementTimer = PLAYER_SWAP_DURATION;
    this.introBlinkTimer = PLAYER_SWAP_DURATION;
    this.introBlinkDuration = PLAYER_SWAP_DURATION;
    this.score = 0;
    this.lives = 3;
    this.extraLifeAwarded = false;
    this.gameOver = false;
    this.status = 'playing';
    this.statusMessage = 'PLAYER 1';
    this.setupWave(1);
    const initialBoardState = this.captureBoardState();
    this.players = Array.from({ length: this.playerCount }, () => ({
      score: 0,
      lives: 3,
      extraLifeAwarded: false,
      boardState: deepClone(initialBoardState),
    }));
    this.loadPlayerSlot(0, { announce: true });
  }

  getActivePlayerSlot() {
    return this.players[this.currentPlayerIndex] ?? null;
  }

  getPlayerScore(index) {
    return this.players[index]?.score ?? (index === this.currentPlayerIndex ? this.score : 0);
  }

  setSelectedPlayerCount(count) {
    this.selectedPlayerCount = clamp(Number(count) || 1, 1, 2);
    this.playerCount = this.selectedPlayerCount;
    this.statusMessage = `${this.selectedPlayerCount} PLAYER${this.selectedPlayerCount > 1 ? 'S' : ''}`;
  }

  syncActivePlayerMeta() {
    const slot = this.getActivePlayerSlot();
    if (!slot) {
      return;
    }
    slot.score = this.score;
    slot.lives = this.lives;
    slot.extraLifeAwarded = this.extraLifeAwarded;
  }

  captureBoardState() {
    return deepClone({
      wave: this.wave,
      statusMessage: this.statusMessage,
      isWaveTransition: this.isWaveTransition,
      transitionTimer: this.transitionTimer,
      spawnQueue: this.spawnQueue,
      spawnTimer: this.spawnTimer,
      formationReady: this.formationReady,
      ufoScoreCycleIndex: this.ufoScoreCycleIndex,
      playerShotsFired: this.playerShotsFired,
      ufoScorePopups: this.ufoScorePopups,
      shields: this.shields,
      ground: this.ground,
      playerShot: this.playerShot,
      alienShots: this.alienShots,
      alienDeaths: this.alienDeaths,
      bombDeaths: this.bombDeaths,
      playerDeath: this.playerDeath,
      ufo: this.ufo,
      ufoDeath: this.ufoDeath,
      bombTypeIndex: this.bombTypeIndex,
      ufoDirection: this.ufoDirection,
      ufoTimer: this.ufoTimer,
      aliens: this.aliens,
      formationDirection: this.formationDirection,
      marchInterval: this.marchInterval,
      marchTimer: this.marchTimer,
      formationStepX: this.formationStepX,
      entryDelay: this.entryDelay,
      player: this.player,
    });
  }

  loadBoardState(boardState) {
    const state = deepClone(boardState);
    this.wave = state.wave;
    this.status = 'playing';
    this.statusMessage = state.statusMessage ?? `PLAYER ${this.currentPlayerIndex + 1}`;
    this.isWaveTransition = Boolean(state.isWaveTransition);
    this.transitionTimer = state.transitionTimer ?? 0;
    this.gameOver = false;
    this.spawnQueue = state.spawnQueue ?? [];
    this.spawnTimer = state.spawnTimer ?? 0;
    this.formationReady = Boolean(state.formationReady);
    this.ufoScoreCycleIndex = state.ufoScoreCycleIndex ?? 0;
    this.playerShotsFired = state.playerShotsFired ?? 0;
    this.ufoScorePopups = state.ufoScorePopups ?? [];
    this.shields = state.shields ?? [];
    this.ground = state.ground ?? null;
    this.playerShot = state.playerShot ?? null;
    this.alienShots = state.alienShots ?? [];
    this.alienDeaths = state.alienDeaths ?? [];
    this.bombDeaths = state.bombDeaths ?? [];
    this.playerDeath = state.playerDeath ?? null;
    this.ufo = state.ufo ?? null;
    this.ufoDeath = state.ufoDeath ?? null;
    this.bombTypeIndex = state.bombTypeIndex ?? 0;
    this.ufoDirection = state.ufoDirection ?? 1;
    this.ufoTimer = state.ufoTimer ?? 12;
    this.aliens = state.aliens ?? [];
    this.formationDirection = state.formationDirection ?? 1;
    this.marchInterval = state.marchInterval ?? INITIAL_MARCH_INTERVAL;
    this.marchTimer = state.marchTimer ?? this.marchInterval;
    this.formationStepX = state.formationStepX ?? 14;
    this.entryDelay = state.entryDelay ?? 0;
    this.player = {
      ...this.createPlayer(),
      ...(state.player ?? {}),
    };
  }

  buildRespawnBoardState() {
    const boardState = this.captureBoardState();
    boardState.player.x = (this.width - this.player.width) / 2;
    boardState.player.alive = true;
    boardState.player.respawnTimer = 0;
    boardState.player.invulnerabilityTimer = PLAYER_RESPAWN_INVULNERABILITY;
    boardState.playerShot = null;
    boardState.alienShots = [];
    boardState.alienDeaths = [];
    boardState.bombDeaths = [];
    boardState.playerDeath = null;
    boardState.ufo = null;
    boardState.ufoDeath = null;
    boardState.ufoScorePopups = [];
    boardState.entryDelay = READY_BANNER_DURATION * 0.75;
    boardState.statusMessage = `PLAYER ${this.currentPlayerIndex + 1}`;
    boardState.isWaveTransition = false;
    boardState.transitionTimer = 0;
    return boardState;
  }

  saveActivePlayerBoardState({ respawnReady = false } = {}) {
    const slot = this.getActivePlayerSlot();
    if (!slot) {
      return;
    }
    this.syncActivePlayerMeta();
    slot.boardState = respawnReady ? this.buildRespawnBoardState() : this.captureBoardState();
  }

  loadPlayerSlot(index, { announce = false } = {}) {
    const slot = this.players[index];
    if (!slot) {
      return false;
    }
    this.currentPlayerIndex = index;
    this.score = slot.score;
    this.lives = slot.lives;
    this.extraLifeAwarded = Boolean(slot.extraLifeAwarded);
    this.loadBoardState(slot.boardState);
    this.statusMessage = `PLAYER ${index + 1}`;
    if (announce) {
      this.turnAnnouncementTimer = Math.max(this.turnAnnouncementTimer, READY_BANNER_DURATION);
      this.entryDelay = Math.max(this.entryDelay, READY_BANNER_DURATION * 0.75);
    }
    return true;
  }

  getOtherLivingPlayerIndex() {
    if (this.playerCount < 2) {
      return -1;
    }
    for (let index = 0; index < this.players.length; index += 1) {
      if (index === this.currentPlayerIndex) {
        continue;
      }
      if ((this.players[index]?.lives ?? 0) > 0) {
        return index;
      }
    }
    return -1;
  }

  queuePlayerSwitch(targetIndex) {
    this.pendingTurnSwitch = {
      targetIndex,
      timer: PLAYER_SWAP_DURATION,
      duration: PLAYER_SWAP_DURATION,
    };
    this.turnAnnouncementTimer = PLAYER_SWAP_DURATION;
    this.statusMessage = `PLAYER ${targetIndex + 1}`;
  }

  getPlayerSwapBlinkVisible() {
    if (!this.pendingTurnSwitch) {
      if (this.introBlinkTimer <= 0) {
        return true;
      }
      const elapsed = this.introBlinkDuration - this.introBlinkTimer;
      const blinkIndex = Math.floor(elapsed / PLAYER_SWAP_BLINK_INTERVAL);
      return blinkIndex % 2 === 0;
    }
    const elapsed = this.pendingTurnSwitch.duration - this.pendingTurnSwitch.timer;
    const blinkIndex = Math.floor(elapsed / PLAYER_SWAP_BLINK_INTERVAL);
    return blinkIndex % 2 === 0;
  }

  getBlinkTargetIndex() {
    if (this.pendingTurnSwitch) {
      return this.pendingTurnSwitch.targetIndex;
    }
    if (this.introBlinkTimer > 0) {
      return this.currentPlayerIndex;
    }
    return this.currentPlayerIndex;
  }

  awardScore(points, event) {
    if (!points) {
      return;
    }
    this.score += points;
    this.hiScore = Math.max(this.hiScore, this.score);
    event.scoreDelta += points;
    if (!this.extraLifeAwarded && this.score >= EXTRA_LIFE_SCORE) {
      this.lives += 1;
      this.extraLifeAwarded = true;
      event.extraLifeAwarded = true;
      this.statusMessage = 'EXTRA LIFE';
      this.turnAnnouncementTimer = Math.max(this.turnAnnouncementTimer, 1);
    }
    this.syncActivePlayerMeta();
  }

  getAliveAliens() {
    return this.aliens.filter((alien) => alien.alive);
  }

  getFormationBounds() {
    const alive = this.getAliveAliens();
    if (!alive.length) {
      return null;
    }
    const left = Math.min(...alive.map((alien) => alien.x));
    const right = Math.max(...alive.map((alien) => alien.x + alien.width));
    const bottom = Math.max(...alive.map((alien) => alien.y + alien.height));
    return { left, right, bottom };
  }

  getLowestAlienInColumn(column) {
    const columnAliens = this.aliens
      .filter((alien) => alien.alive && alien.column === column)
      .sort((a, b) => b.y - a.y);
    return columnAliens[0] ?? null;
  }

  getNextBombType() {
    const type = BOMB_TYPES[this.bombTypeIndex % BOMB_TYPES.length];
    this.bombTypeIndex += 1;
    return type;
  }

  processSpawns(dtSeconds) {
    if (!this.spawnQueue.length) {
      return;
    }

    this.spawnTimer += dtSeconds;
    while (this.spawnTimer >= SPAWN_INTERVAL && this.spawnQueue.length) {
      const next = this.spawnQueue.shift();
      this.aliens.push(this.createAlien(next.row, next.column, next.x, next.y));
      this.spawnTimer -= SPAWN_INTERVAL;
    }

    if (!this.spawnQueue.length) {
      this.formationReady = true;
      this.marchTimer = this.marchInterval;
    }
  }

  buildDescentQueue() {
    return this.getAliveAliens()
      .slice()
      .sort((a, b) => {
        if (a.row !== b.row) {
          return b.row - a.row;
        }
        return a.column - b.column;
      });
  }

  startDescent() {
    this.descentQueue = this.buildDescentQueue();
    this.descentTimer = 0;
    this.descentActive = this.descentQueue.length > 0;
  }

  processDescent(dtSeconds) {
    if (!this.descentActive || !this.descentQueue.length) {
      this.descentActive = false;
      return;
    }
    this.descentTimer += dtSeconds;
    while (this.descentTimer >= DESCENT_INTERVAL && this.descentQueue.length) {
      const alien = this.descentQueue.shift();
      if (alien && alien.alive) {
        alien.y += FORMATION_STEP_DOWN;
        alien.animationFrame = 1 - alien.animationFrame;
      }
      this.descentTimer -= DESCENT_INTERVAL;
    }
    if (!this.descentQueue.length) {
      this.descentActive = false;
    }
  }

  getNextUfoScore() {
    const shots = Math.max(1, this.playerShotsFired);
    const score = UFO_SCORE_CYCLE[(shots - 1) % UFO_SCORE_CYCLE.length];
    return score;
  }

  tickScorePopups(dtSeconds) {
    if (dtSeconds <= 0 || !this.ufoScorePopups.length) {
      return;
    }
    this.ufoScorePopups.forEach((popup) => {
      popup.visibleDelay = Math.max(0, popup.visibleDelay - dtSeconds);
      popup.lifeRemaining = Math.max(0, popup.lifeRemaining - dtSeconds);
    });
    this.ufoScorePopups = this.ufoScorePopups.filter((popup) => popup.lifeRemaining > 0);
  }

  applyOverlay(frame, overlay, impactColumn, impactRow) {
    const rows = frame.map((row) => row.split(''));
    const halfH = Math.floor(overlay.length / 2);
    const halfW = Math.floor((overlay[0] ?? '').length / 2);
    let changed = false;

    for (let overlayRow = 0; overlayRow < overlay.length; overlayRow += 1) {
      const targetRow = impactRow + overlayRow - halfH;
      if (targetRow < 0 || targetRow >= rows.length) {
        continue;
      }
      for (let overlayCol = 0; overlayCol < overlay[overlayRow].length; overlayCol += 1) {
        const targetCol = impactColumn + overlayCol - halfW;
        if (targetCol < 0 || targetCol >= rows[targetRow].length) {
          continue;
        }
        if (overlay[overlayRow][overlayCol] === '1' && rows[targetRow][targetCol] === '1') {
          rows[targetRow][targetCol] = '0';
          changed = true;
        }
      }
    }

    return { frame: rows.map((row) => row.join('')), changed };
  }

  handleBombAgainstShield(shot, shield, event) {
    const hitX = (shot.x + (shot.width / 2)) - shield.x;
    const hitY = (shot.y + shot.height) - shield.y;
    const impactColumn = Math.floor(hitX / shield.pixelSize);
    const impactRow = Math.floor(hitY / shield.pixelSize);
    const first = this.applyOverlay(shield.frame, SHIELD_BOMB_OVERLAY, impactColumn, impactRow);
    const second = this.applyOverlay(first.frame, SHIELD_BOMB_OVERLAY, impactColumn + 1, impactRow);
    const third = this.applyOverlay(second.frame, SHIELD_BOMB_OVERLAY, impactColumn - 1, impactRow);
    const fourth = this.applyOverlay(third.frame, SHIELD_BOMB_OVERLAY, impactColumn + 2, impactRow);
    const fifth = this.applyOverlay(fourth.frame, SHIELD_BOMB_OVERLAY, impactColumn, impactRow - 1);
    const sixth = this.applyOverlay(fifth.frame, SHIELD_BOMB_OVERLAY, impactColumn, impactRow + 1);
    const changed = first.changed || second.changed || third.changed || fourth.changed || fifth.changed || sixth.changed;
    if (changed) {
      shield.frame = sixth.frame;
      this.bombDeaths.push({
        x: shot.x - 12,
        y: shot.y,
        elapsed: 0,
      });
      event.sfx.push('explosion');
    }
    return changed;
  }

  handleBombAgainstGround(shot, event) {
    if (!this.ground) {
      return false;
    }
    const hitX = (shot.x + (shot.width / 2)) - this.ground.x;
    const hitY = (shot.y + shot.height) - this.ground.y;
    const impactColumn = Math.floor(hitX / this.ground.pixelSize);
    const impactRow = Math.floor(hitY / this.ground.pixelSize);
    const { frame, changed } = this.applyOverlay(this.ground.frame, SHIELD_BOMB_OVERLAY, impactColumn, impactRow);
    if (changed) {
      this.ground.frame = frame;
      this.bombDeaths.push({
        x: shot.x - 12,
        y: shot.y,
        elapsed: 0,
      });
      event.sfx.push('explosion');
    }
    return changed;
  }

  erodeShieldsUnderAliens() {
    if (!this.shields.length) {
      return;
    }
    const aliveAliens = this.getAliveAliens();
    this.shields.forEach((shield) => {
      let changed = false;
      const rows = shield.frame.map((row) => row.split(''));
      aliveAliens.forEach((alien) => {
        if (!overlapsRect(alien, shield)) {
          return;
        }
        const overlapX1 = Math.max(alien.x, shield.x);
        const overlapY1 = Math.max(alien.y, shield.y);
        const overlapX2 = Math.min(alien.x + alien.width, shield.x + shield.width);
        const overlapY2 = Math.min(alien.y + alien.height, shield.y + shield.height);
        const startCol = Math.floor((overlapX1 - shield.x) / shield.pixelSize);
        const endCol = Math.ceil((overlapX2 - shield.x) / shield.pixelSize);
        const startRow = Math.floor((overlapY1 - shield.y) / shield.pixelSize);
        const endRow = Math.ceil((overlapY2 - shield.y) / shield.pixelSize);
        for (let r = startRow; r < endRow; r += 1) {
          if (r < 0 || r >= rows.length) continue;
          for (let c = startCol; c < endCol; c += 1) {
            if (c < 0 || c >= rows[r].length) continue;
            if (rows[r][c] === '1') {
              rows[r][c] = '0';
              changed = true;
            }
          }
        }
      });
      if (changed) {
        shield.frame = rows.map((row) => row.join(''));
      }
    });
  }
  firePlayerShot() {
    if (!this.player.alive || this.playerShot) {
      return false;
    }
    const laserWidth = 3;
    const laserHeight = 30;
    const laserOriginY = this.player.y - 20; // top of player bitmap as drawn
    this.playerShot = this.createShot({
      x: this.player.x + (this.player.width * 0.5) - (laserWidth * 0.5) - 4,
      y: laserOriginY,
      vy: -PLAYER_SHOT_SPEED,
      owner: 'player',
    });
    this.playerShotsFired += 1;
    return true;
  }

  fireAlienShot() {
    if (!this.formationReady || this.alienShots.length >= 3) {
      return false;
    }
    const liveColumns = Array.from({ length: ALIEN_COLUMNS }, (_, column) => column)
      .map((column) => this.getLowestAlienInColumn(column))
      .filter(Boolean);
    const shooter = randomChoice(liveColumns, this.rng);
    if (!shooter) {
      return false;
    }
    this.alienShots.push(this.createShot({
      x: shooter.x + (shooter.width / 2) - 3,
      y: shooter.y + shooter.height + 4,
      vy: ALIEN_SHOT_SPEED + ((this.wave - 1) * 12),
      owner: 'alien',
    }));
    return true;
  }

  marchFormation() {
    const alive = this.getAliveAliens();
    if (!alive.length) {
      return false;
    }
    const bounds = this.getFormationBounds();
    const wouldHitRight = this.formationDirection > 0 && (bounds.right + this.formationStepX) >= FORMATION_RIGHT_BOUND;
    const wouldHitLeft = this.formationDirection < 0 && (bounds.left - this.formationStepX) <= FORMATION_LEFT_BOUND;

    if (wouldHitLeft || wouldHitRight) {
      this.formationDirection *= -1;
      this.startDescent();
      return true;
    }

    alive.forEach((alien) => {
      alien.x += this.formationStepX * this.formationDirection;
      alien.animationFrame = 1 - alien.animationFrame;
    });
    return false;
  }

  updateMarchSpeed() {
    const aliveCount = this.getAliveAliens().length;
    const ratio = aliveCount / (ALIEN_COLUMNS * ALIEN_ROWS);
    const speedup = (1 - ratio) * 0.48;
    this.marchInterval = clamp(
      (INITIAL_MARCH_INTERVAL - ((this.wave - 1) * 0.04)) - speedup,
      MIN_MARCH_INTERVAL,
      INITIAL_MARCH_INTERVAL,
    );
  }

  hitPlayer(event) {
    if (!this.player.alive || this.player.invulnerabilityTimer > 0) {
      return false;
    }

    this.lives -= 1;
    this.syncActivePlayerMeta();
    this.player.alive = false;
    this.playerDeath = {
      x: this.player.x,
      y: this.player.y - 20,
      elapsed: 0,
    };

    if (this.lives <= 0) {
      const otherLivingPlayer = this.getOtherLivingPlayerIndex();
      if (otherLivingPlayer >= 0) {
        this.saveActivePlayerBoardState({ respawnReady: false });
        this.queuePlayerSwitch(otherLivingPlayer);
        event.playerSwitched = true;
        return true;
      }
      this.gameOver = true;
      this.status = 'game-over';
      this.statusMessage = 'Game Over';
      event.gameOver = true;
      return true;
    }

    const otherLivingPlayer = this.getOtherLivingPlayerIndex();
    if (otherLivingPlayer >= 0) {
      this.saveActivePlayerBoardState({ respawnReady: true });
      this.queuePlayerSwitch(otherLivingPlayer);
      event.playerSwitched = true;
      return true;
    }

    this.player.respawnTimer = LIFE_RESPAWN_DELAY;
    this.statusMessage = `${this.lives} lives remaining`;
    return true;
  }

  updateAnimations(dtSeconds) {
    this.alienDeaths.forEach((death) => {
      death.elapsed += dtSeconds;
    });
    this.alienDeaths = this.alienDeaths.filter((death) => death.elapsed < ALIEN_DEATH_DURATION);

    this.bombDeaths.forEach((death) => {
      death.elapsed += dtSeconds;
    });
    this.bombDeaths = this.bombDeaths.filter((death) => death.elapsed < BOMB_DEATH_DURATION);

    if (this.ufoDeath) {
      this.ufoDeath.elapsed += dtSeconds;
      if (this.ufoDeath.elapsed >= UFO_DEATH_DURATION) {
        this.ufoDeath = null;
      }
    }

    if (!this.playerDeath) {
      return;
    }

    this.playerDeath.elapsed += dtSeconds;
    if (this.playerDeath.elapsed >= PLAYER_DEATH_DURATION) {
      this.playerDeath = null;
    }
  }

  updatePlayer(dtSeconds, controls, event) {
    const axis = clamp(Number(controls.moveAxis) || 0, -1, 1);
    if (this.player.alive) {
      this.player.x = clamp(
        this.player.x + (axis * this.player.speed * dtSeconds),
        52,
        this.width - 52 - this.player.width,
      );
    } else if (!this.gameOver) {
      this.player.respawnTimer = Math.max(0, this.player.respawnTimer - dtSeconds);
      if (this.player.respawnTimer === 0) {
        this.player.alive = true;
    this.setPlayerHomePosition();
        this.player.invulnerabilityTimer = PLAYER_RESPAWN_INVULNERABILITY;
      }
    }

    this.player.invulnerabilityTimer = Math.max(0, this.player.invulnerabilityTimer - dtSeconds);

    if ((controls.firePressed || controls.fireHeld) && this.firePlayerShot()) {
      event.playerFired = true;
      event.sfx.push('shoot');
    }
  }

  updateShots(dtSeconds, event) {
    if (this.playerShot) {
      this.playerShot.animationElapsed = (this.playerShot.animationElapsed ?? 0) + dtSeconds;
      this.playerShot.y += this.playerShot.vy * dtSeconds;
      if (this.playerShot.y + this.playerShot.height < 0) {
        this.playerShot = null;
      }
    }

    this.alienShots.forEach((shot) => {
      shot.animationElapsed = (shot.animationElapsed ?? 0) + dtSeconds;
      const frameCount = shot.type === 'bomb3' ? 5 : 4;
      shot.animationFrame = Math.floor(shot.animationElapsed * 18) % frameCount;
      shot.y += shot.vy * dtSeconds;
    });
    this.alienShots = this.alienShots.filter((shot) => shot.y <= this.height + 24);

    if (this.playerShot) {
      for (const shield of this.shields) {
        if (overlapsRect(this.playerShot, shield)) {
          const hitX = (this.playerShot.x + (this.playerShot.width / 2)) - shield.x;
          const hitY = this.playerShot.y - shield.y;
          const impactColumn = Math.floor(hitX / shield.pixelSize);
          const impactRow = Math.floor(hitY / shield.pixelSize);
          const first = this.applyOverlay(shield.frame, SHIELD_BOMB_OVERLAY, impactColumn, impactRow);
          const second = this.applyOverlay(first.frame, SHIELD_BOMB_OVERLAY, impactColumn + 1, impactRow);
          const third = this.applyOverlay(second.frame, SHIELD_BOMB_OVERLAY, impactColumn, impactRow - 1);
          const changed = first.changed || second.changed || third.changed;
          if (changed) {
            shield.frame = third.frame;
            this.playerShot = null;
            break;
          }
        }
      }
    }

    // Bombs vs shields and ground
    for (let index = this.alienShots.length - 1; index >= 0; index -= 1) {
      const shot = this.alienShots[index];
      let consumed = false;
      for (const shield of this.shields) {
        if (overlapsRect(shot, shield) && this.handleBombAgainstShield(shot, shield, event)) {
          this.alienShots.splice(index, 1);
          consumed = true;
          break;
        }
      }
      if (consumed) {
        continue;
      }
      if (this.ground && overlapsRect(shot, this.ground) && this.handleBombAgainstGround(shot, event)) {
        this.alienShots.splice(index, 1);
      }
    }

    if (this.playerShot) {
      for (const alien of this.aliens) {
        if (!alien.alive) {
          continue;
        }
        if (overlapsRect(this.playerShot, alien)) {
          alien.alive = false;
          this.awardScore(alien.points, event);
          event.alienHit = true;
          event.sfx.push('invaderkilled');
          this.alienDeaths.push({
            x: alien.x,
            y: alien.y,
            type: alien.type,
            elapsed: 0,
          });
          this.playerShot = null;
          this.updateMarchSpeed();
          break;
        }
      }
    }

    if (this.playerShot && this.ufo && overlapsRect(this.playerShot, this.ufo)) {
      const awarded = this.getNextUfoScore();
      this.awardScore(awarded, event);
      event.ufoHit = true;
      event.sfx.push('explosion');
      this.ufoDeath = {
        x: this.ufo.x,
        y: this.ufo.y,
        elapsed: 0,
      };
      this.ufoScorePopups.push({
        x: this.ufo.x,
        y: this.ufo.y,
        value: awarded,
        visibleDelay: UFO_DEATH_DURATION,
        lifeRemaining: UFO_DEATH_DURATION + UFO_SCORE_POPUP_DURATION,
      });
      this.playerShot = null;
      this.ufo = null;
      this.ufoTimer = clamp(11 - (this.wave * 0.35), 5.5, 12);
    }

    if (this.playerShot) {
      const shotIndex = this.alienShots.findIndex((shot) => overlapsRect(this.playerShot, shot));
      if (shotIndex >= 0) {
        const bomb = this.alienShots[shotIndex];
        if (bomb.type !== 'bomb3') {
          this.bombDeaths.push({
            x: bomb.x - 12,
            y: bomb.y,
            elapsed: 0,
          });
          this.alienShots.splice(shotIndex, 1);
        }
        this.playerShot = null;
      }
    }

    this.alienShots = this.alienShots.filter((shot) => {
      if (this.player.alive && overlapsRect(shot, this.player)) {
        if (this.hitPlayer(event)) {
          event.playerHit = true;
          event.sfx.push('explosion');
        }
        this.bombDeaths.push({
          x: shot.x - 12,
          y: shot.y,
          elapsed: 0,
        });
        return false;
      }
      return true;
    });
  }

  updateUfo(dtSeconds, event) {
    this.ufoTimer -= dtSeconds;
    if (!this.ufo && this.ufoTimer <= 0) {
      this.ufoDirection = this.rng() > 0.5 ? 1 : -1;
      this.ufo = {
        x: this.ufoDirection > 0 ? -80 : this.width + 20,
        y: 94,
        width: 48,
        height: 24,
        speed: 110,
        points: 100,
      };
      this.ufoTimer = clamp(16 - (this.wave * 0.25), 8, 18);
      event.ufoSpawned = true;
      event.sfx.push(this.ufoDirection > 0 ? 'ufo_lowpitch' : 'ufo_highpitch');
    }

    if (!this.ufo) {
      return;
    }

    this.ufo.x += this.ufo.speed * this.ufoDirection * dtSeconds;
    if (this.ufoDirection > 0 && this.ufo.x > this.width + 40) {
      this.ufo = null;
    } else if (this.ufoDirection < 0 && this.ufo.x + this.ufo.width < -40) {
      this.ufo = null;
    }
  }

  checkWaveState(event) {
    const alive = this.getAliveAliens();
    if (alive.length) {
      const dangerLineY = Math.max(...alive.map((alien) => alien.y + (alien.height * 2)));
      if (dangerLineY >= this.player.y) {
        this.lives = 0;
        this.player.alive = false;
        this.syncActivePlayerMeta();
        const otherLivingPlayer = this.getOtherLivingPlayerIndex();
        if (otherLivingPlayer >= 0) {
          this.saveActivePlayerBoardState({ respawnReady: false });
          this.queuePlayerSwitch(otherLivingPlayer);
          event.playerSwitched = true;
        } else {
          this.gameOver = true;
          this.status = 'game-over';
          this.statusMessage = 'Game Over';
          event.gameOver = true;
        }
        return;
      }
    }

    if (!this.getAliveAliens().length) {
      this.wave += 1;
      this.isWaveTransition = true;
      this.transitionTimer = WAVE_CLEAR_DELAY;
      this.statusMessage = `WAVE ${this.wave}`;
      event.waveCleared = true;
      this.saveActivePlayerBoardState();
    }
  }

  updateStep(dtSeconds, controls = {}) {
    const event = makeEvent();

    if (controls.debugPressed) {
      this.debugBoxes = !this.debugBoxes;
    }
    this.turnAnnouncementTimer = Math.max(0, this.turnAnnouncementTimer - dtSeconds);

    if (this.status === 'menu') {
      if (controls.select1Pressed) {
        this.setSelectedPlayerCount(1);
      } else if (controls.select2Pressed) {
        this.setSelectedPlayerCount(2);
      }
      if (controls.startPressed) {
        this.startGame(this.selectedPlayerCount);
        event.waveStarted = true;
      }
      return event;
    }

    if (this.status === 'game-over') {
      if (controls.startPressed) {
        this.resetGame();
        event.waveStarted = true;
      }
      return event;
    }

    if (this.introBlinkTimer > 0) {
      this.updateAnimations(dtSeconds);
      this.introBlinkTimer = Math.max(0, this.introBlinkTimer - dtSeconds);
      if (this.introBlinkTimer === 0) {
        this.entryDelay = Math.max(this.entryDelay, READY_BANNER_DURATION * 0.75);
      }
      return event;
    }

    if (this.pendingTurnSwitch) {
      this.updateAnimations(dtSeconds);
      this.pendingTurnSwitch.timer = Math.max(0, this.pendingTurnSwitch.timer - dtSeconds);
      if (this.pendingTurnSwitch.timer === 0) {
        const { targetIndex } = this.pendingTurnSwitch;
        this.pendingTurnSwitch = null;
        this.loadPlayerSlot(targetIndex, { announce: true });
        event.playerSwitched = true;
      }
      return event;
    }

    if (this.isWaveTransition) {
      this.transitionTimer = Math.max(0, this.transitionTimer - dtSeconds);
      this.updateAnimations(dtSeconds);
      if (this.transitionTimer === 0) {
        this.isWaveTransition = false;
        this.setupWave(this.wave);
        this.turnAnnouncementTimer = Math.max(this.turnAnnouncementTimer, READY_BANNER_DURATION * 0.75);
        this.syncActivePlayerMeta();
        this.saveActivePlayerBoardState();
        event.waveStarted = true;
      }
      return event;
    }

    this.processSpawns(dtSeconds);

    if (this.entryDelay > 0) {
      this.entryDelay = Math.max(0, this.entryDelay - dtSeconds);
      this.updateAnimations(dtSeconds);
      return event;
    }

    this.updatePlayer(dtSeconds, controls, event);
    this.updateUfo(dtSeconds, event);

    if (this.formationReady) {
      if (this.descentActive) {
        this.processDescent(dtSeconds);
      } else {
      this.marchTimer -= dtSeconds;
      if (this.marchTimer <= 0) {
        const descended = this.marchFormation();
        this.marchTimer += this.marchInterval;
        event.sfx.push(`fastinvader${(this.wave + this.getAliveAliens().length) % 4 + 1}`);
        if (descended) {
          event.alienFired = this.fireAlienShot();
        } else if (this.rng() < clamp(0.12 + ((this.wave - 1) * 0.03), 0.12, 0.34) * dtSeconds * 60 * BOMB_FIRE_MULTIPLIER) {
          if (this.fireAlienShot()) {
            event.alienFired = true;
          }
        }
      }
      }
    }

    this.updateShots(dtSeconds, event);
    this.updateAnimations(dtSeconds);
    this.erodeShieldsUnderAliens();
    if (!this.formationReady || this.pendingTurnSwitch) {
      this.syncActivePlayerMeta();
      return event;
    }
    this.checkWaveState(event);
    if (this.gameOver) {
      event.gameOver = true;
    }
    this.syncActivePlayerMeta();
    return event;
  }

  update(dtSeconds, controls = {}) {
    let remaining = Math.max(0, Number(dtSeconds) || 0);
    this.tickScorePopups(remaining);
    let event = makeEvent();
    let frameControls = {
      moveAxis: controls.moveAxis ?? 0,
      firePressed: Boolean(controls.firePressed),
      fireHeld: Boolean(controls.fireHeld),
      startPressed: Boolean(controls.startPressed),
      debugPressed: Boolean(controls.debugPressed),
      select1Pressed: Boolean(controls.select1Pressed),
      select2Pressed: Boolean(controls.select2Pressed),
    };

    if (remaining === 0) {
      return this.updateStep(0, frameControls);
    }

    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP_SECONDS);
      event = mergeEvents(event, this.updateStep(step, frameControls));
      remaining -= step;
      frameControls = {
        ...frameControls,
        firePressed: false,
        fireHeld: frameControls.fireHeld,
        startPressed: false,
        select1Pressed: false,
        select2Pressed: false,
      };
    }

    return event;
  }
}
