import DebugLog from '../utils/debugLog.js';
import PrimitiveRenderer from './primitiveRenderer.js';
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

        PrimitiveRenderer.drawPath(object.rotatedPoints, object.color, normalizedLineWidth, {
            offsetX: normalizedOffsetX,
            offsetY: normalizedOffsetY,
            closePath: true
        });

        if (object.drawBounds) {
            PrimitiveRenderer.drawMarker(object.x + normalizedOffsetX, object.y + normalizedOffsetY, 2, 'white');
            PrimitiveRenderer.drawBounds(
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


