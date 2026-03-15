// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js

import DebugFlag from '../../../engine/utils/debugFlag.js';
import DebugLog from '../../../engine/utils/debugLog.js';
import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import ParticleExplosion from '../../../engine/renderers/particleExplosion.js';

class Game extends GameBase {
    // Enable debug mode: game.html?particle
    static DEBUG = DebugFlag.has('particle');
    static EXPLOSION_INTERVAL_MS = 5000;

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.explosions = [];
        this.lastExplosionTimeMs = 0;
    }

    async onInitialize() {
        this.explosions = [];
        this.lastExplosionTimeMs = Date.now();
        DebugLog.info(Game.DEBUG, 'Particle', 'Particle sample initialized');
    }

    static sanitizePositive(value, fallback) {
        if (!Number.isFinite(value) || value <= 0) {
            return fallback;
        }
        return value;
    }

    static sanitizeNonNegative(value, fallback) {
        if (!Number.isFinite(value) || value < 0) {
            return fallback;
        }
        return value;
    }

    createParticleExplosion(x, y, startRadius, endRadius, durationSeconds = 1.75, particleRadius = 3.5, shape = 'circle') {
        const safeX = Game.sanitizeNonNegative(x, 0);
        const safeY = Game.sanitizeNonNegative(y, 0);
        const safeStartRadius = Game.sanitizeNonNegative(startRadius, 0);
        const safeEndRadius = Game.sanitizePositive(endRadius, 24);
        const safeDuration = Game.sanitizePositive(durationSeconds, 1.75);
        const safeParticleRadius = Game.sanitizePositive(particleRadius, 3.5);
        const particleCount = Math.max(8, Math.round(safeEndRadius / 4));

        const explosion = new ParticleExplosion(
            safeX,
            safeY,
            safeStartRadius,
            safeEndRadius,
            safeDuration,
            particleCount,
            safeParticleRadius
        );

        if (shape === 'square') {
            explosion.setShapeSquare();
        }

        this.explosions.push(explosion);
    }

    updateAndDrawExplosions(deltaTime) {
        this.explosions = this.explosions.filter((explosion) => {
            if (!explosion || explosion.isDone) {
                if (explosion) {
                    explosion.destroy();
                }
                return false;
            }

            if (explosion.update(deltaTime)) {
                explosion.destroy();
                return false;
            }

            explosion.draw();
            return true;
        });
    }

    spawnWave() {
        this.createParticleExplosion(50, 100, 0, 50, 1.5);
        this.createParticleExplosion(150, 100, 0, 50, 3.5, 1.5);
        this.createParticleExplosion(350, 100, 0, 10, 1.5, 1.5);
        this.createParticleExplosion(500, 100, 10, 60, 4.5, 2.5, 'square');
        this.createParticleExplosion(300, 300, 2, 100, 1.5, 2.5);
        this.createParticleExplosion(600, 400, 4, 200, 1.5, 1.5);
    }

    gameLoop(deltaTime) {
        this.updateAndDrawExplosions(deltaTime);

        const currentTimeMs = Date.now();
        if (currentTimeMs - this.lastExplosionTimeMs > Game.EXPLOSION_INTERVAL_MS) {
            this.spawnWave();
            this.lastExplosionTimeMs = currentTimeMs;
        }
    }

    onDestroy() {
        this.explosions.forEach((explosion) => {
            if (explosion && !explosion.isDone) {
                explosion.destroy();
            }
        });
        this.explosions = [];
        this.lastExplosionTimeMs = 0;
    }
}

export default Game;

const game = new Game();



