// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// gamePlayerSelectUi.js

class GamePlayerSelectUi {
    constructor() {
        throw new Error('GamePlayerSelectUi is a utility class with only static methods. Do not instantiate.');
    }

    static drawPlayerSelectOverlay(ctx, config) {
        ctx.fillStyle = config.backgroundColor + 'AA';
        ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
        ctx.fillStyle = config.color;
        ctx.font = config.font;
        ctx.fillText(config.title, config.x, config.y);
    }

    static drawKeyboardPlayerOptions(ctx, config) {
        for (let i = 1; i <= config.maxPlayers; i++) {
            ctx.fillText(
                `Keyboard \`${i}\` for ${i} Player${i > 1 ? 's' : ''}`,
                (config.canvasWidth / 2) - 200,
                config.y + i * config.spacing
            );
        }
    }

    static drawControllerPlayerOptions(ctx, config) {
        ctx.fillText('GameController Select Player(s)', config.x, config.y + 150);
        ctx.fillText('`Left Bumper` 1 player', (config.canvasWidth / 2) - 200, config.y + 200);
        ctx.fillText('`Right Bumper` 2 players', (config.canvasWidth / 2) - 200, config.y + 250);
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
