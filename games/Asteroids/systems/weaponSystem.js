// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// weaponSystem.js

import Timer from '../../../engine/utils/timer.js';
import DifficultyProfile from './difficultyProfile.js';

class AsteroidsWeaponSystem {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.ufoBulletTimer = null;
        this.ufoTimerOwnerId = null;
        this.ufoTimerInterval = null;
    }

    update(world, ship, keyboardInput) {
        this.handleShipFire(world, ship, keyboardInput);
        this.handleUfoFire(ship, world.ufoManager);
    }

    handleShipFire(world, ship, keyboardInput) {
        if (!keyboardInput || !ship.isAlive()) {
            return;
        }

        if (!keyboardInput.getKeysPressed().includes('Space')) {
            return;
        }

        world.bulletManager.shipShootBullet(ship);

        if (this.audioPlayer) {
            this.audioPlayer.playAudio('fire.wav', 0.5);
        }
    }

    handleUfoFire(ship, ufoManager) {
        const ufo = ufoManager.getUfo();

        if (!ufo || typeof ufo.isAlive !== 'function' || !ufo.isAlive()) {
            this.clearUfoTimer();
            return;
        }

        this.ensureUfoTimer(ufo, ufoManager.level);

        if (!this.ufoBulletTimer.isComplete()) {
            return;
        }

        ufoManager.fireBullet(ship);
        this.ufoBulletTimer.reset();
        this.ufoBulletTimer.start();
    }

    ensureUfoTimer(ufo, level = 1) {
        const interval = DifficultyProfile.getUfoFireInterval(level, ufo.isSmall);

        if (this.ufoTimerOwnerId === ufo.ID &&
            this.ufoBulletTimer &&
            this.ufoTimerInterval === interval) {
            return;
        }

        this.ufoTimerOwnerId = ufo.ID;
        this.ufoTimerInterval = interval;
        this.ufoBulletTimer = new Timer(interval);
        this.ufoBulletTimer.start();
    }

    clearUfoTimer() {
        this.ufoTimerOwnerId = null;
        this.ufoBulletTimer = null;
        this.ufoTimerInterval = null;
    }

    reset() {
        this.clearUfoTimer();
    }
}

export default AsteroidsWeaponSystem;
