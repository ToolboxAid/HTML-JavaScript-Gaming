// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// gamePlayerSelectUi.js

import PrimitiveRenderer from '../renderers/primitiveRenderer.js';

class GamePlayerSelectUi {
    constructor() {
        throw new Error('GamePlayerSelectUi is a utility class with only static methods. Do not instantiate.');
    }

    static drawPlayerSelectOverlay(ctx, config) {
        PrimitiveRenderer.drawRect(0, 0, config.canvasWidth, config.canvasHeight, config.backgroundColor, null, 0, 0.67, { ctx });
        ctx.fillStyle = config.color;
        ctx.font = config.font;
        ctx.fillText(config.title, config.x, config.y);
    }

    static drawKeyboardPlayerOptions(ctx, config) {
        for (let i = 1; i <= config.maxPlayers; i++) {
            ctx.fillText(
                `Keyboard \`${i}\` for ${i} Player${i > 1 ? 's' : ''}`,
                config.optionX,
                config.y + i * config.spacing
            );
        }
    }

    static drawControllerPlayerOptions(ctx, config) {
        const controllerTitleY = config.y + config.controllerOffsetY;
        const firstOptionY = controllerTitleY + config.controllerLineSpacing;

        ctx.fillText(config.controllerTitle, config.x, controllerTitleY);
        ctx.fillText('`Left Bumper` 1 player', config.optionX, firstOptionY);
        ctx.fillText('`Right Bumper` 2 players', config.optionX, firstOptionY + config.controllerLineSpacing);
    }

    static drawPlayerSelection(ctx, config, gameControllers = null) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        this.drawPlayerSelectOverlay(ctx, config);
        this.drawKeyboardPlayerOptions(ctx, config);

        if (gameControllers) {
            this.drawControllerPlayerOptions(ctx, config);
        }

        ctx.restore();
    }
}

export default GamePlayerSelectUi;
