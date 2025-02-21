// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufo.js

import ObjectVector from '../scripts/objectVector.js';

import AngleUtils from '../scripts/math/angleUtils.js';
import Bullet from './bullet.js';
import CanvasUtils from '../scripts/canvas.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import RandomUtils from '../scripts/math/randomUtils.js';
import SystemUtils from '../scripts/utils/systemUtils.js';
import Timer from '../scripts/utils/timer.js';

class UFO extends ObjectVector {

  // Play your game normally: game.html
  // Enable debug mode: game.html?ufo
  static DEBUG = new URLSearchParams(window.location.search).has('ufo');

  static getVectorMapSmall() {
    return [
      [-14, 3], [14, 3], [9, 9], [-9, 9], [-14, 3], [-9, -3],
      [-5, -3], [-5, -6], [-2, -9], [2, -9], [5, -6], [5, -3], [-5, -3],
      [9, -3], [14, 3]
    ];
  }
  static getVectorMapLarge() {
    return [
      [-21, 4.5], [21, 4.5], [13.5, 13.5], [-13.5, 13.5], [-21, 4.5], [-13.5, -4.5],
      [-7.5, -4.5], [-7.5, -9], [-3, -13.5], [3, -13.5], [7.5, -9], [7.5, -4.5], [-7.5, -4.5],
      [13.5, -4.5], [21, 4.5]
    ];
  }
  static speed = 80;
  static offset = 20;

  constructor() {
    let x = CanvasUtils.getConfigWidth();
    let y = RandomUtils.randomRange(UFO.offset, CanvasUtils.getConfigHeight() - UFO.offset, true);

    let angle = 180; // left
    const dir = RandomUtils.randomBoolean();
    if (dir) { // 0 is left , 1 is right.
      angle = 0; //right
      x = -UFO.offset;
    }

    const velocity = AngleUtils.angleToVector(angle);

    let velocityX = velocity.x * UFO.speed;
    let velocityY = velocity.y * UFO.speed;

    // Initialize the parent class with the ufo vector map and velocity

    const isSmall = RandomUtils.randomBoolean()
    if (isSmall) {
      super(x, y, UFO.getVectorMapSmall(), velocityX, velocityY);
    } else {
      super(x, y, UFO.getVectorMapLarge(), velocityX, velocityY);
    }
    this.isSmall = isSmall;
    if (this.isSmall) {
      this.setVelocity(velocity.x * UFO.speed * 1.3, velocity.y * UFO.speed * 1.3);
    }

    this.directionCnt = 0;
    this.directionDelay = this.getDelay();

    this.bullets = [];
    this.bulletTimer = new Timer(1000);
    this.bulletTimer.start();

    if (this.DEBUG) {
      console.log(`UFO - string: ${JSON.stringify(this)} dir: ${dir} conf width ${CanvasUtils.getConfigWidth()}, conf height ${CanvasUtils.getConfigHeight()}`);
    }
  }

  update(deltaTime, ship) {
    this.bulletUpdateUFO(deltaTime, ship);

    if (this.isAlive()) {
      if (this.directionCnt++ > this.directionDelay) {
        this.changeDirections();
      }

      // Update super position based on velocity
      super.update(deltaTime);

      this.checkMyBoundaries();

      // update bullets
      this.shootBullet(ship);


    } else {
      if (this.isDying()) {

        // Check if all bullets exausted.
        if (UFO.DEBUG) {
          console.log("UFO isDying - check bullets");
        }
        this.hasBullets();
      }
    }
  }
  checkMyBoundaries(){
      // get bounds sides hit
      const boundariesHit = CollisionUtils.getCompletelyOffScreenBoundaries(this, this.margin);

      // *** top/bottom ***
      if (boundariesHit.includes('top')) {
        this.y = CanvasUtils.getConfigHeight();
        if (this.DEBUG) {
          console.log("top:", this.y);
        }
      }
      if (boundariesHit.includes('bottom')) {
        this.y = -(this.height);
        if (this.DEBUG) {
          console.log("bottom:", this.y);
        }
      }

      // If the ufo exceeds left/right bounds, mark it for removal
      if (boundariesHit.includes('left') || boundariesHit.includes('right')) {
        this.setIsDying();
        if (this.DEBUG) {
          console.log("l/r:", this.x);
        }
      }

  }
  bulletUpdateUFO(deltaTime, ship) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      if(CollisionUtils.vectorCollisionDetection(bullet, ship)){
        console.log("UFO bullet hit ship");
        ship.setIsDying();
        bullet.setIsDead();
      }

      if (bullet.isDead()) {  // Check if dead, don't set it
        bullet.destroy();    // Destroy the bullet
        this.bullets.splice(i, 1); // Remove from array
        // Continue checking other bullets
        continue;
      }

      if (UFO.DEBUG) {
        console.log(`Bullet ${i} status:`, {
          position: { x: bullet.x, y: bullet.y },
          status: bullet.status,
          timer: { time: bullet.timeAlive, life: Bullet.lifespan },
        });
      }
    }
  }
  // Using switch (more readable for this case)
  changeDirections() {
    // Don't change directions if at top or bottom
    const withIn = 20;
    if (this.y > CanvasUtils.getConfigHeight - this.height - withIn || this.y <= withIn) {
      if (UFO.DEBUG) {
        warn.log("Don't get me stuck hidden top/bottom");
      }
      return;
    }

    this.directionCnt = 0;
    this.directionDelay = this.getDelay();

    const direction = RandomUtils.randomRange(0, 6, true);

    switch (direction) {
      case 0:
      case 1:
        // Move diagonally down
        this.velocityY = this.velocityX;
        break;
      case 2:
      case 3:
      case 4:
        // Move horizontally
        this.velocityY = 0;
        break;
      case 5:
      case 6:
        // Move diagonally up
        this.velocityY = -this.velocityX;
        break;
    }

    if (UFO.DEBUG) {
      console.log("UFO direction:", direction);
    }
  }

  getDelay() {
    this.directionDelay = RandomUtils.randomRange(100, 200);
    if (UFO.DEBUG) {
      console.log("directionDelay:", this.directionDelay);
    }
    return this.directionDelay;
  }

  shootBullet(ship) {
    if (this.bulletTimer.isComplete()) {
      // Bullet angle is the same as the ship's rotation
      if (this.isSmall) {
        // sho0t at ship
        const rotationAngle = AngleUtils.getAngleBetweenObjects(this, ship);
        const bullet = new Bullet(this.x, this.y, rotationAngle);
        this.bullets.push(bullet);
      } else {
        // shoot randomly
        const rotationAngle = RandomUtils.randomRange(0, 360, true);
        const bullet = new Bullet(this.x, this.y, rotationAngle);
        this.bullets.push(bullet);
      }

      this.bulletTimer.reset();
      this.bulletTimer.start();
      if (UFO.DEBUG) {
        console.log("shootBullets", this.bullets);
      }
    }
  }

  setHit() {
    if (this.DEBUG) {
      console.log("setHit", this.bullets);
    }
    this.setIsDying(); // until all bullets gone.
    this.bulletTimer.pause();
  }

  hasBullets() {
    if (this.DEBUG) {
      console.log("hasBullets", this.bullets);
    }
    if (this.bullets.length > 0) {
      return;
    }

    // no more bullets, UFO is dead
    this.setIsDead();
  }

  destroy() {
    if (this.DEBUG) {
      console.log(`UFO destroy start:, ${JSON.stringify(this)}`);
    }

    super.destroy();

    this.directionCnt = null;
    this.directionDelay = null;
    this.isSmall = null;

    SystemUtils.cleanupArray(this.bullets);
    this.bullets = null;

    this.bulletTimer = null;

    if (UFO.DEBUG) {
      console.log(`UFO destroy end:, ${JSON.stringify(this)}`);
    }
  }

}

export default UFO;
