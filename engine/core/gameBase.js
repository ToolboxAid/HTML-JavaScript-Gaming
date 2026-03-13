// ToolboxAid.com
// David Quesenberry
// 01/31/2025
// gameBase.js

import Colors from "../renderers/assets/colors.js";
import DebugFlag from "../utils/debugFlag.js";
import RuntimeContext from "./runtimeContext.js";

class GameBase {

    // Enable debug mode: game.html?gameBase
    static DEBUG = DebugFlag.has('gameBase');

    static isInitialized = false;
    static lastTimestamp = performance.now();
    static showTextMetrics = false;

    constructor(canvasConfig, performanceConfig, fullscreenConfig) {
        this.isDestroyed = false;
        this.isPageHidden = document.hidden;
        this.runtimeContext = new RuntimeContext();
        this.animate = this.animate.bind(this);// bind once
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handlePageHide = this.handlePageHide.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('pagehide', this.handlePageHide);

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

    }

    handlePageHide() {
        this.destroy();
    }

    async initializeGame(canvasConfig, performanceConfig, fullscreenConfig) {
        if (!canvasConfig || !performanceConfig || !fullscreenConfig) {
            throw new Error('Missing required configuration');
        }
        await this.runtimeContext.initialize(canvasConfig, performanceConfig, fullscreenConfig);

        // Initialize inheriting (child) class (game.js)
        await this.onInitialize(this.runtimeContext);
    }

    handleVisibilityChange() {
        this.isPageHidden = document.hidden;

        if (this.isPageHidden) {
            this.runtimeContext.onPageHidden();
            return;
        }

        this.runtimeContext.onPageVisible();

        GameBase.lastTimestamp = performance.now();
    }

    async animate(timestamp) {
        try {
            if (this.isDestroyed) {
                return;
            }

            if (this.isPageHidden) {
                requestAnimationFrame(this.animate);
                return;
            }

            Colors.generateRandomColor();

            // Calculate delta time
            const deltaTime = (timestamp - GameBase.lastTimestamp) / 1000;
            GameBase.lastTimestamp = timestamp;

            if (this.runtimeContext.getContext() && this.gameLoop) {
                // start performance timer
                const startTimeMs = Date.now();
                this.runtimeContext.clearCanvas();

                // Call game loop implementation (code and draw)
                await this.gameLoop(deltaTime, this.runtimeContext); // call game.js (the inheriting class)

                // Update performance data
                const timeSpentMs = Date.now() - startTimeMs; // end performance timer
                this.runtimeContext.updatePerformance(timeSpentMs);

                // Draw border
                this.runtimeContext.drawBorder();

                // Draw click full screen
                this.runtimeContext.drawFullscreenOverlay();

                // Draw Performance data
                this.runtimeContext.drawPerformanceOverlay();

                // this will proved the {width, height} of text data;
                if (GameBase.showTextMetrics) {
                    GameBase.showTextMetrics = false;
                    const textData = `"=====================MEM: 30.66/33.08MB"`;
                    const sizePX = 30;
                    const font = "monospace";
                    console.log(this.runtimeContext.calculateTextMetrics(textData, sizePX, font));
                }
            }
            // Continue animation
            requestAnimationFrame(this.animate);
        } catch (error) {
            console.error('Animation error:', error);
        }
    }

    async onInitialize() {
        throw new Error('onInitialize() must be implemented by inheriting child class');
    }
    async gameLoop(deltaTime, runtimeContext = this.runtimeContext) {
        throw new Error('gameLoop must be implemented by inheriting child class');
    }

    destroy() {
        if (this.isDestroyed) {
            return false;
        }

        this.isDestroyed = true;

        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('pagehide', this.handlePageHide);

        if (typeof this.onDestroy === 'function') {
            try {
                this.onDestroy();
            } catch (error) {
                console.warn('onDestroy hook failed:', error);
            }
        }

        // Common input ownership convention across games.
        if (this.keyboardInput?.destroy) {
            this.keyboardInput.destroy();
        }

        if (this.mouseInput?.destroy) {
            this.mouseInput.destroy();
        }

        if (this.gameControllers?.destroy) {
            this.gameControllers.destroy();
        }

        return true;
    }

}

export default GameBase;
