// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import AngleUtils from '../engine/math/angleUtils.js';
import CanvasUtils from '../engine/canvas.js';
import ObjectVector from '../engine/objects/objectVector.js';

import AsteroidManager from './asteroidManager.js';
import BulletManager from './bulletManager.js';
import UFOManager from './ufoManager.js';
import RandomUtils from '../engine/math/randomUtils.js';

class Ship extends ObjectVector {
    static MAX_SPEED = 800;
    static ROTATION_SPEED = 180;
    static THRUST = 150;
    static FRICTION = 0.995;

    static VECTOR_MAPS = {
        LARGE: [[24, 0], [-24, -18], [-18, 0], [-24, 18]],
        MEDIUM: [[18, 0], [-18, -14], [-13, 0], [-18, 14]],
        SMALL: [[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]],
        SMALLFLAME1: [
            [14, 0], [-10, -8], [-6, -3],
            [-8, 0],
            [-6, 3], [-6, -3],
            [-6, 3], [-10, 8], [14, 0]
        ],
        SMALLFLAME2: [
            [14, 0], [-10, -8], [-6, -3],
            [-10, 0],
            [-6, 3], [-6, -3],
            [-6, 3], [-10, 8], [14, 0]
        ],
        LIVES: [[0, -14], [-8, 10], [-3, 6], [3, 6], [8, 10], [0, -14]],
    };

    static DEBUG = new URLSearchParams(window.location.search).has('ship');
    static audioPlayer = null;

    constructor(audioPlayer) {
        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, Ship.VECTOR_MAPS.SMALL);

        Ship.audioPlayer = audioPlayer;

        this.initializeProperties();
        this.initializeManagers();
        this.reset();
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

        this.showThrustFlame = false;
        this.thrustFlameMap = Ship.VECTOR_MAPS.SMALL;
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

    getUfoBullets() {
        const ufo = this.ufoManager?.ufo;
        const bulletManager = ufo?.bulletManager;
        const bullets = bulletManager?.bullets;

        if (!bullets || typeof bullets.forEach !== 'function') {
            return [];
        }

        return bullets;
    }

    checkCollisions() {
        this.asteroidManager.checkShip(this);

        if (this.ufoManager.ufo && typeof this.ufoManager.ufo.isAlive === 'function') {
            this.asteroidManager.checkShip(this.ufoManager.ufo);
        }

        this.bulletManager.bullets.forEach(bullet => {
            this.score += this.asteroidManager.checkBullet(bullet);
        });

        const ufoBullets = this.getUfoBullets();

        ufoBullets.forEach(bullet => {
            this.asteroidManager.checkBullet(bullet);
        });

        this.bulletManager.bullets.forEach(bullet => {
            if (this.ufoManager.ufo && bullet.collisionDetection(this.ufoManager.ufo)) {
                bullet.setIsDead();
                this.ufoManager.ufo.setHit();
                this.ufoManager.createExplosion(this.ufoManager.ufo);
                this.score += this.ufoManager.ufo.getValue();
            }
        });

        if (this.isAlive()) {
            ufoBullets.forEach(bullet => {
                if (bullet.collisionDetection(this)) {
                    bullet.setIsDead();
                    this.setShipHit();
                    this.ufoManager.createExplosion(this);
                }
            });
        }

        if (this.isAlive()) {
            this.bulletManager.bullets.forEach(bullet => {
                if (bullet.collisionDetection(this)) {
                    bullet.setIsDead();
                    this.setShipHit();
                    this.asteroidManager.createExplosion(this);
                }
            });
        }

        this.ufoManager.check(this);
    }

    checkShipDeath() {
        if (
            !this.ufoManager.ufo &&
            this.isDying() &&
            !this.bulletManager.hasActiveBullets() &&
            !this.asteroidManager.hasActiveExplosions()
        ) {
            if (Ship.DEBUG) {
                console.log('Ship death confirmed - UFO destroyed');
            }

            this.setShipDead();
        }
    }

    moveShip(deltaTime, keyboardInput) {
        this.handleRotation(deltaTime, keyboardInput);
        this.handleThrust(deltaTime, keyboardInput);
        this.updateVelocity();
        this.updatePosition(deltaTime);
        this.handleShooting(keyboardInput);
        this.updateThrustVisual();
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

            if (Ship.audioPlayer) {
                Ship.audioPlayer.playAudio('thrust.wav', 0.75);
            }
        } else {
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;
            this.showThrustFlame = false;
        }
    }

    updateThrustVisual() {
        if (!this.isAlive() || !this.showThrustFlame) {
            this.thrustFlameMap = Ship.VECTOR_MAPS.SMALL;
            return;
        }

        this.thrustFlameMap = RandomUtils.randomBoolean()
            ? Ship.VECTOR_MAPS.SMALLFLAME1
            : Ship.VECTOR_MAPS.SMALLFLAME2;
    }

    updateVelocity() {
        this.velocityX = this.capVelocity(this.velocityX + this.accelerationX);
        this.velocityY = this.capVelocity(this.velocityY + this.accelerationY);
    }

    capVelocity(velocity) {
        return Math.abs(velocity) > Ship.MAX_SPEED
            ? Ship.MAX_SPEED * Math.sign(velocity)
            : velocity;
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

            if (Ship.audioPlayer) {
                Ship.audioPlayer.playAudio('fire.wav', 0.5);
            }
        }
    }

    reset() {
        this.setIsAlive();
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;
        this.rotationAngle = 0;
        this.showThrustFlame = false;
        this.thrustFlameMap = Ship.VECTOR_MAPS.SMALL;
        this.resetMovement();
        this.calculateObjectBounds(Ship.VECTOR_MAPS.SMALL);
    }

    resetMovement() {
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    setShipHit() {
        this.setIsDying();
        this.showThrustFlame = false;
        this.thrustFlameMap = Ship.VECTOR_MAPS.SMALL;
    }

    setShipDead() {
        this.setIsDead();
        this.showThrustFlame = false;
        this.thrustFlameMap = Ship.VECTOR_MAPS.SMALL;
    }

    draw() {
        try {
            if (this.isAlive()) {
                this.calculateObjectBounds(this.thrustFlameMap);
                super.draw();
            }

            if (Ship.DEBUG) {
                this.drawShipDebug();
            }

            this.drawGameObjects();
        } catch (error) {
            console.error('Ship draw error:', error, this);
        }
    }

    safeDraw() {
        try {
            if (Ship.DEBUG) {
                this.drawShipDebug();
            }

            this.asteroidManager.draw();
        } catch (error) {
            console.error('Ship safeDraw error:', error, this);
        }
    }

    drawGameObjects() {
        try {
            this.bulletManager.draw();
        } catch (error) {
            console.error('BulletManager draw error:', error);
        }

        try {
            this.asteroidManager.draw();
        } catch (error) {
            console.error('AsteroidManager draw error:', error);
        }

        try {
            this.ufoManager.draw();
        } catch (error) {
            console.error('UFOManager draw error:', error);
        }
    }

    drawShipDebug() {
        if (!this.isAlive()) {
            return;
        }

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