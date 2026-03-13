// ToolboxAid.com
// David Quesenberry
// 01/30/2025
// performanceMonitor.js

//** Javascript usages */

import SystemUtils from "../utils/systemUtils.js";
import DebugFlag from "../utils/debugFlag.js";
import DebugLog from "../utils/debugLog.js";
import CanvasUtils from "./canvas.js";

class PerformanceMonitor {

    // Enable debug mode: game.html?performanceMonitor
    static DEBUG = DebugFlag.has('performanceMonitor');

    /** Constructor for PerformanceMonitor class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const performanceMonitor = new PerformanceMonitor(); // Throws Error
     * 
     * ✅ Do this:
     * PerformanceMonitor.transformPoints(...); // Use static methods directly
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

    static performanceConfig = {// Let's give some defaults
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
            this.dimensions = CanvasUtils.calculateTextMetrics("MEM: 00.00/00.00MB ", this.performanceConfig.size, this.performanceConfig.font);
            DebugLog.log(PerformanceMonitor.DEBUG, 'PerformanceMonitor', 'PerformanceMonitor.init complete.');
            return true;
        }

        return false;
    }

    /* This method should be called once per second. */
    static oncePerSecond() {
        this.calcFPS();
        this.calcGFX();
    }
    /** This method should be called every animation loop. */
    static update(timeSpentMs) {
        this.updateFPS();
        this.updateGFX(timeSpentMs);
    }

    /** Animation GFX / percent of available frame time (16.67ms for 60 FPS) */
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
        this.frameSampleCount++;
        const averageTimeMs = this.totalTimeSpentMs / this.frameSampleCount;
        this.gfxPercentUsage = (averageTimeMs / this.availableTimeMs) * 100;
        this.frameSampleCount = 0;
        this.totalTimeSpentMs = 0;
    }

    /** FPS */
    static frameCount = 0;
    static fps = 0;
    static updateFPS() { // Update FPS counter every second
        this.frameCount++;
    }
    static calcFPS() {
        this.fps = this.frameCount;
        this.frameCount = 0;
    }

    static updateMetrics() {
        if (!this.metrics) this.metrics = {}; // Ensure metrics object exists

        // Memory Usage (only works in Chrome-based browsers)
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
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

        // Frame Time Calculation
        const now = performance.now();
        if (!this.lastFrame) this.lastFrame = now; // Ensure lastFrame is initialized
        this.metrics.frameTime = (now - this.lastFrame).toFixed(2);
        this.lastFrame = now;
    }

    static draw(ctx) {
        if (!this.performanceConfig.show) return;

        this.updateMetrics();

        const width = this.dimensions.width;
        const height = this.dimensions.height + (this.dimensions.height / 5);

        let newY = this.performanceConfig.y;
        const lines = 5;
        const padding = 5;

        // create the background
        ctx.fillStyle = this.performanceConfig.backgroundColor;
        ctx.fillRect(this.performanceConfig.x - 3, newY, width, (height * lines) + padding);
        newY += height;

        // Javascript memory
        ctx.fillStyle = this.performanceConfig.colorLow;
        ctx.font = `${this.performanceConfig.size || '30'}px ${this.performanceConfig.font || 'monospace'}`;
        ctx.fillText(`MEM: ${this.metrics.memory.used}/${this.metrics.memory.total}MB`, this.performanceConfig.x, newY);
        newY += height;

        ctx.fillText(`MEM% :  ${this.metrics.memory.percent}%`, this.performanceConfig.x, newY);
        newY += height;

        // FPS
        ctx.fillStyle = this.colorLow;
        if (this.fps < 57 || this.fps > 63) {
            ctx.fillStyle = this.performanceConfig.colorHigh;
        } else {
            if (this.fps < 59 || this.fps > 61) {
                ctx.fillStyle = this.performanceConfig.colorMed;
            }
        }
        ctx.fillText(`FPS  : ${this.fps || 0}`, this.performanceConfig.x, newY);
        newY += height;

        // Frame
        ctx.fillStyle = this.performanceConfig.colorLow;
        ctx.fillText(`Frame: ${this.metrics.frameTime}ms`, this.performanceConfig.x, newY);
        newY += height;

        // GFX
        //ctx.fillStyle = this.colorLow;
        if (this.gfxPercentUsage > 80) {
            ctx.fillStyle = this.performanceConfig.colorHigh;
        } else {
            if (this.gfxPercentUsage > 60) {
                ctx.fillStyle = this.performanceConfig.colorMed;
            }
        }
        ctx.fillText(`GFX  : ${this.gfxPercentUsage.toFixed(2)}%`, this.performanceConfig.x, newY);
    }

    static getMemoryStats() {
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
        DebugLog.log(true, 'PerformanceMonitor', `  FPS: ${this.fps || 0}`);
        DebugLog.log(true, 'PerformanceMonitor', `  Frame Time: ${window.frameTime?.toFixed(2) || 0}ms`);
        DebugLog.log(true, 'PerformanceMonitor', `  GFX Usage: ${this.gfxPercentUsage?.toFixed(2) || 0}%`);
        console.groupEnd();
    }

}

export default PerformanceMonitor

setInterval(() => PerformanceMonitor.oncePerSecond(), 1000); // every second

