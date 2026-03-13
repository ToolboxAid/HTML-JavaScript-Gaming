// ToolboxAid.com
// David Quesenberry
// asteroids
// 11/20/2024
// ufoManager.js

import DebugFlag from '../../../engine/utils/debugFlag.js';

import Timer from '../../../engine/utils/timer.js';
import UFO from '../ufo.js';
import BulletManager from '../combat/bulletManager.js';
import CollisionUtils from '../../../engine/physics/collisionUtils.js';
import CanExplode from '../../../engine/utils/canExplode.js';
import DifficultyProfile from '../systems/difficultyProfile.js';

class UFOManager extends CanExplode {
    static UFO_SPAWN_INTERVAL = 25000;
    static DEBUG_SPAWN_INTERVAL = 3000;

    static DEBUG = DebugFlag.has('ufoManager');
    static audioPlayer = null;

    constructor(audioPlayer) {
        super();

        this.ufo = null;
        this.bulletManager = new BulletManager();
        this.pendingTimerReset = false;
        this.level = 1;
        this.spawnCount = 0;
        this.ufoTimer = new Timer(this.getSpawnInterval());
        this.ufoTimer.start();

        UFOManager.audioPlayer = audioPlayer;
    }

    update(deltaTime, ship, level = 1) {
        try {
            this.syncLevel(level);

            if (this.ufo) {
                this.updateExistingUFO(deltaTime, ship);
            } else if (this.canSpawnNewUFO()) {
                this.spawnNewUFO();
            }

            this.bulletManager.update(deltaTime, ship);
            this.updateSpawnTimerState();
            this.updateParticleExplosion(deltaTime);
        } catch (error) {
            console.error('UFOManager update error:', error, this);
        }
    }

    syncLevel(level) {
        this.level = Math.max(1, level);
    }

    updateExistingUFO(deltaTime, ship) {
        if (!this.ufo || this.ufo.isDestroyed) {
            this.destroyDeadUFO();
            return;
        }

        try {
            this.ufo.update(deltaTime, ship);
        } catch (error) {
            console.error('UFO update error:', error, this.ufo);
            this.destroyDeadUFO();
            return;
        }

        if (typeof this.ufo.isDead === 'function' && this.ufo.isDead()) {
            if (UFOManager.DEBUG) {
                console.log('UFO destroyed');
            }

            this.destroyDeadUFO();
            return;
        }

        if (typeof this.ufo.isAlive === 'function' && !this.ufo.isAlive()) {
            this.destroyDeadUFO();
        }
    }

    canSpawnNewUFO() {
        return this.ufoTimer && this.ufoTimer.isComplete() && !this.ufoTimer.isPaused && !this.pendingTimerReset;
    }

    updateSpawnTimerState() {
        if (!this.pendingTimerReset || this.hasActiveBullets()) {
            return;
        }

        this.pendingTimerReset = false;
        this.resetTimer();
    }

    spawnNewUFO() {
        if (!this.ufoTimer) {
            return;
        }

        this.ufoTimer.pause();

        try {
            this.spawnCount += 1;
            const forceSmall = DifficultyProfile.shouldForceSmallUfo(this.level, this.spawnCount) ||
                DifficultyProfile.shouldSpawnSmallUfo(this.level);

            this.ufo = new UFO(UFOManager.audioPlayer, {
                forceSmall
            });

            if (UFOManager.DEBUG) {
                console.log('New UFO spawned:', {
                    ufo: this.ufo,
                    timer: this.ufoTimer
                });
            }
        } catch (error) {
            console.error('Failed to spawn UFO:', error);
            this.resetTimer();
        }
    }

    draw() {
        try {
            this.bulletManager.draw();

            if (this.ufo && typeof this.ufo.draw === 'function') {
                this.ufo.draw();
            }
        } catch (error) {
            console.error('UFOManager draw error:', error, this.ufo);
        }
    }

    hasActiveUfo() {
        return Boolean(this.ufo && !this.ufo.isDestroyed);
    }

    getUfo() {
        return this.hasActiveUfo() ? this.ufo : null;
    }

    getActiveBullets() {
        const bullets = this.bulletManager?.bullets;

        if (!bullets || typeof bullets.forEach !== 'function') {
            return [];
        }

        return bullets;
    }

    hasActiveBullets() {
        return Boolean(this.bulletManager && this.bulletManager.hasActiveBullets());
    }

    fireBullet(ship) {
        const ufo = this.getUfo();

        if (!ufo || typeof ufo.isAlive !== 'function' || !ufo.isAlive()) {
            return null;
        }

        return this.bulletManager.ufoShootBullet(ufo, ship, {
            aimErrorDegrees: DifficultyProfile.getSmallUfoAimError(this.level)
        });
    }

    check(ship) {
        const ufo = this.getUfo();

        if (!ship || typeof ship.isAlive !== 'function' || !ship.isAlive()) {
            return;
        }

        if (!ufo) {
            return;
        }

        if (typeof ufo.isAlive === 'function' && !ufo.isAlive()) {
            return;
        }

        let collision = false;

        try {
            collision = CollisionUtils.vectorCollisionDetection(ufo, ship);
        } catch (error) {
            console.error('UFO collision check error:', error, {
                ufo,
                ship
            });
            return;
        }

        if (collision) {
            this.handleShipCollision(ship);
        }
    }

    handleShipCollision(ship) {
        if (!ship || !this.ufo) {
            return;
        }

        if (typeof ship.isAlive !== 'function' || !ship.isAlive()) {
            return;
        }

        if (typeof this.ufo.isAlive === 'function' && !this.ufo.isAlive()) {
            return;
        }

        if (UFOManager.DEBUG) {
            console.log('Ship/UFO collision detected:', {
                ship,
                ufo: this.ufo
            });
        }

        if (typeof ship.setIsDying === 'function') {
            ship.setIsDying();
            this.createExplosion(ship);
        }

        if (typeof this.ufo.setHit === 'function') {
            this.ufo.setHit();
            this.createExplosion(this.ufo);
        }
    }

    destroyDeadUFO() {
        if (UFOManager.DEBUG) {
            console.log('Destroying UFO:', {
                ufo: this.ufo,
                timer: this.ufoTimer
            });
        }

        if (this.ufo) {
            try {
                if (typeof this.ufo.destroy === 'function') {
                    this.ufo.destroy();
                }
            } catch (error) {
                console.error('Error destroying UFO:', error, this.ufo);
            }
        }

        this.ufo = null;

        if (this.hasActiveBullets()) {
            this.pendingTimerReset = true;
            return;
        }

        this.resetTimer();
    }

    resetTimer() {
        if (!this.ufoTimer) {
            return;
        }

        this.ufoTimer.durationMs = this.getSpawnInterval();
        this.ufoTimer.reset();
        this.ufoTimer.start();
    }

    getSpawnInterval() {
        if (UFOManager.DEBUG) {
            return UFOManager.DEBUG_SPAWN_INTERVAL;
        }

        return DifficultyProfile.getUfoSpawnInterval(this.level);
    }

    destroy() {
        try {
            if (this.ufo) {
                try {
                    if (typeof this.ufo.destroy === 'function') {
                        this.ufo.destroy();
                    }
                } catch (error) {
                    console.error('Error destroying UFO during manager cleanup:', error);
                }

                this.ufo = null;
            }

            if (this.bulletManager) {
                this.bulletManager.destroy();
                this.bulletManager = null;
            }

            this.pendingTimerReset = null;
            this.spawnCount = null;
            if (this.ufoTimer) {
                this.ufoTimer.destroy();
            }
            this.ufoTimer = null;
            this.explosions = [];

            return true;
        } catch (error) {
            console.error('Error during UFOManager destruction:', error);
            return false;
        }
    }
}

export default UFOManager;

