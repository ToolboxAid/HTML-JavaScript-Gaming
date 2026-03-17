// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// gamePlayerSelectUi.js

import CanvasText from '../core/canvasText.js';
import PrimitiveRenderer from '../renderers/primitiveRenderer.js';

class GamePlayerSelectUi {
    constructor() {
        throw new Error('GamePlayerSelectUi is a utility class with only static methods. Do not instantiate.');
    }

    static drawPlayerSelectOverlay(config) {
        PrimitiveRenderer.drawOverlay(config.canvasWidth, config.canvasHeight, config.backgroundColor, 0.67);
        const { fontSize, fontFamily } = CanvasText.parseFont(config.font);

        CanvasText.renderText(config.title, config.x, config.y, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
    }

    static drawKeyboardPlayerOptions(config) {
        const { fontSize, fontFamily } = CanvasText.parseFont(config.font);

        for (let i = 1; i <= config.maxPlayers; i++) {
            CanvasText.renderText(
                `Keyboard \`${i}\` for ${i} Player${i > 1 ? 's' : ''}`,
                config.optionX,
                config.y + i * config.spacing,
                {
                    fontSize,
                    fontFamily,
                    color: config.color,
                    useDpr: false
                }
            );
        }
    }

    static drawControllerPlayerOptions(config) {
        const controllerTitleY = config.y + config.controllerOffsetY;
        const firstOptionY = controllerTitleY + config.controllerLineSpacing;
        const { fontSize, fontFamily } = CanvasText.parseFont(config.font);

        CanvasText.renderText(config.controllerTitle, config.x, controllerTitleY, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
        CanvasText.renderText('`Left Bumper` 1 player', config.optionX, firstOptionY, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
        CanvasText.renderText('`Right Bumper` 2 players', config.optionX, firstOptionY + config.controllerLineSpacing, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
    }

    static drawPlayerSelection(config, gameControllers = null) {
        this.drawPlayerSelectOverlay(config);
        this.drawKeyboardPlayerOptions(config);

        if (gameControllers) {
            this.drawControllerPlayerOptions(config);
        }
    }
}

export default GamePlayerSelectUi;
