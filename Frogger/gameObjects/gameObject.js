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
        gameObjectType, direction, speed,
    
        velocityX, velocityY ) {

        if (isNaN(direction)) {
            direction = 15;
            SystemUtils.showStackTrace("invalid direction");
        }
        // Call parent constructor with sprite details
        super(x, y,
            spritePath,
            spriteX, spriteY,
            spriteWidth, spriteHeight,
            pixelSize,
            transparentColor,
            
        velocityX, velocityY 
        );

        // GameObject properties
        this.type = 'gameObject';
        this.gameObjectType = gameObjectType;  // 'car', 'truck', 'bulldozer', etc.
        this.direction = direction;       // 1 for right, -1 for left
        this.speed = speed;              // Pixels per frame
        this.isActive = true;            // Flag for active/inactive state

        if (GameObject.DEBUG) {
            console.log(`GameObject created: ${JSON.stringify(this)}  objectType ${this.gameObjectType} 
                at (${x},${y}) moving ${direction}
                at ${speed}px/frame`);
        }
    }

    draw() {
        // if (SystemUtils.getObjectType(this) === "Snake"){
        // console.log("gameObject draw");
        // }
        super.draw();
    }

}
export default GameObject;
