// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectSprite.js

import CanvasUtils from './canvas.js';
import Colors from './colors.js';
import ObjectKillable from './objectKillable.js';
import SystemUtils from './utils/systemUtils.js';
import Sprite from './sprite.js';
import ObjectValidation from './utils/objectValidation.js';
import ObjectCleanup from './utils/objectCleanup.js';
import ObjectDebug from './utils/objectDebug.js';

class ObjectSprite extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectSprite');

    constructor(x, y, livingFrames, dyingFrames = [], spritePixelSize = 1) {

        if (!livingFrames) {
            throw new Error("livingFrames must be provided.");
        }

        ObjectValidation.positiveNumber(spritePixelSize, "pixelSize");

        let dimensions = null;
        let livingFrameCount = 0;
        let dyingFrameCount = 0;

        // ---- Determine frame structure ----

        const isSingleFrame =
            Array.isArray(livingFrames) &&
            livingFrames.length > 0 &&
            typeof livingFrames[0] === "string";

        const isMultiFrame =
            Array.isArray(livingFrames) &&
            livingFrames.length > 0 &&
            Array.isArray(livingFrames[0]) &&
            livingFrames[0].length > 0 &&
            typeof livingFrames[0][0] === "string";

        if (isSingleFrame) {

            dimensions = Sprite.getLayerDimensions(livingFrames, spritePixelSize);

            livingFrameCount = 1;
            dyingFrameCount = Array.isArray(dyingFrames) ? dyingFrames.length : 0;

        } else if (isMultiFrame) {

            dimensions = Sprite.getLayerDimensions(livingFrames[0], spritePixelSize);

            livingFrameCount = livingFrames.length;
            dyingFrameCount = Array.isArray(dyingFrames) ? dyingFrames.length : 0;

        } else {

            throw new Error("Invalid sprite frame structure.");

        }

        // ---- Initialize base object ----

        super(x, y, dimensions.width, dimensions.height);

        // ---- Store sprite data ----

        this.pixelSize = spritePixelSize;

        this.livingFrames = livingFrames;
        this.dyingFrames = dyingFrames;

        this.livingFrameCount = livingFrameCount;
        this.dyingFrameCount = dyingFrameCount;

        this.livingFrameIndex = 0;
        this.dyingFrameIndex = 0;

        this.livingDelay = 6;
        this.livingDelayCounter = 0;

        this.spriteColor = "white";
    }

    static getFrameType(object) {
        if (!object) {
            return 'null';
        }

        if (SystemUtils.getObjectType(object) === 'Object') {
            return 'json';
        }

        if (Array.isArray(object) && Array.isArray(object[0]) && Array.isArray(object[0][0])) {
            return 'doubleArray';
        }

        if (Array.isArray(object) && Array.isArray(object[0])) {
            return 'array';
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

    getCurrentLivingFrame() {
        if (this.frameType === 'array') {
            return this.livingFrames;
        }

        return this.livingFrames?.[this.currentFrameIndex] ?? null;
    }

    getCurrentDyingFrame() {
        if (!this.dyingFrames) {
            return null;
        }

        if (this.frameType === 'array') {
            return this.dyingFrames;
        }

        return this.dyingFrames?.[this.currentFrameIndex] ?? null;
    }

    advanceFrame(frameCount) {
        if (!frameCount || frameCount <= 0) {
            return;
        }

        this.currentFrameIndex++;
        if (this.currentFrameIndex >= frameCount) {
            this.currentFrameIndex = 0;
        }
    }

    handleAliveStatus(deltaTime, incFrame = false) {
        super.handleAliveStatus(deltaTime, incFrame);

        if (this.livingFrameCount <= 1) {
            return;
        }

        if (incFrame) {
            this.advanceFrame(this.livingFrameCount);
            this.delayCounter = 0;
            return;
        }

        this.delayCounter++;
        if (this.delayCounter >= this.livingDelay) {
            this.delayCounter = 0;
            this.advanceFrame(this.livingFrameCount);
        }
    }
    
    handleDyingStatus(deltaTime, incFrame = false) {
        super.handleDyingStatus(deltaTime, incFrame);

        if (this.dyingFrameCount <= 0) {
            this.setIsDead();
            return;
        }

        if (incFrame) {
            this.advanceFrame(this.dyingFrameCount, true);
            this.delayCounter = 0;

            if (this.dyingFrameIndex >= this.dyingFrameCount - 1) {
                this.setIsDead();
            }

            return;
        }

        this.delayCounter++;

        if (this.delayCounter >= this.dyingDelay) {
            this.delayCounter = 0;

            if (this.dyingFrameIndex < this.dyingFrameCount - 1) {
                this.dyingFrameIndex++;
            } else {
                this.setIsDead();
            }
        }
    }

    handleOtherStatus(deltaTime, incFrame = false) {
        if (!this.otherFrame) {
            this.setIsDead();
            return;
        }

        this.delayCounter++;
        if (this.delayCounter >= this.otherDelay) {
            this.setIsDead();
        }
    }

    handleDeadStatus(deltaTime, incFrame = false) {
        // Intentionally no-op
    }

    setHit() {
        if (this.dyingFrames && this.dyingFrameCount > 0) {
            this.setIsDying();
        } else if (this.otherFrame) {
            this.setIsOther();
        } else {
            this.setIsDead();
        }
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

    setOtherFrame(otherDelay, otherFrame) {
        ObjectValidation.finiteNumber(otherDelay, 'otherDelay');
        if (otherDelay < 0) {
            throw new Error('otherDelay must be 0 or greater.');
        }

        this.otherDelay = otherDelay;
        this.otherFrame = otherFrame;
    }

    draw(offsetX = 0, offsetY = 0) {
        if (this.isDead() || this.isDestroyed) {
            return;
        }

        if (this.frameType === 'json') {
            this.drawRGB(offsetX, offsetY);
            return;
        }

        const newX = this.x + offsetX;
        const newY = this.y + offsetY;

        try {
            if (this.isAlive()) {
                const frame = this.getCurrentLivingFrame();
                if (frame) {
                    CanvasUtils.drawSprite(newX, newY, frame, this.pixelSize, this.spriteColor);
                }
                return;
            }

            if (this.isDying()) {
                const frame = this.getCurrentDyingFrame();
                if (frame) {
                    CanvasUtils.drawSprite(newX, newY, frame, this.pixelSize, this.spriteColor);
                }
                return;
            }

            if (this.isOther() && this.otherFrame) {
                CanvasUtils.drawSprite(newX, newY, this.otherFrame, this.pixelSize, this.spriteColor);
            }
        } catch (error) {
            console.error('Error drawing ObjectSprite:', error.message);
            console.error(error.stack);
            console.log('Object state:', this);
        }
    }

    drawRGB(offsetX = 0, offsetY = 0) {
        if (this.isDead() || this.isDestroyed) {
            return;
        }

        const newX = this.x + offsetX;
        const newY = this.y + offsetY;

        try {
            if (this.isAlive()) {
                const frame = this.getCurrentLivingFrame();
                if (frame) {
                    CanvasUtils.drawSpriteRGB(newX, newY, frame, this.pixelSize);
                }
                return;
            }

            if (this.isDying()) {
                const frame = this.getCurrentDyingFrame();
                if (frame) {
                    CanvasUtils.drawSpriteRGB(newX, newY, frame, this.pixelSize);
                }
                return;
            }

            if (this.isOther() && this.otherFrame) {
                CanvasUtils.drawSpriteRGB(newX, newY, this.otherFrame, this.pixelSize);
            }
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

        ObjectCleanup.cleanupAndNullifyArray(this, 'livingFrames');
        ObjectCleanup.cleanupAndNullifyArray(this, 'dyingFrames');

        this.destroyProperties([
            'frameType',
            'pixelSize',
            'livingDelay',
            'livingFrameCount',
            'dyingDelay',
            'dyingFrameCount',
            'otherDelay',
            'otherFrame',
            'spriteColor'
        ]);

        return super.destroy();
    }
}

export default ObjectSprite;
