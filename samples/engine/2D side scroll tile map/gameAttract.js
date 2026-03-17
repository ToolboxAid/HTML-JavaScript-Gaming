// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// gameAttract.js - 2D tile map

import { canvasConfig } from './global.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import CanvasText from '../../../engine/core/canvasText.js';
import TileMap from '../../../engine/core/tileMap.js';

import Hero from './hero.js';

class GameAttract {
    constructor() {
        this.hero = new Hero();
        this.tileMap = new TileMap(canvasConfig.width, canvasConfig.height);
        this.tileMap.setTileMapInfo(0);
    }

    update(deltaTime, keyboardInput, gameControllers = null) {
        this.hero.update(deltaTime, keyboardInput, this.tileMap, gameControllers);
    }

    draw(show = true) {
  
        this.tileMap.draw(this.hero);
    }

    displayAttract() {
        CanvasText.renderMultilineText([
            "Welcome to Scrolling Tile Map!",
            "Press `Enter` to Start"
        ], 250, 200, {
            fontSize: 30,
            lineHeight: 100,
            useDpr: false
        });
    }

}

export default GameAttract;



