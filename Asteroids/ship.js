// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import CanvasUtils from '../scripts/canvas.js';
import AngleUtils from '../scripts/math/angleUtils.js';
import AsteroidManager from './asteroidManager.js';
import UFOManager from './ufoManager.js';
import Bullet from './bullet.js';
import SystemUtils from '../scripts/utils/systemUtils.js';

class Ship extends ObjectVector {
    // Play your game normally: game.html
    // Enable debug mode: game.html?systemUtils
    static DEBUG = new URLSearchParams(window.location.search).has('ship');

    static maxSpeed = 800; // Set a maximum velocity cap (adjust as needed)

    constructor() {
        // --- X Large
        // const shipVectorMap = [[24, 0], [-24, -18], [-18, 0], [-24, 18]];
        // --- Large
        // const shipVectorMap = [[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]];
        // --- Medium
        // const shipVectorMap = [ [18, 0], [-18, -14], [-13, 0], [-18, 14] ];
        // --- Small
        const shipVectorMap = [[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]];

        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, shipVectorMap);

        this.level = 1;

        this.rotationAngle = 0;
        this.rotationSpeed = 180; // 120; // degrees per second 

        this.thrust = 150;
        this.friction = 0.995;

        this.accelerationX = 0;
        this.accelerationY = 0;

        this.velocityX = 0;
        this.velocityY = 0;

        this.asteroidManager = new AsteroidManager();

        // bullets
        this.bullets = [];
        this.maxBullets = 5;

        // ufo's
        this.ufoManager = new UFOManager;

        this.score = 0;

        this.reset();

    }

    reset() { // called before player plays
        this.setIsAlive();

        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;

        this.accelerationX = 0;
        this.accelerationY = 0;

        this.velocityX = 0;
        this.velocityY = 0;
    }

    setShipHit() {
        // TODO:  fix this.
        this.setIsDying();
        this.setIsDead();

        SystemUtils.cleanupArray(this.bullets);
        this.bullets = null;
        this.bullets = [];
    }

    update(deltaTime, keyboardInput) {
        this.updateShip(deltaTime, keyboardInput);
        this.updateBullet(deltaTime);

        this.ufoManager.update(deltaTime, this);
        this.asteroidManager.update(deltaTime);
        this.asteroidManager.checkShip(this);

        this.asteroidManager.checkUFO(this.ufo);

        if (!this.ufo && this.isDying()) {
            if (this.asteroidManager.safeSpawn(this)) {
                this.setShipHit();
            }
        }

    }

    updateShip(deltaTime, keyboardInput) {
        // Rotate the ship
        if (keyboardInput.isKeyDown('ArrowLeft')) {
            AngleUtils.applyRotation(this, deltaTime, -1)
        }
        if (keyboardInput.isKeyDown('ArrowRight')) {
            AngleUtils.applyRotation(this, deltaTime, 1);
        }

        // Wrap rotationAngle to keep it between 0 and 360
        this.rotationAngle = AngleUtils.normalizeAngle(this.rotationAngle);

        // Reset acceleration values
        this.accelerationX = 0;
        this.accelerationY = 0;

        // Apply thrust (acceleration) when ArrowUp is held down
        if (keyboardInput.isKeyDown('ArrowUp')) {
            const vectorDirection = AngleUtils.angleToVector(this.rotationAngle);
            this.accelerationX = vectorDirection.x * this.thrust * deltaTime;
            this.accelerationY = vectorDirection.y * this.thrust * deltaTime;
        } else { // Apply decelleration with friction (only if no thrust)
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;
        }

        // Apply acceleration to velocity
        this.velocityX += this.accelerationX;
        this.velocityY += this.accelerationY;

        // Apply a velocity cap to prevent runaway motion
        if (Math.abs(this.velocityX) > Ship.maxSpeed) this.velocityX = Ship.maxSpeed * Math.sign(this.velocityX);
        if (Math.abs(this.velocityY) > Ship.maxSpeed) this.velocityY = Ship.maxSpeed * Math.sign(this.velocityY);

        // Update position based on velocity
        super.update(deltaTime);
        this.checkWrapAround();

        // Shoot bullets
        if (keyboardInput.getkeysPressed().includes('Space') &&
            this.isAlive() && 
            this.bullets.length < this.maxBullets) {
            this.shootBullet();
        }
    }

    updateBullet(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);

            // check against SHIP
            if (bullet.isAlive()) {
                this.score += this.asteroidManager.checkBullet(bullet);

                // check collusion with ship (hit myself, dumb ass)
                if (bullet.collisionDetection(this)) {
                    bullet.setIsDead();
                    this.setShipHit();
                    break;
                }
                // check collusion with UFO
            }

            // check against UFO
            this.ufoManager.checkBullet(bullet);

            if (bullet.isDead()) {
                this.bullets.splice(i, 1); // Remove the bullet if it's "dead"
                break;
            }
        }
    }

    shootBullet() {
        const bullet = new Bullet(this.x, this.y, this.rotationAngle);  // Bullet angle is the same as the ship's rotation
        this.bullets.push(bullet);
    }

    draw() {
        // Draw ship
        super.draw();

        this.drawShipDebug();

        // Draw all game objects
        // Bullets
        this.bullets.forEach(bullet => bullet.draw());

        // Asteroids
        this.asteroidManager.draw();

        // UFO
        this.ufoManager.draw();
    }

    drawShipDebug() {
        if (!this.isAlive()) return;
        const ctx = CanvasUtils.ctx;
        ctx.font = '16px Arial';  // Choose font size and style
        ctx.fillStyle = 'white';  // Text color
        ctx.fillText(`Velocity X: ${this.velocityX.toFixed(2)}`, 10, 20);
        ctx.fillText(`Velocity Y: ${this.velocityY.toFixed(2)}`, 10, 40);
        ctx.fillText(`Acceleration X: ${this.accelerationX.toFixed(2)}`, 10, 60);
        ctx.fillText(`Acceleration Y: ${this.accelerationY.toFixed(2)}`, 10, 80);
        ctx.fillText(`Rotation Angle: ${this.rotationAngle.toFixed(2)}`, 10, 100);
        ctx.fillText(`Friction: ${this.friction.toFixed(3)}`, 10, 120);
    }

}

export default Ship;
