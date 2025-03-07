// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import ObjectVector from '../scripts/objectVector.js';
import AngleUtils from '../scripts/math/angleUtils.js';
import BulletManager from './bulletManager.js';
import CanvasUtils from '../scripts/canvas.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';
import SystemUtils from '../scripts/utils/systemUtils.js';
import Timer from '../scripts/utils/timer.js';

/**
 * UFO class representing an enemy spacecraft that can shoot at the player
 * @extends ObjectVector
 */
class UFO extends ObjectVector {
    // Size definitions
    static SIZE = {
        SMALL: 'small',
        LARGE: 'large'
    };

    // Direction definitions
    static DIRECTION = {
        LEFT: 180,
        RIGHT: 0
    };

    // Movement patterns
    static MOVEMENT = {
        DOWN: 'down',
        STRAIGHT: 'straight',
        UP: 'up'
    };

    // Boundary definitions
    static BOUNDARY = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    };

    // Movement probability weights
    static DIRECTION_WEIGHTS = {
        [UFO.MOVEMENT.DOWN]: 2,    // 2/7 chance
        [UFO.MOVEMENT.STRAIGHT]: 3, // 3/7 chance
        [UFO.MOVEMENT.UP]: 2       // 2/7 chance
    };

    // Debug mode enabled via URL parameter: game.html?ufo
    static DEBUG = new URLSearchParams(window.location.search).has('ufo');

    // Constants
    static SPEED = 80;
    static OFFSET = 20;
    static BULLET_INTERVAL = 1000;
    static DIRECTION_MIN_DELAY = 100;
    static DIRECTION_MAX_DELAY = 200;
    static SMALL_SPEED_MULTIPLIER = 1.3;
    static BOUNDARY_MARGIN = 20;
    static ROTATION_MAX = 360;

    static getVectorMapSmall() {
        return [
            [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
            [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
            [9, -3], [14, 3]
        ];
    }

    static getVectorMapLarge() {
        return [
            [-21, 4.5], [21, 4.5], [13.5, 13.5], [-13.5, 13.5], [-21, 4.5], [-13.5, -4.5],
            [-7.5, -4.5], [-7.5, -9], [-3, -13.5], [3, -13.5], [7.5, -9], [7.5, -4.5], [-7.5, -4.5],
            [13.5, -4.5], [21, 4.5]
        ];
    }

    static audioPlayer = null;

    static calculateInitialPosition(direction) {
        return {
            x: direction ? -UFO.OFFSET : CanvasUtils.getConfigWidth(),
            y: RandomUtils.randomRange(UFO.OFFSET, CanvasUtils.getConfigHeight() - UFO.OFFSET, true)
        };
    }

    constructor(audioPlayer) {
        const isSmall = RandomUtils.randomBoolean();
        const direction = RandomUtils.randomBoolean();
        const angle = direction ? UFO.DIRECTION.RIGHT : UFO.DIRECTION.LEFT;
        const velocity = AngleUtils.angleToVector(angle);
        const position = UFO.calculateInitialPosition(direction);

        super(
            position.x,
            position.y,
            isSmall ? UFO.getVectorMapSmall() : UFO.getVectorMapLarge(),
            velocity.x * UFO.SPEED,
            velocity.y * UFO.SPEED
        );

        UFO.audioPlayer = audioPlayer;
        this.setupUFO(isSmall, velocity, direction);
    }

    setupUFO(isSmall, velocity, direction) {
        this.isSmall = isSmall;
        if (this.isSmall) {
            this.setVelocity(
                velocity.x * UFO.SPEED * UFO.SMALL_SPEED_MULTIPLIER,
                velocity.y * UFO.SPEED * UFO.SMALL_SPEED_MULTIPLIER
            );
            UFO.audioPlayer.playAudio('saucerSmall.wav', 0.5, true); // 50% volume
        } else {
            UFO.audioPlayer.playAudio('saucerBig.wav', 0.5, true); // 50% volume
        }

        this.initializeProperties();

        if (UFO.DEBUG) {
            this.logDebugInfo(direction);
        }
    }

    initializeProperties() {
        this.directionCnt = 0;
        this.directionDelay = this.getDelay();
        this.bulletManager = new BulletManager();
        this.bulletTimer = new Timer(UFO.BULLET_INTERVAL);
        this.bulletTimer.start();
    }

    update(deltaTime, ship) {
        if (this.isAlive()) {
            this.updateAlive(deltaTime, ship);
        } else if (this.isDying()) {
            this.updateDying();
        }
        this.bulletManager.update(deltaTime, ship);
    }

    draw() {
        this.bulletManager.draw();
        if (this.isAlive()) {
            super.draw();
        }
    }

    updateAlive(deltaTime, ship) {
        if (this.directionCnt++ > this.directionDelay) {
            this.changeDirections();
        }
        super.update(deltaTime);
        this.checkBoundaries();
        this.shootBullet(ship);
    }

    updateDying() {
        if (!this.bulletManager.hasActiveBullets()) {
            this.setIsDead();
        }
        if (UFO.DEBUG) {
            console.log("UFO isDying - bullets:", this.bulletManager.getBulletCount());
        }

        if (this.isSmall) {
            UFO.audioPlayer.stopLooping('saucerSmall.wav');
        } else {
            UFO.audioPlayer.stopLooping('saucerBig.wav');
        }
    }

    checkBoundaries() {
        const boundariesHit = CollisionUtils.getCompletelyOffScreenBoundaries(this, this.margin);

        if (boundariesHit.includes(UFO.BOUNDARY.TOP)) {
            this.y = CanvasUtils.getConfigHeight();
        }
        if (boundariesHit.includes(UFO.BOUNDARY.BOTTOM)) {
            this.y = -(this.height);
        }
        if (boundariesHit.includes(UFO.BOUNDARY.LEFT) ||
            boundariesHit.includes(UFO.BOUNDARY.RIGHT)) {
            this.setIsDying();
        }

        if (UFO.DEBUG && boundariesHit.length > 0) {
            console.log("Boundaries hit:", boundariesHit);
        }
    }

    changeDirections() {
        if (this.isAtVerticalBoundary()) {
            if (UFO.DEBUG) {
                console.warn("Avoiding vertical boundary trap");
            }
            return;
        }

        this.directionCnt = 0;
        this.directionDelay = this.getDelay();
        const movement = this.getNextMovement();

        this.updateVelocity(movement);

        if (UFO.DEBUG) {
            console.log("New movement:", movement);
        }
    }

    updateVelocity(movement) {
        switch (movement) {
            case UFO.MOVEMENT.DOWN:
                this.velocityY = this.velocityX;
                break;
            case UFO.MOVEMENT.STRAIGHT:
                this.velocityY = 0;
                break;
            case UFO.MOVEMENT.UP:
                this.velocityY = -this.velocityX;
                break;
        }
    }

    getNextMovement() {
        const totalWeight = Object.values(UFO.DIRECTION_WEIGHTS).reduce((a, b) => a + b, 0);
        const random = RandomUtils.randomRange(0, totalWeight - 1, true);
        let sum = 0;

        for (const [movement, weight] of Object.entries(UFO.DIRECTION_WEIGHTS)) {
            sum += weight;
            if (random < sum) return movement;
        }
        return UFO.MOVEMENT.STRAIGHT;
    }

    getValue(){
        return this.isSmall ? 200 : 100;
    }

    isAtVerticalBoundary() {
        return this.y > CanvasUtils.getConfigHeight() - this.height - UFO.BOUNDARY_MARGIN ||
            this.y <= UFO.BOUNDARY_MARGIN;
    }

    shootBullet(ship) {
        if (!this.bulletTimer.isComplete()) return;

        const rotationAngle = this.getBulletAngle(ship);
        this.bulletManager.ufoShootBullet(this, ship, rotationAngle);

        this.bulletTimer.reset();
        this.bulletTimer.start();
    }

    getBulletAngle(ship) {
        if (this.isSmall && ship.isAlive()) {
            return AngleUtils.getAngleBetweenObjects(this, ship);
        }
        return RandomUtils.randomRange(0, UFO.ROTATION_MAX, true);
    }

    getDelay() {
        return RandomUtils.randomRange(UFO.DIRECTION_MIN_DELAY, UFO.DIRECTION_MAX_DELAY);
    }

    setHit() {
        this.setIsDying();
        this.bulletTimer.pause();
        UFO.audioPlayer.playAudio('bangLarge.wav', 0.5); // 50% volume
        
        if (UFO.DEBUG) {
            console.log("UFO hit, dying with bullets:", this.bulletManager.getBulletCount());
        }
    }

    /** @override */
    destroy() {
        if (!super.destroy()) return false;

        try {
            if (UFO.DEBUG) {
                console.log("UFO destroy start:", this);
            }

            this.cleanup();
            return true;

        } catch (error) {
            console.error("Error during UFO destruction:", error);
            return false;
        }
    }

    cleanup() {
        this.directionCnt = null;
        this.directionDelay = null;
        this.isSmall = null;

        if (this.bulletManager) {
            SystemUtils.destroy(this.bulletManager);
            this.bulletManager = null;
        }

        if (this.bulletTimer) {
            this.bulletTimer = null;
        }
    }

    logDebugInfo(direction) {
        console.log("UFO Created:", {
            position: { x: this.x, y: this.y },
            size: this.isSmall ? UFO.SIZE.SMALL : UFO.SIZE.LARGE,
            direction: direction ? "right" : "left",
            velocity: { x: this.velocityX, y: this.velocityY }
        });
    }
}

export default UFO;