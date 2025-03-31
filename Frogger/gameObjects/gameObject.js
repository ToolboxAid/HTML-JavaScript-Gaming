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
        gameObjectType, direction, speed) {

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
        this.direction = direction;       // 1 for right, -1 for left
        this.speed = speed;              // Pixels per frame
        this.isActive = true;            // Flag for active/inactive state

        if (GameObject.DEBUG) {
            console.log(`GameObject created: ${this.gameObjectType} at (${x},${y}) moving ${direction > 0 ? 'right' : 'left'} at ${speed}px/frame`);
        }
    }

    draw() {
        super.draw();
    }
    
}
export default GameObject;
