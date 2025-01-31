// ToolboxAid.com
// David Quesenberry
// 01/31/2025
// gameBase.js

import CanvasUtils from "../scripts/canvas.js";
import Colors from "../scripts/colors.js";
import PerformanceMonitor from "../scripts/performacneMonitor.js";

class GameBase {

    static isInitialized = false;

    constructor() {
        this.initializeGame()
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

    static lastTimestamp = 0;
    static showTextMetrics = false;
    async animate(timestamp) {
        try {
            Colors.generateRandomColor();

            // Calculate delta time
            const deltaTime = (timestamp - this.lastTimestamp) / 1000;
            this.lastTimestamp = timestamp;

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
                CanvasUtils.clickFullscreen();

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
    async initializeGame() {
        await this.initCanvas();

        // Initialize inheriting class (game.js)
        await this.onInitialize();
    }

    async initCanvas() {
        const canvas = document.getElementById('gameArea');
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');

            // Try loading the game module only once and instantiate the Game class
            if (!CanvasUtils.ctx) {

                const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
                try {
                    return await CanvasUtils.initialize(ctx, `${currentDir}/global.js`);
                } catch (error) {
                    console.error('Canvas initialization failed:', error);
                    throw error;
                }
            }
        } else {
            alert('You need a modern browser to see this.');
            throw new Error('You need a modern browser to see this.');
        }
    }

    async onInitialize() {
        throw new Error('onInitialize() must be implemented by inheritting child class');
    }
    async gameLoop(deltaTime) {
        throw new Error('gameLoop must be implemented by inheritting child class');
    }

}

export default GameBase;