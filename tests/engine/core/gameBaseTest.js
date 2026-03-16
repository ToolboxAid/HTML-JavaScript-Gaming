import GameBase from '../../../engine/core/gameBase.js';

function installDocumentHarness() {
    const listeners = new Map();
    const originalAddEventListener = document.addEventListener;
    const originalRemoveEventListener = document.removeEventListener;
    const originalHidden = document.hidden;

    document.addEventListener = (eventName, listener) => {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }
        listeners.get(eventName).add(listener);
    };

    document.removeEventListener = (eventName, listener) => {
        listeners.get(eventName)?.delete(listener);
    };

    Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false
    });

    return () => {
        document.addEventListener = originalAddEventListener;
        document.removeEventListener = originalRemoveEventListener;
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            value: originalHidden
        });
    };
}

function installWindowHarness() {
    const listeners = new Map();
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;

    window.addEventListener = (eventName, listener) => {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }
        listeners.get(eventName).add(listener);
    };

    window.removeEventListener = (eventName, listener) => {
        listeners.get(eventName)?.delete(listener);
    };

    return () => {
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
    };
}

export async function testGameBase(assert) {
    const restoreDocument = installDocumentHarness();
    const restoreWindow = installWindowHarness();
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const rafCalls = [];
    globalThis.requestAnimationFrame = (callback) => {
        rafCalls.push(callback);
        return rafCalls.length;
    };

    try {
        class TestGame extends GameBase {
            constructor() {
                super(
                    { width: 100, height: 100, backgroundColor: '#000', borderColor: '#fff', borderSize: 1, scale: 1 },
                    { show: false, size: 10, font: 'monospace', colorLow: '#0f0', colorMed: '#ff0', colorHigh: '#f00', backgroundColor: '#000', x: 0, y: 0 },
                    { color: '#fff', font: '10px monospace', text: 'fs', x: 0, y: 0 }
                );
            }

            async initializeGame() {
                this.runtimeContext = {
                    onPageHidden() {},
                    onPageVisible() {},
                    getContext() { return null; },
                    clearCanvas() {},
                    drawBorder() {},
                    updatePerformance() {},
                    drawFullscreenOverlay() {},
                    drawPerformanceOverlay() {},
                    calculateTextMetrics() { return { width: 0, height: 0 }; }
                };
                await this.onInitialize(this.runtimeContext);
            }

            async onInitialize() {
                this.keyboardDestroyed = 0;
                this.mouseDestroyed = 0;
                this.controllerDestroyed = 0;
                this.runtimeDestroyed = 0;

                this.keyboardInput = { destroy: () => { this.keyboardDestroyed += 1; } };
                this.mouseInput = { destroy: () => { this.mouseDestroyed += 1; } };
                this.gameControllers = { destroy: () => { this.controllerDestroyed += 1; } };
                this.runtimeContext = {
                    onPageHidden() {},
                    onPageVisible() {},
                    getContext() { return null; },
                    clearCanvas() {},
                    drawBorder() {},
                    updatePerformance() {},
                    drawFullscreenOverlay() {},
                    drawPerformanceOverlay() {},
                    calculateTextMetrics() { return { width: 0, height: 0 }; },
                    destroy: () => { this.runtimeDestroyed += 1; }
                };
            }

            onDestroy() {
                this.keyboardInput = null;
                this.mouseInput = null;
                this.gameControllers = null;
            }

            gameLoop() {}
        }

        const game = new TestGame();
        await Promise.resolve();

        game.lastTimestamp = 123;
        game.handleVisibilityChange();
        assert(game.lastTimestamp !== 123, 'GameBase should reset the instance timestamp when visibility resumes');

        const destroyed = game.destroy();
        assert(destroyed === true, 'GameBase.destroy should succeed on first call');
        assert(game.keyboardDestroyed === 1, 'GameBase.destroy should clean up cached keyboard input even if onDestroy clears the field');
        assert(game.mouseDestroyed === 1, 'GameBase.destroy should clean up cached mouse input even if onDestroy clears the field');
        assert(game.controllerDestroyed === 1, 'GameBase.destroy should clean up cached controllers even if onDestroy clears the field');
        assert(game.runtimeDestroyed === 1, 'GameBase.destroy should forward shared runtime cleanup once');
        assert(game.destroy() === false, 'GameBase.destroy should be idempotent');

        class FailingGame extends GameBase {
            constructor() {
                super(
                    { width: 100, height: 100, backgroundColor: '#000', borderColor: '#fff', borderSize: 1, scale: 1 },
                    { show: false, size: 10, font: 'monospace', colorLow: '#0f0', colorMed: '#ff0', colorHigh: '#f00', backgroundColor: '#000', x: 0, y: 0 },
                    { color: '#fff', font: '10px monospace', text: 'fs', x: 0, y: 0 }
                );
            }

            async initializeGame() {
                throw new Error('boot failed');
            }
        }

        const failingGame = new FailingGame();
        await Promise.resolve();
        await Promise.resolve();
        assert(failingGame.isDestroyed === true, 'GameBase should destroy itself when initialization fails');

        class DeferredGame extends GameBase {
            constructor() {
                super(
                    { width: 100, height: 100, backgroundColor: '#000', borderColor: '#fff', borderSize: 1, scale: 1 },
                    { show: false, size: 10, font: 'monospace', colorLow: '#0f0', colorMed: '#ff0', colorHigh: '#f00', backgroundColor: '#000', x: 0, y: 0 },
                    { color: '#fff', font: '10px monospace', text: 'fs', x: 0, y: 0 }
                );
            }

            async initializeGame() {
                await new Promise((resolve) => {
                    this.resolveInit = resolve;
                });

                this.runtimeContext = {
                    onPageHidden() {},
                    onPageVisible() {},
                    getContext() { return null; },
                    clearCanvas() {},
                    drawBorder() {},
                    updatePerformance() {},
                    drawFullscreenOverlay() {},
                    drawPerformanceOverlay() {},
                    calculateTextMetrics() { return { width: 0, height: 0 }; },
                    destroy() {}
                };
            }
        }

        DeferredGame.isInitialized = false;
        const deferredGame = new DeferredGame();
        const rafCountBeforeDestroy = rafCalls.length;
        deferredGame.destroy();
        deferredGame.resolveInit();
        await Promise.resolve();
        await Promise.resolve();
        assert(DeferredGame.isInitialized === false, 'GameBase should not mark a destroyed game initialized after async init resolves');
        assert(rafCalls.length === rafCountBeforeDestroy, 'GameBase should not schedule animation after destroy during async init');

        class AsyncLoopGame extends GameBase {
            constructor() {
                super(
                    { width: 100, height: 100, backgroundColor: '#000', borderColor: '#fff', borderSize: 1, scale: 1 },
                    { show: false, size: 10, font: 'monospace', colorLow: '#0f0', colorMed: '#ff0', colorHigh: '#f00', backgroundColor: '#000', x: 0, y: 0 },
                    { color: '#fff', font: '10px monospace', text: 'fs', x: 0, y: 0 }
                );
            }

            async initializeGame() {
                this.runtimeContext = {
                    onPageHidden() {},
                    onPageVisible() {},
                    getContext() { return { tag: 'ctx' }; },
                    clearCanvas() {},
                    drawBorder() {},
                    updatePerformance() {},
                    drawFullscreenOverlay() {},
                    drawPerformanceOverlay() {},
                    calculateTextMetrics() { return { width: 0, height: 0 }; },
                    destroy() {}
                };
                await this.onInitialize(this.runtimeContext);
            }

            async onInitialize() {}

            gameLoop() {
                return new Promise((resolve) => {
                    this.resolveLoop = resolve;
                });
            }
        }

        const asyncLoopGame = new AsyncLoopGame();
        await Promise.resolve();
        const scheduledAnimate = rafCalls[rafCalls.length - 1];
        const rafCountBeforeAsyncDestroy = rafCalls.length;
        scheduledAnimate(16);
        asyncLoopGame.destroy();
        asyncLoopGame.resolveLoop();
        await Promise.resolve();
        await Promise.resolve();
        assert(rafCalls.length === rafCountBeforeAsyncDestroy, 'GameBase should not schedule another frame when async gameLoop resolves after destroy');
    } finally {
        globalThis.requestAnimationFrame = originalRequestAnimationFrame;
        restoreDocument();
        restoreWindow();
    }
}
