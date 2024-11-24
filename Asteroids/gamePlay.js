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
        this.ships = [];
        for (let i = 0; i <= 3; i++) {
            this.ships[i] = new Ship();
        }        
    }

    reset(currentPlayer){
        this.ships[currentPlayer].reset();
    }

    update(currentPlayer, deltaTime, keyboardInput) {
        // this.asteroids.forEach((asteroid) => {
        //     asteroid.update(deltaTime);
        // });
         return this.ships[currentPlayer].update( deltaTime, keyboardInput);
    }

    draw(currentPlayer) {
        this.ships[currentPlayer].draw();

        // this.asteroids.forEach((asteroid, key) => {
        //     asteroid.draw();
        // });
    }

}

export default GamePlay;

