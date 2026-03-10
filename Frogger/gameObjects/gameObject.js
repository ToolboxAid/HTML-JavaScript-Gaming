// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// gameObject.js

import ObjectPNG from '../../scripts/objectPNG.js';

class GameObject extends ObjectPNG {
    static DEBUG = new URLSearchParams(window.location.search).has('gameObject');

    constructor(
        x, y,
        spritePath,
        spriteX, spriteY,
        spriteWidth, spriteHeight,
        pixelSize,
        transparentColor,
        gameObjectType,
        velocityX = 0, velocityY = 0,
        frameCount = 1,
        framesPerRow = 1,
        frameDelay = 6,
        frameOffsets = null
    ) {
        super(
            x, y,
            spritePath,
            spriteX, spriteY,
            spriteWidth, spriteHeight,
            pixelSize,
            transparentColor,
            velocityX, velocityY,
            frameCount,
            framesPerRow,
            frameDelay,
            frameOffsets
        );

        this.type = gameObjectType;

        if (GameObject.DEBUG) {
            console.log('GameObject created:', {
                id: this.ID,
                type: this.type,
                position: { x: this.x, y: this.y },
                sprite: {
                    path: this.spritePath,
                    spriteX: this.spriteX,
                    spriteY: this.spriteY,
                    frameWidth: this.frameWidth,
                    frameHeight: this.frameHeight,
                    frameCount: this.frameCount,
                    framesPerRow: this.framesPerRow,
                    frameDelay: this.frameDelay,
                    pixelSize: this.pixelSize
                }
            });
        }
    }

    destroy() {
        if (GameObject.DEBUG) {
            console.log('Destroying GameObject', {
                id: this.ID,
                type: this.type,
                position: { x: this.x, y: this.y },
                sprite: { path: this.spritePath }
            });
        }

        if (this.type === null) {
            if (GameObject.DEBUG) {
                console.warn('GameObject already destroyed');
            }
            return false;
        }

        const finalState = {
            id: this.ID,
            type: this.type,
            position: { x: this.x, y: this.y }
        };

        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent ObjectPNG destruction failed:', {
                type: this.type,
                id: this.ID
            });
            return false;
        }

        this.type = null;

        if (GameObject.DEBUG) {
            console.log('Successfully destroyed GameObject', finalState);
        }

        return true;
    }
}

export default GameObject;