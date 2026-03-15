// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import Circle from './circle.js';

class Game  extends GameBase {
    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
    }

    async onInitialize() {
        this.circle = new Circle(canvasConfig);
    }


    gameLoop(deltaTime) {
        this.circle.update(deltaTime);
        this.circle.draw();
    }

    onDestroy() {
        this.circle = null;
    }
}

export default Game;

const game = new Game();


