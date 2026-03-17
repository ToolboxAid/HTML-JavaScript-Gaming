import CanvasUtils from '../core/canvasUtils.js';
import CanvasSprite from '../core/canvasSprite.js';
import CanvasText from '../core/canvasText.js';
import DebugLog from '../utils/debugLog.js';
import PrimitiveRenderer from './primitiveRenderer.js';
import RendererGuards from './rendererGuards.js';

class PngRenderer {
    static draw(object, offsetX = 0, offsetY = 0) {
        if (!RendererGuards.canRenderObject(object)) {
            return;
        }

        if (!object.isLoaded || !object.png || !object.png.complete) {
            if (object.constructor?.DEBUG && object.loadError) {
                DebugLog.warn(true, 'PngRenderer', 'Sprite failed to load:', object.loadError);
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

        if (object.constructor?.DEBUG) {
            DebugLog.log(true, null, 'ObjectPNG frame debug', {
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
        }

        CanvasUtils.ctx.save();

        if (object.rotation === 0 && object.flip === object.constructor.Flip.NONE) {
            CanvasSprite.drawImageFrame(
                object.png,
                sx,
                sy,
                sw,
                sh,
                newX,
                newY,
                scaledWidth,
                scaledHeight,
                CanvasUtils.ctx
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

            CanvasSprite.drawImageFrame(
                object.png,
                sx,
                sy,
                sw,
                sh,
                -scaledWidth / 2,
                -scaledHeight / 2,
                scaledWidth,
                scaledHeight,
                CanvasUtils.ctx
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

            CanvasSprite.drawImageFrame(
                object.png,
                sx,
                sy,
                object.frameWidth,
                object.frameHeight,
                dx,
                dy,
                cellW,
                cellH,
                CanvasUtils.ctx
            );

            PrimitiveRenderer.drawBounds(dx, dy, cellW, cellH, '#666666', 1);

            CanvasText.renderTextToContext(CanvasUtils.ctx, `${frameIndex}`, dx + 2, dy + 11, {
                fontSize: 10,
                color: 'white',
                useDpr: false
            });

            if (frameIndex === object.currentFrameIndex) {
                PrimitiveRenderer.drawBounds(dx - 1, dy - 1, cellW + 2, cellH + 2, 'yellow', 2);
            }
        }

        CanvasText.renderTextToContext(CanvasUtils.ctx, `PNG Frames: current=${object.currentFrameIndex}`, normalizedPreviewX, normalizedPreviewY + rows * (cellH + normalizedPadding) + 14, {
            fontSize: 12,
            color: 'white',
            useDpr: false
        });

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
        CanvasSprite.drawImageFrame(
            object.png,
            0,
            0,
            object.png.width,
            object.png.height,
            normalizedPreviewX,
            normalizedPreviewY,
            sheetW,
            sheetH,
            CanvasUtils.ctx
        );
        PrimitiveRenderer.drawBounds(
            normalizedPreviewX + sx * normalizedScale,
            normalizedPreviewY + sy * normalizedScale,
            sw * normalizedScale,
            sh * normalizedScale,
            'yellow',
            2
        );

        CanvasText.renderTextToContext(CanvasUtils.ctx, `sheet frame=${object.currentFrameIndex}`, normalizedPreviewX, normalizedPreviewY - 6, {
            fontSize: 12,
            color: 'white',
            useDpr: false
        });
        CanvasUtils.ctx.restore();
    }
}

export default PngRenderer;



