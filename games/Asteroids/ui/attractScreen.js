// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// attractScreen.js

import { canvasConfig, playerSelect } from '../global.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import GamePlayerSelectUi from '../../../engine/game/gamePlayerSelectUi.js';
import GameUtils from '../../../engine/game/gameUtils.js';
import GameAttract from './attractScene.js';

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
        const config = GameUtils.getPlayerSelectConfig(canvasConfig, playerSelect);
        GamePlayerSelectUi.drawPlayerSelection(CanvasUtils.ctx, config);
        return GameUtils.resolvePlayerSelection(keyboardInput, null, config);
    }

    drawPlayerSelect() {
        this.gameAttract.draw(false);
    }
}

export default AsteroidsAttractScreen;

