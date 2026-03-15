// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, fullscreenSampleUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvas.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import { collectMetrics, createEmptyMetrics, getMetricsElements, updateMetricsPanel } from './gameDom.js';

class Game extends GameBase {
    static STATES = Object.freeze({
        ATTRACT: 'attract',
        PLAY_GAME: 'playGame'
    });

    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.keyboardInput = null;
        this.metricsElements = {};
        this.gameState = Game.STATES.ATTRACT;
        this.lastMetrics = createEmptyMetrics({
            gameScale: canvasConfig.scale,
            sampleState: Game.STATES.ATTRACT
        });
        this.stateHandlers = {
            [Game.STATES.ATTRACT]: () => this.displayAttractMode(),
            [Game.STATES.PLAY_GAME]: () => this.playGame()
        };
    }

    async onInitialize() {
        this.keyboardInput = new KeyboardInput();
        this.metricsElements = getMetricsElements();
        this.lastMetrics = collectMetrics({
            gameScale: canvasConfig.scale,
            sampleState: this.gameState
        });
        this.updateMetricsPanel();
    }

    updateMetrics() {
        this.lastMetrics = collectMetrics({
            gameScale: canvasConfig.scale,
            sampleState: this.gameState
        });
        this.updateMetricsPanel();
    }

    updateMetricsPanel() {
        updateMetricsPanel(this.metricsElements, this.lastMetrics);
    }

    wasAnyKeyPressed(keyCodes = []) {
        return keyCodes.some((code) => this.keyboardInput?.isKeyPressed(code));
    }

    updateStateInput() {
        if (this.wasAnyKeyPressed(['Enter', 'NumpadEnter', 'Space'])) {
            this.gameState = this.gameState === Game.STATES.ATTRACT
                ? Game.STATES.PLAY_GAME
                : Game.STATES.ATTRACT;
            return;
        }
    }

    displayAttractMode() {
        this.drawStage(fullscreenSampleUi.theme.panelColor, fullscreenSampleUi.theme.panelBorderColor);
        this.renderCenteredText(fullscreenSampleUi.attract.title, fullscreenSampleUi.attract.titleY, 42, fullscreenSampleUi.theme.colors.textPrimary, uiFont.display);
        this.renderCenteredText(fullscreenSampleUi.attract.prompt, fullscreenSampleUi.attract.promptY, 26, fullscreenSampleUi.theme.colors.textPrimary, uiFont.ui);
        this.renderCenteredText(fullscreenSampleUi.attract.subtitle, fullscreenSampleUi.attract.subtitleY, 20, fullscreenSampleUi.theme.colors.textSecondary, uiFont.ui);
        this.renderCenteredText(fullscreenConfig.text, fullscreenSampleUi.attract.helpY, 18, fullscreenSampleUi.theme.colors.muted, uiFont.ui);
        this.updateMetrics();
    }

    playGame() {
        this.drawStage(fullscreenSampleUi.theme.playPanelColor, fullscreenSampleUi.theme.accentColor);
        this.renderCenteredText('Live Fullscreen Diagnostics', fullscreenSampleUi.play.titleY, 36, fullscreenSampleUi.theme.colors.textPrimary, uiFont.display);
        this.renderCenteredText(fullscreenConfig.text, fullscreenSampleUi.play.subtitleY, 22, fullscreenSampleUi.theme.colors.textSecondary, uiFont.ui);
        this.renderCenteredText('Use the diagnostics list below to compare layout changes', fullscreenSampleUi.play.promptY, 18, fullscreenSampleUi.theme.colors.muted, uiFont.ui);
        this.updateMetrics();
        this.drawMetricSummary();
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = fullscreenSampleUi.theme;
        CanvasUtils.drawRect(panelX - 18, panelY - 18, panelWidth + 36, panelHeight + 36, fullscreenSampleUi.theme.colors.panelBackdrop);
        CanvasUtils.drawRect(panelX, panelY, panelWidth, panelHeight, panelColor);
        CanvasUtils.drawBounds(panelX, panelY, panelWidth, panelHeight, borderColor, panelBorderSize);
        CanvasUtils.drawLine(panelX, panelY + 74, panelX + panelWidth, panelY + 74, 2, borderColor);
    }

    drawMetricSummary() {
        const metrics = this.lastMetrics;
        const lines = [
            `Canvas: ${metrics.canvasWidth} x ${metrics.canvasHeight}`,
            `Container: ${metrics.containerWidth} x ${metrics.containerHeight}`,
            `Window: ${metrics.windowWidth} x ${metrics.windowHeight}`,
            `Document: ${metrics.documentWidth} x ${metrics.documentHeight}`,
            `Screen: ${metrics.screenWidth} x ${metrics.screenHeight}`,
            `Fullscreen: ${metrics.fullscreenActive ? 'On' : 'Off'}  Scale: ${metrics.gameScale}`
        ];

        let y = fullscreenSampleUi.play.metricsStartY;
        lines.forEach((line) => {
            this.renderCenteredText(line, y, 18, fullscreenSampleUi.theme.colors.textPrimary, uiFont.mono);
            y += fullscreenSampleUi.play.metricsLineHeight;
        });
    }

    renderCenteredText(text, y, fontSize, color, fontFamily) {
        const ctx = CanvasUtils.ctx;
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(text, canvasConfig.width / 2, y);
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
        this.metricsElements = {};
        this.lastMetrics = createEmptyMetrics({
            gameScale: canvasConfig.scale,
            sampleState: Game.STATES.ATTRACT
        });
    }
}

export default Game;

const game = new Game();
