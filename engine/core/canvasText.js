// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// canvasText.js

import NumberUtils from '../math/numberUtils.js';
import Font5x6 from '../renderers/assets/font5x6.js';

class CanvasText {
    constructor() {
        throw new Error('CanvasText is a utility class with only static methods. Do not instantiate.');
    }

    static bindDrawText(drawSpriteFn) {
        return (...args) => this.drawText(drawSpriteFn, ...args);
    }

    static bindDrawNumber(drawSpriteFn) {
        const drawTextFn = this.bindDrawText(drawSpriteFn);
        return (...args) => this.drawNumber(drawTextFn, ...args);
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
        if (!ctx) {
            return { width: 0, height: 0 };
        }

        ctx.font = `${fontSize}px ${font}`;
        const metrics = ctx.measureText(text);

        return {
            width: Math.ceil(metrics.width),
            height: Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
        };
    }

    static parseFont(font, fallbackSize = 20, fallbackFamily = 'Arial') {
        if (typeof font !== 'string' || font.trim() === '') {
            return {
                fontSize: fallbackSize,
                fontFamily: fallbackFamily
            };
        }

        const fontParts = font.trim().split(/\s+/);
        const parsedSize = Number.parseFloat(fontParts[0]);

        return {
            fontSize: NumberUtils.isFiniteNumber(parsedSize) ? parsedSize : fallbackSize,
            fontFamily: fontParts.slice(1).join(' ') || fallbackFamily
        };
    }

    static renderText(ctx, text, x, y, {
        fontSize = 20,
        fontFamily = 'Arial',
        color = 'white',
        textAlign = 'left',
        textBaseline = 'alphabetic',
        useDpr = true,
        maxDprScale = 1.25
    } = {}) {
        if (!ctx || typeof text !== 'string') {
            return null;
        }

        const resolvedFontSize = useDpr
            ? this.normalizeFontSizeForDpr(fontSize, maxDprScale)
            : fontSize;

        ctx.save();
        ctx.fillStyle = color;
        ctx.font = `${resolvedFontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.fillText(text, x, y);
        ctx.restore();

        return { x, y, fontSize: resolvedFontSize };
    }

    static renderMultilineText(ctx, lines, x, startY, {
        fontSize = 20,
        lineHeight = null,
        fontFamily = 'Arial',
        color = 'white',
        textAlign = 'left',
        textBaseline = 'alphabetic',
        useDpr = true,
        maxDprScale = 1.25
    } = {}) {
        if (!ctx || !Array.isArray(lines) || lines.length === 0) {
            return [];
        }

        const resolvedFontSize = useDpr
            ? this.normalizeFontSizeForDpr(fontSize, maxDprScale)
            : fontSize;
        const resolvedLineHeight = NumberUtils.isFiniteNumber(lineHeight)
            ? lineHeight
            : Math.round(resolvedFontSize * 1.35);
        const drawResults = [];

        ctx.save();
        ctx.fillStyle = color;
        ctx.font = `${resolvedFontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        for (let i = 0; i < lines.length; i += 1) {
            const y = startY + (i * resolvedLineHeight);
            ctx.fillText(lines[i], x, y);
            drawResults.push({ x, y, fontSize: resolvedFontSize });
        }

        ctx.restore();
        return drawResults;
    }

    static getDevicePixelRatio() {
        if (typeof window === 'undefined') {
            return 1;
        }

        const dpr = window.devicePixelRatio;
        if (!NumberUtils.isPositiveFinite(dpr)) {
            return 1;
        }

        return dpr;
    }

    static normalizeFontSizeForDpr(fontSize, maxScale = 1.25) {
        const size = NumberUtils.isFiniteNumber(fontSize) ? fontSize : 20;
        const scale = Math.min(this.getDevicePixelRatio(), maxScale);
        return Math.round(size * scale * 100) / 100;
    }

    static renderCenteredText(ctx, text, y, {
        centerX = null,
        fontSize = 20,
        fontFamily = 'Arial',
        color = 'white',
        useDpr = true,
        maxDprScale = 1.25,
        defaultCenterX = null
    } = {}) {
        if (!ctx || typeof text !== 'string') {
            return null;
        }

        const resolvedFontSize = useDpr
            ? this.normalizeFontSizeForDpr(fontSize, maxDprScale)
            : fontSize;
        const resolvedCenterX = NumberUtils.isFiniteNumber(centerX)
            ? centerX
            : (NumberUtils.isFiniteNumber(defaultCenterX) ? defaultCenterX : ((ctx.canvas?.width || 0) / 2));
        const dimensions = this.calculateTextMetrics(ctx, text, resolvedFontSize, fontFamily);
        const x = Math.round(resolvedCenterX - (dimensions.width / 2));

        ctx.fillStyle = color;
        ctx.font = `${resolvedFontSize}px ${fontFamily}`;
        ctx.fillText(text, x, y);

        return { x, y, width: dimensions.width, height: dimensions.height, fontSize: resolvedFontSize };
    }

    static renderCenteredMultilineText(ctx, lines, startY, {
        centerX = null,
        fontSize = 20,
        lineHeight = null,
        fontFamily = 'Arial',
        color = 'white',
        useDpr = true,
        maxDprScale = 1.25,
        defaultCenterX = null
    } = {}) {
        if (!ctx || !Array.isArray(lines) || lines.length === 0) {
            return [];
        }

        const resolvedFontSize = useDpr
            ? this.normalizeFontSizeForDpr(fontSize, maxDprScale)
            : fontSize;
        const resolvedLineHeight = NumberUtils.isFiniteNumber(lineHeight)
            ? lineHeight
            : Math.round(resolvedFontSize * 1.35);
        const drawResults = [];

        for (let i = 0; i < lines.length; i += 1) {
            drawResults.push(
                this.renderCenteredText(ctx, lines[i], startY + (i * resolvedLineHeight), {
                    centerX,
                    fontSize: resolvedFontSize,
                    fontFamily,
                    color,
                    useDpr: false,
                    defaultCenterX
                })
            );
        }

        return drawResults;
    }
}

export default CanvasText;
