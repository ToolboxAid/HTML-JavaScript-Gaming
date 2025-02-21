// ToolboxAid.com 
// David Quesenberry
// asteroids
// 11/20/2024
// ufoManager.js

import Timer from '../scripts/utils/timer.js';
import UFO from './ufo.js';

class UFOManager {

    // Play your game normally: game.html
    // Enable debug mode: game.html?ufo
    static DEBUG = new URLSearchParams(window.location.search).has('ufoManager');

    constructor() {

        this.ufo = null;//new UFO();
        //this.ufoTimer = new Timer(10000);
        this.ufoTimer = new Timer(1000);
        this.ufoTimer.start();

    }

    update(deltaTime, ship) {
        if (this.ufo) {
            this.ufo.update(deltaTime, ship);


            if (this.ufo.isDead()) {
                this.setDeadUFO();
                this.ufo = null;
                if (UFOManager.DEBUG) {
                    console.log("this.ufo.isDead");
                }
            }
        } else if (!ship.isDying() && this.ufoTimer.isComplete() && !this.ufoTimer.isPaused) {
            // Create a new UFO
            this.ufoTimer.pause();
            this.ufo = new UFO();
            if (UFOManager.DEBUG) {
                console.log("new UFO", this.ufo, this.ufoTimer);
            }
        }
    }

    draw() {
        if (this.ufo) {
            // Draw bullets
            this.ufo.bullets.forEach(bullet => bullet.draw());

            // Draw UFO if alive
            if (this.ufo.isAlive()) {
                this.ufo.draw();
            }
        }
    }

    checkBullet(bullet) {
        if (this.ufo && bullet.collisionDetection(this.ufo)) {
            bullet.setIsDead();
            this.ufo.setIsDying();
            if (UFOManager.DEBUG) {
                console.log("----------UFO hit bullet");
            }
        }
    }

    setDeadUFO() {
        if (UFOManager.DEBUG) {
            console.log("setDeadUFO", this.ufo, this.ufoTimer);
        }
        this.ufo.setIsDead();

        this.ufo.destroy();

        this.ufoTimer.reset();
        this.ufoTimer.start();
    }

    destroy() {
        if (this.DEBUG) {
            console.log(`UFO destroy start:, ${JSON.stringify(this)}`);
        }

        super.destroy();



        if (UFO.DEBUG) {
            console.log(`UFO destroy end:, ${JSON.stringify(this)}`);
        }
    }

}

export default UFOManager;
