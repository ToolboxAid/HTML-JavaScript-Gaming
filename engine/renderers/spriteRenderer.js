import CanvasSprite from '../core/canvasSprite.js';
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

        const frame = this.getRenderableFrame(object);
        if (!frame) {
            return;
        }

        if (object.frameType === 'json') {
            CanvasSprite.drawSpriteRGB(newX, newY, frame, object.pixelSize);
            return;
        }

        CanvasSprite.drawSprite(newX, newY, frame, object.pixelSize, object.spriteColor);
    }

    static drawRGB(object, newX, newY) {
        if (!RendererGuards.canRenderObject(object)) {
            return;
        }

        const frame = this.getRenderableFrame(object);
        if (!frame) {
            return;
        }

        CanvasSprite.drawSpriteRGB(newX, newY, frame, object.pixelSize);
    }

    static getRenderableFrame(object) {
        if (object.isAlive()) {
            return object.getCurrentLivingFrame();
        }

        if (object.isDying()) {
            return object.getCurrentDyingFrame();
        }

        return null;
    }
}

export default SpriteRenderer;


