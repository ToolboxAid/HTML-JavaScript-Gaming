// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsAttractScreen.js

import { canvasConfig, playerSelect } from './global.js';
import CanvasUtils from '../../engine/canvas.js';
import GameUtils from '../../engine/game/gameUtils.js';
import GameAttract from './gameAttract.js';

class AsteroidsAttractScreen {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameAttract = new GameAttract();
    }

    update(deltaTime) {
        this.gameAttract.update(deltaTime);
    }

    draw() {
        this.gameAttract.draw();
    }

    updatePlayerSelect(deltaTime, keyboardInput) {
        this.gameAttract.update(deltaTime);

        return GameUtils.selectNumberOfPlayers(
            CanvasUtils.ctx,
            canvasConfig,
            playerSelect,
            keyboardInput
        );
    }

    drawPlayerSelect() {
        this.gameAttract.draw(false);
    }
}

export default AsteroidsAttractScreen;
