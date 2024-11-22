// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';

import Bullet from './bullet.js';

class Ship extends ObjectVector {
    constructor() {
        const vectorMap = //[[24, 0], [-24, -16], [-16, -8], [-16, 8], [-24, 16],[24, 0],[0,0]];
        [[12, 0],[-12, -8],[-8, -4],[-8, 4],[-12, 8],[12, 0],
            [0, 0]];
          
        // start in center of screen
        const x = canvasConfig.width / 2;
        const y = canvasConfig.height / 2;

        super(x, y, vectorMap);
        this.rotationAngle = 0;
        this.rotationSpeed = 2.0; //0.1;
        this.thrust = 0.07;
        this.friction = 0.995;

        this.bullets = [];
        this.maxBullets = 5;
    }

    update(deltaTime, keyboardInput) {
        // Rotate the ship
        if (keyboardInput.isKeyDown('ArrowLeft')) {
            this.rotationAngle -= this.rotationSpeed;
        }
        if (keyboardInput.isKeyDown('ArrowRight')) {
            this.rotationAngle += this.rotationSpeed;
        }
        // Wrap rotationAngle to keep it between 0 and 360
        this.rotationAngle = (this.rotationAngle % 360 + 360) % 360;

        // Convert rotationAngle to radians
        const angleInRadians = this.rotationAngle * (Math.PI / 180);

        // Apply thrust
        if (keyboardInput.isKeyDown('ArrowUp')) {
            this.velocityX += Math.cos(angleInRadians) * this.thrust;
            this.velocityY += Math.sin(angleInRadians) * this.thrust;
        }

        // Update position with friction
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.x += this.velocityX;
        this.y += this.velocityY;

        super.update(deltaTime);
        this.wrapAround();

        // Shoot bullets
        if (keyboardInput.getKeysJustPressed().includes('Space')
            && this.bullets.length < this.maxBullets) {
            this.shootBullet();
        }

        // Update bullets
        this.updateBullets(deltaTime);//
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
const ship = new Ship(100, 100);
console.log('Ship:', ship);
