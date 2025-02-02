// ToolboxAid.com
// David Quesenberry
// 01/30/2025
// performanceMonitor.js

//** Javascript usages */

import Functions from "./functions.js";

class PerformanceMonitor {

    static metrics = {
        memory: {},
        cpu: 0,
        frameTime: 0,
        samples: []
    };

    static fpsConfig = {// Let's give some defaults
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
            console.error("No 'config' provided");
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
        const validation = Functions.validateConfig("PerformanceMonitor", config, schema);
        if (validation) {
            this.fpsConfig = config;
            console.log(`PerformanceMonitor.init complete.`);
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
        // if (this.frameSampleCount++ >= this.frameSampleSize) {
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

    static updateMetrics() { // this needs to be in the animation draw loop: this.updateMetrics(); if you wish to use.
        // Memory
        const memory = window.performance.memory;
        this.metrics.memory = {
            used: (memory.usedJSHeapSize / 1048576).toFixed(2),
            total: (memory.totalJSHeapSize / 1048576).toFixed(2),
            limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2),
            percent: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
        };

        // Frame time
        const now = performance.now();
        this.metrics.frameTime = now - this.lastFrame;
        this.lastFrame = now;
    }

    static draw(ctx) {
        this.updateMetrics();

        // {width: 126, height: 24} console.log(CanvasUtils.calculateTextMetrics("FPS: 60", 30, "monospace")); 
        // {width: 307, height: 29} console.log(CanvasUtils.calculateTextMetrics("MEM: 30.66/33.08MB", 30, "monospace")); 
        const width = 307;
        const height = 29;

        let newY = this.fpsConfig.y;
        const padding = 5;

        // create the background
        ctx.fillStyle = this.fpsConfig.backgroundColor;
        ctx.fillRect(this.fpsConfig.x - 5, newY, width, height * padding + 5);
        newY += height;

        // Javascript memory
        ctx.fillStyle = this.fpsConfig.colorLow;
        ctx.font = `${this.fpsConfig.size || '30'}px ${this.fpsConfig.font || 'monospace'}`;
        ctx.fillText(`MEM: ${this.metrics.memory.used}/${this.metrics.memory.total}MB`, this.fpsConfig.x, newY);
        newY += height;

        ctx.fillText(`MEM% :  ${this.metrics.memory.percent}%`, this.fpsConfig.x, newY);
        newY += height;

        // FPS
        ctx.fillStyle = this.colorLow;
        if (this.fps < 57 || this.fps > 63) {
            ctx.fillStyle = this.fpsConfig.colorHigh;
        } else {
            if (this.fps < 59 || this.fps > 61) {
                ctx.fillStyle = this.fpsConfig.colorMed;
            }
        }
        ctx.fillText(`FPS  : ${this.fps || 0}`, this.fpsConfig.x, newY);
        newY += height;

        // Frame
        ctx.fillStyle = this.fpsConfig.colorLow;
        ctx.fillText(`Frame: ${this.metrics.frameTime.toFixed(2)}ms`, this.fpsConfig.x, newY);
        newY += height;

        // GFX
        //ctx.fillStyle = this.colorLow;
        if (this.gfxPercentUsage > 80) {
            ctx.fillStyle = this.fpsConfig.colorHigh;
        } else {
            if (this.gfxPercentUsage > 60) {
                ctx.fillStyle = this.fpsConfig.colorMed;
            }
        }
        ctx.fillText(`GFX  : ${this.gfxPercentUsage.toFixed(2)}%`, this.fpsConfig.x, newY);
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
        const memory = window.performance.memory;
        console.table({
            'Heap Limit': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
            'Total Heap': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
            'Used Heap': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
            'Usage %': `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
        });
    }

    static logPerformance() {
        const metrics = this.getMetrics();
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);

        console.group(`Performance Stats [${timestamp}]`);
        console.log('%cMemory Usage', 'color: #4CAF50');
        console.log(`  Used: ${metrics.usedHeapSize}MB`);
        console.log(`  Total: ${metrics.totalHeapSize}MB`);
        console.log(`  Limit: ${metrics.heapLimit}MB`);
        console.log(`  Usage: ${metrics.usage}%`);

        console.log('%cFrame Stats', 'color: #2196F3');
        console.log(`  FPS: ${this.fps || 0}`);
        console.log(`  Frame Time: ${window.frameTime?.toFixed(2) || 0}ms`);
        console.log(`  GFX Usage: ${this.gfxPercentUsage?.toFixed(2) || 0}%`);
        console.groupEnd();
    }

}

export default PerformanceMonitor

setInterval(() => PerformanceMonitor.oncePerSecond(), 1000); // every second
