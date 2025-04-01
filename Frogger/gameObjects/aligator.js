// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// frog.js

import ObjectPNG from '../../scripts/objectPNG.js';
import CanvasUtils from '../../scripts/canvas.js';

class GameObject extends ObjectPNG {
    static DEBUG = new URLSearchParams(window.location.search).has('gameObject');

    constructor(x, y, 
        spritePath, 
        spriteX, spriteY,
        spriteWidth, spriteHeight,
        pixelSize,
        transparentColor,
        gameObjectType) {

        // Call parent constructor with sprite details
        super(x, y, 
            spritePath, 
            spriteX, spriteY,
            spriteWidth, spriteHeight,
            pixelSize,
            transparentColor
            );

        // GameObject properties
        this.type = 'gameObject';
        this.gameObjectType = gameObjectType;  // 'car', 'truck', 'bulldozer', etc.
        this.isActive = true;            // Flag for active/inactive state

    }

    draw() {
        super.draw();
    }
    
}
export default GameObject;
