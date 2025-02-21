// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// bulletManager.js

import Bullet from "./bullet.js";
import SystemUtils from "../scripts/utils/systemUtils.js";

class BulletManager {

  // Play your game normally: game.html
  // Enable debug mode: game.html?bullet
  static DEBUG = new URLSearchParams(window.location.search).has('bulletManager');


  constructor() {
    // bullets
    this.bullets = [];
    this.maxBullets = 5;
  }

  update(deltaTime, ship) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      // check against SHIP
      if (bullet.isAlive()) {
//TODO        this.score += this.asteroidManager.checkBullet(bullet);

        // check collusion with ship (hit myself, dumb ass)
        if (bullet.collisionDetection(ship)) {
          bullet.setIsDead();
//TODO          this.setShipHit();
          break;
        }
        // check collusion with UFO
      }

      // check against UFO
//TODO      this.ufoManager.checkBullet(bullet);

      if (bullet.isDead()) {
        this.bullets.splice(i, 1); // Remove the bullet if it's "dead"
        break;
      }
    }
  }

  draw() {
    this.bullets.forEach(bullet => bullet.draw());
  }

  shootBullet(ship) {
    if (this.bullets.length < this.maxBullets) {
      // Bullet angle is the same as the ship's rotation
      const bullet = new Bullet(ship.x, ship.y, ship.rotationAngle);
      this.bullets.push(bullet);
    }
  }

  reset() {
    SystemUtils.cleanupArray(this.bullets);
    this.bullets = null;
    this.bullets = [];
  }

  /** Destroys the bullet and cleans up resources.
  * @returns {boolean} True if cleanup was successful
  */
  destroy() {
    try {
      if (Bullet.DEBUG) {
        console.log(`bullet destroy ${JSON.stringify(this)}`);
      }

      // Call parent destroy first
      const parentDestroyed = super.destroy();
      if (!parentDestroyed) {
        return false;
      }


      return true; // Successful cleanup

    } catch (error) {
      console.error('Error during Bullet destruction:', error);
      return false;
    }
  }

}

export default BulletManager;
