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

    static drawTriangle(points, fillColor = 'white', borderColor = null, borderWidth = 0) {
        if (!Array.isArray(points) || points.length < 3) {
            return;
        }

        return this.withContext((ctx) => {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let index = 1; index < points.length; index += 1) {
                ctx.lineTo(points[index].x, points[index].y);
            }

            ctx.closePath();

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
