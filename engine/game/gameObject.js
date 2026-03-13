// ToolboxAid.com
// David Quesenberry
// Global Game Object
// 03/2026

import ObjectPNG from '../objects/objectPNG.js';
import GameObjectUtils from './gameObjectUtils.js';
import ObjectDebug from '../utils/objectDebug.js';

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
        GameObjectUtils.validateConstructorArgs({
            x,
            y,
            imagePath,
            spriteWidth,
            spriteHeight,
            type,
            debug
        });

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

        GameObjectUtils.initializeMetadata(this, { type, debug });

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
        GameObjectUtils.destroyMetadata(this);

        ObjectDebug.log(this.debug, 'GameObject destroyed', {
            id: this.ID
        });

        return true;
    }
}

export default GameObject;
