// ToolboxAid.com
// David Quesenberry
// 2025-01-30
// performanceMonitor.js

import SystemUtils from "../utils/systemUtils.js";
import DebugFlag from "../utils/debugFlag.js";
import DebugLog from "../utils/debugLog.js";
import CanvasUtils from "./canvasUtils.js";

class PerformanceMonitor {

    // Enable debug mode: game.html?performanceMonitor
    static DEBUG = DebugFlag.has('performanceMonitor');

    /**
     * Utility-only class.
     * @throws {Error} Always throws because this class should not be instantiated.
     * @example
     * // Don't do this:
     * new PerformanceMonitor();
     *
     * // Do this:
     * PerformanceMonitor.update(8.5);
     */
    constructor() {
        throw new Error('PerformanceMonitor is a utility class with only static methods. Do not instantiate.');
    }

    static metrics = {
        memory: {},
        cpu: 0,
        frameTime: 0,
        samples: []
    };
    static layoutCache = null;
    static layoutTemplates = Object.freeze([
        'MEM: 000.00/000.00MB',
        'LIM% : 100.00%',
        'FPS  : 000',
        'Frame: 000.00ms',
        'GFX  : 100.00%'
    ]);

    // Default on-screen monitor configuration.
    static performanceConfig = {
        show: true,
        size: 30,
        font: 'monospace',
        colorLow: 'lime',
        colorMed: 'orange',
        colorHigh: 'pink',
        backgroundColor: "gray",
        x: 300,
        y: 300,
    };
    static monitorIntervalId = null;

    static async init(config) {
        if (!config) {
            DebugLog.error('PerformanceMonitor', "No 'config' provided");
        }
        const schema = {
            show: 'boolean',
            size: 'number',
            font: 'string',
            colorLow: 'string',
            colorMed: 'string',
            colorHigh: 'string',
            backgroundColor: 'string',
            x: 'number',
            y: 'number'
        };

        const validation = SystemUtils.validateConfig("PerformanceMonitor", config, schema);
        if (validation) {
            this.performanceConfig = config;
            this.resetMonitoringState();
            this.updateMemoryMetrics();
            this.startMonitoring();
            DebugLog.log(PerformanceMonitor.DEBUG, 'PerformanceMonitor', 'PerformanceMonitor.init complete.');
            return true;
        }

        return false;
    }

    static startMonitoring() {
        if (this.monitorIntervalId !== null || typeof setInterval !== 'function') {
            return false;
        }

        this.monitorIntervalId = setInterval(() => PerformanceMonitor.oncePerSecond(), 1000);
        return true;
    }

    static stopMonitoring() {
        if (this.monitorIntervalId === null || typeof clearInterval !== 'function') {
            return false;
        }

        clearInterval(this.monitorIntervalId);
        this.monitorIntervalId = null;
        this.resetMonitoringState();
        return true;
    }

    static resetMonitoringState() {
        this.frameCount = 0;
        this.fps = 0;
        this.totalTimeSpentMs = 0;
        this.frameSampleCount = 0;
        this.gfxPercentUsage = 0;
        this.lastFrame = null;
        this.layoutCache = null;
        this.metrics = {
            memory: {
                used: "N/A",
                total: "N/A",
                limit: "N/A",
                percent: "N/A"
            },
            cpu: 0,
            frameTime: 0,
            samples: []
        };
    }

    // Call once per second.
    static oncePerSecond() {
        this.calcFPS();
        this.calcGFX();
        this.updateMemoryMetrics();
    }
    // Call once per animation frame.
    static update(timeSpentMs) {
        this.updateFPS();
        this.updateGFX(timeSpentMs);
    }

    // Animation GFX: percent of available frame time (16.67ms at 60 FPS).
    static availableTimeMs = 1000 / 60; // Time per frame in milliseconds (16.67ms)
    static timeSpentMs = 0.0; // Time spent in the current frame
    static totalTimeSpentMs = 0.0; // Sum of all time spent to be averaged into gfxPercentUsage
    static frameSampleCount = 0; // Number of samples taken
    static gfxPercentUsage = 0.0; // GFX usage percentage
    static updateGFX(timeSpentMs) {
        this.frameSampleCount++;
        this.totalTimeSpentMs += timeSpentMs;
    }
    static calcGFX() {
        if (this.frameSampleCount <= 0) {
            this.gfxPercentUsage = 0;
            return;
        }

        const averageTimeMs = this.totalTimeSpentMs / this.frameSampleCount;
        this.gfxPercentUsage = (averageTimeMs / this.availableTimeMs) * 100;
        this.frameSampleCount = 0;
        this.totalTimeSpentMs = 0;
    }

    // FPS metrics.
    static frameCount = 0;
    static fps = 0;
    static updateFPS() { // Update FPS counter every second
        this.frameCount++;
    }
    static calcFPS() {
        this.fps = this.frameCount;
        this.frameCount = 0;
    }

    static updateMemoryMetrics() {
        if (!this.metrics) this.metrics = {}; // Ensure metrics object exists

        // Memory Usage (only works in Chrome-based browsers)
        const runtimeWindow = typeof window !== 'undefined' ? window : null;
        if (runtimeWindow?.performance?.memory) {
            const memory = runtimeWindow.performance.memory;
            this.metrics.memory = {
                used: (memory.usedJSHeapSize / 1048576).toFixed(2),
                total: (memory.totalJSHeapSize / 1048576).toFixed(2),
                limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2),
                percent: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
            };
        } else {
            this.metrics.memory = {
                used: "N/A",
                total: "N/A",
                limit: "N/A",
                percent: "N/A"
            };
        }
    }

    static updateFrameTimeMetric() {
        if (!this.metrics) this.metrics = {}; // Ensure metrics object exists
        // Frame Time Calculation
        const now = performance.now();
        if (!this.lastFrame) this.lastFrame = now; // Ensure lastFrame is initialized
        this.metrics.frameTime = (now - this.lastFrame).toFixed(2);
        this.lastFrame = now;
    }

    static getPanelLayout(fontSize, fontFamily) {
        const signature = `${fontSize}|${fontFamily}`;

        if (this.layoutCache?.signature === signature) {
            return this.layoutCache.layout;
        }

        const measurements = this.layoutTemplates.map((text) =>
            CanvasUtils.calculateTextMetrics(text, fontSize, fontFamily)
        );
        const layout = {
            maxWidth: Math.max(...measurements.map(({ width }) => width)),
            lineHeight: Math.max(...measurements.map(({ height }) => height)) * 1.2
        };

        this.layoutCache = { signature, layout };
        return layout;
    }

    static getMetrics() {
        const memoryStats = this.getMemoryStats();
        return {
            usedHeapSize: memoryStats.usedHeapSize,
            totalHeapSize: memoryStats.totalHeapSize,
            heapLimit: memoryStats.heapLimit,
            usage: memoryStats.usage
        };
    }

    static draw(ctx) {
        if (!this.performanceConfig.show || !ctx) {
            return;
        }

        this.updateFrameTimeMetric();
        const fontSize = this.performanceConfig.size || 30;
        const fontFamily = this.performanceConfig.font || 'monospace';
        const textLines = [
            {
                text: `MEM: ${this.metrics.memory.used}/${this.metrics.memory.total}MB`,
                color: this.performanceConfig.colorLow
            },
            {
                text: `LIM% : ${this.metrics.memory.percent}%`,
                color: this.performanceConfig.colorLow
            },
            {
                text: `FPS  : ${this.fps || 0}`,
                color: (this.fps < 57 || this.fps > 63)
                    ? this.performanceConfig.colorHigh
                    : ((this.fps < 59 || this.fps > 61) ? this.performanceConfig.colorMed : this.performanceConfig.colorLow)
            },
            {
                text: `Frame: ${this.metrics.frameTime}ms`,
                color: this.performanceConfig.colorLow
            },
            {
                text: `GFX  : ${this.gfxPercentUsage.toFixed(2)}%`,
                color: this.gfxPercentUsage > 80
                    ? this.performanceConfig.colorHigh
                    : (this.gfxPercentUsage > 60 ? this.performanceConfig.colorMed : this.performanceConfig.colorLow)
            }
        ];

        const { maxWidth, lineHeight } = this.getPanelLayout(fontSize, fontFamily);
        const paddingX = 12;
        const paddingY = 8;
        const panelX = this.performanceConfig.x;
        const panelY = this.performanceConfig.y;
        const panelWidth = maxWidth + (paddingX * 2);
        const panelHeight = (lineHeight * textLines.length) + (paddingY * 2);
        const textCenterX = panelX + (panelWidth / 2);

        ctx.save();
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = this.performanceConfig.backgroundColor;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        textLines.forEach(({ text, color }, index) => {
            ctx.fillStyle = color;
            const textY = panelY + paddingY + (lineHeight * index) + (lineHeight / 2);
            ctx.fillText(text, textCenterX, textY);
        });
        ctx.restore();
    }

    static getMemoryStats() {
        if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
            return {
                usedHeapSize: "N/A",
                totalHeapSize: "N/A",
                heapLimit: "N/A",
                usage: "N/A"
            };
        }

        const memory = window.performance.memory;
        return {
            usedHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2), // MB
            totalHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2), // MB
            heapLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2), // MB
            usage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) // %
        };
    }

    static logMemoryStats() {
        if (!PerformanceMonitor.DEBUG) {
            return;
        }

        if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
            DebugLog.warn(true, 'PerformanceMonitor', 'Memory stats are unavailable in this runtime.');
            return;
        }

        const memory = window.performance.memory;
        console.table({
            'Heap Limit': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
            'Total Heap': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
            'Used Heap': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
            'Usage %': `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
        });
    }

    static logPerformance() {
        if (!PerformanceMonitor.DEBUG) {
            return;
        }

        const metrics = this.getMetrics();
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);

        console.group(`Performance Stats [${timestamp}]`);
        DebugLog.log(true, 'PerformanceMonitor', '%cMemory Usage', 'color: #4CAF50');
        DebugLog.log(true, 'PerformanceMonitor', `  Used: ${metrics.usedHeapSize}MB`);
        DebugLog.log(true, 'PerformanceMonitor', `  Total: ${metrics.totalHeapSize}MB`);
        DebugLog.log(true, 'PerformanceMonitor', `  Limit: ${metrics.heapLimit}MB`);
        DebugLog.log(true, 'PerformanceMonitor', `  Usage: ${metrics.usage}%`);

        DebugLog.log(true, 'PerformanceMonitor', '%cFrame Stats', 'color: #2196F3');
        DebugLog.log(true, 'PerformanceMonitor', `FPS: ${this.fps || 0}`);
        DebugLog.log(true, 'PerformanceMonitor', `Frame Time: ${window.frameTime?.toFixed(2) || 0}ms`);
        DebugLog.log(true, 'PerformanceMonitor', `GFX Usage: ${this.gfxPercentUsage?.toFixed(2) || 0}%`);
        console.groupEnd();
    }

}

export default PerformanceMonitor



