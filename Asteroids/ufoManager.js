// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufoManager.js

import Timer from '../scripts/utils/timer.js';
import UFO from './ufo.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import CanExplode from '../scripts/utils/canExplode.js';

/**
 * Manages UFO creation, updates, and cleanup
 */
class UFOManager extends CanExplode {
    // Constants
    static UFO_SPAWN_INTERVAL = 25000; // 25 seconds
    static DEBUG_SPAWN_INTERVAL = 3000; // 3 seconds for testing

    // Debug mode enabled via URL parameter: game.html?ufoManager
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
        if (this.ufo) {
            this.updateExistingUFO(deltaTime, ship);
        } else if (this.canSpawnNewUFO()) {
            this.spawnNewUFO();
        }

        this.updateParticleExplosion(deltaTime);
    }

    updateExistingUFO(deltaTime, ship) {
        this.ufo.update(deltaTime, ship);
        if (this.ufo.isDead()) {
            if (UFOManager.DEBUG) {
                console.log("UFO destroyed");
            }
            this.destroyDeadUFO();
        }
    }

    canSpawnNewUFO() {
        return this.ufoTimer.isComplete() && !this.ufoTimer.isPaused;
    }

    spawnNewUFO() {
        this.ufoTimer.pause();
        console.log(UFOManager.audioPlayer);
        this.ufo = new UFO(UFOManager.audioPlayer); // 50% volume);

        if (UFOManager.DEBUG) {
            console.log("New UFO spawned:", {
                ufo: this.ufo,
                timer: this.ufoTimer
            });
        }
    }

    draw() {
        if (this.ufo) {
            this.ufo.draw();
        }
    }

    check(ship) {
        if (!ship?.isAlive() || !this.ufo) return;

        const collision = CollisionUtils.vectorCollisionDetection(this.ufo, ship);
        if (collision) {
            this.handleShipCollision(ship);
        }
    }

    handleShipCollision(ship) {
        if (UFOManager.DEBUG) {
            console.log("Ship/UFO collision detected:", {
                ship: ship,
                ufo: this.ufo
            });
        }

        ship.setIsDying();
        this.createExplosion(ship);

        this.ufo.setHit();
        this.createExplosion(this.ufo);
    }

    destroyDeadUFO() {
        if (UFOManager.DEBUG) {
            console.log("Destroying UFO:", {
                ufo: this.ufo,
                timer: this.ufoTimer
            });
        }

        this.ufo.destroy();
        this.ufo = null;
        this.resetTimer();
    }

    resetTimer() {
        this.ufoTimer.reset();
        this.ufoTimer.start();
    }

    /**
     * Destroys the UFO manager and cleans up resources
     * @returns {boolean} True if cleanup was successful
     */
    destroy() {
        try {
            if (UFOManager.DEBUG) {
                console.log("UFOManager destruction started");
            }

            if (this.ufo) {
                this.ufo.destroy();
                this.ufo = null;
            }

            if (this.ufoTimer) {
                this.ufoTimer = null;
            }

            if (UFOManager.DEBUG) {
                console.log("UFOManager destruction completed");
            }

            return true;
        } catch (error) {
            console.error("Error during UFOManager destruction:", error);
            return false;
        }
    }
}

export default UFOManager;