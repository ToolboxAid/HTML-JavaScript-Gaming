// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// primitiveRenderer.js

import CanvasUtils from '../core/canvasUtils.js';
import RendererGuards from './rendererGuards.js';

class PrimitiveRenderer {
    static draw(object, fillColor = 'gray', borderColor = null, borderWidth = 0, options = {}) {
        if (!RendererGuards.canRenderObject(object, { allowDead: true })) {
            return;
        }

        return this.renderWithContext(options, (ctx) => {
            this.renderRect(ctx, object.x, object.y, object.width, object.height, fillColor, borderColor, borderWidth, 1, options);
        });
    }

    static drawRect(x, y, width, height, fillColor = 'gray', borderColor = null, borderWidth = 0, alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderRect(ctx, x, y, width, height, fillColor, borderColor, borderWidth, alpha, options);
        });
    }

    static drawBounds(x, y, width, height, borderColor = 'red', borderWidth = 1, alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderBounds(ctx, x, y, width, height, borderColor, borderWidth, alpha, options);
        });
    }

    static drawPanel(x, y, width, height, {
        fillColor = 'gray',
        borderColor = null,
        borderWidth = 0,
        backdropColor = null,
        backdropInset = 0,
        headerY = null,
        headerColor = null,
        headerWidth = 2,
        ctx = null
    } = {}) {
        return this.renderWithContext({ ctx }, (renderCtx) => {
            this.renderPanel(renderCtx, x, y, width, height, {
                fillColor,
                borderColor,
                borderWidth,
                backdropColor,
                backdropInset,
                headerY,
                headerColor,
                headerWidth
            });
        });
    }

    static drawCircle(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0, alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderCircle(ctx, x, y, radius, fillColor, borderColor, borderWidth, alpha, options);
        });
    }

    static drawEllipse(x, y, radiusX, radiusY, fillColor = null, borderColor = null, borderWidth = 0, rotation = 0, alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderEllipse(ctx, x, y, radiusX, radiusY, fillColor, borderColor, borderWidth, rotation, alpha, options);
        });
    }

    static drawPolygon(points, fillColor = null, borderColor = null, borderWidth = 0, options = {}) {
        return this.withValidatedPoints(points, 3, options, (ctx) => {
            this.renderPolygon(ctx, points, fillColor, borderColor, borderWidth, options);
        });
    }

    static drawTriangle(points, fillColor = 'white', borderColor = null, borderWidth = 0, options = {}) {
        return this.withValidatedPoints(points, 3, options, (ctx) => {
            this.renderPolygon(ctx, points, fillColor, borderColor, borderWidth, options);
        });
    }

    static drawPath(points, strokeColor = 'white', lineWidth = 1, {
        offsetX = 0,
        offsetY = 0,
        closePath = false,
        alpha = 1,
        lineDash = null,
        ctx = null
    } = {}) {
        return this.withValidatedPoints(points, 2, { ctx }, (renderCtx) => {
            this.renderPath(renderCtx, points, strokeColor, lineWidth, {
                offsetX,
                offsetY,
                closePath,
                alpha,
                lineDash
            });
        });
    }

    static drawLine(x1, y1, x2, y2, strokeColor = 'white', lineWidth = 1, alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderLine(ctx, x1, y1, x2, y2, strokeColor, lineWidth, alpha, options);
        });
    }

    static drawGridLines(x, y, width, height, columns, rows, strokeColor = 'white', lineWidth = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderGridLines(ctx, x, y, width, height, columns, rows, strokeColor, lineWidth, options);
        });
    }

    static drawOverlay(width, height, fillColor = 'black', alpha = 0.5, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderOverlay(ctx, width, height, fillColor, alpha, options);
        });
    }

    static drawSafeAreaGuides(width, height, margin = 16, strokeColor = '#66d9ff99', lineWidth = 2, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderSafeAreaGuides(ctx, width, height, margin, strokeColor, lineWidth, options);
        });
    }

    static drawCrosshair(centerX, centerY, size = 10, strokeColor = 'white', lineWidth = 1, alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderCrosshair(ctx, centerX, centerY, size, strokeColor, lineWidth, alpha, options);
        });
    }

    static drawMarker(x, y, radius = 2, fillColor = 'white', alpha = 1, options = {}) {
        return this.renderWithContext(options, (ctx) => {
            this.renderMarker(ctx, x, y, radius, fillColor, alpha, options);
        });
    }

    static drawDebugBounds(x, y, width, height, {
        borderColor = 'white',
        borderWidth = 1,
        alpha = 1,
        markerX = null,
        markerY = null,
        markerRadius = 2,
        markerColor = borderColor,
        markerAlpha = alpha,
        ctx = null
    } = {}) {
        return this.renderWithContext({ ctx }, (renderCtx) => {
            this.renderDebugBounds(renderCtx, x, y, width, height, {
                borderColor,
                borderWidth,
                alpha,
                markerX,
                markerY,
                markerRadius,
                markerColor,
                markerAlpha
            });
        });
    }

    static drawPixelMatrix(matrix, x, y, pixelWidth, pixelHeight, fillColor = 'white', {
        extraWidth = 0,
        extraHeight = 0,
        ctx = null
    } = {}) {
        return this.withValidatedMatrix(matrix, { ctx }, (renderCtx) => {
            this.renderPixelMatrix(renderCtx, matrix, x, y, pixelWidth, pixelHeight, fillColor, {
                extraWidth,
                extraHeight
            });
        });
    }

    static tracePath(ctx, points, { offsetX = 0, offsetY = 0, closePath = false } = {}) {
        ctx.beginPath();

        points.forEach((point, index) => {
            const { x, y } = this.getPointCoordinates(point);

            if (index === 0) {
                ctx.moveTo(x + offsetX, y + offsetY);
                return;
            }

            ctx.lineTo(x + offsetX, y + offsetY);
        });

        if (closePath) {
            ctx.closePath();
        }
    }

    static getPointCoordinates(point) {
        return Array.isArray(point)
            ? { x: point[0], y: point[1] }
            : { x: point.x, y: point.y };
    }

    static hasMinimumPointCount(points, minimumCount) {
        return Array.isArray(points) && points.length >= minimumCount;
    }

    static hasMatrixRows(matrix) {
        return Array.isArray(matrix) && matrix.length > 0;
    }

    static withContext(options = {}, drawFn) {
        const ctx = this.resolveContext(options);
        if (!ctx) {
            return false;
        }

        ctx.save();
        try {
            drawFn(ctx);
        } finally {
            ctx.restore();
        }
        return true;
    }

    static renderWithContext(options = {}, renderFn) {
        return this.withContext(options, renderFn);
    }

    static withValidatedInput(isValid, options = {}, drawFn) {
        if (!isValid) {
            return false;
        }

        return this.renderWithContext(options, drawFn);
    }

    static withValidatedPoints(points, minimumCount, options = {}, drawFn) {
        return this.withValidatedInput(this.hasMinimumPointCount(points, minimumCount), options, drawFn);
    }

    static withValidatedMatrix(matrix, options = {}, drawFn) {
        return this.withValidatedInput(this.hasMatrixRows(matrix), options, drawFn);
    }

    static resolveContext(options = {}) {
        if (options?.ctx) {
            return options.ctx;
        }

        return CanvasUtils.ctx || null;
    }

    static applyLineDash(ctx, lineDash) {
        if (!Array.isArray(lineDash) || typeof ctx.setLineDash !== 'function') {
            return;
        }

        ctx.setLineDash(lineDash);
    }

    static applyRenderState(ctx, alpha = 1, lineDash = null) {
        ctx.globalAlpha = alpha;
        this.applyLineDash(ctx, lineDash);
    }

    static renderRect(ctx, x, y, width, height, fillColor = 'gray', borderColor = null, borderWidth = 0, alpha = 1, options = {}) {
        this.applyRenderState(ctx, alpha, options.lineDash);

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, width, height);
        }

        if (borderColor && borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(x, y, width, height);
        }
    }

    static renderLine(ctx, x1, y1, x2, y2, strokeColor = 'white', lineWidth = 1, alpha = 1, options = {}) {
        this.renderStrokedShape(ctx, strokeColor, lineWidth, {
            alpha,
            lineDash: options.lineDash,
            trace: () => {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
        });
    }

    static renderCircle(ctx, x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0, alpha = 1, options = {}) {
        this.renderShape(ctx, fillColor, borderColor, borderWidth, {
            alpha,
            lineDash: options.lineDash,
            trace: () => {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
            }
        });
    }

    static renderEllipse(ctx, x, y, radiusX, radiusY, fillColor = null, borderColor = null, borderWidth = 0, rotation = 0, alpha = 1, options = {}) {
        this.renderShape(ctx, fillColor, borderColor, borderWidth, {
            alpha,
            lineDash: options.lineDash,
            trace: () => {
                ctx.beginPath();
                ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
            }
        });
    }

    static renderPolygon(ctx, points, fillColor = null, borderColor = null, borderWidth = 0, options = {}) {
        this.renderShape(ctx, fillColor, borderColor, borderWidth, {
            lineDash: options.lineDash,
            trace: () => this.tracePath(ctx, points, { closePath: true })
        });
    }

    static renderPath(ctx, points, strokeColor = 'white', lineWidth = 1, {
        offsetX = 0,
        offsetY = 0,
        closePath = false,
        alpha = 1,
        lineDash = null
    } = {}) {
        this.renderStrokedShape(ctx, strokeColor, lineWidth, {
            alpha,
            lineDash,
            trace: () => this.tracePath(ctx, points, { offsetX, offsetY, closePath })
        });
    }

    static renderPanel(ctx, x, y, width, height, {
        fillColor = 'gray',
        borderColor = null,
        borderWidth = 0,
        backdropColor = null,
        backdropInset = 0,
        headerY = null,
        headerColor = null,
        headerWidth = 2
    } = {}) {
        if (backdropColor && backdropInset > 0) {
            this.renderRect(
                ctx,
                x - backdropInset,
                y - backdropInset,
                width + (backdropInset * 2),
                height + (backdropInset * 2),
                backdropColor,
                null,
                0,
                1
            );
        }

        this.renderRect(ctx, x, y, width, height, fillColor, null, 0, 1);

        if (borderColor && borderWidth > 0) {
            this.renderBounds(ctx, x, y, width, height, borderColor, borderWidth, 1);
        }

        if (Number.isFinite(headerY)) {
            this.renderLine(ctx, x, headerY, x + width, headerY, headerColor || borderColor || 'white', headerWidth, 1);
        }
    }

    static renderOverlay(ctx, width, height, fillColor = 'black', alpha = 0.5, options = {}) {
        this.renderRect(ctx, 0, 0, width, height, fillColor, null, 0, alpha, options);
    }

    static renderSafeAreaGuides(ctx, width, height, margin = 16, strokeColor = '#66d9ff99', lineWidth = 2, options = {}) {
        const x = margin;
        const y = margin;
        const safeWidth = Math.max(0, width - (margin * 2));
        const safeHeight = Math.max(0, height - (margin * 2));
        const centerX = width / 2;
        const centerY = height / 2;
        const lineDash = [8, 6];

        this.renderSegments(ctx, [
            { x1: x, y1: y, x2: x + safeWidth, y2: y },
            { x1: x + safeWidth, y1: y, x2: x + safeWidth, y2: y + safeHeight },
            { x1: x + safeWidth, y1: y + safeHeight, x2: x, y2: y + safeHeight },
            { x1: x, y1: y + safeHeight, x2: x, y2: y },
            { x1: centerX, y1: y, x2: centerX, y2: y + safeHeight },
            { x1: x, y1: centerY, x2: x + safeWidth, y2: centerY }
        ], strokeColor, lineWidth, { alpha: 1, lineDash });
    }

    static renderGridLines(ctx, x, y, width, height, columns, rows, strokeColor = 'white', lineWidth = 1, options = {}) {
        const normalizedColumns = Math.max(0, Math.floor(columns));
        const normalizedRows = Math.max(0, Math.floor(rows));
        const stepX = normalizedColumns > 0 ? width / normalizedColumns : 0;
        const stepY = normalizedRows > 0 ? height / normalizedRows : 0;
        const segments = [];

        for (let column = 0; column <= normalizedColumns; column++) {
            const lineX = x + (column * stepX);
            segments.push({ x1: lineX, y1: y, x2: lineX, y2: y + height });
        }

        for (let row = 0; row <= normalizedRows; row++) {
            const lineY = y + (row * stepY);
            segments.push({ x1: x, y1: lineY, x2: x + width, y2: lineY });
        }

        this.renderSegments(ctx, segments, strokeColor, lineWidth, { alpha: 1, lineDash: options.lineDash });
    }

    static renderBounds(ctx, x, y, width, height, borderColor = 'red', borderWidth = 1, alpha = 1, options = {}) {
        this.renderRect(ctx, x, y, width, height, null, borderColor, borderWidth, alpha, options);
    }

    static renderFillAndStroke(ctx, fillColor = null, borderColor = null, borderWidth = 0) {
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (borderColor && borderWidth > 0) {
            this.renderStroke(ctx, borderColor, borderWidth);
        }
    }

    static renderShape(ctx, fillColor = null, borderColor = null, borderWidth = 0, {
        alpha = 1,
        lineDash = null,
        trace
    } = {}) {
        this.applyRenderState(ctx, alpha, lineDash);
        trace?.();
        this.renderFillAndStroke(ctx, fillColor, borderColor, borderWidth);
    }

    static renderStrokedShape(ctx, strokeColor = 'white', lineWidth = 1, {
        alpha = 1,
        lineDash = null,
        trace
    } = {}) {
        this.applyRenderState(ctx, alpha, lineDash);
        trace?.();
        this.renderStroke(ctx, strokeColor, lineWidth);
    }

    static renderStroke(ctx, strokeColor = 'white', lineWidth = 1) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    static renderCrosshair(ctx, centerX, centerY, size = 10, strokeColor = 'white', lineWidth = 1, alpha = 1, options = {}) {
        this.renderSegments(ctx, [
            { x1: centerX - size, y1: centerY, x2: centerX + size, y2: centerY },
            { x1: centerX, y1: centerY - size, x2: centerX, y2: centerY + size }
        ], strokeColor, lineWidth, { alpha, lineDash: options.lineDash });
    }

    static renderMarker(ctx, x, y, radius = 2, fillColor = 'white', alpha = 1, options = {}) {
        this.renderCircle(ctx, x, y, radius, fillColor, null, 0, alpha, options);
    }

    static renderPixelMatrix(ctx, matrix, x, y, pixelWidth, pixelHeight, fillColor = 'white', {
        extraWidth = 0,
        extraHeight = 0
    } = {}) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] !== 1) {
                    continue;
                }

                this.renderRect(
                    ctx,
                    x + (col * pixelWidth),
                    y + (row * pixelHeight),
                    pixelWidth + extraWidth,
                    pixelHeight + extraHeight,
                    fillColor,
                    null,
                    0,
                    1
                );
            }
        }
    }

    static renderSegments(ctx, segments, strokeColor = 'white', lineWidth = 1, {
        alpha = 1,
        lineDash = null
    } = {}) {
        this.renderStrokedShape(ctx, strokeColor, lineWidth, {
            alpha,
            lineDash,
            trace: () => {
                ctx.beginPath();

                for (const segment of segments) {
                    ctx.moveTo(segment.x1, segment.y1);
                    ctx.lineTo(segment.x2, segment.y2);
                }
            }
        });
    }

    static renderDebugBounds(ctx, x, y, width, height, {
        borderColor = 'white',
        borderWidth = 1,
        alpha = 1,
        markerX = null,
        markerY = null,
        markerRadius = 2,
        markerColor = borderColor,
        markerAlpha = alpha
    } = {}) {
        this.renderBounds(ctx, x, y, width, height, borderColor, borderWidth, alpha);

        if (Number.isFinite(markerX) && Number.isFinite(markerY)) {
            this.renderMarker(ctx, markerX, markerY, markerRadius, markerColor, markerAlpha);
        }
    }
}

export default PrimitiveRenderer;
