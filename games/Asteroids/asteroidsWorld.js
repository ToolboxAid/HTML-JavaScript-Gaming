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

    resolveCollisions(ship) {
        const ufo = this.ufoManager.getUfo();

        this.asteroidManager.checkShip(ship);

        if (ufo && typeof ufo.isAlive === 'function') {
            this.asteroidManager.checkShip(ufo);
        }

        this.bulletManager.bullets.forEach((bullet) => {
            this.pendingScore += this.asteroidManager.checkBullet(bullet);
        });

        const ufoBullets = this.ufoManager.getActiveBullets();

        ufoBullets.forEach((bullet) => {
            this.asteroidManager.checkBullet(bullet);
        });

        this.bulletManager.bullets.forEach((bullet) => {
            if (ufo && bullet.collisionDetection(ufo)) {
                bullet.setIsDead();
                ufo.setHit();
                this.ufoManager.createExplosion(ufo);
                this.pendingScore += ufo.getValue();
            }
        });

        if (ship.isAlive()) {
            ufoBullets.forEach((bullet) => {
                if (bullet.team !== 'player' && bullet.collisionDetection(ship)) {
                    bullet.setIsDead();
                    ship.setShipHit();
                    this.ufoManager.createExplosion(ship);
                }
            });
        }

        if (ship.isAlive()) {
            this.bulletManager.bullets.forEach((bullet) => {
                if (bullet.ownerId !== ship.ID && bullet.collisionDetection(ship)) {
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

    hasActiveUfo() {
        return this.ufoManager.hasActiveUfo();
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
