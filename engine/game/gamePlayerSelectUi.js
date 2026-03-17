// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// gamePlayerSelectUi.js

import CanvasUtils from '../core/canvasUtils.js';
import CanvasText from '../core/canvasText.js';
import PrimitiveRenderer from '../renderers/primitiveRenderer.js';

class GamePlayerSelectUi {
    constructor() {
        throw new Error('GamePlayerSelectUi is a utility class with only static methods. Do not instantiate.');
    }

    static drawPlayerSelectOverlay(ctx, config) {
        PrimitiveRenderer.drawOverlay(config.canvasWidth, config.canvasHeight, config.backgroundColor, 0.67, { ctx });
        const { fontSize, fontFamily } = CanvasText.parseFont(config.font);

        CanvasText.renderTextToContext(ctx, config.title, config.x, config.y, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
    }

    static drawKeyboardPlayerOptions(ctx, config) {
        const { fontSize, fontFamily } = CanvasText.parseFont(config.font);

        for (let i = 1; i <= config.maxPlayers; i++) {
            CanvasText.renderTextToContext(
                ctx,
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

    static drawControllerPlayerOptions(ctx, config) {
        const controllerTitleY = config.y + config.controllerOffsetY;
        const firstOptionY = controllerTitleY + config.controllerLineSpacing;
        const { fontSize, fontFamily } = CanvasText.parseFont(config.font);

        CanvasText.renderTextToContext(ctx, config.controllerTitle, config.x, controllerTitleY, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
        CanvasText.renderTextToContext(ctx, '`Left Bumper` 1 player', config.optionX, firstOptionY, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
        CanvasText.renderTextToContext(ctx, '`Right Bumper` 2 players', config.optionX, firstOptionY + config.controllerLineSpacing, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
    }

    static drawPlayerSelection(config, gameControllers = null) {
        this.drawPlayerSelectionToContext(CanvasUtils.ctx, config, gameControllers);
    }

    static drawPlayerSelectionToContext(ctx, config, gameControllers = null) {
        this.drawPlayerSelectOverlay(ctx, config);
        this.drawKeyboardPlayerOptions(ctx, config);

        if (gameControllers) {
            this.drawControllerPlayerOptions(ctx, config);
        }
    }
}

export default GamePlayerSelectUi;
