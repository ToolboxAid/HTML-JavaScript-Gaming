// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import Physics from '../scripts/physics.js';
import Bullet from './bullet.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';
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

// TODO: need a bullet/asteroid/ufo manager for below inside this SHIP (the player).
        this.bullets = [];
        this.maxBullets = 5;

        this.asteroids = [];
        this.maxAsteroids = 3 + (3 * this.level);
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
        } else {
            // Apply decelleration with friction (only if no thrust)
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
        if (keyboardInput.getkeysPressed().includes('Space') && this.bullets.length < this.maxBullets) {
            this.shootBullet();
        }

        // Update bullets
        this.updateBullets(deltaTime);
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

    updateBullets(deltaTime) {
        this.bullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            if (bullet.isDead()) {
                this.bullets.splice(index, 1); // Remove dead bullets
            }
        });
    }

    draw() {
        // Draw ship
        super.draw();

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw());
    }

}

export default Ship;

// Example usage
if (false) {
    const ship = new Ship(100, 100);
    console.log('Ship:', ship);
}
