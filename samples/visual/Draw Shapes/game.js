// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, drawShapesUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import CanvasText from '../../../engine/core/canvasText.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
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
        CanvasText.renderCenteredText(CanvasUtils.ctx, drawShapesUi.attract.title, drawShapesUi.attract.titleY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 42,
            fontFamily: uiFont.display,
            color: drawShapesUi.theme.colors.textPrimary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, drawShapesUi.attract.prompt, drawShapesUi.attract.promptY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 26,
            fontFamily: uiFont.ui,
            color: drawShapesUi.theme.colors.textPrimary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, drawShapesUi.attract.subtitle, drawShapesUi.attract.subtitleY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 20,
            fontFamily: uiFont.ui,
            color: drawShapesUi.theme.colors.textSecondary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, drawShapesUi.attract.help, drawShapesUi.attract.helpY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 18,
            fontFamily: uiFont.ui,
            color: drawShapesUi.theme.colors.muted
        });
    }

    playGame() {
        this.drawStage(drawShapesUi.theme.playPanelColor, drawShapesUi.theme.accentColor);
        CanvasText.renderCenteredText(CanvasUtils.ctx, 'Canvas Shape Gallery', drawShapesUi.play.titleY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 36,
            fontFamily: uiFont.display,
            color: drawShapesUi.theme.colors.textPrimary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, drawShapesUi.play.subtitle, drawShapesUi.play.subtitleY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 22,
            fontFamily: uiFont.ui,
            color: drawShapesUi.theme.colors.textSecondary
        });
        CanvasText.renderCenteredText(CanvasUtils.ctx, drawShapesUi.play.prompt, drawShapesUi.play.promptY, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize: 18,
            fontFamily: uiFont.ui,
            color: drawShapesUi.theme.colors.muted
        });
        drawShapeGallery(canvasConfig);
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = drawShapesUi.theme;
        CanvasUtils.drawRect(panelX - 18, panelY - 18, panelWidth + 36, panelHeight + 36, drawShapesUi.theme.colors.panelBackdrop);
        CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
        CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
        CanvasUtils.drawLine(panelX, panelY + 74, panelX + panelWidth, panelY + 74, 2, borderColor);
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
        this.keyboardInput = null;
    }
}

export default Game;

const game = new Game();
