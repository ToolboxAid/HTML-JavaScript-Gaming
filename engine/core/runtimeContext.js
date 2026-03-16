// ToolboxAid.com
// David Quesenberry
// Runtime context wrapper for engine singletons
// 03/13/2026

import CanvasUtils from './canvasUtils.js';
import Fullscreen from './fullscreen.js';
import PerformanceMonitor from './performanceMonitor.js';
import PrimitiveRenderer from '../renderers/primitiveRenderer.js';
import Timer from '../utils/timer.js';

class RuntimeContext {
    constructor({
        canvas = CanvasUtils,
        fullscreen = Fullscreen,
        performance = PerformanceMonitor,
        primitive = PrimitiveRenderer,
        timer = Timer
    } = {}) {
        this.canvas = canvas;
        this.fullscreen = fullscreen;
        this.performance = performance;
        this.primitive = primitive;
        this.timer = timer;
    }

    async initialize(canvasConfig, performanceConfig, fullscreenConfig) {
        await this.canvas.init(canvasConfig);
        await this.fullscreen.init(fullscreenConfig, canvasConfig);
        await this.performance.init(performanceConfig);
    }

    onPageHidden() {
        this.timer?.pauseAllForVisibility?.();
    }

    onPageVisible() {
        this.timer?.resumeAllFromVisibility?.();
    }

    getContext() {
        return this.canvas?.ctx ?? null;
    }

    clearCanvas() {
        this.canvas?.canvasClear?.();
    }

    drawBorder() {
        const ctx = this.getContext();
        const width = this.canvas?.getConfigWidth?.() ?? this.canvas?.config?.width ?? 0;
        const height = this.canvas?.getConfigHeight?.() ?? this.canvas?.config?.height ?? 0;
        const borderColor = this.canvas?.config?.borderColor ?? 'red';
        const borderSize = this.canvas?.config?.borderSize ?? 1;

        this.primitive?.drawBounds?.(0, 0, width, height, borderColor, borderSize, 1, { ctx });
    }

    updatePerformance(timeSpentMs) {
        this.performance?.update?.(timeSpentMs);
    }

    drawFullscreenOverlay(ctx = this.getContext()) {
        this.fullscreen?.draw?.(ctx);
    }

    drawPerformanceOverlay(ctx = this.getContext()) {
        this.performance?.draw?.(ctx);
    }

    calculateTextMetrics(text, fontSize = 20, font = 'Arial') {
        return this.canvas?.calculateTextMetrics?.(text, fontSize, font) ?? { width: 0, height: 0 };
    }

    destroy() {
        if (typeof this.performance?.stopMonitoring === 'function') {
            this.performance.stopMonitoring();
        }

        if (typeof this.fullscreen?.destroy === 'function') {
            this.fullscreen.destroy();
        }
    }
}

export default RuntimeContext;

