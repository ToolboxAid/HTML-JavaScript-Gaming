import CanvasUtils from '../core/canvas.js';

class RendererGuards {
    static canRenderObject(object, { allowDead = false, requireAlive = false } = {}) {
        if (!object || object.isDestroyed || !CanvasUtils.ctx) {
            return false;
        }

        if (!allowDead && typeof object.isDead === 'function' && object.isDead()) {
            return false;
        }

        if (requireAlive && typeof object.isAlive === 'function' && !object.isAlive()) {
            return false;
        }

        return true;
    }

    static normalizeOffset(value) {
        return Number.isFinite(value) ? value : 0;
    }

    static normalizeLineWidth(value, fallback = 1.25) {
        return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    static normalizePositiveNumber(value, fallback) {
        return Number.isFinite(value) && value > 0 ? value : fallback;
    }
}

export default RendererGuards;

