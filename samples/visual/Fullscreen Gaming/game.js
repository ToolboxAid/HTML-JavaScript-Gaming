// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig, fullscreenSampleUi, uiFont } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import CanvasText from '../../../engine/core/canvasText.js';
import KeyboardInput from '../../../engine/input/keyboard.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';
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
        CanvasText.renderCenteredText(fullscreenSampleUi.attract.title, fullscreenSampleUi.attract.titleY, { fontSize: 42, fontFamily: uiFont.display, color: fullscreenSampleUi.theme.colors.textPrimary, useDpr: false });
        CanvasText.renderCenteredText(fullscreenSampleUi.attract.prompt, fullscreenSampleUi.attract.promptY, { fontSize: 26, fontFamily: uiFont.ui, color: fullscreenSampleUi.theme.colors.textPrimary, useDpr: false });
        CanvasText.renderCenteredText(fullscreenSampleUi.attract.subtitle, fullscreenSampleUi.attract.subtitleY, { fontSize: 20, fontFamily: uiFont.ui, color: fullscreenSampleUi.theme.colors.textSecondary, useDpr: false });
        CanvasText.renderCenteredText(fullscreenConfig.text, fullscreenSampleUi.attract.helpY, { fontSize: 18, fontFamily: uiFont.ui, color: fullscreenSampleUi.theme.colors.muted, useDpr: false });
        this.updateMetrics();
    }

    playGame() {
        this.drawStage(fullscreenSampleUi.theme.playPanelColor, fullscreenSampleUi.theme.accentColor);
        CanvasText.renderCenteredText('Live Fullscreen Diagnostics', fullscreenSampleUi.play.titleY, { fontSize: 36, fontFamily: uiFont.display, color: fullscreenSampleUi.theme.colors.textPrimary, useDpr: false });
        CanvasText.renderCenteredText(fullscreenConfig.text, fullscreenSampleUi.play.subtitleY, { fontSize: 22, fontFamily: uiFont.ui, color: fullscreenSampleUi.theme.colors.textSecondary, useDpr: false });
        CanvasText.renderCenteredText('Use the diagnostics list below to compare layout changes', fullscreenSampleUi.play.promptY, { fontSize: 18, fontFamily: uiFont.ui, color: fullscreenSampleUi.theme.colors.muted, useDpr: false });
        this.updateMetrics();
        this.drawMetricSummary();
    }

    drawStage(panelColor, borderColor) {
        const { panelX, panelY, panelWidth, panelHeight, panelBorderSize } = fullscreenSampleUi.theme;
        PrimitiveRenderer.drawPanel(panelX, panelY, panelWidth, panelHeight, {
            fillColor: panelColor,
            borderColor,
            borderWidth: panelBorderSize,
            backdropColor: fullscreenSampleUi.theme.colors.panelBackdrop,
            backdropInset: 18,
            headerY: panelY + 74,
            headerColor: borderColor,
            headerWidth: 2
        });
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
            CanvasText.renderCenteredText(line, y, { fontSize: 18, fontFamily: uiFont.mono, color: fullscreenSampleUi.theme.colors.textPrimary, useDpr: false });
            y += fullscreenSampleUi.play.metricsLineHeight;
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
        this.metricsElements = {};
        this.lastMetrics = createEmptyMetrics({
            gameScale: canvasConfig.scale,
            sampleState: Game.STATES.ATTRACT
        });
    }
}

export default Game;

const game = new Game();

