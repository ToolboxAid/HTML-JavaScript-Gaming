// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// frog.js

import objectPNG from '../scripts/objectPNG.js';
import CanvasUtils from '../scripts/canvas.js';

class Vehicle extends objectPNG {
    static DEBUG = new URLSearchParams(window.location.search).has('vehicle');

    constructor(x, y, 
        spritePath, 
        spriteX, spriteY,
        spriteWidth, spriteHeight,
        pixelSize,
        transparentColor,
        vehicleType, direction, speed) {

        // Call parent constructor with sprite details
        super(x, y, 
            spritePath, 
            spriteX, spriteY,
            spriteWidth, spriteHeight,
            pixelSize,
            transparentColor
            );

        // Vehicle properties
        this.type = 'vehicle';
        this.vehicleType = vehicleType;  // 'car', 'truck', 'bulldozer', etc.
        this.direction = direction;       // 1 for right, -1 for left
        this.speed = speed;              // Pixels per frame
        this.isActive = true;            // Flag for active/inactive state

        if (Vehicle.DEBUG) {
            console.log(`Vehicle created: ${this.vehicleType} at (${x},${y}) moving ${direction > 0 ? 'right' : 'left'} at ${speed}px/frame`);
        }
    }

    draw() {
        super.draw();
    }
    
}
export default Vehicle;
