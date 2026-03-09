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

    constructor(x = 0, y = 0, livingFrames, dyingFrames = null, pixelSize = 1, palette = null) {
        if (!livingFrames || (Array.isArray(livingFrames) && livingFrames.length === 0)) {
            throw new Error('livingFrames must be provided.');
        }

        let frameType = ObjectSprite.getFrameType(livingFrames);
        let spritePixelSize = pixelSize;
        let dimensions = null;

        let normalizedLivingFrames = livingFrames;
        let normalizedDyingFrames = dyingFrames;

        let livingDelay = 30;
        let dyingDelay = 7;

        let livingFrameCount = 0;
        let dyingFrameCount = 0;

        switch (frameType) {
            case 'json': {
                Sprite.validateJsonFormat(livingFrames);

                spritePixelSize = livingFrames.metadata.spritePixelSize;
                dimensions = Sprite.getLayerDimensions(livingFrames, spritePixelSize);

                livingFrameCount = livingFrames.layers.length;
                livingDelay = livingFrames.metadata.framesPerSprite ?? 30;

                let paletteArray = null;
                if (palette) {
                    paletteArray = ObjectSprite.extractArray(palette);
                }

                normalizedLivingFrames = Sprite.convert2RGB(livingFrames, paletteArray);

                if (dyingFrames) {
                    Sprite.validateJsonFormat(dyingFrames);
                    dyingDelay = dyingFrames.metadata.framesPerSprite ?? 7;
                    normalizedDyingFrames = Sprite.convert2RGB(dyingFrames, paletteArray);
                    dyingFrameCount = dyingFrames.layers.length;
                }
                break;
            }

            case 'array': {
                ObjectValidation.positiveNumber(spritePixelSize, 'pixelSize');
                //dimensions = Sprite.getWidthHeight(livingFrames, spritePixelSize);
                dimensions = Sprite.getLayerDimensions(frame, pixelSize);
                livingFrameCount = 1;

                if (dyingFrames) {
                    dyingFrameCount = 1;
                }
                break;
            }

            case 'doubleArray': {
                ObjectValidation.positiveNumber(spritePixelSize, 'pixelSize');
                //dimensions = Sprite.getWidthHeight(livingFrames[0], spritePixelSize);
                dimensions = Sprite.getLayerDimensions(frame, pixelSize);
                livingFrameCount = livingFrames.length;

                if (dyingFrames) {
                    dyingFrameCount = Array.isArray(dyingFrames) ? dyingFrames.length : 0;
                }
                break;
            }

            default:
                throw new Error(`Unsupported frame type: ${frameType}`);
        }

        super(x, y, dimensions.width, dimensions.height);

        this.frameType = frameType;
        this.pixelSize = spritePixelSize;

        this.livingDelay = livingDelay;
        this.livingFrames = normalizedLivingFrames;
        this.livingFrameCount = livingFrameCount;

        this.dyingDelay = dyingDelay;
        this.dyingFrames = normalizedDyingFrames;
        this.dyingFrameCount = dyingFrameCount;

        this.otherDelay = 0;
        this.otherFrame = null;

        this.spriteColor = 'white';
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
        super.update(deltaTime);

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
        if (!this.dyingFrames || this.dyingFrameCount <= 0) {
            this.setIsDead();
            return;
        }

        if (incFrame) {
            this.currentFrameIndex++;
        } else {
            this.delayCounter++;
            if (this.delayCounter >= this.dyingDelay) {
                this.delayCounter = 0;
                this.currentFrameIndex++;
            }
        }

        if (this.currentFrameIndex >= this.dyingFrameCount) {
            if (this.otherFrame) {
                this.setIsOther();
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
