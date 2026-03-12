// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// weaponSystem.js

import Timer from '../../../engine/utils/timer.js';
import UFO from '../ufo.js';

class AsteroidsWeaponSystem {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.ufoBulletTimer = null;
        this.ufoTimerOwnerId = null;
    }

    update(world, ship, keyboardInput) {
        this.handleShipFire(world, ship, keyboardInput);
        this.handleUfoFire(ship, world.ufoManager);
    }

    handleShipFire(world, ship, keyboardInput) {
        if (!keyboardInput || !ship.isAlive()) {
            return;
        }

        if (!keyboardInput.getkeysPressed().includes('Space')) {
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

        this.ensureUfoTimer(ufo);

        if (!this.ufoBulletTimer.isComplete()) {
            return;
        }

        ufoManager.fireBullet(ship);
        this.ufoBulletTimer.reset();
        this.ufoBulletTimer.start();
    }

    ensureUfoTimer(ufo) {
        if (this.ufoTimerOwnerId === ufo.ID && this.ufoBulletTimer) {
            return;
        }

        this.ufoTimerOwnerId = ufo.ID;
        this.ufoBulletTimer = new Timer(UFO.BULLET_INTERVAL);
        this.ufoBulletTimer.start();
    }

    clearUfoTimer() {
        this.ufoTimerOwnerId = null;
        this.ufoBulletTimer = null;
    }

    reset() {
        this.clearUfoTimer();
    }
}

export default AsteroidsWeaponSystem;
