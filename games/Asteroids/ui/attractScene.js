// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// attractScene.js

import { canvasConfig } from '../global.js';
import CanvasText from '../../../engine/core/canvasText.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import Asteroid from '../asteroid.js';
import RandomUtils from '../../../engine/math/randomUtils.js';

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
        // Draw lives and score for each player
        const xOffset = CanvasUtils.getConfigWidth() / 2 - 200; // Space between player scores
        CanvasText.renderText(`Welcome to 'Asteroids'!`, xOffset, 250, {
            fontSize: 20,
            fontFamily: '"Vector Battle"',
            color: 'white',
            useDpr: false
        });
        const duration = 35;
        if (GameAttract.count++ < duration) {

            CanvasText.renderText("Press `Enter` to Start", xOffset, 300, {
                fontSize: 20,
                fontFamily: '"Vector Battle"',
                color: 'white',
                useDpr: false
            });
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



