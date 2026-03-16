// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// fullscreen.js

import SystemUtils from "../utils/systemUtils.js";
import DebugFlag from '../utils/debugFlag.js';
import DebugLog from '../utils/debugLog.js';

class Fullscreen {

    // Enable debug mode: game.html?fullscreen
    static DEBUG = DebugFlag.has('fullscreen');

    /** Constructor for Fullscreen class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const fullscreen = new Fullscreen(); // Throws Error
     * 
     * ✅ Do this:
     * Fullscreen.transformPoints(...); // Use static methods directly
     */
    constructor() {
        throw new Error('Fullscreen is a utility class with only static methods. Do not instantiate.');
    }

    static gameFullScaleScreen = 1.0;
    static isFullScreen = false;

    static canvas = typeof document !== 'undefined'
        ? document.getElementById("gameArea")
        : null;
    static ctx = Fullscreen.canvas?.getContext
        ? Fullscreen.canvas.getContext('2d')
        : null;

    static canvasWidth = 0;
    static canvasHeight = 0;
    static scale = 0;

    static config = {
        width: 1024,
        height: 768,
        color: 'red',
        font: '40px Arial',
        scale: 1,
        text: 'Click here to enter fullscreen, default',
        x: 300,
        y: 300
    };

    static listenersRegistered = false;
    static canvasClickBound = null;
    static resizeBound = null;
    static fullscreenChangeBound = null;
    static onResizeHook = null;

    static isFullscreenActive() {
        if (typeof document === 'undefined') {
            return false;
        }

        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }

    static syncFullscreenState() {
        Fullscreen.isFullScreen = Fullscreen.isFullscreenActive();
    }

    static async init(config, canvasConfig, hooks = {}) {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            throw new Error('Fullscreen requires a browser window/document.');
        }

        if (!config) {
            DebugLog.error('Fullscreen', "No 'fullscreenConfig' provided");
        }
        const schema = {
            color: 'string',
            font: 'string',
            text: 'string',
            x: 'number',
            y: 'number'
        };
        const validation = SystemUtils.validateConfig("FullScreen", config, schema);
        if (validation) {
            this.config = config;
        }

        if (!canvasConfig) {
            DebugLog.error('Fullscreen', "'canvasConfig' not provided.");
        }
        const { width = 1024, height = 768, scale = 0.25 } = canvasConfig || {};
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.scale = scale;
        this.canvas = document.getElementById("gameArea");
        this.ctx = this.canvas?.getContext ? this.canvas.getContext('2d') : null;

        if (!this.canvas || !this.ctx) {
            throw new Error('Fullscreen requires #gameArea canvas with a 2D context.');
        }

        Fullscreen.onResizeHook = typeof hooks.onResize === 'function' ? hooks.onResize : null;
        Fullscreen.syncFullscreenState();

        Fullscreen.setCanvasSize(Fullscreen.scale);
        Fullscreen.updateCanvasTransform();

        if (!Fullscreen.listenersRegistered) {
            Fullscreen.resizeBound = Fullscreen.resizeCanvas.bind(Fullscreen);
            Fullscreen.canvasClickBound = Fullscreen.toggleFullscreen.bind(Fullscreen);
            Fullscreen.fullscreenChangeBound = () => {
                Fullscreen.syncFullscreenState();
                DebugLog.log(Fullscreen.DEBUG, 'Fullscreen', `fullscreenchange: isFullScreen=${Fullscreen.isFullScreen}`);
                Fullscreen.resizeCanvas('fullscreenchange');
            };

            window.addEventListener("resize", Fullscreen.resizeBound);
            window.addEventListener('orientationchange', Fullscreen.resizeBound);
            Fullscreen.canvas.addEventListener('click', Fullscreen.canvasClickBound);
            document.addEventListener('fullscreenchange', Fullscreen.fullscreenChangeBound);
            document.addEventListener('webkitfullscreenchange', Fullscreen.fullscreenChangeBound);
            document.addEventListener('msfullscreenchange', Fullscreen.fullscreenChangeBound);
            Fullscreen.listenersRegistered = true;
        }

        Fullscreen.notifyResizeHook('init');

        DebugLog.log(Fullscreen.DEBUG, 'Fullscreen', 'FullScreen.init complete.');
    }

    static openFullscreen() {
        if (Fullscreen.canvas.requestFullscreen) {
            const request = Fullscreen.canvas.requestFullscreen();
            if (request && typeof request.catch === 'function') {
                request.catch((error) => {
                    DebugLog.warn(Fullscreen.DEBUG, 'Fullscreen', 'requestFullscreen failed:', error);
                });
            }
        } else if (Fullscreen.canvas.webkitRequestFullscreen) {
            Fullscreen.canvas.webkitRequestFullscreen();
        } else if (Fullscreen.canvas.msRequestFullscreen) {
            Fullscreen.canvas.msRequestFullscreen();
        }
    }

    static closeFullscreen() {
        if (document.exitFullscreen) {
            const exit = document.exitFullscreen();
            if (exit && typeof exit.catch === 'function') {
                exit.catch((error) => {
                    DebugLog.warn(Fullscreen.DEBUG, 'Fullscreen', 'exitFullscreen failed:', error);
                });
            }
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    static toggleFullscreen() {
        Fullscreen.syncFullscreenState();
        Fullscreen.isFullScreen ? Fullscreen.closeFullscreen() : Fullscreen.openFullscreen();
    }

    static resizeCanvas(reason = 'resize') {
        if (!Fullscreen.canvas || !Fullscreen.ctx) {
            return;
        }

        Fullscreen.syncFullscreenState();

        if (Fullscreen.isFullScreen) {
            Fullscreen.setCanvasSize(Fullscreen.gameFullScaleScreen);
            DebugLog.log(Fullscreen.DEBUG, 'Fullscreen', 'Fullscreen mode activated.');
        } else {
            Fullscreen.setCanvasSize(Fullscreen.scale);
        }

        Fullscreen.updateCanvasTransform();
        Fullscreen.ctx.clearRect(0, 0, Fullscreen.canvas.width, Fullscreen.canvas.height);
        Fullscreen.notifyResizeHook(reason);
    }

    static notifyResizeHook(reason = 'resize') {
        if (typeof Fullscreen.onResizeHook !== 'function') {
            return;
        }

        try {
            Fullscreen.onResizeHook({
                reason,
                isFullScreen: Fullscreen.isFullScreen,
                canvas: Fullscreen.canvas,
                ctx: Fullscreen.ctx
            });
        } catch (error) {
            DebugLog.warn(Fullscreen.DEBUG, 'Fullscreen', 'onResize hook failed:', error);
        }
    }

    static setCanvasSize(scale) {
        if (!Fullscreen.canvas) {
            return;
        }
        Fullscreen.canvas.width = Fullscreen.canvasWidth;
        Fullscreen.canvas.height = Fullscreen.canvasHeight;
        Fullscreen.canvas.style.width = `${Fullscreen.canvasWidth * scale}px`;
        Fullscreen.canvas.style.height = `${Fullscreen.canvasHeight * scale}px`;
    }

    static updateCanvasTransform() {
        if (!Fullscreen.ctx) {
            return;
        }
        Fullscreen.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    static draw(ctx) {
        if (!ctx) {
            return;
        }

        if (!Fullscreen.isFullScreen) {
            ctx.save();
            ctx.fillStyle = this.config.color;
            ctx.font = this.config.font;
            ctx.textAlign = 'start';
            ctx.fillText(this.config.text, this.config.x, this.config.y);
            ctx.restore();
        }
    }

    static destroy() {
        if (!Fullscreen.listenersRegistered || typeof window === 'undefined' || typeof document === 'undefined') {
            return false;
        }

        window.removeEventListener("resize", Fullscreen.resizeBound);
        window.removeEventListener('orientationchange', Fullscreen.resizeBound);
        Fullscreen.canvas?.removeEventListener('click', Fullscreen.canvasClickBound);
        document.removeEventListener('fullscreenchange', Fullscreen.fullscreenChangeBound);
        document.removeEventListener('webkitfullscreenchange', Fullscreen.fullscreenChangeBound);
        document.removeEventListener('msfullscreenchange', Fullscreen.fullscreenChangeBound);

        Fullscreen.resizeBound = null;
        Fullscreen.canvasClickBound = null;
        Fullscreen.fullscreenChangeBound = null;
        Fullscreen.onResizeHook = null;
        Fullscreen.canvas = null;
        Fullscreen.ctx = null;
        Fullscreen.isFullScreen = false;
        Fullscreen.listenersRegistered = false;
        return true;
    }

}

export default Fullscreen;
