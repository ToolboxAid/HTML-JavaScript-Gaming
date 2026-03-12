// ToolboxAid.com
// David Quesenberry
// asteroids
// 11/20/2024
// ufoManager.js

import Timer from '../engine/utils/timer.js';
import UFO from './ufo.js';
import CollisionUtils from '../engine/physics/collisionUtils.js';
import CanExplode from '../engine/utils/canExplode.js';

class UFOManager extends CanExplode {
    static UFO_SPAWN_INTERVAL = 25000;
    static DEBUG_SPAWN_INTERVAL = 3000;

    static DEBUG = new URLSearchParams(window.location.search).has('ufoManager');
    static audioPlayer = null;

    constructor(audioPlayer) {
        super();

        this.ufo = null;
        this.ufoTimer = new Timer(
            UFOManager.DEBUG ? UFOManager.DEBUG_SPAWN_INTERVAL : UFOManager.UFO_SPAWN_INTERVAL
        );
        this.ufoTimer.start();

        UFOManager.audioPlayer = audioPlayer;
    }

    update(deltaTime, ship) {
        try {
            if (this.ufo) {
                this.updateExistingUFO(deltaTime, ship);
            } else if (this.canSpawnNewUFO()) {
                this.spawnNewUFO();
            }

            this.updateParticleExplosion(deltaTime);
        } catch (error) {
            console.error('UFOManager update error:', error, this);
        }
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
        return this.ufoTimer && this.ufoTimer.isComplete() && !this.ufoTimer.isPaused;
    }

    spawnNewUFO() {
        if (!this.ufoTimer) {
            return;
        }

        this.ufoTimer.pause();

        try {
            this.ufo = new UFO(UFOManager.audioPlayer);

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
        if (!this.ufo || typeof this.ufo.draw !== 'function') {
            return;
        }

        try {
            this.ufo.draw();
        } catch (error) {
            console.error('UFO draw error:', error, this.ufo);
        }
    }

    check(ship) {
        if (!ship || typeof ship.isAlive !== 'function' || !ship.isAlive()) {
            return;
        }

        if (!this.ufo || this.ufo.isDestroyed) {
            return;
        }

        if (typeof this.ufo.isAlive === 'function' && !this.ufo.isAlive()) {
            return;
        }

        let collision = false;

        try {
            collision = CollisionUtils.vectorCollisionDetection(this.ufo, ship);
        } catch (error) {
            console.error('UFO collision check error:', error, {
                ufo: this.ufo,
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
        this.resetTimer();
    }

    resetTimer() {
        if (!this.ufoTimer) {
            return;
        }

        this.ufoTimer.reset();
        this.ufoTimer.start();
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