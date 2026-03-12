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
import PngAnimationController from '../animation/pngAnimationController.js';

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
        this.animation = new PngAnimationController(this.frameCount, this.framesPerRow, this.frameDelay);

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

    get currentFrameIndex() {
        return this.animation?.currentFrameIndex ?? super.currentFrameIndex;
    }

    set currentFrameIndex(value) {
        if (this.animation) {
            this.animation.currentFrameIndex = value;
        }

        super.currentFrameIndex = value;
    }

    get delayCounter() {
        return this.animation?.delayCounter ?? super.delayCounter;
    }

    set delayCounter(value) {
        if (this.animation) {
            this.animation.delayCounter = value;
        }

        super.delayCounter = value;
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
        this.animation.setFrame(frameIndex);
        this.currentFrameIndex = this.animation.currentFrameIndex;
        this.delayCounter = this.animation.delayCounter;
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
        return this.animation.getCurrentSourceRect(
            this.spriteX,
            this.spriteY,
            this.frameWidth,
            this.frameHeight
        );
    }

    advanceFrame() {
        const advanced = this.animation.advanceFrame();
        this.currentFrameIndex = this.animation.currentFrameIndex;
        this.delayCounter = this.animation.delayCounter;
        return advanced;
    }

    stepFrame(incFrame = false) {
        const stepped = this.animation.stepFrame(incFrame);
        this.currentFrameIndex = this.animation.currentFrameIndex;
        this.delayCounter = this.animation.delayCounter;
        return stepped;
    }

    handleAliveStatus(deltaTime, incFrame = false) {
        super.handleAliveStatus(deltaTime, incFrame);
        this.stepFrame(incFrame);
    }

    handleDyingStatus(deltaTime, incFrame = false) {
        const finished = this.animation.stepDyingFrame(incFrame);
        this.currentFrameIndex = this.animation.currentFrameIndex;
        this.delayCounter = this.animation.delayCounter;

        if (finished) {
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

        if (this.animation) {
            this.animation.destroy();
        }

        this.destroyProperties([
            'animation',
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
