// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import ObjectStatic from './objectStatic.js';
import Fullscreen from './fullscreen.js'; // Import the Fullscreen class
import Font5x6 from './font5x6.js';
import Colors from './colors.js';
import Sprite from './sprite.js';
import PerformanceMonitor from './performacneMonitor.js';

class CanvasUtils {

    static gameModule;
    static lastTimestamp = 0;
    static ctx = null;
    static config = null;

    /**
     * Draw text and numbers 
     */
    static drawNumber(x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        const numberStr = number.toString();
        if (numberStr.length > leadingCount) {
            leadingCount = numberStr.length;
        }
        const leadingLength = Math.max(0, leadingCount - numberStr.length); // Calculate number of leading characters needed
        const text = leadingChar.repeat(leadingLength) + numberStr; // Create text with leading characters

        // Ensure text length is exactly 5
        const formattedText = text.padStart(leadingCount, leadingChar).slice(-leadingCount);
        this.drawText(x, y, formattedText, pixelSize, color);
    }

    static drawText(x, y, text, pixelSize, color = 'white') {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char];

            if (frame) {
                // Assuming each character has a fixed width, you can adjust the space here
                const charWidth = frame[0].length; // Get the width from the frame
                this.drawSprite(x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
            }
        }
    }

    // get text width & height based on size & font w/padding
    static calculateTextMetrics(text, fontSize = 20, font = 'Arial') {
        // Set font
        this.ctx.font = `${fontSize}px ${font}`;

        // Measure text
        const metrics = this.ctx.measureText(text);
        const width = Math.ceil(metrics.width);

        // Get height using font metrics
        const height = Math.ceil(
            metrics.actualBoundingBoxAscent +
            metrics.actualBoundingBoxDescent
        );

        return {
            width: width + 10,    // Add padding
            height: height + 5    // Add padding
        };
    }
    //TODO: should these move to the sprite class (and split sprite class)
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
            let dimensions = Sprite.getWidthHeight(frame, pixelSize);
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
        const {
            width,
            height,
            borderSize = 6,
            borderColor = Colors.getRandomColor()
        } = this.config?.canvasConfig || {};

        this.ctx.lineWidth = borderSize;
        this.ctx.strokeStyle = borderColor;
        this.ctx.strokeRect(0, 0, width, height);
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
        const { width, height, backgroundColor } = this.config?.canvasConfig || {};

        this.ctx.fillStyle = backgroundColor || Colors.getRandomColor();
        this.ctx.fillRect(0, 0, width, height);
    }

    static clickFullscreen() {
        if (!Fullscreen.isFullScreen) {
            const {
                color = 'white',
                font = '40px Arial',
                text = 'Click here to enter fullscreen',
                x = 230,
                y = 790
            } = this.config?.fullscreenConfig || {};

            this.ctx.fillStyle = color;
            this.ctx.font = font;
            this.ctx.textAlign = 'start';
            this.ctx.fillText(text, x, y);
        }
    }

    static async initialize(ctx, configPath) {
        try {
            this.ctx = ctx;
            this.globalConfigPath = configPath;

            // Import all configs
            const {
                canvasConfig,
                fpsConfig,
                fullscreenConfig
            } = await import(configPath);

            // Store configs
            this.config = {
                canvasConfig,
                fpsConfig,
                fullscreenConfig
            };

            return true;
        } catch (error) {
            console.error('Canvas initialization failed:', error);
            return false;
        }
    }

}

export default CanvasUtils;
