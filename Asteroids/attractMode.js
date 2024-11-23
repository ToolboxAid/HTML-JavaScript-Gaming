// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// AttractMode.js - asteroids

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import Asteroid from './asteroid.js';
import Functions from '../scripts/functions.js';

class AttractMode {
    constructor() {
        this.asteroids = new Map();
        this.spawnAsteroidsCount = 7;

        this.initAttract();
    }

    update(deltaTime) {
        this.asteroids.forEach((asteroid) => {
            asteroid.update(deltaTime);
        });
    }

    draw() {
        this.asteroids.forEach((asteroid, key) => {
            asteroid.draw();
        });
        this.displayAttract();
    }

    displayAttract() {
        CanvasUtils.ctx.fillStyle = "white";
        CanvasUtils.ctx.font = "30px Arial";
        CanvasUtils.ctx.fillText("Welcome to Asteroids!", 250, 200);
        CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);
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

export default AttractMode;

