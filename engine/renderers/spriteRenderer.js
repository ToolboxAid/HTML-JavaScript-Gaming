import CanvasUtils from '../canvas.js';
import RendererGuards from './rendererGuards.js';

class SpriteRenderer {
    static draw(object, offsetX = 0, offsetY = 0) {
        if (!RendererGuards.canRenderObject(object)) {
            return;
        }

        const normalizedOffsetX = RendererGuards.normalizeOffset(offsetX);
        const normalizedOffsetY = RendererGuards.normalizeOffset(offsetY);
        const newX = object.x + normalizedOffsetX;
        const newY = object.y + normalizedOffsetY;

        if (object.frameType === 'json') {
            this.drawRGB(object, newX, newY);
            return;
        }

        if (object.isAlive()) {
            const frame = object.getCurrentLivingFrame();
            if (frame) {
                CanvasUtils.drawSprite(newX, newY, frame, object.pixelSize, object.spriteColor);
            }
            return;
        }

        if (object.isDying()) {
            const frame = object.getCurrentDyingFrame();
            if (frame) {
                CanvasUtils.drawSprite(newX, newY, frame, object.pixelSize, object.spriteColor);
            }
            return;
        }
    }

    static drawRGB(object, newX, newY) {
        if (!RendererGuards.canRenderObject(object)) {
            return;
        }

        if (object.isAlive()) {
            const frame = object.getCurrentLivingFrame();
            if (frame) {
                CanvasUtils.drawSpriteRGB(newX, newY, frame, object.pixelSize);
            }
            return;
        }

        if (object.isDying()) {
            const frame = object.getCurrentDyingFrame();
            if (frame) {
                CanvasUtils.drawSpriteRGB(newX, newY, frame, object.pixelSize);
            }
            return;
        }
    }
}

export default SpriteRenderer;
