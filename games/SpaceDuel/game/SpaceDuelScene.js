/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import PhysicsController from './PhysicsController.js';
import PlayerController from './PlayerController.js';
import WaveController from './WaveController.js';
import ScoreManager from './ScoreManager.js';
import SoundController from './SoundController.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#020617',
  border: '#8aa0bb',
  text: '#e2e8f0',
  muted: '#93a5bc',
  player1: '#ffffff',
  player2: '#9ae6b4',
  enemy: '#e2e8f0',
  hazard: '#fca5a5',
  bullet: '#f8fafc',
  enemyShot: '#f87171',
};

function shipPoints(ship) {
  const cos = Math.cos(ship.angle);
  const sin = Math.sin(ship.angle);
  const lateralCos = Math.cos(ship.angle + (Math.PI / 2));
  const lateralSin = Math.sin(ship.angle + (Math.PI / 2));

  return [
    { x: ship.x + (cos * 16), y: ship.y + (sin * 16) },
    { x: ship.x - (cos * 11) + (lateralCos * 9), y: ship.y - (sin * 11) + (lateralSin * 9) },
    { x: ship.x - (cos * 4), y: ship.y - (sin * 4) },
    { x: ship.x - (cos * 11) - (lateralCos * 9), y: ship.y - (sin * 11) - (lateralSin * 9) },
  ];
}

function flamePoints(ship) {
  const cos = Math.cos(ship.angle);
  const sin = Math.sin(ship.angle);
  const lateralCos = Math.cos(ship.angle + (Math.PI / 2));
  const lateralSin = Math.sin(ship.angle + (Math.PI / 2));

  return [
    { x: ship.x - (cos * 8) + (lateralCos * 4), y: ship.y - (sin * 8) + (lateralSin * 4) },
    { x: ship.x - (cos * 20), y: ship.y - (sin * 20) },
    { x: ship.x - (cos * 8) - (lateralCos * 4), y: ship.y - (sin * 8) - (lateralSin * 4) },
  ];
}

function enemyPolygon(enemy) {
  const points = [];
  for (let i = 0; i < enemy.sides; i += 1) {
    const t = enemy.angle + ((Math.PI * 2 * i) / enemy.sides);
    const jitter = i % 2 === 0 ? 1 : 0.82;
    points.push({
      x: enemy.x + Math.cos(t) * enemy.radius * jitter,
      y: enemy.y + Math.sin(t) * enemy.radius * jitter,
    });
  }
  return points;
}

export default class SpaceDuelScene extends Scene {
  constructor() {
    super();
    this.physics = new PhysicsController(VIEW);
    this.playerController = new PlayerController({ physics: this.physics });
    this.waveController = new WaveController({ physics: this.physics });
    this.scoreManager = new ScoreManager();
    this.soundController = new SoundController();

    this.mode = 'menu';
    this.playerCount = 1;
    this.players = [];
    this.playerBullets = [];
    this.isPaused = false;
    this.elapsedSeconds = 0;
    this.lastPausePressed = false;
  }

  startGame(playerCount) {
    this.playerCount = playerCount;
    this.scoreManager.start(playerCount);
    this.players = this.playerController.createPlayers(playerCount);
    this.playerBullets = [];
    this.waveController.reset();
    this.scoreManager.setWave(this.waveController.wave);
    this.mode = 'playing';
    this.isPaused = false;
    this.soundController.play('start', { volume: 0.44 });
  }

  returnToMenu() {
    this.mode = 'menu';
    this.playerBullets = [];
    this.waveController.enemies = [];
    this.waveController.hazards = [];
    this.waveController.enemyShots = [];
    this.isPaused = false;
  }

  update(dtSeconds, engine) {
    this.elapsedSeconds += dtSeconds;
    const input = engine.input;

    const pausePressed = Boolean(input?.isActionPressed?.('pause'));
    const backPressed = Boolean(input?.isActionPressed?.('menuBack'));

    if (this.mode === 'menu') {
      if (input?.isActionPressed?.('startOnePlayer')) {
        this.startGame(1);
      } else if (input?.isActionPressed?.('startTwoPlayer')) {
        this.startGame(2);
      }
      this.lastPausePressed = pausePressed;
      return;
    }

    if (this.mode === 'game-over') {
      if (input?.isActionPressed?.('startOnePlayer') || input?.isActionPressed?.('startTwoPlayer')) {
        this.returnToMenu();
      }
      this.lastPausePressed = pausePressed;
      return;
    }

    if (pausePressed && !this.lastPausePressed) {
      this.isPaused = !this.isPaused;
    }
    this.lastPausePressed = pausePressed;

    if (this.isPaused && backPressed) {
      this.returnToMenu();
      return;
    }

    if (this.isPaused) {
      return;
    }

    const playerEvents = this.playerController.update({
      dtSeconds,
      input,
      bullets: this.playerBullets,
    });

    playerEvents.firedBy.forEach(() => {
      this.soundController.play('fire', { volume: 0.42 });
    });

    playerEvents.thrustingBy.forEach(() => {
      this.soundController.playThrustBurst(this.elapsedSeconds);
    });

    this.physics.updateBullets(this.playerBullets, dtSeconds);

    const waveEvents = this.waveController.update(dtSeconds, this.players);
    if (waveEvents.waveStarted) {
      this.scoreManager.setWave(this.waveController.wave);
      this.soundController.play('start', { volume: 0.35 });
    }

    const hitEvents = this.waveController.handlePlayerBulletCollisions(this.playerBullets, this.scoreManager);
    if (hitEvents.destroyedEnemies > 0) {
      this.soundController.play('enemySplit', { volume: 0.38 });
    }
    if (hitEvents.destroyedHazards > 0) {
      this.soundController.play('explosion', { volume: 0.4 });
    }
    if (hitEvents.extraLife) {
      this.soundController.play('bonus', { volume: 0.4 });
    }

    this.resolveShipCollisions();
  }

  resolveShipCollisions() {
    this.players.forEach((player) => {
      if (!player.alive || player.invulnerableTimer > 0) {
        if (!player.alive && player.respawnTimer <= 0 && this.scoreManager.hasLives(player.id)) {
          this.playerController.respawn(player);
        }
        return;
      }

      const hitEnemy = this.waveController.enemies.some((enemy) => this.physics.collidesCircle(player, enemy));
      const hitHazard = this.waveController.hazards.some((hazard) => this.physics.collidesCircle(player, hazard));
      let hitShotIndex = -1;
      for (let index = 0; index < this.waveController.enemyShots.length; index += 1) {
        if (this.physics.collidesCircle(player, this.waveController.enemyShots[index])) {
          hitShotIndex = index;
          break;
        }
      }

      if (!hitEnemy && !hitHazard && hitShotIndex < 0) {
        return;
      }

      if (hitShotIndex >= 0) {
        this.waveController.enemyShots.splice(hitShotIndex, 1);
      }

      this.playerController.destroy(player);
      this.scoreManager.loseLife(player.id);
      this.soundController.play('playerDeath', { volume: 0.46 });

      const anyShipAlive = this.players.some((entry) => entry.alive);
      if (!anyShipAlive && !this.scoreManager.hasAnyLifeRemaining()) {
        this.mode = 'game-over';
        this.soundController.play('gameOver', { volume: 0.5 });
      }
    });
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    renderer.strokeRect(40, 56, VIEW.width - 80, VIEW.height - 110, COLORS.border, 2);

    this.drawHud(renderer);
    this.drawObjects(renderer);

    if (this.mode === 'menu') {
      this.drawMenu(renderer);
      return;
    }

    if (this.mode === 'game-over') {
      this.drawGameOver(renderer);
      return;
    }

    if (this.isPaused) {
      this.drawPauseOverlay(renderer);
    }
  }

  drawHud(renderer) {
    const p1 = this.scoreManager.getPlayerState(1);
    const p2 = this.scoreManager.getPlayerState(2);

    renderer.drawText(`P1 ${String(p1?.score ?? 0).padStart(4, '0')}  L${p1?.lives ?? 0}`, 52, 24, {
      color: COLORS.text,
      font: '20px monospace',
      textBaseline: 'top',
    });

    if (this.playerCount === 2 || p2) {
      renderer.drawText(`P2 ${String(p2?.score ?? 0).padStart(4, '0')}  L${p2?.lives ?? 0}`, 908, 24, {
        color: COLORS.text,
        font: '20px monospace',
        textBaseline: 'top',
        textAlign: 'right',
      });
    }

    renderer.drawText(`WAVE ${String(this.scoreManager.wave).padStart(2, '0')}`, VIEW.width * 0.5, 24, {
      color: COLORS.text,
      font: '20px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    renderer.drawText(`HIGH ${String(this.scoreManager.highScore).padStart(4, '0')}`, VIEW.width * 0.5, VIEW.height - 30, {
      color: COLORS.muted,
      font: '16px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  drawObjects(renderer) {
    this.waveController.enemies.forEach((enemy) => {
      renderer.drawPolygon(enemyPolygon(enemy), {
        fillColor: null,
        strokeColor: COLORS.enemy,
        lineWidth: 2,
      });
    });

    this.waveController.hazards.forEach((hazard) => {
      const pulseRadius = hazard.radius + (Math.sin(hazard.pulse) * 2.4);
      renderer.drawCircle(hazard.x, hazard.y, pulseRadius, {
        fillColor: null,
        strokeColor: COLORS.hazard,
        lineWidth: 2,
      });
      renderer.drawLine(hazard.x - 10, hazard.y - 10, hazard.x + 10, hazard.y + 10, COLORS.hazard, 2);
      renderer.drawLine(hazard.x + 10, hazard.y - 10, hazard.x - 10, hazard.y + 10, COLORS.hazard, 2);
    });

    this.waveController.enemyShots.forEach((shot) => {
      renderer.drawCircle(shot.x, shot.y, shot.radius, {
        fillColor: COLORS.enemyShot,
        strokeColor: COLORS.enemyShot,
        lineWidth: 1,
      });
    });

    this.playerBullets.forEach((bullet) => {
      renderer.drawRect(bullet.x - 2, bullet.y - 2, 4, 4, COLORS.bullet);
    });

    this.players.forEach((player) => {
      if (!player.alive) {
        return;
      }

      const blinking = player.invulnerableTimer > 0 && Math.floor(this.elapsedSeconds * 16) % 2 === 0;
      if (blinking) {
        return;
      }

      renderer.drawPolygon(shipPoints(player), {
        fillColor: null,
        strokeColor: player.id === 1 ? COLORS.player1 : COLORS.player2,
        lineWidth: 2,
      });

      if (player.thrusting) {
        renderer.drawPolygon(flamePoints(player), {
          fillColor: null,
          strokeColor: '#f59e0b',
          lineWidth: 2,
        });
      }
    });
  }

  drawMenu(renderer) {
    renderer.drawText('SPACE DUEL', VIEW.width * 0.5, 220, {
      color: COLORS.text,
      font: '56px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('1 = ONE PLAYER', VIEW.width * 0.5, 320, {
      color: COLORS.text,
      font: '26px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('2 = TWO PLAYER SAME-SCREEN', VIEW.width * 0.5, 362, {
      color: COLORS.text,
      font: '26px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('P1: ARROWS + SPACE    P2: A/D/W + SHIFT', VIEW.width * 0.5, 436, {
      color: COLORS.muted,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('P pauses. X returns to menu while paused.', VIEW.width * 0.5, 466, {
      color: COLORS.muted,
      font: '18px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  drawPauseOverlay(renderer) {
    renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(1, 6, 19, 0.6)');
    renderer.drawText('PAUSED', VIEW.width * 0.5, 336, {
      color: COLORS.text,
      font: '40px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('Press P to resume or X for menu', VIEW.width * 0.5, 386, {
      color: COLORS.text,
      font: '20px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }

  drawGameOver(renderer) {
    renderer.drawText('GAME OVER', VIEW.width * 0.5, 324, {
      color: '#fca5a5',
      font: '48px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText('Press 1 or 2 to return to menu', VIEW.width * 0.5, 380, {
      color: COLORS.text,
      font: '20px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
