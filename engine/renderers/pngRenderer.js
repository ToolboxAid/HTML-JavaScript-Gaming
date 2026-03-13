import CanvasUtils from '../core/canvas.js';
import DebugLog from '../utils/debugLog.js';
import RendererGuards from './rendererGuards.js';

class PngRenderer {
    static draw(object, offsetX = 0, offsetY = 0) {
        if (!RendererGuards.canRenderObject(object)) {
            return;
        }

        if (!object.isLoaded || !object.png || !object.png.complete) {
            if (object.constructor?.DEBUG && object.loadError) {
                console.warn('Sprite failed to load:', object.loadError);
            }
            return;
        }

        const normalizedOffsetX = RendererGuards.normalizeOffset(offsetX);
        const normalizedOffsetY = RendererGuards.normalizeOffset(offsetY);
        const scaledWidth = Math.round(object.frameWidth * object.pixelSize);
        const scaledHeight = Math.round(object.frameHeight * object.pixelSize);
        const frameOffset = object.getFrameOffset(object.currentFrameIndex);
        const newX = Math.round(object.x + normalizedOffsetX + (frameOffset.x * object.pixelSize));
        const newY = Math.round(object.y + normalizedOffsetY + (frameOffset.y * object.pixelSize));
        const { sx, sy, sw, sh } = object.getCurrentSourceRect();

        DebugLog.log(object.constructor?.DEBUG, null, 'ObjectPNG frame debug', {
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

        const normalizedScale = RendererGuards.normalizePositiveNumber(scale, 2);
        const normalizedPadding = RendererGuards.normalizePositiveNumber(padding, 4);
        const normalizedPreviewX = RendererGuards.normalizeOffset(previewX);
        const normalizedPreviewY = RendererGuards.normalizeOffset(previewY);

        const totalFrames = object.frameCount || 1;
        const cols = object.framesPerRow || 1;
        const rows = Math.ceil(totalFrames / cols);
        const cellW = object.frameWidth * normalizedScale;
        const cellH = object.frameHeight * normalizedScale;

        CanvasUtils.ctx.save();

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const srcCol = frameIndex % cols;
            const srcRow = Math.floor(frameIndex / cols);
            const sx = object.spriteX + (srcCol * object.frameWidth);
            const sy = object.spriteY + (srcRow * object.frameHeight);
            const drawCol = frameIndex % cols;
            const drawRow = Math.floor(frameIndex / cols);
            const dx = normalizedPreviewX + drawCol * (cellW + normalizedPadding);
            const dy = normalizedPreviewY + drawRow * (cellH + normalizedPadding);

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
            normalizedPreviewX,
            normalizedPreviewY + rows * (cellH + normalizedPadding) + 14
        );

        CanvasUtils.ctx.restore();
    }

    static drawSheetPreview(object, previewX = 10, previewY = 150, scale = 1) {
        if (!object || !object.png || !object.isLoaded || !CanvasUtils.ctx) {
            return;
        }

        const normalizedScale = RendererGuards.normalizePositiveNumber(scale, 1);
        const normalizedPreviewX = RendererGuards.normalizeOffset(previewX);
        const normalizedPreviewY = RendererGuards.normalizeOffset(previewY);

        const sheetW = object.png.width * normalizedScale;
        const sheetH = object.png.height * normalizedScale;
        const { sx, sy, sw, sh } = object.getCurrentSourceRect();

        CanvasUtils.ctx.save();
        CanvasUtils.ctx.drawImage(object.png, normalizedPreviewX, normalizedPreviewY, sheetW, sheetH);
        CanvasUtils.ctx.strokeStyle = 'yellow';
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.strokeRect(
            normalizedPreviewX + sx * normalizedScale,
            normalizedPreviewY + sy * normalizedScale,
            sw * normalizedScale,
            sh * normalizedScale
        );

        CanvasUtils.ctx.fillStyle = 'white';
        CanvasUtils.ctx.font = '12px Arial';
        CanvasUtils.ctx.fillText(`sheet frame=${object.currentFrameIndex}`, normalizedPreviewX, normalizedPreviewY - 6);
        CanvasUtils.ctx.restore();
    }
}

export default PngRenderer;


