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
        velocityX, velocityY
    ) {
        super(
            x, y,
            spritePath,
            spriteX, spriteY,
            spriteWidth, spriteHeight,
            pixelSize,
            transparentColor,
            velocityX, velocityY
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