// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// primitiveRenderer.js

import CanvasUtils from '../core/canvasUtils.js';
import RendererGuards from './rendererGuards.js';

class PrimitiveRenderer {
    static draw(object, fillColor = 'gray', borderColor = null, borderWidth = 0) {
        if (!RendererGuards.canRenderObject(object, { allowDead: true })) {
            return;
        }

        this.drawRect(object.x, object.y, object.width, object.height, fillColor, borderColor, borderWidth);
    }

    static drawRect(x, y, width, height, fillColor = 'gray', borderColor = null, borderWidth = 0, alpha = 1) {
        return this.withContext((ctx) => {
            ctx.globalAlpha = alpha;

            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fillRect(x, y, width, height);
            }

            if (borderColor && borderWidth > 0) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.strokeRect(x, y, width, height);
            }
        });
    }

    static drawBounds(x, y, width, height, borderColor = 'red', borderWidth = 1, alpha = 1) {
        return this.drawRect(x, y, width, height, null, borderColor, borderWidth, alpha);
    }

    static drawPanel(x, y, width, height, {
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
            this.drawRect(
                x - backdropInset,
                y - backdropInset,
                width + (backdropInset * 2),
                height + (backdropInset * 2),
                backdropColor
            );
        }

        this.drawRect(x, y, width, height, fillColor);

        if (borderColor && borderWidth > 0) {
            this.drawBounds(x, y, width, height, borderColor, borderWidth);
        }

        if (Number.isFinite(headerY)) {
            this.drawLine(x, headerY, x + width, headerY, headerColor || borderColor || 'white', headerWidth);
        }
    }

    static drawCircle(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        return this.withContext((ctx) => {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);

            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }

            if (borderColor && borderWidth > 0) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.stroke();
            }
        });
    }

    static drawEllipse(x, y, radiusX, radiusY, fillColor = null, borderColor = null, borderWidth = 0, rotation = 0) {
        return this.withContext((ctx) => {
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);

            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }

            if (borderColor && borderWidth > 0) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.stroke();
            }
        });
    }

    static drawPolygon(points, fillColor = null, borderColor = null, borderWidth = 0) {
        if (!Array.isArray(points) || points.length < 3) {
            return false;
        }

        return this.withContext((ctx) => {
            this.tracePath(ctx, points, { closePath: true });

            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }

            if (borderColor && borderWidth > 0) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.stroke();
            }
        });
    }

    static drawTriangle(points, fillColor = 'white', borderColor = null, borderWidth = 0) {
        return this.drawPolygon(points, fillColor, borderColor, borderWidth);
    }

    static drawPath(points, strokeColor = 'white', lineWidth = 1, {
        offsetX = 0,
        offsetY = 0,
        closePath = false,
        alpha = 1
    } = {}) {
        if (!Array.isArray(points) || points.length < 2) {
            return false;
        }

        return this.withContext((ctx) => {
            ctx.globalAlpha = alpha;
            this.tracePath(ctx, points, { offsetX, offsetY, closePath });
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        });
    }

    static drawLine(x1, y1, x2, y2, strokeColor = 'white', lineWidth = 1, alpha = 1) {
        return this.withContext((ctx) => {
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        });
    }

    static tracePath(ctx, points, { offsetX = 0, offsetY = 0, closePath = false } = {}) {
        ctx.beginPath();

        points.forEach((point, index) => {
            const x = Array.isArray(point) ? point[0] : point.x;
            const y = Array.isArray(point) ? point[1] : point.y;

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

    static withContext(drawFn) {
        if (!CanvasUtils.ctx) {
            return false;
        }

        CanvasUtils.ctx.save();
        drawFn(CanvasUtils.ctx);
        CanvasUtils.ctx.restore();
        return true;
    }
}

export default PrimitiveRenderer;
