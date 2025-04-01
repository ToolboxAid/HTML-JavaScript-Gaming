// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// frog.js

import ObjectPNG from '../../scripts/objectPNG.js';
import SystemUtils from '../../scripts/utils/systemUtils.js';

class GameObject extends ObjectPNG {
    static DEBUG = new URLSearchParams(window.location.search).has('gameObject');

    constructor(x, y,
        spritePath,
        spriteX, spriteY,
        spriteWidth, spriteHeight,
        pixelSize,
        transparentColor,
        gameObjectType,
        velocityX, velocityY
    ) {
        // Call parent constructor with sprite details
        super(x, y,
            spritePath,
            spriteX, spriteY,
            spriteWidth, spriteHeight,
            pixelSize,
            transparentColor,
            velocityX, velocityY,
        );

        // GameObject properties
        this.type = 'gameObject';
        this.gameObjectType = gameObjectType;  // 'car', 'truck', 'bulldozer', etc.
        this.isActive = true;            // Flag for active/inactive state

        if (GameObject.DEBUG) {
            console.log(`GameObject created: ${JSON.stringify(this)}`            );
        }
    }

    draw() {
        super.draw();
    }

}
export default GameObject;
