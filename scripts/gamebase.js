// ToolboxAid.com
// David Quesenberry
// 01/31/2025
// gameBase.js

import CanvasUtils from "../scripts/canvas.js";
import Colors from "../scripts/colors.js";
import Fullscreen from "./fullscreen.js";
import PerformanceMonitor from "../scripts/performacneMonitor.js";

class GameBase {

    static isInitialized = false;

    constructor(canvasConfig, performanceConfig, fullscreenConfig) {
console.log(canvasConfig, performanceConfig, fullscreenConfig);
        this.initializeGame(canvasConfig, performanceConfig, fullscreenConfig)
            .then(() => {
                console.log('*** Game initialization complete ***');

                this.constructor.isInitialized = true;

                // Start animation loop
                requestAnimationFrame(this.animate); // already bind - just once
                //requestAnimationFrame(this.animate.bind(this)); // bind each call
            })
            .catch(error => {
                console.error('Game initialization failed:', error);
                this.constructor.isInitialized = false;
            });

        // Bind animation method to instance
        this.animate = this.animate.bind(this);// bind once
    }

    async initializeGame(canvasConfig, performanceConfig, fullscreenConfig) {
        if (!canvasConfig || !performanceConfig || !fullscreenConfig) {
            throw new Error('Missing required configuration');
        }
        await PerformanceMonitor.init(performanceConfig);
        await CanvasUtils.init(canvasConfig);
        await Fullscreen.init(fullscreenConfig, canvasConfig);

        // Initialize inheriting (child) class (game.js)
        await this.onInitialize();
    }

    static lastTimestamp = performance.now();
    static showTextMetrics = false;
    async animate(timestamp) {
        try {
            Colors.generateRandomColor();

            // Calculate delta time
            const deltaTime = (timestamp - GameBase.lastTimestamp) / 1000;
            GameBase.lastTimestamp = timestamp;

            if (CanvasUtils.ctx && this.gameLoop) {
                // start performance timer
                const startTimeMs = Date.now();
                CanvasUtils.canvasClear();

                // Draw border
                CanvasUtils.drawBorder();

                // Call game loop implementation
                await this.gameLoop(deltaTime); // call game.js (the inheriting class)

                // Update performance data
                const timeSpentMs = Date.now() - startTimeMs; // end performance timer
                PerformanceMonitor.update(timeSpentMs);

                // Draw click full screen
                Fullscreen.draw(CanvasUtils.ctx);

                // Draw Performance data
                PerformanceMonitor.draw(CanvasUtils.ctx);

                // this will proved the {width, height} of text data;
                if (GameBase.showTextMetrics) {
                    GameBase.showTextMetrics = false;
                    const textData = `"=====================MEM: 30.66/33.08MB"`;
                    const sizePX = 30;
                    const font = "monospace";
                    console.log(CanvasUtils.calculateTextMetrics(textData, sizePX, font));
                }
            }
            // Continue animation
            requestAnimationFrame(this.animate);
        } catch (error) {
            console.error('Animation error:', error);
        }
    }

    // Abstract method
    async gameLoop() {
        throw new Error('gameLoop must be implemented');
    }

    async onInitialize() {
        throw new Error('onInitialize() must be implemented by inheritting child class');
    }
    async gameLoop(deltaTime) {
        throw new Error('gameLoop must be implemented by inheritting child class');
    }

}

export default GameBase;