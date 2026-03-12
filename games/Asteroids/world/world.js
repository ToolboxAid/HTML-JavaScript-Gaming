// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// world.js

import AsteroidManager from './asteroidManager.js';
import BulletManager from '../combat/bulletManager.js';
import AsteroidsCollisionSystem from '../systems/collisionSystem.js';
import UFOManager from './ufoManager.js';
import AsteroidsWeaponSystem from '../systems/weaponSystem.js';
import AsteroidsScoreSystem from '../systems/scoreSystem.js';

class AsteroidsWorld {
    constructor(audioPlayer) {
        this.asteroidManager = new AsteroidManager(audioPlayer);
        this.bulletManager = new BulletManager();
        this.ufoManager = new UFOManager(audioPlayer);
        this.weaponSystem = new AsteroidsWeaponSystem(audioPlayer);
        this.scoreSystem = new AsteroidsScoreSystem();
    }

    stepForSpawn(deltaTime, actor) {
        this.updateManagers(deltaTime, actor);
    }

    isSafeSpawn(actor) {
        return this.asteroidManager.safeSpawn(actor);
    }

    step(deltaTime, actor, keyboardInput = null) {
        this.updateManagers(deltaTime, actor);
        this.weaponSystem.update(this, actor, keyboardInput);
        AsteroidsCollisionSystem.resolve(this, actor);
    }

    updateManagers(deltaTime, actor) {
        this.asteroidManager.update(deltaTime);
        this.bulletManager.update(deltaTime, actor);
        this.ufoManager.update(deltaTime, actor);
    }

    consumeScore() {
        return this.scoreSystem.consume();
    }

    hasActiveBullets() {
        return this.bulletManager.hasActiveBullets() || this.ufoManager.hasActiveBullets();
    }

    hasActiveExplosions() {
        return this.asteroidManager.hasActiveExplosions();
    }

    hasActiveUfo() {
        return this.ufoManager.hasActiveUfo();
    }

    canFinalizeActorDeath() {
        return !this.hasActiveUfo() &&
            !this.hasActiveBullets() &&
            !this.hasActiveExplosions();
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
        this.scoreSystem.reset();
        this.weaponSystem.reset();
    }
}

export default AsteroidsWorld;
