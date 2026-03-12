// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectPNG.js

import ObjectKillable from './objectKillable.js';
import SystemUtils from '../utils/systemUtils.js';
import AngleUtils from '../math/angleUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import ObjectDebug from '../utils/objectDebug.js';
import PngRenderer from '../renderers/pngRenderer.js';
import ImageAssetCache from '../utils/imageAssetCache.js';

class ObjectPNG extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectPNG');

    static Flip = Object.freeze({
        NONE: 'none',
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical',
        BOTH: 'both'
    });

    constructor(
        x = 0,
        y = 0,
        spritePath,
        spriteX = 0,
        spriteY = 0,
        frameWidth = 50,
        frameHeight = 50,
        pixelSize = 1,
        transparentColor = 'black',
        velocityX = 0,
        velocityY = 0,
        frameCount = 1,
        framesPerRow = 1,
        frameDelay = 6,
        frameOffsets = null
    ) {
        ObjectValidation.nonEmptyString(spritePath, 'spritePath');
        ObjectValidation.finiteNumber(spriteX, 'spriteX');
        ObjectValidation.finiteNumber(spriteY, 'spriteY');
        ObjectValidation.positiveNumber(frameWidth, 'frameWidth');
        ObjectValidation.positiveNumber(frameHeight, 'frameHeight');
        ObjectValidation.positiveNumber(pixelSize, 'pixelSize');
        ObjectValidation.finiteNumber(velocityX, 'velocityX');
        ObjectValidation.finiteNumber(velocityY, 'velocityY');
        ObjectValidation.positiveNumber(frameCount, 'frameCount');
        ObjectValidation.positiveNumber(framesPerRow, 'framesPerRow');
        ObjectValidation.positiveNumber(frameDelay, 'frameDelay');

        // Keep inherited width/height as raw frame dimensions
        super(
            x,
            y,
            frameWidth,
            frameHeight,
            velocityX,
            velocityY
        );

        this.spritePath = spritePath;
        this.spriteX = spriteX;
        this.spriteY = spriteY;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.pixelSize = pixelSize;

        this.frameCount = Math.floor(frameCount);
        this.framesPerRow = Math.floor(framesPerRow);
        this.frameDelay = Math.floor(frameDelay);

        this.transparentColor = transparentColor;

        this.boundWidth = this.frameWidth * this.pixelSize;
        this.boundHeight = this.frameHeight * this.pixelSize;

        this.flip = ObjectPNG.Flip.NONE;
        this.rotation = 0;

        this.png = null;
        this.isLoaded = false;
        this.loadError = null;

        this.frameOffsets = Array.isArray(frameOffsets) ? frameOffsets : null;

        ObjectPNG.loadSprite(spritePath, transparentColor)
            .then((png) => {
                this.png = png;
                this.isLoaded = true;

                ObjectDebug.log(ObjectPNG.DEBUG, 'Loaded PNG sprite', {
                    path: spritePath,
                    imageWidth: png.width,
                    imageHeight: png.height,
                    frameWidth: this.frameWidth,
                    frameHeight: this.frameHeight
                });
            })
            .catch((error) => {
                this.loadError = error;
                this.isLoaded = false;
                console.error(`Failed to load sprite: ${spritePath}`, error);
            });
    }

    setFlip(flipType = ObjectPNG.Flip.NONE) {
        ObjectValidation.nonEmptyString(flipType, 'flipType');

        const normalized = flipType.toLowerCase();
        ObjectValidation.oneOf(normalized, 'flipType', Object.values(ObjectPNG.Flip));

        this.flip = normalized;
    }

    setRotation(rotationDegrees = 0) {
        ObjectValidation.finiteNumber(rotationDegrees, 'rotationDegrees');
        this.rotation = AngleUtils.toRadians(rotationDegrees);
    }

    setFrame(frameIndex = 0) {
        ObjectValidation.finiteNumber(frameIndex, 'frameIndex');

        if (!Number.isInteger(frameIndex)) {
            throw new Error('frameIndex must be an integer.');
        }

        if (frameIndex < 0 || frameIndex >= this.frameCount) {
            throw new Error(`frameIndex out of range: ${frameIndex}`);
        }

        this.currentFrameIndex = frameIndex;
        this.delayCounter = 0;
    }

    setFrameOffsets(frameOffsets) {
        if (frameOffsets !== null && !Array.isArray(frameOffsets)) {
            throw new Error('frameOffsets must be null or an array.');
        }

        this.frameOffsets = frameOffsets;
    }

    getFrameOffset(frameIndex = this.currentFrameIndex) {
        if (!this.frameOffsets || !this.frameOffsets[frameIndex]) {
            return { x: 0, y: 0 };
        }

        const offset = this.frameOffsets[frameIndex];
        const offsetX = Number.isFinite(offset?.x) ? offset.x : 0;
        const offsetY = Number.isFinite(offset?.y) ? offset.y : 0;

        return { x: offsetX, y: offsetY };
    }

    getCurrentSourceRect() {
        const frameIndex = this.currentFrameIndex || 0;
        const col = frameIndex % this.framesPerRow;
        const row = Math.floor(frameIndex / this.framesPerRow);

        return {
            sx: this.spriteX + (col * this.frameWidth),
            sy: this.spriteY + (row * this.frameHeight),
            sw: this.frameWidth,
            sh: this.frameHeight
        };
    }

advanceFrame() {
    if (this.frameCount <= 1) {
        return false;
    }

    this.currentFrameIndex++;

    if (this.currentFrameIndex >= this.frameCount) {
        this.currentFrameIndex = 0;
        return true;
    }

    return false;
}
stepFrame(incFrame = false) {
    if (this.frameCount <= 1) {
        return false;
    }

    if (incFrame) {
        this.delayCounter++;

        if (this.delayCounter < this.frameDelay) {
            return false;
        }

        this.delayCounter = 0;
        return this.advanceFrame();
    }

    return false;
}
handleAliveStatus(deltaTime, incFrame = false) {
    super.handleAliveStatus(deltaTime, incFrame);
    this.stepFrame(incFrame);
}

handleDyingStatus(deltaTime, incFrame = false) {
    if (this.frameCount <= 1) {
        this.setIsDead();
        return;
    }

    if (incFrame) {
        this.delayCounter++;

        if (this.delayCounter >= this.frameDelay) {
            this.delayCounter = 0;
            this.currentFrameIndex++;
        }
    }

    if (this.currentFrameIndex >= this.frameCount) {
        this.setIsDead();
    }
}

    handleOtherStatus(deltaTime, incFrame = false) {
        // no-op by default
    }

    handleDeadStatus(deltaTime, incFrame = false) {
        // no-op
    }

    static async loadSprite(spritePath, transparentColor = 'black') {
        return ImageAssetCache.loadTransparentSprite(spritePath, transparentColor);
    }

    static makeTransparent(png, transparentColor) {
        return ImageAssetCache.makeTransparent(png, transparentColor);
    }

    drawAllFramesPreview(previewX = 10, previewY = 10, scale = 2, padding = 4) {
        PngRenderer.drawAllFramesPreview(this, previewX, previewY, scale, padding);
    }

    drawSheetPreview(previewX = 10, previewY = 150, scale = 1) {
        PngRenderer.drawSheetPreview(this, previewX, previewY, scale);
    }

    draw(offsetX = 0, offsetY = 0) {
        try {
            PngRenderer.draw(this, offsetX, offsetY);
        } catch (error) {
            console.error('Draw error:', error);
        }
    }

    destroy() {
        if (this.isDestroyed) {
            ObjectDebug.warn(ObjectPNG.DEBUG, 'ObjectPNG already destroyed');
            return false;
        }

        ObjectDebug.log(ObjectPNG.DEBUG, `Destroying ${SystemUtils.getObjectType(this)}`, {
            position: { x: this.x, y: this.y },
            sprite: {
                path: this.spritePath,
                loaded: this.isLoaded,
                pixelSize: this.pixelSize,
                spriteX: this.spriteX,
                spriteY: this.spriteY
            }
        });

        if (this.png) {
            this.png.onload = null;
            this.png.onerror = null;
        }

        this.destroyProperties([
            'png',
            'isLoaded',
            'loadError',
            'spritePath',
            'spriteX',
            'spriteY',
            'frameWidth',
            'frameHeight',
            'pixelSize',
            'transparentColor',
            'boundWidth',
            'boundHeight',
            'flip',
            'rotation',
            'frameCount',
            'framesPerRow',
            'frameDelay',
            'frameOffsets'
        ]);

        return super.destroy();
    }
}

export default ObjectPNG;
