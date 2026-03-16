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

    static resolveContext(ctx = null) {
        return ctx || CanvasUtils.ctx || null;
    }

    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false, ctx = null) {
        const renderCtx = this.resolveContext(ctx);
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

    static drawSpriteRGB(x, y, frame, pixelSize, drawBounds = false, ctx = null) {
        const renderCtx = this.resolveContext(ctx);
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
