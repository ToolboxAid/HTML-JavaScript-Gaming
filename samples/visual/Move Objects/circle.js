// ToolboxAid.com
// David Quesenberry
// circle.js
// 10/16/2024

import ObjectDynamic from '../../../engine/objects/objectDynamic.js'; // Import ObjectDynamic
import CanvasUtils from '../../../engine/core/canvasUtils.js';
import GameCollision from '../../../engine/game/gameCollision.js';

import RandomUtils from '../../../engine/math/randomUtils.js';
import DebugFlag from '../../../engine/utils/debugFlag.js';
import DebugLog from '../../../engine/utils/debugLog.js';
/**
 * Represents a dynamic circle object in a game.
 */
class Circle extends ObjectDynamic {
    // Enable debug mode: game.html?circle
    static DEBUG = DebugFlag.has('circle');

    /** Creates an instance of Circle.
     * 
     */
    constructor(canvasConfig) {
        const radius = 25;
        const velocityX = RandomUtils.randomRange(2.0, 5.0);
        const velocityY = RandomUtils.randomRange(2.0, 5.0);

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
        const boundariesHit = GameCollision.isOutOfBoundsCircle(this);

        if (boundariesHit) {
            // Pass boundariesHit to updateCirclePosition
            const boundariesSide = GameCollision.getOutOfBoundsCircleSides(this);
            this.updateCircle(boundariesSide);
        }
    }

    /** Draws the circle on the canvas. */
    draw(fillColor = 'white', borderColor = '#ed9700', borderWidth = 2) {
        CanvasUtils.drawCircle2(this.x, this.y, this.radius, fillColor, borderColor, borderWidth);
    }

    updateCircle(boundariesHit) {
        
        DebugLog.log(Circle.DEBUG, 'Circle', 'Boundaries hit:', boundariesHit);

        if (boundariesHit.includes('top')) {
            this.y = this.radius; // Prevent moving out of bounds at the top
            this.velocityY *= -1; // Reverse direction
        }
        if (boundariesHit.includes('bottom')) {
            this.y = this.canvasHeight - this.radius; // Prevent moving out of bounds at the bottom
            this.velocityY *= -1; // Reverse direction
        }
        if (boundariesHit.includes('left')) {
            this.x = this.radius; // Prevent moving out of bounds on the left
            this.velocityX *= -1; // Reverse direction
        }
        if (boundariesHit.includes('right')) {
            this.x = this.canvasWidth - this.radius; // Prevent moving out of bounds on the right
            this.velocityX *= -1; // Reverse direction
        }
    }

}

export default Circle; // Export the class for use in other modules



