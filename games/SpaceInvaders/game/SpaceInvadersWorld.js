/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersWorld.js
*/
const MAX_STEP_SECONDS = 1 / 120;
const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 18;
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
const ALIEN_DEATH_DURATION = 0.28;
const PLAYER_DEATH_DURATION = 0.5;

const ROW_TYPES = [
  { type: 'squid', points: 30, width: 24, height: 18 },
  { type: 'crab', points: 20, width: 26, height: 18 },
  { type: 'crab', points: 20, width: 26, height: 18 },
  { type: 'octopus', points: 10, width: 24, height: 18 },
  { type: 'octopus', points: 10, width: 24, height: 18 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomChoice(list, rng) {
  if (!list.length) {
    return null;
  }
  return list[Math.floor(rng() * list.length)];
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

export default class SpaceInvadersWorld {
  constructor({ width = 960, height = 720, rng = Math.random } = {}) {
    this.width = width;
    this.height = height;
    this.rng = typeof rng === 'function' ? rng : Math.random;
    this.player = this.createPlayer();
    this.resetGame();
  }

  createPlayer() {
    return {
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      x: 0,
      y: this.height - 78,
      speed: PLAYER_SPEED,
      alive: true,
      respawnTimer: 0,
      invulnerabilityTimer: 0,
    };
  }

  createShot({ x, y, vy, owner }) {
    return {
      x,
      y,
      width: owner === 'player' ? 4 : 6,
      height: owner === 'player' ? 16 : 18,
      vy,
      owner,
      active: true,
    };
  }

  createAlien(row, column, x, y) {
    const rowType = ROW_TYPES[row];
    return {
      row,
      column,
      type: rowType.type,
      points: rowType.points,
      width: rowType.width,
      height: rowType.height,
      x,
      y,
      alive: true,
      animationFrame: 0,
    };
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.status = 'menu';
    this.statusMessage = 'Press Space or Enter to start.';
    this.isWaveTransition = false;
    this.transitionTimer = 0;
    this.gameOver = false;
    this.playerShot = null;
    this.alienShots = [];
    this.alienDeaths = [];
    this.playerDeath = null;
    this.ufo = null;
    this.ufoDirection = 1;
    this.ufoTimer = 12;
    this.player.x = (this.width - this.player.width) / 2;
    this.player.alive = true;
    this.player.respawnTimer = 0;
    this.player.invulnerabilityTimer = 0;
    this.setupWave(this.wave);
  }

  setupWave(waveNumber) {
    const left = 154;
    const top = 148;
    const horizontalSpacing = 56;
    const verticalSpacing = 44;
    this.aliens = [];
    for (let row = 0; row < ALIEN_ROWS; row += 1) {
      for (let column = 0; column < ALIEN_COLUMNS; column += 1) {
        this.aliens.push(
          this.createAlien(
            row,
            column,
            left + (column * horizontalSpacing),
            top + (row * verticalSpacing),
          ),
        );
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
    this.playerDeath = null;
    this.entryDelay = waveNumber === 1 && this.status === 'menu' ? 0 : WAVE_ENTRY_DELAY;
    this.ufo = null;
    this.ufoTimer = clamp(11 - (waveNumber * 0.35), 5.5, 12);
    this.player.x = (this.width - this.player.width) / 2;
    this.player.alive = true;
    this.player.respawnTimer = 0;
    this.player.invulnerabilityTimer = PLAYER_RESPAWN_INVULNERABILITY;
  }

  startGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.gameOver = false;
    this.status = 'playing';
    this.statusMessage = 'Wave 1';
    this.setupWave(1);
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

  firePlayerShot() {
    if (!this.player.alive || this.playerShot) {
      return false;
    }
    this.playerShot = this.createShot({
      x: this.player.x + (this.player.width / 2) - 2,
      y: this.player.y - 16,
      vy: -PLAYER_SHOT_SPEED,
      owner: 'player',
    });
    return true;
  }

  fireAlienShot() {
    if (this.alienShots.length >= 3) {
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
      alive.forEach((alien) => {
        alien.y += FORMATION_STEP_DOWN;
        alien.animationFrame = 1 - alien.animationFrame;
      });
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

  hitPlayer() {
    if (!this.player.alive || this.player.invulnerabilityTimer > 0) {
      return false;
    }
    this.lives -= 1;
    if (this.lives <= 0) {
      this.player.alive = false;
      this.gameOver = true;
      this.status = 'game-over';
      this.statusMessage = 'Game Over';
      this.playerDeath = {
        x: this.player.x,
        y: this.player.y - 20,
        elapsed: 0,
      };
      return true;
    }
    this.player.alive = false;
    this.player.respawnTimer = LIFE_RESPAWN_DELAY;
    this.statusMessage = `${this.lives} lives remaining`;
    this.playerDeath = {
      x: this.player.x,
      y: this.player.y - 20,
      elapsed: 0,
    };
    return true;
  }

  updateAnimations(dtSeconds) {
    this.alienDeaths.forEach((death) => {
      death.elapsed += dtSeconds;
    });
    this.alienDeaths = this.alienDeaths.filter((death) => death.elapsed < ALIEN_DEATH_DURATION);

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
        this.player.x = (this.width - this.player.width) / 2;
        this.player.invulnerabilityTimer = PLAYER_RESPAWN_INVULNERABILITY;
      }
    }

    this.player.invulnerabilityTimer = Math.max(0, this.player.invulnerabilityTimer - dtSeconds);

    if (controls.firePressed && this.firePlayerShot()) {
      event.playerFired = true;
      event.sfx.push('shoot');
    }
  }

  updateShots(dtSeconds, event) {
    if (this.playerShot) {
      this.playerShot.y += this.playerShot.vy * dtSeconds;
      if (this.playerShot.y + this.playerShot.height < 0) {
        this.playerShot = null;
      }
    }

    this.alienShots.forEach((shot) => {
      shot.y += shot.vy * dtSeconds;
    });
    this.alienShots = this.alienShots.filter((shot) => shot.y <= this.height + 24);

    if (this.playerShot) {
      for (const alien of this.aliens) {
        if (!alien.alive) {
          continue;
        }
        if (overlapsRect(this.playerShot, alien)) {
          alien.alive = false;
          this.score += alien.points;
          event.scoreDelta += alien.points;
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
      this.score += this.ufo.points;
      event.scoreDelta += this.ufo.points;
      event.ufoHit = true;
      event.sfx.push('explosion');
      this.playerShot = null;
      this.ufo = null;
      this.ufoTimer = clamp(11 - (this.wave * 0.35), 5.5, 12);
    }

    if (this.playerShot) {
      const shotIndex = this.alienShots.findIndex((shot) => overlapsRect(this.playerShot, shot));
      if (shotIndex >= 0) {
        this.alienShots.splice(shotIndex, 1);
        this.playerShot = null;
      }
    }

    this.alienShots = this.alienShots.filter((shot) => {
      if (this.player.alive && overlapsRect(shot, this.player)) {
        if (this.hitPlayer()) {
          event.playerHit = true;
          event.sfx.push('explosion');
        }
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
        width: 52,
        height: 22,
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
    const bounds = this.getFormationBounds();
    if (bounds && bounds.bottom >= this.player.y + 6) {
      this.lives = 0;
      this.player.alive = false;
      this.gameOver = true;
      this.status = 'game-over';
      this.statusMessage = 'Game Over';
      event.gameOver = true;
      return;
    }

    if (!this.getAliveAliens().length) {
      this.wave += 1;
      this.isWaveTransition = true;
      this.transitionTimer = 1.1;
      this.statusMessage = `Wave ${this.wave - 1} cleared`;
      event.waveCleared = true;
    }
  }

  updateStep(dtSeconds, controls = {}) {
    const event = makeEvent();

    if (this.status === 'menu') {
      if (controls.startPressed) {
        this.startGame();
        event.waveStarted = true;
      }
      return event;
    }

    if (this.status === 'game-over') {
      if (controls.startPressed) {
        this.startGame();
        event.waveStarted = true;
      }
      return event;
    }

    if (this.isWaveTransition) {
      this.transitionTimer = Math.max(0, this.transitionTimer - dtSeconds);
      if (this.transitionTimer === 0) {
        this.isWaveTransition = false;
        this.setupWave(this.wave);
        this.statusMessage = `Wave ${this.wave}`;
        event.waveStarted = true;
      }
      return event;
    }

    if (this.entryDelay > 0) {
      this.entryDelay = Math.max(0, this.entryDelay - dtSeconds);
      this.updateAnimations(dtSeconds);
      return event;
    }

    this.updatePlayer(dtSeconds, controls, event);
    this.updateUfo(dtSeconds, event);

    this.marchTimer -= dtSeconds;
    if (this.marchTimer <= 0) {
      const descended = this.marchFormation();
      this.marchTimer += this.marchInterval;
      event.sfx.push(`fastinvader${(this.wave + this.getAliveAliens().length) % 4 + 1}`);
      if (descended) {
        event.alienFired = this.fireAlienShot();
      } else if (this.rng() < clamp(0.12 + ((this.wave - 1) * 0.03), 0.12, 0.34) * dtSeconds * 60) {
        if (this.fireAlienShot()) {
          event.alienFired = true;
        }
      }
    }

    this.updateShots(dtSeconds, event);
    this.updateAnimations(dtSeconds);
    this.checkWaveState(event);
    if (this.gameOver) {
      event.gameOver = true;
    }
    return event;
  }

  update(dtSeconds, controls = {}) {
    let remaining = Math.max(0, Number(dtSeconds) || 0);
    let event = makeEvent();
    let frameControls = {
      moveAxis: controls.moveAxis ?? 0,
      firePressed: Boolean(controls.firePressed),
      startPressed: Boolean(controls.startPressed),
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
        startPressed: false,
      };
    }

    return event;
  }
}
