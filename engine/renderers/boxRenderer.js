// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// boxRenderer.js

import CanvasUtils from '../canvas.js';

class BoxRenderer {
    static draw(object, fillColor = 'gray', borderColor = null, borderWidth = 0) {
        if (!object || object.isDestroyed) {
            return;
        }

        CanvasUtils.ctx.fillStyle = fillColor;
        CanvasUtils.ctx.fillRect(object.x, object.y, object.width, object.height);

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.strokeRect(object.x, object.y, object.width, object.height);
        }
    }
}

export default BoxRenderer;
