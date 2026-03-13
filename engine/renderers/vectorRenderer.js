import CanvasUtils from '../core/canvas.js';
import DebugLog from '../utils/debugLog.js';
import RendererGuards from './rendererGuards.js';

class VectorRenderer {
    static draw(object, lineWidth = 1.25, offsetX = 0, offsetY = 0) {
        if (!RendererGuards.canRenderObject(object, { requireAlive: true })) {
            return;
        }

        if (!Array.isArray(object.rotatedPoints) || object.rotatedPoints.length === 0) {
            if (object.constructor?.DEBUG) {
                DebugLog.warn(true, 'VectorRenderer', 'VectorRenderer skipped draw: rotatedPoints are not available.');
            }
            return;
        }

        const normalizedLineWidth = RendererGuards.normalizeLineWidth(lineWidth, 1.25);
        const normalizedOffsetX = RendererGuards.normalizeOffset(offsetX);
        const normalizedOffsetY = RendererGuards.normalizeOffset(offsetY);

        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.strokeStyle = object.color;
        CanvasUtils.ctx.lineWidth = normalizedLineWidth;

        object.rotatedPoints.forEach(([rx, ry], index) => {
            if (index === 0) {
                CanvasUtils.ctx.moveTo(rx + normalizedOffsetX, ry + normalizedOffsetY);
            } else {
                CanvasUtils.ctx.lineTo(rx + normalizedOffsetX, ry + normalizedOffsetY);
            }
        });

        CanvasUtils.ctx.closePath();
        CanvasUtils.ctx.stroke();

        if (object.drawBounds) {
            CanvasUtils.drawCircle2(object.x + normalizedOffsetX, object.y + normalizedOffsetY, 2, 'white');
            CanvasUtils.drawBounds(
                object.boundX + normalizedOffsetX,
                object.boundY + normalizedOffsetY,
                object.boundWidth,
                object.boundHeight,
                'white',
                normalizedLineWidth
            );
        }
    }
}

export default VectorRenderer;

