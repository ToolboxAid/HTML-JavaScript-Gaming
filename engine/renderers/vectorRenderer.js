import CanvasUtils from '../canvas.js';

class VectorRenderer {
    static draw(object, lineWidth = 1.25, offsetX = 0, offsetY = 0) {
        if (!object || object.isDestroyed || !object.isAlive()) {
            return;
        }

        if (!Array.isArray(object.rotatedPoints) || object.rotatedPoints.length === 0) {
            console.error('Rotated points are not available.');
            return;
        }

        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.strokeStyle = object.color;
        CanvasUtils.ctx.lineWidth = lineWidth;

        object.rotatedPoints.forEach(([rx, ry], index) => {
            if (index === 0) {
                CanvasUtils.ctx.moveTo(rx + offsetX, ry + offsetY);
            } else {
                CanvasUtils.ctx.lineTo(rx + offsetX, ry + offsetY);
            }
        });

        CanvasUtils.ctx.closePath();
        CanvasUtils.ctx.stroke();

        if (object.drawBounds) {
            CanvasUtils.drawCircle2(object.x + offsetX, object.y + offsetY, 2, 'white');
            CanvasUtils.drawBounds(
                object.boundX + offsetX,
                object.boundY + offsetY,
                object.boundWidth,
                object.boundHeight,
                'white',
                lineWidth
            );
        }
    }
}

export default VectorRenderer;
