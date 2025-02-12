// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import CanvasUtils from '../scripts/canvas.js';

import AngleUtils from '../scripts/math/angleUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';

import Asteroid from './asteroid.js';
import Bullet from './bullet.js';
import UFO from './ufo.js';

class Ship extends ObjectVector {

    static maxSpeed = 800; // Set a maximum velocity cap (adjust as needed)

    constructor() {
        // // const vectorMap = //[[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]]; //,[0, 0]
        // //     [[24, 0], [-24, -18], [-18, 0], [-24, 18]];
        // const vectorMap = [
        //     [18, 0], [-18, -14], [-13, 0], [-18, 14]
        //   ];
        const vectorMap = [
            [14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]
        ];

        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, vectorMap);

        this.level = 1;

        this.rotationAngle = 0;
        this.rotationSpeed = 180; // 120; // degrees per second 

        this.thrust = 150;
        this.friction = 0.995;

        this.accelerationX = 0;
        this.accelerationY = 0;

        this.velocityX = 0;
        this.velocityY = 0;

        // asteroids
        this.asteroids = new Map();
        this.asteroidID = 0;

        // bullets
        this.bullets = [];
        this.maxBullets = 5;
        this.bulletsUFO = [];

        // ufo's
        this.ufo = new UFO();

        // value is used to add to score
        this.value = 0;

        this.reset();
        this.initAsteroids();
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
        this.setIsDead();
        this.bullets = [];
    }

    setAsteroidHit(asteroid, asteroidKey) {
        if (asteroid.size === 'large') {
            this.createAsteroid(asteroid.x, asteroid.y, 'medium');
            this.createAsteroid(asteroid.x, asteroid.y, 'medium');
            this.setValue(100);
        }
        if (asteroid.size === 'medium') {
            this.createAsteroid(asteroid.x, asteroid.y, 'small');
            this.createAsteroid(asteroid.x, asteroid.y, 'small');
            this.setValue(50);
        }
        if (asteroid.size === 'small') {
            this.setValue(10);
        }
        this.asteroids.delete(asteroidKey);
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        const value = this.value;
        this.value = 0;
        return value;
    }

    initAsteroids() {
        const maxAsteroids = 3 + (this.level * 2);
        let angleStep = 360 / maxAsteroids;
        for (let i = 0; i < maxAsteroids; i++) {
            const angle = angleStep * i;
            const d1 = canvasConfig.width / 4;
            const d2 = canvasConfig.width / 3;
            //            console.log(d1, d2);
            const distance = RandomUtils.randomRange(d1, d2);
            const position = AngleUtils.calculateOrbitalPosition(
                canvasConfig.width / 2, canvasConfig.height / 2, angle, distance);

            this.createAsteroid(position.x, position.y, "large");
        }
    }

    createAsteroid(x, y, size) {
        const key = size + "-" + this.asteroidID++;
        const asteroid = new Asteroid(x, y, size);
        this.asteroids.set(key, asteroid);
    }

    update(deltaTime, keyboardInput) {
        this.updateShip(deltaTime, keyboardInput);
        this.updateBullet(deltaTime);
        this.updateAsteroid(deltaTime);
        this.updateUFO(deltaTime);

        if (this.asteroids.size === 0) {
            this.level += 1;
            this.initAsteroids();
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
        this.rotationAngle = AngleUtils.degreeLimits(this.rotationAngle);

        // Reset acceleration values
        this.accelerationX = 0;
        this.accelerationY = 0;

        // Apply thrust (acceleration) when ArrowUp is held down
        if (keyboardInput.isKeyDown('ArrowUp')) {
            const vectorDirection = AngleUtils.getVectorDirection(this.rotationAngle);

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
        this.wrapAround();

        // Shoot bullets
        if (keyboardInput.getkeysPressed().includes('Space') &&
            this.bullets.length < this.maxBullets) {
            this.shootBullet();
            this.ufo = new UFO();
        }
    }

    updateAsteroid(deltaTime) {
        this.asteroids.forEach((asteroid, key) => {
            asteroid.update(deltaTime);
            if (asteroid.collisionDetection(this)) {
                this.setShipHit();
            }
        });
    }

    updateBullet(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);

            if (bullet.isAlive()) {
                // check collusion with asteroids
                this.asteroids.forEach((asteroid, asteroidKey) => {
                    if (bullet.collisionDetection(asteroid)) {
                        bullet.setIsDead();
                        this.setAsteroidHit(asteroid, asteroidKey);
                    }
                });

                // check collusion with ship (hit myself, dumb ass)
                if (bullet.collisionDetection(this)) {
                    bullet.setIsDead();
                    this.setShipHit();
                    break;
                }
                // check collusion with UFO


            }
            if (bullet.isDead()) {
                this.bullets.splice(i, 1); // Remove the bullet if it's "dead"
                break;
            }
        }
    }

    shootBullet() {
        const angleInRadians = this.rotationAngle * (Math.PI / 180); // Convert rotation angle from degrees to radians

        // Calculate the nose offset in world space (taking into account ship's rotation)
        const noseX = Math.cos(angleInRadians) * 24;  // Rotate the x-component of the nose vector
        const noseY = Math.sin(angleInRadians) * 24;  // Rotate the y-component of the nose vector

        // Bullet position is the ship's position plus the rotated nose offset
        const bulletX = this.x + noseX + ((this.width / 2) - 1);
        const bulletY = this.y + noseY + ((this.height / 2) - 1);

        // Create the bullet at the calculated position
        const bullet = new Bullet(bulletX, bulletY, angleInRadians);  // Bullet angle is the same as the ship's rotation
        //const bullet = new Bullet(bulletX, bulletY, this.rotationAngle);  // Bullet angle is the same as the ship's rotation
        bullet.rotationAngle = this.rotationAngle;
        this.bullets.push(bullet);
    }

    updateUFO(deltaTime) {
        if (this.ufo) {
            this.ufo.update(deltaTime);
        }
        // this.asteroids.forEach((asteroid, key) => {
        //     asteroid.update(deltaTime);
        //     if (asteroid.collisionDetection(this)) {
        //         this.setShipHit();
        //     }
        // });
    }

    draw() {
        // Draw ship
        super.draw();
        this.drawShipDebug(CanvasUtils.ctx);

        // Draw all game objects
        this.bullets.forEach(bullet => bullet.draw());
        this.asteroids.forEach(asteroid => asteroid.draw());
        if (this.ufo){
        this.ufo.draw();}
    }

    drawShipDebug(ctx) {
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

// Example usage
if (false) {
    const ship = new Ship(100, 100);
    console.log('Ship:', ship);
}
