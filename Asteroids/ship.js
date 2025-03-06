// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import AngleUtils from '../scripts/math/angleUtils.js';
import CanvasUtils from '../scripts/canvas.js';
import ObjectVector from '../scripts/objectVector.js';

import AsteroidManager from './asteroidManager.js';
import BulletManager from './bulletManager.js';
import UFOManager from './ufoManager.js';
import SystemUtils from '../scripts/utils/systemUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';

class Ship extends ObjectVector {
    // Constants
    static MAX_SPEED = 800;
    static ROTATION_SPEED = 180;
    static THRUST = 150;
    static FRICTION = 0.995;
    static VECTOR_MAPS = {
        LARGE: [[24, 0], [-24, -18], [-18, 0], [-24, 18]],
        MEDIUM: [[18, 0], [-18, -14], [-13, 0], [-18, 14]],
        SMALL: [[14, 0], [-10, -8], [-6, -3],
        // Flame will be here
        [-6, 3], [-10, 8], [14, 0]],
        SMALLFLAME1: [[14, 0], [-10, -8], [-6, -3],
        // Flame
        [-8, 0],
        // Reset
        [-6, 3], [-6, -3],
        // continue
        [-6, 3], [-10, 8], [14, 0]],
        SMALLFLAME2: [[14, 0], [-10, -8], [-6, -3],
        // Flame
        [-10, 0],
        // Reset
        [-6, 3], [-6, -3],
        // continue
        [-6, 3], [-10, 8], [14, 0]],
        LIVES: [[0, -14], [-8, 10], [-3, 6], [3, 6], [8, 10], [0, -14]],
    };

    // Debug mode enabled via URL parameter: game.html?ship
    static DEBUG = new URLSearchParams(window.location.search).has('ship');

    static audioPlayer = null;
    constructor(audioPlayer) {
        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, Ship.VECTOR_MAPS.SMALL);

        this.initializeProperties();
        this.initializeManagers();
        this.reset();

        this.showThrustFlame = false;

        Ship.audioPlayer = audioPlayer;
    }

    initializeProperties() {
        this.level = 1;
        this.score = 0;
        this.rotationAngle = 0;
        this.rotationSpeed = Ship.ROTATION_SPEED;
        this.thrust = Ship.THRUST;
        this.friction = Ship.FRICTION;
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    initializeManagers() {
        this.asteroidManager = new AsteroidManager(Ship.audioPlayer);
        this.bulletManager = new BulletManager();
        this.ufoManager = new UFOManager(Ship.audioPlayer);
    }

    safeSpawn(deltaTime) {
        this.updateManagers(deltaTime, this);
        return this.asteroidManager.safeSpawn(this);
    }

    update(deltaTime, keyboardInput) {
        this.moveShip(deltaTime, keyboardInput);
        this.updateManagers(deltaTime, this);
        this.checkCollisions();
        this.checkShipDeath();
    }

    updateManagers(deltaTime, ship) {
        this.asteroidManager.update(deltaTime);
        this.bulletManager.update(deltaTime, ship);
        this.ufoManager.update(deltaTime, ship);
    }

    checkCollisions() {
        // Check if ship hits asteroids
        this.asteroidManager.checkShip(this);

        // Check if UFO hits ship
        this.asteroidManager.checkShip(this.ufoManager.ufo);

        // Check if bullets hit asteroids
        this.bulletManager.bullets.forEach(bullet => {
            this.score += this.asteroidManager.checkBullet(bullet);
        });

        // Check if UFO bullets hit asteroid
        this.ufoManager.ufo?.bulletManager.bullets.forEach(bullet => {
            this.asteroidManager.checkBullet(bullet);
        });

        // Check if UFO hit by ship bullets
        this.bulletManager.bullets.forEach(bullet => {
            if (this.ufoManager.ufo && bullet.collisionDetection(this.ufoManager.ufo)) {
                bullet.setIsDead();
                this.ufoManager.ufo.setIsDying();
                this.ufoManager.createExplosion(this.ufoManager.ufo);
                this.score += this.ufoManager.ufo.getValue();
            }
        });

        // Check if ship hit by UFO bullets
        if (this.isAlive()) {
            this.ufoManager.ufo?.bulletManager.bullets.forEach(bullet => {
                if (bullet.collisionDetection(this)) {
                    bullet.setIsDead();
                    this.setShipHit();
                    this.ufoManager.createExplosion(this);
                }
            });
        }

        // Check if ship hit by Ship bullets (hit myself)
        if (this.isAlive()) {
            this.bulletManager.bullets.forEach(bullet => {
                if (bullet.collisionDetection(this)) {
                    bullet.setIsDead();
                    this.setShipHit();
                    this.asteroidManager.createExplosion(this);
                }
            });
        }

        // Check if ship hits UFO
        this.ufoManager.check(this);
    }

    checkShipDeath() {
        if (!this.ufoManager.ufo && this.isDying() && !this.bulletManager.hasActiveBullets()
            && !this.asteroidManager.hasActiveExplosions()) {
            if (Ship.DEBUG) {
                console.log("Ship death confirmed - UFO destroyed");
            }
            if (!this.bulletManager.hasActiveBullets()) {
                this.setShipDead();
            }
        }
    }

    moveShip(deltaTime, keyboardInput) {
        this.handleRotation(deltaTime, keyboardInput);
        this.handleThrust(deltaTime, keyboardInput);
        this.updateVelocity();
        this.updatePosition(deltaTime);
        this.handleShooting(keyboardInput);
    }

    handleRotation(deltaTime, keyboardInput) {
        if (keyboardInput.isKeyDown('ArrowLeft')) {
            AngleUtils.applyRotation(this, deltaTime, -1);
        }
        if (keyboardInput.isKeyDown('ArrowRight')) {
            AngleUtils.applyRotation(this, deltaTime, 1);
        }
        this.rotationAngle = AngleUtils.normalizeAngle(this.rotationAngle);
    }

    handleThrust(deltaTime, keyboardInput) {
        this.accelerationX = 0;
        this.accelerationY = 0;

        if (keyboardInput.isKeyDown('ArrowUp') && this.isAlive()) {
            const vectorDirection = AngleUtils.angleToVector(this.rotationAngle);
            this.accelerationX = vectorDirection.x * this.thrust * deltaTime;
            this.accelerationY = vectorDirection.y * this.thrust * deltaTime;
            this.showThrustFlame = true;
            Ship.audioPlayer.playAudio('thrust.wav', 0.75); // 75% volume

        } else {
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;
            this.showThrustFlame = false;
        }
    }

    updateVelocity() {
        this.velocityX = this.capVelocity(this.velocityX + this.accelerationX);
        this.velocityY = this.capVelocity(this.velocityY + this.accelerationY);
    }

    capVelocity(velocity) {
        return Math.abs(velocity) > Ship.MAX_SPEED ?
            Ship.MAX_SPEED * Math.sign(velocity) : velocity;
    }

    updatePosition(deltaTime) {
        super.update(deltaTime);
        this.checkWrapAround();
    }

    getValue() {
        const score = this.score;
        this.score = 0;
        return score;
    }

    handleShooting(keyboardInput) {
        if (keyboardInput.getkeysPressed().includes('Space') && this.isAlive()) {
            this.bulletManager.shipShootBullet(this);
            Ship.audioPlayer.playAudio('fire.wav', 0.5); // 50% volume
        }
    }

    reset() {
        this.setIsAlive();
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;
        this.resetMovement();
    }

    resetMovement() {
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    setShipHit() {
        this.setIsDying();
    }

    setShipDead() {
        this.setIsDead();
    }

    draw() {
        if (this.isAlive()) {
            if (this.showThrustFlame) {
                if (RandomUtils.randomBoolean()) {
                    this.calculateObjectBounds(Ship.VECTOR_MAPS.SMALLFLAME1);
                } else {
                    this.calculateObjectBounds(Ship.VECTOR_MAPS.SMALLFLAME2);
                }
            }
            super.draw();
        }
        if (Ship.DEBUG) {
            this.drawShipDebug();
        }
        this.drawGameObjects();
    }

    safeDraw() {
        if (Ship.DEBUG) {
            this.drawShipDebug();
        }
        this.asteroidManager.draw();
    }

    drawGameObjects() {
        this.bulletManager.draw();
        this.asteroidManager.draw();
        this.ufoManager.draw();
    }

    drawShipDebug() {
        if (!this.isAlive()) return;

        const debugInfo = [
            `Velocity X: ${this.velocityX.toFixed(2)}`,
            `Velocity Y: ${this.velocityY.toFixed(2)}`,
            `Acceleration X: ${this.accelerationX.toFixed(2)}`,
            `Acceleration Y: ${this.accelerationY.toFixed(2)}`,
            `Rotation Angle: ${this.rotationAngle.toFixed(2)}`,
            `Friction: ${this.friction.toFixed(3)}`
        ];

        const ctx = CanvasUtils.ctx;
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';

        debugInfo.forEach((info, index) => {
            ctx.fillText(info, 10, 20 * (index + 1));
        });
    }

}

export default Ship;