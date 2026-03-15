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

    drawShape() {
        const ctx = CanvasUtils.ctx;
        const { width, height } = canvasConfig;

        ctx.fillStyle = '#767eff';
        ctx.fillRect(0, 0, width, height);
        ctx.save();

        for (let gx = 0; gx <= height; gx += 100) {
            ctx.beginPath();
            ctx.moveTo(0, gx);
            ctx.lineTo(width, gx);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#3600af';
            ctx.stroke();
        }

        for (let gy = 0; gy <= width; gy += 100) {
            ctx.beginPath();
            ctx.moveTo(gy, 0);
            ctx.lineTo(gy, height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ed9700';
            ctx.stroke();
        }

        ctx.fillStyle = 'yellow';
        ctx.fillRect(15, 15, 120, 120);
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(30, 30, 90, 90);
        ctx.restore();
        ctx.fillRect(45, 45, 60, 60);
        ctx.restore();
        ctx.fillStyle = '#00808080';
        ctx.fillRect(60, 60, 70, 70);
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
        this.drawShape();
        this.updateMetrics();
    }

    onDestroy() {
        this.metricsElements = {};
    }
}

export default Game;

const game = new Game();
