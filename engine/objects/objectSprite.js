// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectSprite.js

import Colors from '../../engine/colors.js';
import ObjectKillable from './objectKillable.js';
import SystemUtils from '../utils/systemUtils.js';
import Sprite from '../sprite.js';
import ObjectValidation from '../utils/objectValidation.js';
import ObjectCleanup from '../utils/objectCleanup.js';
import ObjectDebug from '../utils/objectDebug.js';
import SpriteRenderer from '../renderers/spriteRenderer.js';
import SpriteAnimationController from '../animation/spriteAnimationController.js';

class ObjectSprite extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectSprite');

constructor(x = 0, y = 0, livingFrames, dyingFrames = null, pixelSize = 1, palette = null) {

    if (!livingFrames || (Array.isArray(livingFrames) && livingFrames.length === 0)) {
        throw new Error('livingFrames must be provided.');
    }

    let frameType = ObjectSprite.getFrameType(livingFrames);
    let spritePixelSize = pixelSize;
    let dimensions = null;

    let normalizedLivingFrames = null;
    let normalizedDyingFrames = null;

    let livingDelay = 30;
    let dyingDelay = 7;

    let livingFrameCount = 0;
    let dyingFrameCount = 0;

    switch (frameType) {

        case 'json': {
            Sprite.validateJsonFormat(livingFrames);

            spritePixelSize = livingFrames.metadata.spritePixelSize;
            livingDelay = livingFrames.metadata.framesPerSprite ?? 30;

            let paletteArray = null;
            if (palette) {
                paletteArray = ObjectSprite.extractArray(palette);
            }

            normalizedLivingFrames = Sprite.convert2RGB(livingFrames, paletteArray);
            dimensions = Sprite.getLayerDimensions(normalizedLivingFrames[0], spritePixelSize);
            livingFrameCount = normalizedLivingFrames.length;

            if (dyingFrames) {
                Sprite.validateJsonFormat(dyingFrames);

                dyingDelay = dyingFrames.metadata.framesPerSprite ?? 7;
                normalizedDyingFrames = Sprite.convert2RGB(dyingFrames, paletteArray);
                dyingFrameCount = normalizedDyingFrames.length;
            } else {
                normalizedDyingFrames = null;
                dyingFrameCount = 0;
            }

            break;
        }

        case 'singleFrame': {
            ObjectValidation.positiveNumber(spritePixelSize, 'pixelSize');

            normalizedLivingFrames = ObjectSprite.normalizeFrames(livingFrames, frameType);
            dimensions = Sprite.getLayerDimensions(normalizedLivingFrames[0], spritePixelSize);
            livingFrameCount = normalizedLivingFrames.length;

            if (dyingFrames) {
                const dyingFrameType = ObjectSprite.getFrameType(dyingFrames);
                normalizedDyingFrames = ObjectSprite.normalizeFrames(dyingFrames, dyingFrameType);
                dyingFrameCount = normalizedDyingFrames.length;
            } else {
                normalizedDyingFrames = null;
                dyingFrameCount = 0;
            }

            break;
        }

        case 'multiFrame': {
            ObjectValidation.positiveNumber(spritePixelSize, 'pixelSize');

            normalizedLivingFrames = ObjectSprite.normalizeFrames(livingFrames, frameType);
            dimensions = Sprite.getLayerDimensions(normalizedLivingFrames[0], spritePixelSize);
            livingFrameCount = normalizedLivingFrames.length;

            if (dyingFrames) {
                const dyingFrameType = ObjectSprite.getFrameType(dyingFrames);
                normalizedDyingFrames = ObjectSprite.normalizeFrames(dyingFrames, dyingFrameType);
                dyingFrameCount = normalizedDyingFrames.length;
            } else {
                normalizedDyingFrames = null;
                dyingFrameCount = 0;
            }

            break;
        }

        default:
            throw new Error(`Unsupported frame type: ${frameType}`);
    }

    super(x, y, dimensions.width, dimensions.height);

    this.frameType = frameType;
    this.pixelSize = spritePixelSize;

    this.animation = new SpriteAnimationController({
        livingFrames: normalizedLivingFrames,
        dyingFrames: normalizedDyingFrames,
        livingDelay,
        dyingDelay
    });

    this.livingDelay = livingDelay;
    this.livingFrames = normalizedLivingFrames;
    this.livingFrameCount = livingFrameCount;

    this.dyingDelay = dyingDelay;
    this.dyingFrames = normalizedDyingFrames;
    this.dyingFrameCount = dyingFrameCount;

    this.spriteColor = 'white';
}

static getFrameType(object) {
    if (!object) {
        return 'null';
    }

    if (SystemUtils.getObjectType(object) === 'Object') {
        return 'json';
    }

    // Single frame:
    // [
    //   "00100",
    //   "01110"
    // ]
    if (
        Array.isArray(object) &&
        object.length > 0 &&
        typeof object[0] === 'string'
    ) {
        return 'singleFrame';
    }

    // Multi frame:
    // [
    //   ["00100", "01110"],
    //   ["00000", "00100"]
    // ]
    if (
        Array.isArray(object) &&
        object.length > 0 &&
        Array.isArray(object[0]) &&
        object[0].length > 0 &&
        typeof object[0][0] === 'string'
    ) {
        return 'multiFrame';
    }

    if (SystemUtils.getObjectType(object) === 'String') {
        return 'string';
    }

    return 'unknown';
}

    static extractArray(obj) {
        for (const value of Object.values(obj)) {
            if (Array.isArray(value)) {
                return value;
            }
        }

        throw new Error('No array found in the object.');
    }
static normalizeFrames(frames, frameType) {
    if (!frames) {
        return null;
    }

    if (frameType === 'json') {
        return frames;
    }

    if (frameType === 'singleFrame') {
        return [frames];
    }

    if (frameType === 'multiFrame') {
        return frames;
    }

    throw new Error(`Unsupported frame type for normalization: ${frameType}`);
}

getCurrentLivingFrame() {
    return this.animation.getCurrentLivingFrame(this.currentFrameIndex);
}

getCurrentDyingFrame() {
    return this.animation.getCurrentDyingFrame(this.currentFrameIndex);
}

advanceFrame(frameCount) {
    const result = this.animation.advanceFrame(this.currentFrameIndex, frameCount);
    this.currentFrameIndex = result.currentFrameIndex;
    return result.looped;
}
stepLoopingFrame(frameCount, frameDelay, incFrame = false) {
    const result = this.animation.stepLoopingFrame(
        this.currentFrameIndex,
        this.delayCounter,
        frameCount,
        frameDelay,
        incFrame
    );
    this.currentFrameIndex = result.currentFrameIndex;
    this.delayCounter = result.delayCounter;
    return result.looped;
}
stepFinalFrame(frameCount, frameDelay, incFrame = false) {
    const result = this.animation.stepFinalFrame(
        this.currentFrameIndex,
        this.delayCounter,
        frameCount,
        frameDelay,
        incFrame
    );
    this.currentFrameIndex = result.currentFrameIndex;
    this.delayCounter = result.delayCounter;
    return result.finished;
}
handleAliveStatus(deltaTime, incFrame = false) {
    super.handleAliveStatus(deltaTime, incFrame);

    if (this.livingFrameCount <= 1) {
        return;
    }

    this.stepLoopingFrame(this.livingFrameCount, this.livingDelay, incFrame);
}

handleDyingStatus(deltaTime, incFrame = false) {
    if (!this.dyingFrames || this.dyingFrameCount <= 0) {
        this.setIsDead();
        return;
    }

    const finished = this.stepFinalFrame(this.dyingFrameCount, this.dyingDelay, incFrame);

    if (finished) {
        this.setIsDead();
    }
}

setHit() {
    this.currentFrameIndex = 0;
    this.delayCounter = 0;

    if (this.dyingFrames && this.dyingFrameCount > 0) {
        this.setIsDying();
    } else {
        this.setIsDead();
    }
}

    handleDeadStatus(deltaTime, incFrame = false) {
        // Intentionally no-op
    }

    setSpriteColor(spriteColor) {
        ObjectValidation.nonEmptyString(spriteColor, 'spriteColor');

        if (this.frameType === 'json') {
            ObjectDebug.warn(ObjectSprite.DEBUG, 'setSpriteColor is not used for json/RGB sprite data.');
            return;
        }

        const isValidSymbol = Colors.isValidSymbol(spriteColor);
        const isHexColor = Colors.isValidHexColor(spriteColor);

        if (isValidSymbol || isHexColor) {
            this.spriteColor = spriteColor;
            return;
        }

        ObjectDebug.warn(ObjectSprite.DEBUG, `Invalid sprite color: ${spriteColor}`);
        this.spriteColor = Colors.getRandomColor();
    }

    draw(offsetX = 0, offsetY = 0) {
        try {
            SpriteRenderer.draw(this, offsetX, offsetY);
        } catch (error) {
            console.error('Error drawing ObjectSprite:', error.message);
            console.error(error.stack);
            console.log('Object state:', this);
        }
    }

    drawRGB(offsetX = 0, offsetY = 0) {
        try {
            const newX = this.x + offsetX;
            const newY = this.y + offsetY;
            SpriteRenderer.drawRGB(this, newX, newY);
        } catch (error) {
            console.error('Error drawing RGB sprite:', error.message);
            console.error(error.stack);
            console.log('Object state:', this);
        }
    }

    destroy() {
        if (this.isDestroyed) {
            return false;
        }

        if (this.animation) {
            this.animation.destroy();
        }

        ObjectCleanup.cleanupAndNullifyArray(this, 'livingFrames');
        ObjectCleanup.cleanupAndNullifyArray(this, 'dyingFrames');

        this.destroyProperties([
            'animation',
            'frameType',
            'pixelSize',
            'livingDelay',
            'livingFrameCount',
            'dyingDelay',
            'dyingFrameCount',
            'spriteColor'
        ]);

        return super.destroy();
    }
}

export default ObjectSprite;
