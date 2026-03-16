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

    static drawRect(x, y, width, height, fillColor = 'gray', borderColor = null, borderWidth = 0) {
        if (!CanvasUtils.ctx) {
            return;
        }

        CanvasUtils.ctx.save();
        CanvasUtils.ctx.fillStyle = fillColor;
        CanvasUtils.ctx.fillRect(x, y, width, height);

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.strokeRect(x, y, width, height);
        }

        CanvasUtils.ctx.restore();
    }

    static drawCircle(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        if (!CanvasUtils.ctx) {
            return;
        }

        CanvasUtils.ctx.save();
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (fillColor) {
            CanvasUtils.ctx.fillStyle = fillColor;
            CanvasUtils.ctx.fill();
        }

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.stroke();
        }

        CanvasUtils.ctx.restore();
    }

    static drawEllipse(x, y, radiusX, radiusY, fillColor = null, borderColor = null, borderWidth = 0, rotation = 0) {
        if (!CanvasUtils.ctx) {
            return;
        }

        CanvasUtils.ctx.save();
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);

        if (fillColor) {
            CanvasUtils.ctx.fillStyle = fillColor;
            CanvasUtils.ctx.fill();
        }

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.stroke();
        }

        CanvasUtils.ctx.restore();
    }

    static drawTriangle(points, fillColor = 'white', borderColor = null, borderWidth = 0) {
        if (!CanvasUtils.ctx || !Array.isArray(points) || points.length < 3) {
            return;
        }

        CanvasUtils.ctx.save();
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(points[0].x, points[0].y);

        for (let index = 1; index < points.length; index += 1) {
            CanvasUtils.ctx.lineTo(points[index].x, points[index].y);
        }

        CanvasUtils.ctx.closePath();

        if (fillColor) {
            CanvasUtils.ctx.fillStyle = fillColor;
            CanvasUtils.ctx.fill();
        }

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.stroke();
        }

        CanvasUtils.ctx.restore();
    }
}

export default PrimitiveRenderer;
