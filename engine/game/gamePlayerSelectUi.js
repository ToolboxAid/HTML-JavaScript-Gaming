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

    static drawPlayerSelectOverlay(ctx, config) {
        PrimitiveRenderer.drawOverlay(config.canvasWidth, config.canvasHeight, config.backgroundColor, 0.67, { ctx });
        const fontParts = config.font.split(/\s+/);
        const fontSize = Number.parseFloat(fontParts[0]) || 20;
        const fontFamily = fontParts.slice(1).join(' ') || 'Arial';

        CanvasText.renderText(ctx, config.title, config.x, config.y, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
    }

    static drawKeyboardPlayerOptions(ctx, config) {
        const fontParts = config.font.split(/\s+/);
        const fontSize = Number.parseFloat(fontParts[0]) || 20;
        const fontFamily = fontParts.slice(1).join(' ') || 'Arial';

        for (let i = 1; i <= config.maxPlayers; i++) {
            CanvasText.renderText(
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
        const fontParts = config.font.split(/\s+/);
        const fontSize = Number.parseFloat(fontParts[0]) || 20;
        const fontFamily = fontParts.slice(1).join(' ') || 'Arial';

        CanvasText.renderText(ctx, config.controllerTitle, config.x, controllerTitleY, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
        CanvasText.renderText(ctx, '`Left Bumper` 1 player', config.optionX, firstOptionY, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
        CanvasText.renderText(ctx, '`Right Bumper` 2 players', config.optionX, firstOptionY + config.controllerLineSpacing, {
            fontSize,
            fontFamily,
            color: config.color,
            useDpr: false
        });
    }

    static drawPlayerSelection(ctx, config, gameControllers = null) {
        this.drawPlayerSelectOverlay(ctx, config);
        this.drawKeyboardPlayerOptions(ctx, config);

        if (gameControllers) {
            this.drawControllerPlayerOptions(ctx, config);
        }
    }
}

export default GamePlayerSelectUi;
