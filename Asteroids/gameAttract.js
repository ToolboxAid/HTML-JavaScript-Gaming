// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// gameAttract.js - asteroids

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
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
        if (show) {
            this.displayAttract();
        }
    }

    static count = 0;
    displayAttract() {
        const ctx = CanvasUtils.ctx;

        // Configure text settings
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';

        // During flash state, only current player's score flashes
        ctx.font = '20px "Vector Battle"';

        // Draw lives and score for each player
        const xOffset = CanvasUtils.getConfigWidth() / 2 - 200; // Space between player scores
        ctx.fillText(
            `Welcome to 'Asteroids'!`,
            xOffset,
            250
        );
        const duration = 35;
        if (GameAttract.count++ < duration) {

            ctx.fillText(
                "Press `Enter` to Start",
                xOffset,
                300);
        } else {
            if (GameAttract.count > duration * 2) {
                GameAttract.count = 0;
            }
        }
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

