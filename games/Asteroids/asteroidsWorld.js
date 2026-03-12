// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsWorld.js

import AsteroidManager from './asteroidManager.js';
import BulletManager from './bulletManager.js';
import AsteroidsCollisionSystem from './asteroidsCollisionSystem.js';
import UFOManager from './ufoManager.js';
import AsteroidsWeaponSystem from './asteroidsWeaponSystem.js';

class AsteroidsWorld {
    constructor(audioPlayer) {
        this.asteroidManager = new AsteroidManager(audioPlayer);
        this.bulletManager = new BulletManager();
        this.ufoManager = new UFOManager(audioPlayer);
        this.weaponSystem = new AsteroidsWeaponSystem(audioPlayer);
        this.pendingScore = 0;
    }

    safeSpawn(ship, deltaTime) {
        this.updateManagers(deltaTime, ship);
        return this.asteroidManager.safeSpawn(ship);
    }

    update(ship, deltaTime, keyboardInput = null) {
        this.updateManagers(deltaTime, ship);
        this.weaponSystem.update(this, ship, keyboardInput);
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
        this.weaponSystem.reset();
    }
}

export default AsteroidsWorld;
