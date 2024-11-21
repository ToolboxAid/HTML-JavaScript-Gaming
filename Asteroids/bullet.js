// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// bullet.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';

class Bullet extends ObjectVector {
  constructor(x, y, angle) {

    const speed = 300;
    const lifespan = 1.5;
    // Define a simple vector map for a bullet, typically a small line or dot
    const vectorMap = [[-1, 0], [1, 0.5], [1,-0.5]];

    // Calculate velocity based on angle and speed
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    // Initialize the parent class with the bullet vector map and velocity
    super(x, y, vectorMap, velocityX, velocityY);

    this.lifespan = lifespan; // Time in seconds before the bullet disappears
    this.timeAlive = 0; // Time the bullet has existed
  }

  update(deltaTime) {
//this.rotationAngle += 22.5;
    // Update position based on velocity
    super.update(deltaTime);

    // Track how long the bullet has been alive
    this.timeAlive += deltaTime;

    // If the bullet exceeds its lifespan, mark it for removal
    if (this.timeAlive > this.lifespan) {
      this.setIsDead();
    }

    // Remove the bullet if it goes off-screen
    this.wrapAround();
  }


  // draw(context) {
  //   // Custom drawing logic for the bullet (e.g., a simple line or shape)
  //   context.save();
  //   context.translate(this.x, this.y);
  //   context.rotate(this.angle);
  //   context.beginPath();
  //   context.moveTo(this.vectorMap[0][0], this.vectorMap[0][1]);
  //   for (let i = 1; i < this.vectorMap.length; i++) {
  //     context.lineTo(this.vectorMap[i][0], this.vectorMap[i][1]);
  //   }
  //   context.closePath();
  //   context.fillStyle = 'yellow'; // Set a visible color for the bullet
  //   context.fill();
  //   context.restore();
  // }
}

// // Example Usage Code
// if (false) { // Replace 'false' with 'true' to activate the example
//   import Bullet from './bullet.js';

//   const bullets = []; // Array to store active bullets
//   const player = { x: 100, y: 100, angle: 0 }; // Mock player object

//   function fireBullet(x, y, angle) {
//     const bullet = new Bullet(x, y, angle);
//     bullets.push(bullet);
//   }

//   function updateBullets(deltaTime) {
//     bullets.forEach((bullet, index) => {
//       bullet.update(deltaTime);
//       if (bullet.isDead) {
//         bullets.splice(index, 1); // Remove dead bullets
//       }
//     });
//   }

//   function drawBullets(context) {
//     bullets.forEach((bullet) => {
//       bullet.draw(context);
//     });
//   }

//   // Example firing logic
//   document.addEventListener('keydown', (event) => {
//     if (event.code === 'Space') {
//       fireBullet(player.x, player.y, player.angle); // Fire from player's position and angle
//     }
//   });

//   // Game Loop Example
//   const canvas = document.getElementById('gameCanvas');
//   const context = canvas.getContext('2d');

//   function gameLoop(timestamp) {
//     const deltaTime = 1 / 60; // Assume fixed 60 FPS for simplicity

//     // Clear the canvas
//     context.clearRect(0, 0, canvas.width, canvas.height);

//     // Update and draw bullets
//     updateBullets(deltaTime);
//     drawBullets(context);

//     // Request the next frame
//     requestAnimationFrame(gameLoop);
//   }

//   gameLoop(); // Start the game loop
// }

export default Bullet;
