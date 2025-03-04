// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// gameAttract.js - asteroids

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import Asteroid from './asteroid.js';

import RandomUtils from '../scripts/math/randomUtils.js';

class GameAttract {
    constructor() {
        this.asteroids = new Map();
        this.spawnAsteroidsCount = 7;
        this.initAsteroids();
    }

    update(deltaTime) {
        this.asteroids.forEach((asteroid) => {
            asteroid.update(deltaTime);
        });
    }

    draw(show = true) {
        this.asteroids.forEach((asteroid, key) => {
            asteroid.draw();
        });
        if (show){
        this.displayAttract();
        }
    }

    displayAttract() {
        CanvasUtils.ctx.fillStyle = "white";
        CanvasUtils.ctx.font = "30px Arial";
        CanvasUtils.ctx.fillText("Welcome to Asteroids!", 250, 200);
        CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);
    }

    initAsteroids() {
        this.spawnAsteroids('small');
        this.spawnAsteroids('medium');
        this.spawnAsteroids('large');
    }

    spawnAsteroids(size) {
        for (let i = 0; i < this.spawnAsteroidsCount; i++) {
            const key = size + "-" + i;
            const x = RandomUtils.randomRange(0, canvasConfig.width);
            const y = RandomUtils.randomRange(0, canvasConfig.height);
            const asteroid = new Asteroid(x, y, size);
            this.asteroids.set(key, asteroid);
        }
    }

}

export default GameAttract;

