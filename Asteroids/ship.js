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

class Ship extends ObjectVector {
    // Constants
    static MAX_SPEED = 800;
    static ROTATION_SPEED = 180;
    static THRUST = 150;
    static FRICTION = 0.995;
    static VECTOR_MAPS = {
        LARGE: [[24, 0], [-24, -18], [-18, 0], [-24, 18]],
        MEDIUM: [[18, 0], [-18, -14], [-13, 0], [-18, 14]],
        SMALL: [[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]],
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

        //TODO: still need flame
        this.applyThrust = false;

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
        this.asteroidManager = new AsteroidManager();
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
        this.asteroidManager.checkShip(this);
        this.ufoManager.check(this);
    }

    checkShipDeath() {
        if (!this.ufoManager.ufo && this.isDying()) {
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

        if (keyboardInput.isKeyDown('ArrowUp')) {
            const vectorDirection = AngleUtils.angleToVector(this.rotationAngle);
            this.accelerationX = vectorDirection.x * this.thrust * deltaTime;
            this.accelerationY = vectorDirection.y * this.thrust * deltaTime;
            this.applyThrust = true;
            Ship.audioPlayer.playAudio('thrust.wav', 0.5); // 50% volume

        } else {
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;
            this.applyThrust = false;
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

    handleShooting(keyboardInput) {
        if (keyboardInput.getkeysPressed().includes('Space') && this.isAlive()) {
            this.bulletManager.shipShootBullet(this);
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
        super.draw();
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