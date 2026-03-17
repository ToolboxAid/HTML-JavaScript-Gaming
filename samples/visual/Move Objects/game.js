// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, moveObjectsUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import CanvasText from '../../../engine/core/canvasText.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';
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
            [Game.STATES.PLAY_GAME]: (deltaTime) => this.playGame(deltaTime)
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
        CanvasText.renderCenteredText(moveObjectsUi.attract.title, moveObjectsUi.attract.titleY, { fontSize: 42, fontFamily: uiFont.display, color: moveObjectsUi.theme.colors.textPrimary });
        CanvasText.renderCenteredText(moveObjectsUi.attract.prompt, moveObjectsUi.attract.promptY, { fontSize: 26, fontFamily: uiFont.ui, color: moveObjectsUi.theme.colors.textPrimary });
        CanvasText.renderCenteredText(moveObjectsUi.attract.subtitle, moveObjectsUi.attract.subtitleY, { fontSize: 20, fontFamily: uiFont.ui, color: moveObjectsUi.theme.colors.textSecondary });
        CanvasText.renderCenteredText(moveObjectsUi.attract.help, moveObjectsUi.attract.helpY, { fontSize: 18, fontFamily: uiFont.ui, color: moveObjectsUi.theme.colors.muted });
    }

    playGame(deltaTime) {
        this.drawStage(moveObjectsUi.theme.playPanelColor, moveObjectsUi.theme.accentColor);
        CanvasText.renderCenteredText('Movement Demo', moveObjectsUi.play.titleY, { fontSize: 36, fontFamily: uiFont.display, color: moveObjectsUi.theme.colors.textPrimary });
        CanvasText.renderCenteredText(moveObjectsUi.play.subtitle, moveObjectsUi.play.subtitleY, { fontSize: 22, fontFamily: uiFont.ui, color: moveObjectsUi.theme.colors.textSecondary });
        CanvasText.renderCenteredText(moveObjectsUi.play.prompt, moveObjectsUi.play.promptY, { fontSize: 18, fontFamily: uiFont.ui, color: moveObjectsUi.theme.colors.muted });
        this.runMovementDemo(deltaTime);
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = moveObjectsUi.theme;
        PrimitiveRenderer.drawPanel(panelX, panelY, panelWidth, panelHeight, {
            fillColor: panelColor,
            borderColor,
            borderWidth: panelBorderSize,
            backdropColor: moveObjectsUi.theme.colors.panelBackdrop,
            backdropInset: 18,
            headerY: panelY + 74,
            headerColor: borderColor,
            headerWidth: 2
        });
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

export default Game;

const game = new Game();

