// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js'; // Import canvasConfig
import GameBase from '../scripts/gamebase.js';
import Circle from './circle.js';

class Game  extends GameBase {
    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
    }

    static circle = null;
    async onInitialize() {
        // Create our circle
        this.circle = new Circle(canvasConfig);
        console.log("Game 'onInitialize' is complete");
    }


    gameLoop(deltaTime) {
        // Update circle position
        this.circle.update(deltaTime);
    
        // Call the drawing function
        this.circle.draw();
    }
}

export default Game;

const game = new Game();
