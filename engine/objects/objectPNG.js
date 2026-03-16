// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectPNG.js

import ObjectKillable from './objectKillable.js';
import SystemUtils from '../utils/systemUtils.js';
import AngleUtils from '../math/angleUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import DebugLog from '../utils/debugLog.js';
import DebugFlag from '../utils/debugFlag.js';
import ObjectDestroyUtils from './objectDestroyUtils.js';
import PngRenderer from '../renderers/pngRenderer.js';
import ImageAssetCache from '../utils/imageAssetCache.js';
import PngAssetState from '../utils/pngAssetState.js';
import PngController from '../animation/pngController.js';
import StateUtils from '../animation/stateUtils.js';
import AnimationStateBridge from '../animation/animationStateBridge.js';
import NumberUtils from '../math/numberUtils.js';

class ObjectPNG extends ObjectKillable {
    static DEBUG = DebugFlag.has('objectPNG');

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
        NumberUtils.finiteNumber(spriteX, 'spriteX');
        NumberUtils.finiteNumber(spriteY, 'spriteY');
        NumberUtils.positiveNumber(frameWidth, 'frameWidth');
        NumberUtils.positiveNumber(frameHeight, 'frameHeight');
        NumberUtils.positiveNumber(pixelSize, 'pixelSize');
        NumberUtils.finiteNumber(velocityX, 'velocityX');
        NumberUtils.finiteNumber(velocityY, 'velocityY');
        NumberUtils.positiveNumber(frameCount, 'frameCount');
        NumberUtils.positiveNumber(framesPerRow, 'framesPerRow');
        NumberUtils.positiveNumber(frameDelay, 'frameDelay');

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

        this.assetState = new PngAssetState();
        this.assetState.applyTo(this);

        this.frameOffsets = Array.isArray(frameOffsets) ? frameOffsets : null;
        this.animation = new PngController(this.frameCount, this.framesPerRow, this.frameDelay);
        AnimationStateBridge.installMirroredCounters(this);

        ObjectPNG.loadSprite(spritePath, transparentColor)
            .then((png) => {
                if (this.isDestroyed || !this.assetState) {
                    return;
                }

                this.assetState.setLoaded(png);
                this.assetState.applyTo(this);

                DebugLog.log(ObjectPNG.DEBUG, null, 'Loaded PNG sprite', {
                    path: spritePath,
                    imageWidth: png.width,
                    imageHeight: png.height,
                    frameWidth: this.frameWidth,
                    frameHeight: this.frameHeight
                });
            })
            .catch((error) => {
                if (this.isDestroyed || !this.assetState) {
                    return;
                }

                this.assetState.setError(error);
                this.assetState.applyTo(this);
                DebugLog.error('ObjectPNG', `Failed to load sprite: ${spritePath}`, error);
            });
    }

    setFlip(flipType = ObjectPNG.Flip.NONE) {
        ObjectValidation.nonEmptyString(flipType, 'flipType');

        const normalized = flipType.toLowerCase();
        ObjectValidation.oneOf(normalized, 'flipType', Object.values(ObjectPNG.Flip));

        this.flip = normalized;
    }

    setRotation(rotationDegrees = 0) {
        NumberUtils.finiteNumber(rotationDegrees, 'rotationDegrees');
        this.rotation = AngleUtils.toRadians(rotationDegrees);
    }

    setFrame(frameIndex = 0) {
        this.animation.setFrame(frameIndex);
        AnimationStateBridge.syncFromAnimation(this, this.animation);
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
        const offsetX = NumberUtils.isFiniteNumber(offset?.x) ? offset.x : 0;
        const offsetY = NumberUtils.isFiniteNumber(offset?.y) ? offset.y : 0;

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
        AnimationStateBridge.syncFromAnimation(this, this.animation);
        return advanced;
    }

    stepFrame(incFrame = false) {
        const stepped = this.animation.stepFrame(incFrame);
        AnimationStateBridge.syncFromAnimation(this, this.animation);
        return stepped;
    }

    handleAliveStatus(deltaTime, incFrame = false) {
        super.handleAliveStatus(deltaTime, incFrame);
        this.stepFrame(incFrame);
    }

    handleDyingStatus(deltaTime, incFrame = false) {
        const finished = this.animation.stepDyingFrame(incFrame);
        AnimationStateBridge.syncFromAnimation(this, this.animation);

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
            DebugLog.error('ObjectPNG', 'Draw error:', error);
        }
    }

    destroy() {
        if (ObjectDestroyUtils.shouldSkipDestroy(this, ObjectPNG.DEBUG, 'ObjectPNG')) {
            return false;
        }

        DebugLog.log(ObjectPNG.DEBUG, null, `Destroying ${SystemUtils.getObjectType(this)}`, {
            position: { x: this.x, y: this.y },
            sprite: {
                path: this.spritePath,
                loaded: this.isLoaded,
                pixelSize: this.pixelSize,
                spriteX: this.spriteX,
                spriteY: this.spriteY
            }
        });

        this.assetState?.destroy(this);

        StateUtils.destroyAnimation(this, [
            'animation',
            'assetState',
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

