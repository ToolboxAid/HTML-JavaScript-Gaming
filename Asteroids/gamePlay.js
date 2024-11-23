// ToolboxAid.com
// David Quesenberry
// 11/23/2024
// gamePlay.js - asteroids

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import Asteroid from './asteroid.js';
import Functions from '../scripts/functions.js';
import Ship from './ship.js';

class GamePlay {
    constructor() {
        this.asteroids = new Map();
        this.spawnAsteroidsCount = 7;
        this.initAttract();
        const ship1 = new Ship();
        const ship2 = new Ship();
        this.ships = [ship1, ship2];
    }

    update(deltaTime, keyboardInput) {
        this.asteroids.forEach((asteroid) => {
            asteroid.update(deltaTime);
        });
        this.ships[0].update(deltaTime, keyboardInput);
    }

    draw() {
        this.ships[0].draw();

        this.asteroids.forEach((asteroid, key) => {
            asteroid.draw();
        });
    }

    initAttract() {
        this.spawnAsteroids('small');
        this.spawnAsteroids('medium');
        this.spawnAsteroids('large');
    }

    spawnAsteroids(size) {
        for (let i = 0; i < this.spawnAsteroidsCount; i++) {
            const key = size + "-" + i;
            const x = Functions.randomGenerator(0, canvasConfig.width);
            const y = Functions.randomGenerator(0, canvasConfig.height);
            const asteroid = new Asteroid(x, y, size);
            this.asteroids.set(key, asteroid);
        }
    }

}

export default GamePlay;

