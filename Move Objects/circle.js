// ToolboxAid.com
// David Quesenberry
// circle.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import ObjectDynamic from '../scripts/objectDynamic.js'; // Import ObjectDynamic
import CanvasUtils from '../scripts/canvas.js';

import RandomUtils from '../scripts/math/randomUtils.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
/**
 * Represents a dynamic circle object in a game.
 */
class Circle extends ObjectDynamic {
    /** Creates an instance of Circle.
     * 
     */
    constructor(canvasConfig) {
        const radius = 25;
        const velocityX = RandomUtils.randomRange(150.0, 350.0);
        const velocityY = RandomUtils.randomRange(150.0, 350.0);

        // Call ObjectDynamic constructor, passing the radius as both width and height
        super(100, 100, radius, radius, velocityX, velocityY);
        this.canvasWidth = canvasConfig.width;
        this.canvasHeight = canvasConfig.height;
        this.radius = radius;
    }

    update(deltaTime) {
        // if (!deltaTime){
        //     throw new Error("deltaTime");
        // }
        super.update(deltaTime);
        // Call the checkGameAtBoundsCircle function
        const boundariesHit = CollisionUtils.checkGameAtBoundsCircle(this);

        if (boundariesHit) {
            // Pass boundariesHit to updateCirclePosition
            const boundariesSide = CollisionUtils.checkGameAtBoundsCircleSides(this);
            this.updateCircle(boundariesSide);
        }
    }

    /** Draws the circle on the canvas.
     * @param {string} [fillColor='black'] - The fill color of the circle.
     * @param {string|null} [borderColor=null] - The border color of the circle.
     * @param {number} [borderWidth=0] - The width of the border.
     */
    draw(fillColor = 'white', borderColor = 'red', borderWidth = 2) {
        CanvasUtils.drawCircle2(this.x, this.y, this.radius, fillColor, borderColor, borderWidth);
    }

    updateCircle(boundariesHit) {
        console.log("Boundaries hit:", boundariesHit);

        if (boundariesHit.includes('top')) {
            this.y = this.radius; // Prevent moving out of bounds at the top
            this.velocityY *= -1; // Reverse direction
        }
        if (boundariesHit.includes('bottom')) {
            this.y = canvasConfig.height - this.radius; // Prevent moving out of bounds at the bottom
            this.velocityY *= -1; // Reverse direction
        }
        if (boundariesHit.includes('left')) {
            this.x = this.radius; // Prevent moving out of bounds on the left
            this.velocityX *= -1; // Reverse direction
        }
        if (boundariesHit.includes('right')) {
            this.x = canvasConfig.width - this.radius; // Prevent moving out of bounds on the right
            this.velocityX *= -1; // Reverse direction
        }
    }

}

export default Circle; // Export the class for use in other modules
