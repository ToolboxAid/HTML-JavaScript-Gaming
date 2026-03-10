// ToolboxAid.com
// David Quesenberry
// Global Game Object
// 03/2026

import ObjectPNG from './objectPNG.js';
import ObjectDebug from './utils/objectDebug.js';
import ObjectValidation from './utils/objectValidation.js';

class GameObject extends ObjectPNG {

    constructor(
        x,
        y,
        imagePath,
        spriteX,
        spriteY,
        spriteWidth,
        spriteHeight,
        pixelSize,
        transparentColor,
        type,
        velocityX = 0,
        velocityY = 0,
        frameCount = 1,
        framesPerRow = 1,
        frameDelay = 6,
        frameOffsets = null,
        debug = false
    ) {

        ObjectValidation.finiteNumber(x, 'x');
        ObjectValidation.finiteNumber(y, 'y');
        ObjectValidation.nonEmptyString(imagePath, 'imagePath');
        ObjectValidation.positiveNumber(spriteWidth, 'spriteWidth');
        ObjectValidation.positiveNumber(spriteHeight, 'spriteHeight');
        ObjectValidation.nonEmptyString(type, 'type');
        ObjectValidation.boolean(debug, 'debug');

        super(
            x,
            y,
            imagePath,
            spriteX,
            spriteY,
            spriteWidth,
            spriteHeight,
            pixelSize,
            transparentColor,
            velocityX,
            velocityY,
            frameCount,
            framesPerRow,
            frameDelay,
            frameOffsets
        );

        this.type = type;
        this.debug = debug;
        this.isDestroyed = false;

        ObjectDebug.log(this.debug, 'GameObject created', {
            id: this.ID,
            type: this.type,
            x: this.x,
            y: this.y
        });
    }

    destroy() {

        if (this.isDestroyed) {
            ObjectDebug.warn(this.debug, 'GameObject already destroyed', {
                id: this.ID,
                type: this.type
            });
            return false;
        }

        const parentDestroyed = super.destroy();

        if (!parentDestroyed) {
            ObjectDebug.error(this.debug, 'Parent destroy failed', {
                id: this.ID
            });
            return false;
        }

        this.isDestroyed = true;
        this.type = null;

        ObjectDebug.log(this.debug, 'GameObject destroyed', {
            id: this.ID
        });

        return true;
    }
}

export default GameObject;