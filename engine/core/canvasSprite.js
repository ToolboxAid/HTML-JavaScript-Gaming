// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// canvasSprite.js

import CanvasUtils from './canvasUtils.js';
import Colors from '../renderers/assets/colors.js';
import Sprite from './sprite.js';

class CanvasSprite {
    constructor() {
        throw new Error('CanvasSprite is a utility class with only static methods. Do not instantiate.');
    }

    static bindDrawSprite() {
        return (...args) => this.drawSprite(...args);
    }

    static bindDrawSpriteRGB() {
        return (...args) => this.drawSpriteRGB(...args);
    }

    static drawImageFrame(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        return this._drawImageFrameToContext(CanvasUtils.ctx, image, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // Internal/test support only.
    static _drawImageFrameToContext(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh) {
        const renderCtx = ctx || null;
        if (!renderCtx || !image) {
            return false;
        }

        renderCtx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        return true;
    }

    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        return this._drawSpriteToContext(CanvasUtils.ctx, x, y, frame, pixelSize, spriteColor, drawBounds);
    }

    // Internal/test support only.
    static _drawSpriteToContext(ctx, x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        const renderCtx = ctx || null;
        if (!renderCtx || !Array.isArray(frame)) {
            return false;
        }

        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = Colors.symbolColorMap[pixel] || '#00000000';

                if (pixel === '1' && spriteColor) {
                    color = spriteColor;
                }

                renderCtx.fillStyle = color;
                const ceilX = Math.ceil((col * pixelSize) + x);
                const ceilY = Math.ceil((row * pixelSize) + y);
                const ceilPixelSize = Math.ceil(pixelSize);
                renderCtx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            const dimensions = Sprite.getLayerDimensions(frame, pixelSize);
            renderCtx.lineWidth = 2;
            renderCtx.strokeStyle = spriteColor;
            renderCtx.strokeRect(x, y, dimensions.width, dimensions.height);
        }

        return true;
    }

    static drawSpriteRGB(x, y, frame, pixelSize, drawBounds = false) {
        return this._drawSpriteRGBToContext(CanvasUtils.ctx, x, y, frame, pixelSize, drawBounds);
    }

    // Internal/test support only.
    static _drawSpriteRGBToContext(ctx, x, y, frame, pixelSize, drawBounds = false) {
        const renderCtx = ctx || null;
        if (!renderCtx || !Array.isArray(frame)) {
            return false;
        }

        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                renderCtx.fillStyle = frame[row][col];
                const ceilX = Math.ceil((col * pixelSize) + x);
                const ceilY = Math.ceil((row * pixelSize) + y);
                const ceilPixelSize = Math.ceil(pixelSize);
                renderCtx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            const dimensions = Sprite.getLayerDimensions(frame, pixelSize);
            renderCtx.lineWidth = 2;
            renderCtx.strokeStyle = 'white';
            renderCtx.strokeRect(x, y, dimensions.width, dimensions.height);
        }

        return true;
    }
}

export default CanvasSprite;
