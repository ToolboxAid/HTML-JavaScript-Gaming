// ToolboxAid.com
// David Quesenberry
// game.js
// 03/15/2026

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js';
import GameBase from '../../../engine/core/gameBase.js';
import CanvasUtils from '../../../engine/core/canvas.js';

class Game extends GameBase {
    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
        this.metricsElements = {};
    }

    async onInitialize() {
        this.metricsElements = {
            canW: document.getElementById('canW'),
            divW: document.getElementById('divW'),
            docW: document.getElementById('docW'),
            wdowW: document.getElementById('wdowW'),
            scrnW: document.getElementById('scrnW'),
            gameScaleWindow: document.getElementById('gameScaleWindow')
        };
    }

    updateMetrics() {
        const canvas = document.getElementById('gameArea');
        const container = document.getElementById('gameAreaContainer');
        if (!canvas || !container) {
            return;
        }

        this.metricsElements.canW.textContent = `can: ${canvas.clientWidth} x ${canvas.clientHeight}`;
        this.metricsElements.divW.textContent = `div: ${Math.round(container.getBoundingClientRect().width)} x ${Math.round(container.getBoundingClientRect().height)}`;
        this.metricsElements.docW.textContent = `document: ${document.documentElement.clientWidth} x ${document.documentElement.clientHeight}`;
        this.metricsElements.wdowW.textContent = `window: ${window.innerWidth} x ${window.innerHeight}`;
        this.metricsElements.scrnW.textContent = `screen: ${screen.width} x ${screen.height}`;
        this.metricsElements.gameScaleWindow.textContent = `gameScaleWindow: ${canvasConfig.scale}`;
    }

    gameLoop() {
        this.updateMetrics();
    }

    onDestroy() {
        this.metricsElements = {};
    }
}

export default Game;

const game = new Game();
