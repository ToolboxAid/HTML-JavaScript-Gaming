// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsWorld.js

import AsteroidManager from './asteroidManager.js';
import BulletManager from './bulletManager.js';
import AsteroidsCollisionSystem from './asteroidsCollisionSystem.js';
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
        this.pendingScore += AsteroidsCollisionSystem.resolve(this, ship);
    }

    updateManagers(deltaTime, ship) {
        this.asteroidManager.update(deltaTime);
        this.bulletManager.update(deltaTime, ship);
        this.ufoManager.update(deltaTime, ship);
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
