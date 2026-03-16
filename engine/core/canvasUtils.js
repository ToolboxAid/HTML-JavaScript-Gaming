// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvasUtils.js

import SystemUtils from '../utils/systemUtils.js';
import DebugFlag from '../utils/debugFlag.js';
import DebugLog from '../utils/debugLog.js';
import Colors from '../renderers/assets/colors.js';

class CanvasUtils {
    // Enable debug mode: game.html?canvasUtils
    static DEBUG = DebugFlag.has('canvasUtils');
    static LAYOUT_DEBUG = DebugFlag.has('layout');

    /** Constructor for CanvasUtils class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const canvasUtils = new CanvasUtils(); // Throws Error
     * 
     * ✅ Do this:
     * CanvasUtils.transformPoints(...); // Use static methods directly
     */
    constructor() {
        throw new Error('CanvasUtils is a utility class with only static methods. Do not instantiate.');
    }


    static canvas = null;
    static ctx = null;
    static config = {
        width: 1024,
        height: 768,
        scale: 1.0,
        backgroundColor: "#222222",
        borderColor: "red",
        borderSize: 15,
    };

    static async init(config) {
        if (typeof document === 'undefined') {
            throw new Error('CanvasUtils.init requires a browser document.');
        }

        const canvas = document.getElementById('gameArea');
        this.canvas = canvas;

        if (canvas && canvas.getContext) {
            this.ctx = canvas.getContext('2d');
            this.ctx.imageSmoothingEnabled = false;

            // Get the width and height of the canvas
            const width = canvas.width;
            const height = canvas.height;
            DebugLog.log(this.DEBUG, 'CanvasUtils', `${canvas}, ${this.canvas}, Canvas width: ${width}, Canvas height: ${height}`);
        } else {
            throw new Error('You need a modern browser to see this.');
        }

        if (!config) {
            DebugLog.error('CanvasUtils', "No 'canvasConfig' provided");
        }
        const schema = {
            width: 'number',           // Game area width
            height: 'number',          // Game area height
            scale: 'number',           // Scale factor
            backgroundColor: 'string', // Background color hex/name
            borderColor: 'string',     // Border color hex/name
            borderSize: 'number'       // Border width in pixels
        };

        const validation = SystemUtils.validateConfig("Canvas", config, schema);
        if (validation) {
            this.config = config;
        }

        DebugLog.log(CanvasUtils.DEBUG, 'CanvasUtils', 'CanvasUtils.init complete.', canvas, this.config);
    }

    static getCanvasWidth() {
        return this.canvas?.width ?? 0;
    }
    static getCanvasHeight() {
        return this.canvas?.height ?? 0;
    }
    static getConfigWidth() {
        return this.config?.width ?? 0;
    }
    static getConfigHeight() {
        return this.config?.height ?? 0;
    }

    static hasContext() {
        return !!this.ctx;
    }

    /**
     *  Canvas Init Methods
     */
    static canvasClear() {
        if (!this.ctx) {
            return false;
        }

        this.ctx.fillStyle = this.config.backgroundColor || Colors.getRandomColor();
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);

        return true;
    }

}

export default CanvasUtils;
