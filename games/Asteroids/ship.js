// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import AngleUtils from '../../engine/math/angleUtils.js';
import CanvasUtils from '../../engine/canvas.js';
import ObjectVector from '../../engine/objects/objectVector.js';
import RandomUtils from '../../engine/math/randomUtils.js';
import AsteroidsWorld from './asteroidsWorld.js';

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

    constructor(audioPlayer, world = null) {
        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, Ship.VECTOR_MAPS.SMALL);

        Ship.audioPlayer = audioPlayer;
        this.world = world || new AsteroidsWorld(audioPlayer);

        this.initializeProperties();
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

    safeSpawn(deltaTime) {
        return this.world.safeSpawn(this, deltaTime);
    }

    update(deltaTime, keyboardInput) {
        this.moveShip(deltaTime, keyboardInput);
        this.world.update(this, deltaTime);
        this.checkShipDeath();
    }

    checkShipDeath() {
        if (
            !this.world.hasActiveUfo() &&
            this.isDying() &&
            !this.world.hasActiveBullets() &&
            !this.world.hasActiveExplosions()
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
        const score = this.score + this.world.consumeScore();
        this.score = 0;
        return score;
    }

    handleShooting(keyboardInput) {
        if (keyboardInput.getkeysPressed().includes('Space') && this.isAlive()) {
            this.world.bulletManager.shipShootBullet(this);

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
        this.world.reset();
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

            this.world.drawSafeSpawn();
        } catch (error) {
            console.error('Ship safeDraw error:', error, this);
        }
    }

    drawGameObjects() {
        try {
            this.world.draw();
        } catch (error) {
            console.error('AsteroidsWorld draw error:', error);
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
