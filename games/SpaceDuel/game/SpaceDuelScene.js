/*
Toolbox Aid
David Quesenberry
03/25/2026
SpaceDuelScene.js
*/
import { AttractModeController, Scene } from '/src/engine/scenes/index.js';
import PhysicsController from './PhysicsController.js';
import PlayerController from './PlayerController.js';
import WaveController from './WaveController.js';
import ScoreManager from './ScoreManager.js';
import SoundController from './SoundController.js';
import SpaceDuelAttractAdapter from './SpaceDuelAttractAdapter.js';
import SpaceDuelHighScoreService from './SpaceDuelHighScoreService.js';
import SpaceDuelInitialsEntry from './SpaceDuelInitialsEntry.js';

const VIEW = {
  width: 960,
  height: 720,
};

const COLORS = {
  background: '#020617',
  border: '#8aa0bb',
  borderInner: '#334155',
  text: '#e2e8f0',
  muted: '#93a5bc',
  player1: '#ffffff',
  player2: '#9ae6b4',
  enemy: '#e2e8f0',
  enemyInner: '#94a3b8',
  hazard: '#fca5a5',
  hazardInner: '#fecaca',
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

const ATTRACT_INPUT_ACTIONS = [
  'startOnePlayer',
  'startTwoPlayer',
  'pause',
  'menuBack',
  'p1Left',
  'p1Right',
  'p1Thrust',
  'p1Fire',
  'p2Left',
  'p2Right',
  'p2Thrust',
  'p2Fire',
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

function drawDualStrokeSegments(renderer, segments, options) {
  const {
    outerColor,
    innerColor,
    outerWidth = 3,
    innerWidth = 1.5,
    ...transform
  } = options;

  drawVectorSegments(renderer, segments, {
    ...transform,
    color: outerColor,
    lineWidth: outerWidth,
  });
  drawVectorSegments(renderer, segments, {
    ...transform,
    color: innerColor,
    lineWidth: innerWidth,
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
    this.highScoreService = new SpaceDuelHighScoreService();
    this.highScoreRows = this.highScoreService.loadTable();
    this.initialsEntry = new SpaceDuelInitialsEntry();
    this.qualifyingPending = false;

    this.mode = 'menu';
    this.playerCount = 1;
    this.players = [];
    this.playerBullets = [];
    this.isPaused = false;
    this.elapsedSeconds = 0;
    this.lastPausePressed = false;
    this.starfield = this.buildStarfield();
    this.currentInput = null;
    this.attractAdapter = new SpaceDuelAttractAdapter({ scene: this });
    this.attractController = new AttractModeController({
      phases: ['title', 'highScores', 'demo'],
      isInputActive: () => this.isAttractExitInputActive(),
      onEnterAttract: () => this.attractAdapter.enter(),
      onExitAttract: () => this.attractAdapter.exit(),
      onEnterDemo: () => this.attractAdapter.startDemo(),
      onExitDemo: () => this.attractAdapter.stopDemo(),
      onPhaseChange: (phase) => this.attractAdapter.setPhase(phase),
    });
    this.scoreManager.highScore = this.highScoreService.getTopScore(this.highScoreRows);
  }

  buildStarfield() {
    const stars = [];
    for (let index = 0; index < 68; index += 1) {
      const seed = index + 1;
      const x = ((seed * 137) % 900) + 30;
      const y = ((seed * 211) % 610) + 64;
      stars.push({
        x,
        y,
        drift: ((seed % 7) + 1) * 0.03,
        phase: (seed * 0.8) % (Math.PI * 2),
        intensity: seed % 3 === 0 ? 0.9 : 0.55,
      });
    }
    return stars;
  }

  startGame(playerCount) {
    this.attractController.exitAttract();
    this.playerCount = playerCount;
    this.scoreManager.start(playerCount);
    this.players = this.playerController.createPlayers(playerCount);
    this.playerBullets = [];
    this.waveController.reset();
    this.scoreManager.setWave(this.waveController.wave);
    this.mode = 'playing';
    this.isPaused = false;
    this.qualifyingPending = false;
    this.initialsEntry.cancel();
    this.soundController.play('start', { volume: 0.44 });
  }

  returnToMenu() {
    this.mode = 'menu';
    this.playerBullets = [];
    this.waveController.enemies = [];
    this.waveController.hazards = [];
    this.waveController.enemyShots = [];
    this.isPaused = false;
    this.qualifyingPending = false;
    this.initialsEntry.cancel();
    this.attractController.resetIdle();
  }

  enterInitialsEntryIfQualified() {
    if (this.qualifyingPending || this.initialsEntry.active) {
      return;
    }

    const candidate = this.scoreManager.players.reduce((best, player) =>
      (!best || player.score > best.score ? { playerId: player.id, score: player.score } : best), null);

    if (!candidate || candidate.score <= 0) {
      return;
    }

    const index = this.highScoreService.getQualifyingIndex(candidate.score, this.highScoreRows);
    if (index < 0) {
      return;
    }

    this.qualifyingPending = true;
    this.mode = 'initials-entry';
    this.initialsEntry.begin(candidate);
  }

  isAttractExitInputActive() {
    if (!this.currentInput) {
      return false;
    }

    return ATTRACT_INPUT_ACTIONS.some((action) =>
      this.currentInput.isActionDown?.(action) || this.currentInput.isActionPressed?.(action));
  }

  update(dtSeconds, engine) {
    this.elapsedSeconds += dtSeconds;
    const input = engine.input;
    this.currentInput = input;

    if (this.mode === 'menu') {
      this.attractController.update(dtSeconds);
      this.attractAdapter.update(dtSeconds);
    } else if (this.attractController.active) {
      this.attractController.exitAttract();
    }

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
      if (this.qualifyingPending || this.initialsEntry.active) {
        this.mode = 'initials-entry';
      }
      if (input?.isActionPressed?.('startOnePlayer') || input?.isActionPressed?.('startTwoPlayer')) {
        this.returnToMenu();
      }
      this.lastPausePressed = pausePressed;
      return;
    }

    if (this.mode === 'initials-entry') {
      const result = this.initialsEntry.update(input);
      if (result.confirmed) {
        this.highScoreRows = this.highScoreService.insertScore({
          initials: result.initials,
          score: result.score,
        }, this.highScoreRows);
        this.scoreManager.highScore = this.highScoreService.getTopScore(this.highScoreRows);
        this.qualifyingPending = false;
        this.initialsEntry.cancel();
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
      this.enterInitialsEntryIfQualified();
    }
  }

  render(renderer) {
    renderer.clear(COLORS.background);
    this.drawBackdrop(renderer);
    renderer.strokeRect(40, 56, VIEW.width - 80, VIEW.height - 110, COLORS.border, 2);
    renderer.strokeRect(44, 60, VIEW.width - 88, VIEW.height - 118, COLORS.borderInner, 1);

    this.drawHud(renderer);
    this.drawObjects(renderer);

    if (this.mode === 'menu') {
      this.drawMenu(renderer);
      this.attractAdapter.render(renderer);
      return;
    }

    if (this.mode === 'game-over') {
      this.drawGameOver(renderer);
      return;
    }

    if (this.mode === 'initials-entry') {
      this.drawInitialsEntry(renderer);
      return;
    }

    if (this.isPaused) {
      this.drawPauseOverlay(renderer);
    }
  }

  drawBackdrop(renderer) {
    this.starfield.forEach((star) => {
      const pulse = 0.45 + ((Math.sin(this.elapsedSeconds * star.drift * 12 + star.phase) + 1) * 0.28);
      const alpha = Math.min(1, star.intensity * pulse);
      renderer.drawRect(star.x, star.y, 1.6, 1.6, `rgba(203, 213, 225, ${alpha.toFixed(3)})`);
    });
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
      drawDualStrokeSegments(renderer, segments, {
        x: enemy.x,
        y: enemy.y,
        angle: enemy.angle,
        scale,
        outerColor: COLORS.enemy,
        innerColor: COLORS.enemyInner,
        outerWidth: 2.2,
        innerWidth: 1.1,
      });
    });

    this.waveController.hazards.forEach((hazard) => {
      const pulseScale = (hazard.radius / 10) + (Math.sin(hazard.pulse) * 0.1);
      drawDualStrokeSegments(renderer, HAZARD_SEGMENTS, {
        x: hazard.x,
        y: hazard.y,
        angle: hazard.pulse * 0.35,
        scale: pulseScale,
        outerColor: COLORS.hazard,
        innerColor: COLORS.hazardInner,
        outerWidth: 2.2,
        innerWidth: 1.1,
      });
    });

    this.waveController.enemyShots.forEach((shot) => {
      drawVectorSegments(renderer, SHOT_SEGMENTS, {
        x: shot.x,
        y: shot.y,
        angle: this.elapsedSeconds * 18,
        scale: 0.7,
        color: COLORS.enemyShot,
        lineWidth: 1.35,
      });
    });

    this.playerBullets.forEach((bullet) => {
      drawVectorSegments(renderer, SHOT_SEGMENTS, {
        x: bullet.x,
        y: bullet.y,
        angle: 0,
        scale: 0.6,
        color: COLORS.bullet,
        lineWidth: 1.35,
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

      const shipOuter = player.id === 1 ? COLORS.player1 : COLORS.player2;
      const shipInner = player.id === 1 ? '#cbd5e1' : '#86efac';
      drawDualStrokeSegments(renderer, SHIP_SEGMENTS, {
        x: player.x,
        y: player.y,
        angle: player.angle,
        outerColor: shipOuter,
        innerColor: shipInner,
        outerWidth: 2.5,
        innerWidth: 1.2,
      });

      if (player.thrusting) {
        drawDualStrokeSegments(renderer, FLAME_SEGMENTS, {
          x: player.x,
          y: player.y,
          angle: player.angle,
          outerColor: '#f59e0b',
          innerColor: '#fde68a',
          outerWidth: 2.1,
          innerWidth: 1,
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

  drawInitialsEntry(renderer) {
    renderer.drawRect(0, 0, VIEW.width, VIEW.height, 'rgba(1, 6, 19, 0.62)');
    renderer.drawRect(220, 250, 520, 220, '#020b1e');
    renderer.strokeRect(220, 250, 520, 220, '#94a3b8', 2);

    renderer.drawText('NEW HIGH SCORE', 480, 284, {
      color: '#fbbf24',
      font: '36px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
    renderer.drawText(`SCORE ${String(this.initialsEntry.score).padStart(5, '0')}`, 480, 332, {
      color: '#e2e8f0',
      font: '22px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });

    const initials = this.initialsEntry.getInitials().split('');
    initials.forEach((letter, index) => {
      const x = 430 + (index * 50);
      const selected = this.initialsEntry.cursor === index;
      renderer.drawText(letter, x, 378, {
        color: selected ? '#fbbf24' : '#e2e8f0',
        font: selected ? '44px monospace' : '36px monospace',
        textBaseline: 'top',
      });
    });

    renderer.drawText('TYPE A-Z, ARROWS ADJUST, ENTER SAVES', 480, 434, {
      color: '#93a5bc',
      font: '14px monospace',
      textAlign: 'center',
      textBaseline: 'top',
    });
  }
}
