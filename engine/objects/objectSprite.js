// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectSprite.js

import Colors from '../../engine/colors.js';
import ObjectKillable from './objectKillable.js';
import ObjectValidation from '../utils/objectValidation.js';
import ObjectCleanup from '../utils/objectCleanup.js';
import ObjectDebug from '../utils/objectDebug.js';
import SpriteRenderer from '../renderers/spriteRenderer.js';
import SpriteController from '../animation/spriteController.js';
import StateUtils from '../animation/stateUtils.js';
import ObjectSpriteFrameConfig from './objectSpriteFrameConfig.js';

class ObjectSprite extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectSprite');

constructor(x = 0, y = 0, livingFrames, dyingFrames = null, pixelSize = 1, palette = null) {
    const frameConfig = ObjectSpriteFrameConfig.create(
        livingFrames,
        dyingFrames,
        pixelSize,
        palette
    );

    super(x, y, frameConfig.dimensions.width, frameConfig.dimensions.height);

    this.frameType = frameConfig.frameType;
    this.pixelSize = frameConfig.pixelSize;

    this.animation = new SpriteController({
        livingFrames: frameConfig.livingFrames,
        dyingFrames: frameConfig.dyingFrames,
        livingDelay: frameConfig.livingDelay,
        dyingDelay: frameConfig.dyingDelay
    });

    this.livingDelay = frameConfig.livingDelay;
    this.livingFrames = frameConfig.livingFrames;
    this.livingFrameCount = frameConfig.livingFrameCount;

    this.dyingDelay = frameConfig.dyingDelay;
    this.dyingFrames = frameConfig.dyingFrames;
    this.dyingFrameCount = frameConfig.dyingFrameCount;

    this.spriteColor = 'white';
}

getCurrentLivingFrame() {
    return this.animation.getCurrentLivingFrame(this.currentFrameIndex);
}

getCurrentDyingFrame() {
    return this.animation.getCurrentDyingFrame(this.currentFrameIndex);
}

advanceFrame(frameCount) {
    const result = this.animation.advanceFrame(this.currentFrameIndex, frameCount);
    StateUtils.syncToObject(this, {
        currentFrameIndex: result.currentFrameIndex,
        delayCounter: this.delayCounter
    });
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
    StateUtils.syncToObject(this, result);
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
    StateUtils.syncToObject(this, result);
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

        StateUtils.destroyAnimation(this, ['animation']);

        ObjectCleanup.cleanupAndNullifyArray(this, 'livingFrames');
        ObjectCleanup.cleanupAndNullifyArray(this, 'dyingFrames');

        this.destroyProperties([
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
