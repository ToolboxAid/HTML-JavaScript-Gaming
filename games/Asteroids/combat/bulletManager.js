// ToolboxAid.com 
// David Quesenberry
// asteroids
// 01/20/2025
// bulletManager.js

import SystemUtils from "../../../engine/utils/systemUtils.js";
import BulletFactory from "./bulletFactory.js";

/**
 * Manages bullet creation, updates, and cleanup for ship and UFO
 */
class BulletManager {
  // Constants
  static SHIP_MAX_BULLETS = 5;

  // Debug mode enabled via URL parameter: game.html?bulletManager
  static DEBUG = new URLSearchParams(window.location.search).has('bulletManager');

  constructor() {
    this.bullets = [];
    this.shipMaxBullets = BulletManager.SHIP_MAX_BULLETS;
  }

  update(deltaTime) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      bullet.update(deltaTime);

      if (bullet.isDead()) {
        bullet.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  /** TODO: where should this go?
       // // Clear all explosions with proper cleanup
    // while (Game.explosions.length > 0) {
    //   const explosion = Game.explosions.pop();
    //   if (explosion) {
    //     explosion.destroy();
    //   }
    // }
    // Game.explosions = [];
   */

  // check(ship) {
  //   if (!ship.isAlive()) return;

  //   for (let i = this.bullets.length - 1; i >= 0; i--) {
  //     const bullet = this.bullets[i];

  //     // if (SystemUtils.getObjectType(this) === 'Bullet') {
  //     //   console.log(`bullet vectorMap for '${SystemUtils.getObjectType(this)}', ${JSON.stringify(bullet.vectorMap)}`);
  //     // }

  //     if (!bullet.isAlive()) continue;

  //     if (bullet.collisionDetection(ship)) {
  //       bullet.setIsDead();
  //       bullet.destroy();
  //       ship.setIsDying();
  //       break;
  //     }
  //   }
  // }

  draw() {
    this.bullets.forEach(bullet => bullet.draw());
  }

  shipShootBullet(ship) {
    if (!this.canShipShoot()) return;

    const bullet = BulletFactory.createShipBullet(ship);
    this.bullets.push(bullet);

    if (BulletManager.DEBUG) {
      console.log("Ship bullet fired:", {
        angle: ship.rotationAngle,
        total: this.bullets.length
      });
      console.log("Ship bullet fired:", bullet);
    }
  }

  canShipShoot() {
    return this.bullets.length < this.shipMaxBullets;
  }

  ufoShootBullet(ufo, ship, options = {}) {
    if (!ufo.isAlive()) return;

    const bullet = BulletFactory.createUfoBullet(ufo, ship, options);
    this.bullets.push(bullet);

    if (BulletManager.DEBUG) {
      console.log("UFO bullet fired:", {
        angle: bullet.rotationAngle,
        total: this.bullets.length
      });
    }
  }

  hasActiveBullets() {
    return this.bullets.length > 0;
  }

  getBulletCount() {
    return this.bullets.length;
  }

  /** Destroys bullets array and cleans up resources
   * @returns {boolean} True if cleanup was successful
   */
  destroy() {
    try {
      if (BulletManager.DEBUG) {
        console.log("BulletManager destroy:", {
          bulletCount: this.bullets.length
        });
      }

      SystemUtils.cleanupArray(this.bullets);
      this.bullets = [];
      this.bullets = null;
      this.shipMaxBullets = null;

      return true;

    } catch (error) {
      console.error('Error during BulletManager destruction:', error);
      return false;
    }
  }
}

export default BulletManager;
