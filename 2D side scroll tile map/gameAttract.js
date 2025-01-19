// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// gameAttract.js - 2D tile map

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import Functions from '../scripts/functions.js';

import Hero from './hero.js';
import TileMap from '../scripts/tileMap.js';

class GameAttract {
    constructor() {
        this.hero = new Hero();
        this.tileMap = new TileMap(canvasConfig.width, canvasConfig.height);
        this.tileMap.setTileMapInfo(0);
    }

    update(deltaTime, keyboardInput) {
        this.hero.update(deltaTime, keyboardInput, this.tileMap);
    }

    draw(show = true) {
        // this.displayAttract();
        // needs to be drawn on the correct layer.
        // moved to tilemap.js
        // this.hero.draw();  
        this.tileMap.draw(this.hero);
    }

    displayAttract() {
        CanvasUtils.ctx.fillStyle = "white";
        CanvasUtils.ctx.font = "30px Arial";
        CanvasUtils.ctx.fillText("Welcome to Scrolling Tile Map!", 250, 200);
        CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);
    }

}

export default GameAttract;
