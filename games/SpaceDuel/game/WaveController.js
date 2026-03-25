/*
Toolbox Aid
David Quesenberry
03/25/2026
WaveController.js
*/
const ENEMY_COLORS = {
  2: '#f8fafc',
  1: '#cbd5e1',
};

const ENEMY_SCORE = {
  2: 120,
  1: 220,
};

const HAZARD_SCORE = 180;
const SHOT_SCORE = 30;
const MAX_ENEMY_SHOTS_BASE = 6;

function randomBetween(min, max) {
  return min + (Math.random() * (max - min));
}

function makeEnemy(id, wave, tier = 2) {
  const speedScale = tier === 2 ? 1 : 1.24;
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(56, 90) + (wave * 7);
  const radius = tier === 2 ? 22 : 13;
  const sides = tier === 2 ? 7 : 5;

  return {
    id,
    type: 'enemy',
    tier,
    x: randomBetween(80, 880),
    y: randomBetween(110, 540),
    vx: Math.cos(angle) * speed * speedScale,
    vy: Math.sin(angle) * speed * speedScale,
    radius,
    sides,
    angle: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-1.6, 1.6),
    fireCooldown: randomBetween(1.1, 2.4),
    color: ENEMY_COLORS[tier],
  };
}

function makeHazard(id, wave) {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(30, 55) + (wave * 2.2);
  return {
    id,
    type: 'hazard',
    x: randomBetween(90, 870),
    y: randomBetween(140, 500),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 18,
    pulse: randomBetween(0, Math.PI * 2),
  };
}

export default class WaveController {
  constructor({ physics }) {
    this.physics = physics;
    this.wave = 1;
    this.enemies = [];
    this.hazards = [];
    this.enemyShots = [];
    this.nextEnemyId = 1;
    this.nextHazardId = 1;
    this.nextShotId = 1;
    this.waveAdvanceTimer = 0;
  }

  reset() {
    this.wave = 1;
    this.enemies = [];
    this.hazards = [];
    this.enemyShots = [];
    this.waveAdvanceTimer = 0;
    this.spawnWave(this.wave);
  }

  spawnWave(waveNumber) {
    this.wave = waveNumber;
    this.enemies = [];
    this.hazards = [];
    this.enemyShots = [];

    const enemyCount = Math.min(3 + waveNumber, 10);
    const hazardCount = Math.min(1 + Math.floor((waveNumber - 1) / 2), 4);

    for (let i = 0; i < enemyCount; i += 1) {
      this.enemies.push(makeEnemy(this.nextEnemyId++, waveNumber, 2));
    }

    for (let i = 0; i < hazardCount; i += 1) {
      this.hazards.push(makeHazard(this.nextHazardId++, waveNumber));
    }
  }

  update(dtSeconds, players) {
    const events = {
      waveStarted: false,
      waveCleared: false,
      enemiesDestroyed: 0,
      hazardsDestroyed: 0,
      shotsDestroyed: 0,
    };

    this.enemies.forEach((enemy) => {
      enemy.angle += enemy.spin * dtSeconds;
      enemy.fireCooldown -= dtSeconds;
      this.physics.advanceBody(enemy, dtSeconds);

      if (enemy.fireCooldown <= 0) {
        enemy.fireCooldown = randomBetween(1.2, 2.6) / Math.max(1, this.wave * 0.18 + 0.82);
        const maxEnemyShots = MAX_ENEMY_SHOTS_BASE + Math.min(8, Math.floor(this.wave * 0.75));
        if (this.enemyShots.length >= maxEnemyShots) {
          return;
        }

        const nearest = this.physics.findNearestTarget(enemy, players);
        if (!nearest) {
          return;
        }

        const delta = this.physics.getWrappedDelta(nearest, enemy);
        const dx = delta.dx;
        const dy = delta.dy;
        const norm = Math.max(1, Math.hypot(dx, dy));
        const speed = 205 + (this.wave * 10);
        this.enemyShots.push({
          id: this.nextShotId++,
          x: enemy.x,
          y: enemy.y,
          vx: (dx / norm) * speed,
          vy: (dy / norm) * speed,
          radius: 3,
          ttl: 2.8,
        });
      }
    });

    this.hazards.forEach((hazard) => {
      hazard.pulse += dtSeconds * 2.3;
      this.physics.advanceBody(hazard, dtSeconds);
    });

    this.physics.updateBullets(this.enemyShots, dtSeconds);

    if (this.enemies.length === 0 && this.hazards.length === 0) {
      if (this.waveAdvanceTimer <= 0) {
        this.waveAdvanceTimer = 1.05;
        events.waveCleared = true;
      } else {
        this.waveAdvanceTimer -= dtSeconds;
        if (this.waveAdvanceTimer <= 0) {
          this.spawnWave(this.wave + 1);
          events.waveStarted = true;
        }
      }
    } else {
      this.waveAdvanceTimer = 0;
    }

    return events;
  }

  handlePlayerBulletCollisions(playerBullets, scoreManager) {
    const events = {
      destroyedEnemies: 0,
      destroyedHazards: 0,
      destroyedShots: 0,
      extraLife: false,
    };

    for (let bulletIndex = playerBullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = playerBullets[bulletIndex];
      let consumed = false;

      for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0 && !consumed; enemyIndex -= 1) {
        const enemy = this.enemies[enemyIndex];
        if (!this.physics.collidesCircle(bullet, enemy)) {
          continue;
        }

        this.enemies.splice(enemyIndex, 1);
        const scoreResult = scoreManager.addScore(bullet.ownerId, ENEMY_SCORE[enemy.tier] ?? 100);
        events.extraLife = events.extraLife || scoreResult.extraLifeAwarded;
        events.destroyedEnemies += 1;

        if (enemy.tier > 1) {
          this.enemies.push({
            ...makeEnemy(this.nextEnemyId++, this.wave, 1),
            x: enemy.x,
            y: enemy.y,
            vx: enemy.vy,
            vy: -enemy.vx,
          });
          this.enemies.push({
            ...makeEnemy(this.nextEnemyId++, this.wave, 1),
            x: enemy.x,
            y: enemy.y,
            vx: -enemy.vy,
            vy: enemy.vx,
          });
        }

        consumed = true;
      }

      for (let hazardIndex = this.hazards.length - 1; hazardIndex >= 0 && !consumed; hazardIndex -= 1) {
        const hazard = this.hazards[hazardIndex];
        if (!this.physics.collidesCircle(bullet, hazard)) {
          continue;
        }

        this.hazards.splice(hazardIndex, 1);
        const scoreResult = scoreManager.addScore(bullet.ownerId, HAZARD_SCORE);
        events.extraLife = events.extraLife || scoreResult.extraLifeAwarded;
        events.destroyedHazards += 1;
        consumed = true;
      }

      for (let shotIndex = this.enemyShots.length - 1; shotIndex >= 0 && !consumed; shotIndex -= 1) {
        const shot = this.enemyShots[shotIndex];
        if (!this.physics.collidesCircle(bullet, shot)) {
          continue;
        }

        this.enemyShots.splice(shotIndex, 1);
        const scoreResult = scoreManager.addScore(bullet.ownerId, SHOT_SCORE);
        events.extraLife = events.extraLife || scoreResult.extraLifeAwarded;
        events.destroyedShots += 1;
        consumed = true;
      }

      if (consumed) {
        playerBullets.splice(bulletIndex, 1);
      }
    }

    return events;
  }
}
