// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, drawShapesUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import CanvasText from '../../../engine/core/canvasText.js';
import KeyboardInput from '../../../engine/input/keyboard.js';

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
        this.drawShapeGallery();
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = drawShapesUi.theme;
        CanvasUtils.drawRect(panelX - 18, panelY - 18, panelWidth + 36, panelHeight + 36, drawShapesUi.theme.colors.panelBackdrop);
        CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
        CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
        CanvasUtils.drawLine(panelX, panelY + 74, panelX + panelWidth, panelY + 74, 2, borderColor);
    }

    drawShapeGallery() {
        this.drawGridLines();
        this.drawFilledTriangle();
        this.drawHollowOval();
        this.drawOverlappingRectangles();
        this.drawFilledSquare();
        this.drawHollowSquare();
        this.drawFilledCircle();
        this.drawHollowCircle();
    }

    drawFilledCircle() {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(450, 510, 50, 0, Math.PI * 2);
        CanvasUtils.ctx.fillStyle = '#ed9700';
        CanvasUtils.ctx.fill();
    }

    drawHollowCircle() {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(550, 510, 50, 0, Math.PI * 2);
        CanvasUtils.ctx.strokeStyle = '#ffffff';
        CanvasUtils.ctx.lineWidth = 3;
        CanvasUtils.ctx.stroke();
    }

    drawFilledSquare() {
        CanvasUtils.ctx.fillStyle = '#f5d7a4';
        CanvasUtils.ctx.fillRect(350, 300, 100, 100);
    }

    drawHollowSquare() {
        CanvasUtils.ctx.strokeStyle = '#ed9700';
        CanvasUtils.ctx.lineWidth = 3;
        CanvasUtils.ctx.strokeRect(480, 300, 100, 100);
    }

    drawFilledTriangle() {
        CanvasUtils.ctx.fillStyle = '#d6c4ff';
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(140, 180);
        CanvasUtils.ctx.lineTo(200, 320);
        CanvasUtils.ctx.lineTo(80, 320);
        CanvasUtils.ctx.closePath();
        CanvasUtils.ctx.fill();
    }

    drawHollowOval() {
        CanvasUtils.ctx.strokeStyle = '#ed9700';
        CanvasUtils.ctx.lineWidth = 3;
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.ellipse(255, 310, 85, 56, 0, 0, Math.PI * 2);
        CanvasUtils.ctx.stroke();
    }

    drawGridLines() {
        for (let row = 0; row <= canvasConfig.height; row += 100) {
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.moveTo(0, row);
            CanvasUtils.ctx.lineTo(canvasConfig.width, row);
            CanvasUtils.ctx.lineWidth = 2;
            CanvasUtils.ctx.strokeStyle = '#3600af';
            CanvasUtils.ctx.stroke();
        }

        for (let col = 0; col <= canvasConfig.width; col += 100) {
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.moveTo(col, 0);
            CanvasUtils.ctx.lineTo(col, canvasConfig.height);
            CanvasUtils.ctx.lineWidth = 2;
            CanvasUtils.ctx.strokeStyle = '#ed970044';
            CanvasUtils.ctx.stroke();
        }
    }

    drawOverlappingRectangles() {
        CanvasUtils.ctx.fillStyle = '#ed9700';
        CanvasUtils.ctx.fillRect(605, 235, 110, 110);
        CanvasUtils.ctx.fillStyle = '#ffffff';
        CanvasUtils.ctx.globalAlpha = 0.35;
        CanvasUtils.ctx.fillRect(625, 255, 90, 90);
        CanvasUtils.ctx.fillStyle = '#3600af';
        CanvasUtils.ctx.globalAlpha = 0.65;
        CanvasUtils.ctx.fillRect(645, 275, 70, 70);
        CanvasUtils.ctx.globalAlpha = 1;
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
