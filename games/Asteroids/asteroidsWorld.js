// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsWorld.js

import AsteroidManager from './asteroidManager.js';
import BulletManager from './bulletManager.js';
import UFOManager from './ufoManager.js';

class AsteroidsWorld {
    constructor(audioPlayer) {
        this.asteroidManager = new AsteroidManager(audioPlayer);
        this.bulletManager = new BulletManager();
        this.ufoManager = new UFOManager(audioPlayer);
        this.pendingScore = 0;
    }

    safeSpawn(ship, deltaTime) {
        this.updateManagers(deltaTime, ship);
        return this.asteroidManager.safeSpawn(ship);
    }

    update(ship, deltaTime) {
        this.updateManagers(deltaTime, ship);
        this.resolveCollisions(ship);
    }

    updateManagers(deltaTime, ship) {
        this.asteroidManager.update(deltaTime);
        this.bulletManager.update(deltaTime, ship);
        this.ufoManager.update(deltaTime, ship);
    }

    getUfoBullets() {
        const ufo = this.ufoManager?.ufo;
        const bulletManager = ufo?.bulletManager;
        const bullets = bulletManager?.bullets;

        if (!bullets || typeof bullets.forEach !== 'function') {
            return [];
        }

        return bullets;
    }

    resolveCollisions(ship) {
        this.asteroidManager.checkShip(ship);

        if (this.ufoManager.ufo && typeof this.ufoManager.ufo.isAlive === 'function') {
            this.asteroidManager.checkShip(this.ufoManager.ufo);
        }

        this.bulletManager.bullets.forEach((bullet) => {
            this.pendingScore += this.asteroidManager.checkBullet(bullet);
        });

        const ufoBullets = this.getUfoBullets();

        ufoBullets.forEach((bullet) => {
            this.asteroidManager.checkBullet(bullet);
        });

        this.bulletManager.bullets.forEach((bullet) => {
            if (this.ufoManager.ufo && bullet.collisionDetection(this.ufoManager.ufo)) {
                bullet.setIsDead();
                this.ufoManager.ufo.setHit();
                this.ufoManager.createExplosion(this.ufoManager.ufo);
                this.pendingScore += this.ufoManager.ufo.getValue();
            }
        });

        if (ship.isAlive()) {
            ufoBullets.forEach((bullet) => {
                if (bullet.collisionDetection(ship)) {
                    bullet.setIsDead();
                    ship.setShipHit();
                    this.ufoManager.createExplosion(ship);
                }
            });
        }

        if (ship.isAlive()) {
            this.bulletManager.bullets.forEach((bullet) => {
                if (bullet.collisionDetection(ship)) {
                    bullet.setIsDead();
                    ship.setShipHit();
                    this.asteroidManager.createExplosion(ship);
                }
            });
        }

        this.ufoManager.check(ship);
    }

    consumeScore() {
        const score = this.pendingScore;
        this.pendingScore = 0;
        return score;
    }

    hasActiveBullets() {
        return this.bulletManager.hasActiveBullets();
    }

    hasActiveExplosions() {
        return this.asteroidManager.hasActiveExplosions();
    }

    draw() {
        this.bulletManager.draw();
        this.asteroidManager.draw();
        this.ufoManager.draw();
    }

    drawSafeSpawn() {
        this.asteroidManager.draw();
    }

    reset() {
        this.pendingScore = 0;
    }
}

export default AsteroidsWorld;
