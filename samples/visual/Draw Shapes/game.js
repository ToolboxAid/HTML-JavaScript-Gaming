// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, drawShapesUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import CanvasText from '../../../engine/core/canvasText.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';
import { drawShapeGallery } from './drawShapesArt.js';

class Game extends GameBase {
    static STATES = Object.freeze({
        ATTRACT: 'attract',
        PLAY_GAME: 'playGame'
    });

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.keyboardInput = null;
        this.gameState = Game.STATES.ATTRACT;
        this.stateHandlers = {
            [Game.STATES.ATTRACT]: () => this.displayAttractMode(),
            [Game.STATES.PLAY_GAME]: () => this.playGame()
        };
    }

    async onInitialize() {
        this.keyboardInput = new KeyboardInput();
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
        this.drawStage(drawShapesUi.theme.panelColor, drawShapesUi.theme.panelBorderColor);
        renderCenteredText(drawShapesUi.attract.title, drawShapesUi.attract.titleY, 42, uiFont.display, drawShapesUi.theme.colors.textPrimary);
        renderCenteredText(drawShapesUi.attract.prompt, drawShapesUi.attract.promptY, 26, uiFont.ui, drawShapesUi.theme.colors.textPrimary);
        renderCenteredText(drawShapesUi.attract.subtitle, drawShapesUi.attract.subtitleY, 20, uiFont.ui, drawShapesUi.theme.colors.textSecondary);
        renderCenteredText(drawShapesUi.attract.help, drawShapesUi.attract.helpY, 18, uiFont.ui, drawShapesUi.theme.colors.muted);
    }

    playGame() {
        this.drawStage(drawShapesUi.theme.playPanelColor, drawShapesUi.theme.accentColor);
        renderCenteredText('Canvas Shape Gallery', drawShapesUi.play.titleY, 36, uiFont.display, drawShapesUi.theme.colors.textPrimary);
        renderCenteredText(drawShapesUi.play.subtitle, drawShapesUi.play.subtitleY, 22, uiFont.ui, drawShapesUi.theme.colors.textSecondary);
        renderCenteredText(drawShapesUi.play.prompt, drawShapesUi.play.promptY, 18, uiFont.ui, drawShapesUi.theme.colors.muted);
        drawShapeGallery(canvasConfig);
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = drawShapesUi.theme;
        PrimitiveRenderer.drawPanel(panelX, panelY, panelWidth, panelHeight, {
            fillColor: panelColor,
            borderColor,
            borderWidth: panelBorderSize,
            backdropColor: drawShapesUi.theme.colors.panelBackdrop,
            backdropInset: 18,
            headerY: panelY + 74,
            headerColor: borderColor,
            headerWidth: 2
        });
    }

    gameLoop() {
        this.keyboardInput.update();
        this.updateStateInput();

        const handler = this.stateHandlers[this.gameState];
        if (typeof handler === 'function') {
            handler();
            return;
        }

        this.gameState = Game.STATES.ATTRACT;
    }

    onDestroy() {
        // GameBase owns shared input cleanup after onDestroy runs.
    }
}

function renderCenteredText(text, y, fontSize, fontFamily, color) {
    CanvasText.renderCenteredText(CanvasUtils.ctx, text, y, {
        fontSize,
        fontFamily,
        color
    });
}

export default Game;

const game = new Game();

