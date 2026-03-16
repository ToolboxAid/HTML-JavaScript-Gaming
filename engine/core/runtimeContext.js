// ToolboxAid.com
// David Quesenberry
// Runtime context wrapper for engine singletons
// 03/13/2026

import CanvasUtils from './canvasUtils.js';
import Fullscreen from './fullscreen.js';
import PerformanceMonitor from './performanceMonitor.js';
import Timer from '../utils/timer.js';

class RuntimeContext {
    constructor({
        canvas = CanvasUtils,
        fullscreen = Fullscreen,
        performance = PerformanceMonitor,
        timer = Timer
    } = {}) {
        this.canvas = canvas;
        this.fullscreen = fullscreen;
        this.performance = performance;
        this.timer = timer;
    }

    async initialize(canvasConfig, performanceConfig, fullscreenConfig) {
        await this.canvas.init(canvasConfig);
        await this.fullscreen.init(fullscreenConfig, canvasConfig);
        await this.performance.init(performanceConfig);
    }

    onPageHidden() {
        this.timer.pauseAllForVisibility();
    }

    onPageVisible() {
        this.timer.resumeAllFromVisibility();
    }

    getContext() {
        return this.canvas.ctx;
    }

    clearCanvas() {
        this.canvas.canvasClear();
    }

    drawBorder() {
        this.canvas.drawBorder();
    }

    updatePerformance(timeSpentMs) {
        this.performance.update(timeSpentMs);
    }

    drawFullscreenOverlay(ctx = this.getContext()) {
        this.fullscreen.draw(ctx);
    }

    drawPerformanceOverlay(ctx = this.getContext()) {
        this.performance.draw(ctx);
    }

    calculateTextMetrics(text, fontSize = 20, font = 'Arial') {
        return this.canvas.calculateTextMetrics(text, fontSize, font);
    }

    destroy() {
        if (typeof this.performance?.stopMonitoring === 'function') {
            this.performance.stopMonitoring();
        }
    }
}

export default RuntimeContext;

