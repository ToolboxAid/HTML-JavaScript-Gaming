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

const SHIP_SEGMENTS = [
  [[16, 0], [-11, 9]],
  [[-11, 9], [-4, 0]],
  [[-4, 0], [-11, -9]],
  [[-11, -9], [16, 0]],
  [[-4, 0], [-8, 0]],
];

const FLAME_SEGMENTS = [
  [[-8, 4], [-20, 0]],
  [[-20, 0], [-8, -4]],
];

const ENEMY_HEAVY_SEGMENTS = [
  [[16, 0], [9, 12]],
  [[9, 12], [-6, 15]],
  [[-6, 15], [-16, 6]],
  [[-16, 6], [-14, -8]],
  [[-14, -8], [-2, -16]],
  [[-2, -16], [12, -12]],
  [[12, -12], [16, 0]],
  [[-9, 4], [9, 4]],
  [[-6, -5], [7, -5]],
];

const ENEMY_LIGHT_SEGMENTS = [
  [[12, 0], [4, 11]],
  [[4, 11], [-8, 8]],
  [[-8, 8], [-12, -2]],
  [[-12, -2], [-3, -11]],
  [[-3, -11], [9, -8]],
  [[9, -8], [12, 0]],
  [[-5, 1], [6, 1]],
];

const HAZARD_SEGMENTS = [
  [[-9, 0], [9, 0]],
  [[0, -9], [0, 9]],
  [[-7, -7], [7, 7]],
  [[7, -7], [-7, 7]],
];

const SHOT_SEGMENTS = [
  [[-3, 0], [3, 0]],
  [[0, -3], [0, 3]],
];

function rotateTranslatePoint(point, angle, tx, ty, scale = 1) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = point[0] * scale;
  const y = point[1] * scale;
  return {
    x: tx + (x * cos) - (y * sin),
    y: ty + (x * sin) + (y * cos),
  };
}

function drawVectorSegments(renderer, segments, {
  x = 0,
  y = 0,
  angle = 0,
  scale = 1,
  color = '#ffffff',
  lineWidth = 2,
} = {}) {
  segments.forEach((segment) => {
    const start = rotateTranslatePoint(segment[0], angle, x, y, scale);
    const end = rotateTranslatePoint(segment[1], angle, x, y, scale);
    renderer.drawLine(start.x, start.y, end.x, end.y, color, lineWidth);
  });
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
    for (let bulletIndex = this.playerBullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = this.playerBullets[bulletIndex];
      let hitPlayer = null;
      for (let playerIndex = 0; playerIndex < this.players.length; playerIndex += 1) {
        const player = this.players[playerIndex];
        if (!player.alive || player.invulnerableTimer > 0 || player.id === bullet.ownerId) {
          continue;
        }
        if (this.physics.collidesCircle(player, bullet)) {
          hitPlayer = player;
          break;
        }
      }

      if (hitPlayer) {
        this.playerBullets.splice(bulletIndex, 1);
        this.applyPlayerHit(hitPlayer);
      }
    }

    if (this.players.length > 1) {
      for (let left = 0; left < this.players.length; left += 1) {
        for (let right = left + 1; right < this.players.length; right += 1) {
          const a = this.players[left];
          const b = this.players[right];
          if (!a.alive || !b.alive || a.invulnerableTimer > 0 || b.invulnerableTimer > 0) {
            continue;
          }
          if (this.physics.collidesCircle(a, b)) {
            this.applyPlayerHit(a);
            this.applyPlayerHit(b);
          }
        }
      }
    }

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

      this.applyPlayerHit(player);
    });
  }

  applyPlayerHit(player) {
    if (!player.alive || player.invulnerableTimer > 0) {
      return;
    }

    this.playerController.destroy(player);
    this.scoreManager.loseLife(player.id);
    this.soundController.play('playerDeath', { volume: 0.46 });

    const anyShipAlive = this.players.some((entry) => entry.alive);
    if (!anyShipAlive && !this.scoreManager.hasAnyLifeRemaining()) {
      this.mode = 'game-over';
      this.soundController.play('gameOver', { volume: 0.5 });
    }
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
      const segments = enemy.tier > 1 ? ENEMY_HEAVY_SEGMENTS : ENEMY_LIGHT_SEGMENTS;
      const scale = enemy.radius / (enemy.tier > 1 ? 16 : 12);
      drawVectorSegments(renderer, segments, {
        x: enemy.x,
        y: enemy.y,
        angle: enemy.angle,
        scale,
        color: COLORS.enemy,
        lineWidth: 2,
      });
    });

    this.waveController.hazards.forEach((hazard) => {
      const pulseScale = (hazard.radius / 10) + (Math.sin(hazard.pulse) * 0.1);
      drawVectorSegments(renderer, HAZARD_SEGMENTS, {
        x: hazard.x,
        y: hazard.y,
        angle: hazard.pulse * 0.35,
        scale: pulseScale,
        color: COLORS.hazard,
        lineWidth: 2,
      });
    });

    this.waveController.enemyShots.forEach((shot) => {
      drawVectorSegments(renderer, SHOT_SEGMENTS, {
        x: shot.x,
        y: shot.y,
        angle: this.elapsedSeconds * 18,
        scale: 0.7,
        color: COLORS.enemyShot,
        lineWidth: 1.5,
      });
    });

    this.playerBullets.forEach((bullet) => {
      drawVectorSegments(renderer, SHOT_SEGMENTS, {
        x: bullet.x,
        y: bullet.y,
        angle: 0,
        scale: 0.6,
        color: COLORS.bullet,
        lineWidth: 1.5,
      });
    });

    this.players.forEach((player) => {
      if (!player.alive) {
        return;
      }

      const blinking = player.invulnerableTimer > 0 && Math.floor(this.elapsedSeconds * 16) % 2 === 0;
      if (blinking) {
        return;
      }

      drawVectorSegments(renderer, SHIP_SEGMENTS, {
        x: player.x,
        y: player.y,
        angle: player.angle,
        color: player.id === 1 ? COLORS.player1 : COLORS.player2,
        lineWidth: 2,
      });

      if (player.thrusting) {
        drawVectorSegments(renderer, FLAME_SEGMENTS, {
          x: player.x,
          y: player.y,
          angle: player.angle,
          color: '#f59e0b',
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
