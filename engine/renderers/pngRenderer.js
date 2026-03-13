import CanvasUtils from '../canvas.js';
import ObjectDebug from '../utils/objectDebug.js';

class PngRenderer {
    static draw(object, offsetX = 0, offsetY = 0) {
        if (!object || object.isDestroyed || object.isDead() || !CanvasUtils.ctx) {
            return;
        }

        if (!object.isLoaded || !object.png || !object.png.complete) {
            if (object.constructor?.DEBUG && object.loadError) {
                console.warn('Sprite failed to load:', object.loadError);
            }
            return;
        }

        const scaledWidth = Math.round(object.frameWidth * object.pixelSize);
        const scaledHeight = Math.round(object.frameHeight * object.pixelSize);
        const frameOffset = object.getFrameOffset(object.currentFrameIndex);
        const newX = Math.round(object.x + offsetX + (frameOffset.x * object.pixelSize));
        const newY = Math.round(object.y + offsetY + (frameOffset.y * object.pixelSize));
        const { sx, sy, sw, sh } = object.getCurrentSourceRect();

        ObjectDebug.log(object.constructor?.DEBUG, 'ObjectPNG frame debug', {
            spritePath: object.spritePath,
            spriteX: object.spriteX,
            spriteY: object.spriteY,
            frameWidth: object.frameWidth,
            frameHeight: object.frameHeight,
            currentFrameIndex: object.currentFrameIndex,
            sourceRect: { sx, sy, sw, sh },
            destRect: {
                x: newX,
                y: newY,
                width: scaledWidth,
                height: scaledHeight
            },
            frameOffset
        });

        CanvasUtils.ctx.save();

        if (object.rotation === 0 && object.flip === object.constructor.Flip.NONE) {
            CanvasUtils.ctx.drawImage(
                object.png,
                sx,
                sy,
                sw,
                sh,
                newX,
                newY,
                scaledWidth,
                scaledHeight
            );
        } else {
            const centerX = newX + scaledWidth / 2;
            const centerY = newY + scaledHeight / 2;

            CanvasUtils.ctx.translate(centerX, centerY);

            switch (object.flip) {
                case object.constructor.Flip.HORIZONTAL:
                    CanvasUtils.ctx.scale(-1, 1);
                    break;
                case object.constructor.Flip.VERTICAL:
                    CanvasUtils.ctx.scale(1, -1);
                    break;
                case object.constructor.Flip.BOTH:
                    CanvasUtils.ctx.scale(-1, -1);
                    break;
                default:
                    break;
            }

            CanvasUtils.ctx.rotate(object.rotation);

            CanvasUtils.ctx.drawImage(
                object.png,
                sx,
                sy,
                sw,
                sh,
                -scaledWidth / 2,
                -scaledHeight / 2,
                scaledWidth,
                scaledHeight
            );
        }

        if (object.constructor?.DEBUG) {
            this.drawSheetPreview(object, 100, 350, 1);
        }

        CanvasUtils.ctx.restore();
    }

    static drawAllFramesPreview(object, previewX = 10, previewY = 10, scale = 2, padding = 4) {
        if (!object || !object.png || !object.isLoaded || !CanvasUtils.ctx) {
            return;
        }

        const totalFrames = object.frameCount || 1;
        const cols = object.framesPerRow || 1;
        const rows = Math.ceil(totalFrames / cols);
        const cellW = object.frameWidth * scale;
        const cellH = object.frameHeight * scale;

        CanvasUtils.ctx.save();

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const srcCol = frameIndex % cols;
            const srcRow = Math.floor(frameIndex / cols);
            const sx = object.spriteX + (srcCol * object.frameWidth);
            const sy = object.spriteY + (srcRow * object.frameHeight);
            const drawCol = frameIndex % cols;
            const drawRow = Math.floor(frameIndex / cols);
            const dx = previewX + drawCol * (cellW + padding);
            const dy = previewY + drawRow * (cellH + padding);

            CanvasUtils.ctx.drawImage(
                object.png,
                sx,
                sy,
                object.frameWidth,
                object.frameHeight,
                dx,
                dy,
                cellW,
                cellH
            );

            CanvasUtils.ctx.strokeStyle = '#666666';
            CanvasUtils.ctx.lineWidth = 1;
            CanvasUtils.ctx.strokeRect(dx, dy, cellW, cellH);

            CanvasUtils.ctx.fillStyle = 'white';
            CanvasUtils.ctx.font = '10px Arial';
            CanvasUtils.ctx.textAlign = 'left';
            CanvasUtils.ctx.fillText(`${frameIndex}`, dx + 2, dy + 11);

            if (frameIndex === object.currentFrameIndex) {
                CanvasUtils.ctx.strokeStyle = 'yellow';
                CanvasUtils.ctx.lineWidth = 2;
                CanvasUtils.ctx.strokeRect(dx - 1, dy - 1, cellW + 2, cellH + 2);
            }
        }

        CanvasUtils.ctx.fillStyle = 'white';
        CanvasUtils.ctx.font = '12px Arial';
        CanvasUtils.ctx.textAlign = 'left';
        CanvasUtils.ctx.fillText(
            `PNG Frames: current=${object.currentFrameIndex}`,
            previewX,
            previewY + rows * (cellH + padding) + 14
        );

        CanvasUtils.ctx.restore();
    }

    static drawSheetPreview(object, previewX = 10, previewY = 150, scale = 1) {
        if (!object || !object.png || !object.isLoaded || !CanvasUtils.ctx) {
            return;
        }

        const sheetW = object.png.width * scale;
        const sheetH = object.png.height * scale;
        const { sx, sy, sw, sh } = object.getCurrentSourceRect();

        CanvasUtils.ctx.save();
        CanvasUtils.ctx.drawImage(object.png, previewX, previewY, sheetW, sheetH);
        CanvasUtils.ctx.strokeStyle = 'yellow';
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.strokeRect(
            previewX + sx * scale,
            previewY + sy * scale,
            sw * scale,
            sh * scale
        );

        CanvasUtils.ctx.fillStyle = 'white';
        CanvasUtils.ctx.font = '12px Arial';
        CanvasUtils.ctx.fillText(`sheet frame=${object.currentFrameIndex}`, previewX, previewY - 6);
        CanvasUtils.ctx.restore();
    }
}

export default PngRenderer;
