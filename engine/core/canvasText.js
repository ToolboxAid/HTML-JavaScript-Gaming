// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// canvasText.js

import Font5x6 from '../renderers/assets/font5x6.js';

class CanvasText {
    constructor() {
        throw new Error('CanvasText is a utility class with only static methods. Do not instantiate.');
    }

    static drawNumber(drawTextFn, x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        const numberStr = number.toString();
        if (numberStr.length > leadingCount) {
            leadingCount = numberStr.length;
        }

        const leadingLength = Math.max(0, leadingCount - numberStr.length);
        const text = leadingChar.repeat(leadingLength) + numberStr;
        const formattedText = text.padStart(leadingCount, leadingChar).slice(-leadingCount);
        drawTextFn(x, y, formattedText, pixelSize, color);
    }

    static drawText(drawSpriteFn, x, y, text, pixelSize, color = 'white') {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char];

            if (frame) {
                const charWidth = frame[0].length;
                drawSpriteFn(x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
            }
        }
    }

    static calculateTextMetrics(ctx, text, fontSize = 20, font = 'Arial') {
        ctx.font = `${fontSize}px ${font}`;
        const metrics = ctx.measureText(text);

        return {
            width: Math.ceil(metrics.width),
            height: Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
        };
    }
}

export default CanvasText;
