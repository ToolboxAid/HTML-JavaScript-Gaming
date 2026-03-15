// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtils.js

class GameUtils {
    static hasWarnedAboutControllerLimit = false;

    static getPlayerSelectConfig(canvasConfig, playerSelect = {}) {
        return {
            maxPlayers: playerSelect.maxPlayers || 4,
            lives: playerSelect.lives || 3,
            fillText: playerSelect.fillText || "Select Player Mode",
            x: playerSelect.optionBaseX || 100,
            y: playerSelect.optionBaseY || 100,
            spacing: playerSelect.optionSpacing || 50,
            fillStyle: playerSelect.fillStyle || "white",
            font: playerSelect.font || "30px Arial",
            canvasWidth: canvasConfig.width,
            canvasHeight: canvasConfig.height,
            backgroundColor: canvasConfig.backgroundColor
        };
    }

    static buildPlayerSelectionResult(playerCount, maxPlayers, lives) {
        return {
            playerCount,
            playerLives: Array.from({ length: maxPlayers }, (_, index) => (index < playerCount ? lives : 0)),
            gameState: "initGame"
        };
    }

    static drawPlayerSelectOverlay(ctx, config) {
        ctx.fillStyle = config.backgroundColor + 'AA';
        ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
        ctx.fillStyle = config.fillStyle;
        ctx.font = config.font;
        ctx.fillText(config.fillText, config.x, config.y);
    }

    static drawKeyboardPlayerOptions(ctx, config) {
        for (let i = 1; i <= config.maxPlayers; i++) {
            ctx.fillText(
                `Keyboard \`${i}\` for ${i} Player${i > 1 ? "s" : ""}`,
                (config.canvasWidth / 2) - 200,
                config.y + i * config.spacing
            );
        }
    }

    static getKeyboardPlayerSelection(keyboardInput, config) {
        for (let i = 1; i <= config.maxPlayers; i++) {
            if (keyboardInput.getKeysPressed().includes(`Digit${i}`) ||
                keyboardInput.getKeysPressed().includes(`Numpad${i}`)) {
                return this.buildPlayerSelectionResult(i, config.maxPlayers, config.lives);
            }
        }

        return null;
    }

    static drawControllerPlayerOptions(ctx, config) {
        ctx.fillText('GameController Select Player(s)', config.x, config.y + 150);
        ctx.fillText('`Left Bumper` 1 player', (config.canvasWidth / 2) - 200, config.y + 200);
        ctx.fillText('`Right Bumper` 2 players', (config.canvasWidth / 2) - 200, config.y + 250);
    }

    static getControllerPlayerSelection(gameControllers, config) {
        if (!gameControllers) {
            return null;
        }

        if (!this.hasWarnedAboutControllerLimit) {
            console.warn('GameController currently supports 2 players');
            this.hasWarnedAboutControllerLimit = true;
        }

        if (gameControllers.isButtonIndexDown(0, 4)) {
            return this.buildPlayerSelectionResult(1, config.maxPlayers, config.lives);
        }

        if (gameControllers.isButtonIndexDown(0, 5)) {
            return this.buildPlayerSelectionResult(2, config.maxPlayers, config.lives);
        }

        return null;
    }

    /** Constructor for GameUtils class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const gameUtils = new GameUtils(); // Throws Error
     * 
     * ✅ Do this:
     * GameUtils.selectNumberOfPlayers(...); // Use static methods directly
     */
    constructor() {
        throw new Error('GameUtils is a utility class with only static methods. Do not instantiate.');
    }

    /**  Player select information
    */
    static selectNumberOfPlayers(ctx, canvasConfig, playerSelect, keyboardInput, gameControllers) {
        const config = this.getPlayerSelectConfig(canvasConfig, playerSelect);

        this.drawPlayerSelectOverlay(ctx, config);
        this.drawKeyboardPlayerOptions(ctx, config);

        const keyboardSelection = this.getKeyboardPlayerSelection(keyboardInput, config);
        if (keyboardSelection) {
            return keyboardSelection;
        }

        if (gameControllers) {
            this.drawControllerPlayerOptions(ctx, config);
        }

        return this.getControllerPlayerSelection(gameControllers, config);
    }

    static swapPlayer(playerLives, currentPlayer, playerCount, setGameState) {
        const updatedLives = [...playerLives];

        updatedLives[currentPlayer] -= 1;

        if (updatedLives[currentPlayer] <= 0) {
            const allOut = updatedLives.every(lives => lives <= 0);
            if (allOut) {
                setGameState("gameOver");
                return { updatedPlayer: 0, updatedLives };
            }
        }

        let nextPlayer = currentPlayer;
        do {
            nextPlayer = (nextPlayer + 1) % playerCount;
        } while (updatedLives[nextPlayer] <= 0 && nextPlayer !== currentPlayer);

        return { updatedPlayer: nextPlayer, updatedLives };
    }

}

export default GameUtils;
