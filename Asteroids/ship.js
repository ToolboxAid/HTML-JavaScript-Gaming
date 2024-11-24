// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';
import Physics from '../scripts/physics.js';

import Asteroid from './asteroid.js';
import Bullet from './bullet.js';
//import UFO from './ufo.js';

class Ship extends ObjectVector {

    static maxSpeed = 800; // Set a maximum velocity cap (adjust as needed)

    constructor() {
        const vectorMap = [[14, 0], [-10, -8], [-6, -3], [-6, 3], [-10, 8], [14, 0]
            //,[0, 0]
        ];

        // start SHIP at center of screen
        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, vectorMap);

        this.level = 1;

        this.rotationAngle = 0;
        this.rotationSpeed = 120; // degrees per second 

        this.thrust = 150;
        this.friction = 0.995;

        this.accelerationX = 0;
        this.accelerationY = 0;

        this.velocityX = 0;
        this.velocityY = 0;

        // asteroids
        this.asteroids = new Map();
        this.asteroidID = 0;
        // this.asteroids.delete(key);

        // bullets
        this.bullets = [];
        this.maxBullets = 5;

        // ufos

        this.reset();
        this.init();
    }

    reset() { // called before player plays
        this.x = canvasConfig.width / 2;
        this.y = canvasConfig.height / 2;

        this.rotationAngle = 0;
        this.rotationSpeed = 120; // degrees per second 

        this.accelerationX = 0;
        this.accelerationY = 0;

        this.velocityX = 0;
        this.velocityY = 0;
    }

    init() {
        // this.initAsteroids('small');
        // this.initAsteroids('medium');
        this.initAsteroids('large');
    }

    initAsteroids(size) {
        const maxAsteroids = 3 + (3 * this.level);

        for (let i = 0; i < maxAsteroids; i++) {
            const x = Functions.randomGenerator(0, canvasConfig.width);
            const y = Functions.randomGenerator(0, canvasConfig.height);
            this.createAsteroid(x, y, size);
        }
    }

    createAsteroid(x,y,size){
        const key = size + "-" + this.asteroidID++;
        const asteroid = new Asteroid(x, y, size);
        this.asteroids.set(key, asteroid);
    }

    drawDebugInfo(ctx) {
        // Draw the current velocity and thrust values on the screen
        ctx.font = '16px Arial';  // Choose font size and style
        ctx.fillStyle = 'white';  // Text color
        ctx.fillText(`Velocity X: ${this.velocityX.toFixed(2)}`, 10, 20);
        ctx.fillText(`Velocity Y: ${this.velocityY.toFixed(2)}`, 10, 40);
        ctx.fillText(`Acceleration X: ${this.accelerationX.toFixed(2)}`, 10, 60);
        ctx.fillText(`Acceleration Y: ${this.accelerationY.toFixed(2)}`, 10, 80);
        ctx.fillText(`Rotation Angle: ${this.rotationAngle.toFixed(2)}`, 10, 100);
        ctx.fillText(`Friction: ${this.friction.toFixed(3)}`, 10, 120);
    }

    update(deltaTime, keyboardInput) {
        this.drawDebugInfo(CanvasUtils.ctx);

        let asteroidValue = 0;

        // Rotate the ship
        if (keyboardInput.isKeyDown('ArrowLeft')) {
            Physics.applyRotation(this, deltaTime, -1)
        }
        if (keyboardInput.isKeyDown('ArrowRight')) {
            Physics.applyRotation(this, deltaTime, 1);
        }

        // Wrap rotationAngle to keep it between 0 and 360
        this.rotationAngle = Functions.degreeLimits(this.rotationAngle);

        // Reset acceleration values
        this.accelerationX = 0;
        this.accelerationY = 0;

        // Apply thrust (acceleration) when ArrowUp is held down
        if (keyboardInput.isKeyDown('ArrowUp')) {
            const vectorDirection = Physics.getVectorDirection(this.rotationAngle);

            this.accelerationX = vectorDirection.x * this.thrust * deltaTime;
            this.accelerationY = vectorDirection.y * this.thrust * deltaTime;
            // TODO: add a flame to the ship for thrust
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
        }

        //  update game objects
        this.asteroids.forEach((asteroid, key) => {
            asteroid.update(deltaTime);
            // 
        });

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);

// check collusion with asteroids
            this.asteroids.forEach((asteroid, asteroidKey) => {
                if (bullet.collisionDetection(asteroid)) {
                    bullet.setIsDead();

                    if (asteroid.size === 'large'){
                        console.log("hit large");
                        // spawn 2 mediume
                        this.createAsteroid(asteroid.x,asteroid.y,'medium');
                        this.createAsteroid(asteroid.x,asteroid.y,'medium');
                        asteroidValue = 100;
                    }
                    if (asteroid.size === 'medium'){
                        console.log("hit large");
                        // spawn 2 small 
                        this.createAsteroid(asteroid.x,asteroid.y,'small');
                        this.createAsteroid(asteroid.x,asteroid.y,'small');
                        asteroidValue =  50;
                    }                    
                    if (asteroid.size === 'small'){
                        console.log("hit small");
                        asteroidValue = 10;
                    }
                    this.asteroids.delete(asteroidKey);
                }
            });
            // check collusion with UFO

            // check collusion with ship (hit myself, dumb ass)

            if (bullet.isDead()) {
                this.bullets.splice(i, 1); // Remove the bullet if it's "dead"
            }
        }

        // // Draw bullets
        // // this.bullets.forEach(bullet => bullet.draw());
        // this.asteroids.forEach((asteroid, key) => {
        //     asteroid.draw();
        //     console.log("Draw");
        //     //     if (asteroid.isOutOfBounds()) {
        //     //         this.asteroids.delete(key);
        //     //     }
        // });
        return asteroidValue;
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

    draw() {
        // Draw ship
        super.draw();

        // Draw all game objects
        this.bullets.forEach(bullet => bullet.draw());
        this.asteroids.forEach(asteroid => asteroid.draw());
    }

}

export default Ship;

// Example usage
if (false) {
    const ship = new Ship(100, 100);
    console.log('Ship:', ship);
}
