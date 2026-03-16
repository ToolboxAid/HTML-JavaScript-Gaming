// ToolboxAid.com
// David Quesenberry
// 01/31/2025
// gameBase.js

import DebugFlag from "../utils/debugFlag.js";
import DebugLog from "../utils/debugLog.js";
import RuntimeContext from "./runtimeContext.js";
import Fullscreen from "./fullscreen.js";

class GameBase {

    // Enable debug mode: game.html?gameBase
    static DEBUG = DebugFlag.has('gameBase');

    static isInitialized = false;
    static showTextMetrics = false;

    constructor(canvasConfig, performanceConfig, fullscreenConfig) {
        this.isDestroyed = false;
        this.isPageHidden = document.hidden;
        this.lastTimestamp = performance.now();
        this.runtimeContext = new RuntimeContext();
        this.animate = this.animate.bind(this);// bind once
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handlePageHide = this.handlePageHide.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('pagehide', this.handlePageHide);

        this.initializeGame(canvasConfig, performanceConfig, fullscreenConfig)
            .then(() => {
                if (this.isDestroyed) {
                    return;
                }

                DebugLog.log(GameBase.DEBUG, 'GameBase', '*** Game initialization complete ***');

                this.constructor.isInitialized = true;

                // Start animation loop
                requestAnimationFrame(this.animate); // already bind - just once
                //requestAnimationFrame(this.animate.bind(this)); // bind each call
            })
            .catch(error => {
                DebugLog.error('GameBase', 'Game initialization failed:', error);
                this.constructor.isInitialized = false;
                this.destroy();
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

        this.lastTimestamp = performance.now();
    }

    animate(timestamp) {
        try {
            if (this.isDestroyed) {
                return;
            }

            if (this.isPageHidden) {
                requestAnimationFrame(this.animate);
                return;
            }

            // Calculate delta time
            const deltaTime = (timestamp - this.lastTimestamp) / 1000;
            this.lastTimestamp = timestamp;

            if (this.runtimeContext.getContext() && this.gameLoop) {
                // start performance timer
                const startTimeMs = performance.now();
                this.runtimeContext.clearCanvas();

                // Call game loop implementation (code and draw)
                const gameLoopResult = this.gameLoop(deltaTime, this.runtimeContext); // call game.js (the inheriting class)
                if (gameLoopResult && typeof gameLoopResult.then === 'function') {
                    gameLoopResult.then(() => {
                        if (this.isDestroyed) {
                            return;
                        }

                        this.completeFrame(startTimeMs);
                        requestAnimationFrame(this.animate);
                    }).catch((error) => {
                        DebugLog.error('GameBase', 'Animation error:', error);

                        if (!this.isDestroyed) {
                            requestAnimationFrame(this.animate);
                        }
                    });
                    return;
                }

                this.completeFrame(startTimeMs);
            }
            // Continue animation
            requestAnimationFrame(this.animate);
        } catch (error) {
            DebugLog.error('GameBase', 'Animation error:', error);
        }
    }

    completeFrame(startTimeMs) {
        // Update performance data
        const timeSpentMs = performance.now() - startTimeMs; // end performance timer
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
            DebugLog.log(GameBase.DEBUG, 'GameBase', this.runtimeContext.calculateTextMetrics(textData, sizePX, font));
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
        const keyboardInput = this.keyboardInput;
        const mouseInput = this.mouseInput;
        const gameControllers = this.gameControllers;

        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('pagehide', this.handlePageHide);

        if (typeof this.onDestroy === 'function') {
            try {
                this.onDestroy();
            } catch (error) {
                DebugLog.warn(true, 'GameBase', 'onDestroy hook failed:', error);
            }
        }

        // Common input ownership convention across games.
        if (keyboardInput?.destroy) {
            keyboardInput.destroy();
        }

        if (mouseInput?.destroy) {
            mouseInput.destroy();
        }

        if (gameControllers?.destroy) {
            gameControllers.destroy();
        }

        if (typeof this.runtimeContext?.destroy === 'function') {
            this.runtimeContext.destroy();
        }

        if (typeof Fullscreen.destroy === 'function') {
            Fullscreen.destroy();
        }

        return true;
    }

}

export default GameBase;
