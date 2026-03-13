// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import DebugFlag from '../../engine/utils/debugFlag.js';
import { canvasConfig } from './global.js';
import AngleUtils from '../../engine/math/angleUtils.js';
import CanvasUtils from '../../engine/core/canvas.js';
import ObjectVector from '../../engine/objects/objectVector.js';
import RandomUtils from '../../engine/math/randomUtils.js';

class Ship extends ObjectVector {
    static MAX_SPEED = 800;
    static ROTATION_SPEED = 180;
    static THRUST = 150;
    static FRICTION = 0.995;

    static VECTOR_MAPS = {
        LARGE: [[24, 0], [-24, -18], [-18, 0], [-24, 18]],
        MEDIUM: [[18, 0], [-18, -14], [-13, 0], [-18, 14]],
        SMALL: [[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]],
        SMALLFLAME1_RAW: [
            [14, 0], [-10, -8], [-6, -3],
            [-8, 0],
            [-6, 3], [-6, -3],
            [-6, 3], [-10, 8], [14, 0]
        ],
        SMALLFLAME2_RAW: [
            [14, 0], [-10, -8], [-6, -3],
            [-10, 0],
            [-6, 3], [-6, -3],
            [-6, 3], [-10, 8], [14, 0]
        ],
        LIVES: [[0, -14], [-8, 10], [-3, 6], [3, 6], [8, 10], [0, -14]],
    };

    static getVectorMapCenter(vectorMap) {
        const total = vectorMap.reduce((sum, [x, y]) => ({
            x: sum.x + x,
            y: sum.y + y
        }), { x: 0, y: 0 });

        return {
            x: total.x / vectorMap.length,
            y: total.y / vectorMap.length
        };
    }

    static centerVectorMap(vectorMap, targetCenter) {
        const center = Ship.getVectorMapCenter(vectorMap);
        const deltaX = targetCenter.x - center.x;
        const deltaY = targetCenter.y - center.y;

        return vectorMap.map(([x, y]) => [x + deltaX, y + deltaY]);
    }

    static getThrustFlameMaps() {
        const targetCenter = Ship.getVectorMapCenter(Ship.VECTOR_MAPS.SMALL);

        return {
            flame1: Ship.centerVectorMap(Ship.VECTOR_MAPS.SMALLFLAME1_RAW, targetCenter),
            flame2: Ship.centerVectorMap(Ship.VECTOR_MAPS.SMALLFLAME2_RAW, targetCenter)
        };
    }

    static DEBUG = DebugFlag.has('ship');
    static audioPlayer = null;

    constructor(audioPlayer) {
        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, Ship.VECTOR_MAPS.SMALL);

        Ship.audioPlayer = audioPlayer;

        this.initializeProperties();
        this.reset();
    }

    initializeProperties() {
        this.level = 1;

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

    update(deltaTime, keyboardInput) {
        this.moveShip(deltaTime, keyboardInput);
    }

    moveShip(deltaTime, keyboardInput) {
        this.handleRotation(deltaTime, keyboardInput);
        this.handleThrust(deltaTime, keyboardInput);
        this.updateVelocity();
        this.updatePosition(deltaTime);
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

        const flameMaps = Ship.getThrustFlameMaps();

        this.thrustFlameMap = RandomUtils.randomBoolean()
            ? flameMaps.flame1
            : flameMaps.flame2;
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
        } catch (error) {
            console.error('Ship draw error:', error, this);
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


