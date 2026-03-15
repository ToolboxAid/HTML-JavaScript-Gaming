// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import SystemUtils from '../utils/systemUtils.js';
import DebugFlag from '../utils/debugFlag.js';
import DebugLog from '../utils/debugLog.js';

import CanvasText from './canvasText.js';
import Colors from '../renderers/assets/colors.js';
import Sprite from './sprite.js';

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
    static drawTextCallback = (...args) => CanvasUtils.drawText(...args);
    static drawSpriteCallback = (...args) => CanvasUtils.drawSprite(...args);

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
            alert('You need a modern browser to see this.');
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

    /**
     * Draw text and numbers 
     */
    static drawNumber(x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        CanvasText.drawNumber(
            this.drawTextCallback,
            x,
            y,
            number,
            pixelSize,
            color,
            leadingCount,
            leadingChar
        );
    }

    static drawText(x, y, text, pixelSize, color = 'white') {
        CanvasText.drawText(this.drawSpriteCallback, x, y, text, pixelSize, color);
    }

    // get text width & height based on size & font w/padding
    static calculateTextMetrics(text, fontSize = 20, font = 'Arial') {
        return CanvasText.calculateTextMetrics(this.ctx, text, fontSize, font);
    }

    static drawSafeAreaGuides(margin = 16, color = '#66d9ff99') {
        if (!CanvasUtils.LAYOUT_DEBUG || !this.ctx) {
            return false;
        }

        const width = this.getConfigWidth();
        const height = this.getConfigHeight();
        const x = margin;
        const y = margin;
        const safeWidth = Math.max(0, width - (margin * 2));
        const safeHeight = Math.max(0, height - (margin * 2));

        this.ctx.save();
        this.ctx.setLineDash([8, 6]);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, safeWidth, safeHeight);

        this.ctx.beginPath();
        this.ctx.moveTo(width / 2, y);
        this.ctx.lineTo(width / 2, y + safeHeight);
        this.ctx.moveTo(x, height / 2);
        this.ctx.lineTo(x + safeWidth, height / 2);
        this.ctx.stroke();
        this.ctx.restore();

        return true;
    }

    // Method to draw the current frame
    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = Colors.symbolColorMap[pixel] || '#00000000'; // transparent';

                // Replace white with spriteColor if present
                if (pixel === '1' && spriteColor) {
                    color = spriteColor; // Use sprite color instead of white
                }
                this.ctx.fillStyle = color;
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                this.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            //let dimensions = Sprite.getWidthHeight(frame, pixelSize);
            let dimensions = Sprite.getLayerDimensions(frame, pixelSize);
            this.drawBounds(x, y, dimensions.width, dimensions.height, spriteColor, 2);
        }
    }

    // Method to draw the current frame
    static drawSpriteRGB(x, y, frame, pixelSize, drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                this.ctx.fillStyle = frame[row][col];
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                this.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            const dimensions = Sprite.getLayerDimensions(frame, pixelSize);
            this.drawBounds(x, y, dimensions.width, dimensions.height, "white", 2);
        }
    }

    /**
     * Line methods
     */
    static drawLine(x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = strokeColor;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1); // Start point
        this.ctx.lineTo(x2, y2); // End point
        this.ctx.stroke(); // Draw the line
    }

    static drawLineFromPoints(start, end, lineWidth = 5, strokeColor = 'red') {
        //   const start1 = { x: 0, y: 0 };
        //   const end1   = { x: 500, y: 500 };
        this.drawLine(start.x, start.y, end.x, end.y, lineWidth, strokeColor);
    }

    static drawDashLine(x1, y1, x2, y2, lineWidth, strokeColor = 'white', dashPattern = [10, 10]) {
        /* ctx.setLineDash
             ([5, 15]);        - Short dashes with longer gaps
             ([15, 5]);        - Long dashes with short gaps
             ([15, 5, 5, 5]);  - Long dash, short gap, short dash, short gap
             ([20, 5, 10, 5]); - Alternating long and medium dashes
         */
        this.ctx.setLineDash(dashPattern);
        this.drawLine(x1, y1, x2, y2, lineWidth, strokeColor);
        this.ctx.setLineDash([]); // Reset to solid line
    }

    static drawBounds(x, y, w, h, color = 'red', lineSize = 1) {
        if (w <= 0) {
            w = 10;
        }
        if (h <= 0) {
            h = 10;
        }
        this.ctx.lineWidth = lineSize;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(x, y, w, h);
    }

    static drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    static drawBorder() {
        this.ctx.lineWidth = this.config.borderSize;
        this.ctx.strokeStyle = this.config.borderColor;
        this.ctx.strokeRect(0, 0, this.config.width, this.config.height);
    }

    /**
     * Circle methods
     */
    static drawCircle(point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    static drawCircle2(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw circle
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();

        if (borderColor && borderWidth > 0) {
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = borderWidth;
            this.ctx.stroke();
        }
    }

    /**
     *  Canvas Init Methods
     */
    static canvasClear() {
        this.ctx.fillStyle = this.config.backgroundColor || Colors.getRandomColor();
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    }

}

export default CanvasUtils;
