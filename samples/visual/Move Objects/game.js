// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, moveObjectsUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import CanvasText from '../../../engine/core/canvasText.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import Circle from './circle.js';

class Game extends GameBase {
    static STATES = Object.freeze({
        ATTRACT: 'attract',
        PLAY_GAME: 'playGame'
    });

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.keyboardInput = null;
        this.circle = null;
        this.gameState = Game.STATES.ATTRACT;
        this.stateHandlers = {
            [Game.STATES.ATTRACT]: () => this.displayAttractMode(),
            [Game.STATES.PLAY_GAME]: () => this.playGame()
        };
    }

    async onInitialize() {
        this.keyboardInput = new KeyboardInput();
        this.circle = new Circle(canvasConfig);
    }

    wasAnyKeyPressed(keyCodes = []) {
        return keyCodes.some((code) => this.keyboardInput?.isKeyPressed(code));
    }

    updateStateInput() {
        if (this.wasAnyKeyPressed(['Enter', 'NumpadEnter', 'Space'])) {
            this.gameState = this.gameState === Game.STATES.ATTRACT
                ? Game.STATES.PLAY_GAME
                : Game.STATES.ATTRACT;
        }
    }

    displayAttractMode() {
        this.drawStage(moveObjectsUi.theme.panelColor, moveObjectsUi.theme.panelBorderColor);
        renderCenteredText(moveObjectsUi.attract.title, moveObjectsUi.attract.titleY, 42, uiFont.display, moveObjectsUi.theme.colors.textPrimary);
        renderCenteredText(moveObjectsUi.attract.prompt, moveObjectsUi.attract.promptY, 26, uiFont.ui, moveObjectsUi.theme.colors.textPrimary);
        renderCenteredText(moveObjectsUi.attract.subtitle, moveObjectsUi.attract.subtitleY, 20, uiFont.ui, moveObjectsUi.theme.colors.textSecondary);
        renderCenteredText(moveObjectsUi.attract.help, moveObjectsUi.attract.helpY, 18, uiFont.ui, moveObjectsUi.theme.colors.muted);
    }

    playGame(deltaTime) {
        this.drawStage(moveObjectsUi.theme.playPanelColor, moveObjectsUi.theme.accentColor);
        renderCenteredText('Movement Demo', moveObjectsUi.play.titleY, 36, uiFont.display, moveObjectsUi.theme.colors.textPrimary);
        renderCenteredText(moveObjectsUi.play.subtitle, moveObjectsUi.play.subtitleY, 22, uiFont.ui, moveObjectsUi.theme.colors.textSecondary);
        renderCenteredText(moveObjectsUi.play.prompt, moveObjectsUi.play.promptY, 18, uiFont.ui, moveObjectsUi.theme.colors.muted);
        this.runMovementDemo(deltaTime);
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = moveObjectsUi.theme;
        CanvasUtils.drawRect(panelX - 18, panelY - 18, panelWidth + 36, panelHeight + 36, moveObjectsUi.theme.colors.panelBackdrop);
        CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
        CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
        CanvasUtils.drawLine(panelX, panelY + 74, panelX + panelWidth, panelY + 74, 2, borderColor);
    }

    runMovementDemo(deltaTime) {
        if (!this.circle) {
            return;
        }

        this.circle.update(deltaTime);
        this.circle.draw();
    }

    gameLoop(deltaTime) {
        this.keyboardInput.update();
        this.updateStateInput();

        const handler = this.stateHandlers[this.gameState];
        if (typeof handler === 'function') {
            handler(deltaTime);
            return;
        }

        this.gameState = Game.STATES.ATTRACT;
    }

    onDestroy() {
        this.circle = null;
    }
}

function renderCenteredText(text, y, fontSize, fontFamily, color) {
    CanvasText.renderCenteredText(CanvasUtils.ctx, text, y, {
        defaultCenterX: canvasConfig.width / 2,
        fontSize,
        fontFamily,
        color
    });
}

export default Game;

const game = new Game();
