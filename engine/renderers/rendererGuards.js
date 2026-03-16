import CanvasUtils from '../core/canvasUtils.js';
import NumberUtils from '../math/numberUtils.js';

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
        return NumberUtils.isFiniteNumber(value) ? value : 0;
    }

    static normalizeLineWidth(value, fallback = 1.25) {
        return NumberUtils.isPositiveFinite(value) ? value : fallback;
    }

    static normalizeNonNegativeNumber(value, fallback = 0) {
        return NumberUtils.isNonNegativeFinite(value) ? value : fallback;
    }

    static normalizePositiveNumber(value, fallback) {
        return NumberUtils.isPositiveFinite(value) ? value : fallback;
    }
}

export default RendererGuards;


