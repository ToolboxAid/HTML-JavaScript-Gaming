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
        this.drawCenteredText(drawShapesUi.attract.title, drawShapesUi.attract.titleY, 42, drawShapesUi.theme.colors.textPrimary, uiFont.display);
        this.drawCenteredText(drawShapesUi.attract.prompt, drawShapesUi.attract.promptY, 26, drawShapesUi.theme.colors.textPrimary, uiFont.ui);
        this.drawCenteredText(drawShapesUi.attract.subtitle, drawShapesUi.attract.subtitleY, 20, drawShapesUi.theme.colors.textSecondary, uiFont.ui);
        this.drawCenteredText(drawShapesUi.attract.help, drawShapesUi.attract.helpY, 18, drawShapesUi.theme.colors.muted, uiFont.ui);
    }

    playGame() {
        this.drawStage(drawShapesUi.theme.playPanelColor, drawShapesUi.theme.accentColor);
        this.drawCenteredText('Canvas Shape Gallery', drawShapesUi.play.titleY, 36, drawShapesUi.theme.colors.textPrimary, uiFont.display);
        this.drawCenteredText(fullscreenConfig.text, drawShapesUi.play.subtitleY, 22, drawShapesUi.theme.colors.textSecondary, uiFont.ui);
        this.drawCenteredText('Press Enter again to return to the intro screen.', drawShapesUi.play.promptY, 18, drawShapesUi.theme.colors.muted, uiFont.ui);
        drawShapeGallery(canvasConfig);
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = drawShapesUi.theme;
        CanvasUtils.drawRect(panelX - 18, panelY - 18, panelWidth + 36, panelHeight + 36, drawShapesUi.theme.colors.panelBackdrop);
        CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
        CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
        CanvasUtils.drawLine(panelX, panelY + 74, panelX + panelWidth, panelY + 74, 2, borderColor);
    }

    drawCenteredText(text, y, fontSize, color, fontFamily) {
        CanvasText.renderCenteredText(CanvasUtils.ctx, text, y, {
            defaultCenterX: canvasConfig.width / 2,
            fontSize,
            fontFamily,
            color
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
        this.keyboardInput = null;
    }
}

export default Game;

const game = new Game();
