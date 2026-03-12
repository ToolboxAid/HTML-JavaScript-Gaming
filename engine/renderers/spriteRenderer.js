import CanvasUtils from '../canvas.js';

class SpriteRenderer {
    static draw(object, offsetX = 0, offsetY = 0) {
        if (!object || object.isDead() || object.isDestroyed) {
            return;
        }

        const newX = object.x + offsetX;
        const newY = object.y + offsetY;

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
