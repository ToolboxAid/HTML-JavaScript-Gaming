// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable from './objectKillable.js';
import CanvasUtils from './canvas.js';
import AngleUtils from '../scripts/math/angleUtils.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js';
import SystemUtils from './utils/systemUtils.js';

class ObjectVector extends ObjectKillable {
    // Enable debug mode: game.html?objectVector
    static DEBUG = new URLSearchParams(window.location.search).has('objectVector');

    /** Creates an instance of ObjectVector.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {Array<Array<number>>} vectorMap - Array of point pairs defining the vector shape.
     * @param {number} [velocityX=0] - The initial velocity in the X direction.
     * @param {number} [velocityY=0] - The initial velocity in the Y direction.
     * @throws {Error} If vectorMap is invalid or missing
     */
    constructor(x, y, vectorMap, velocityX = 0, velocityY = 0) {
        // Validate vectorMap
        if (!vectorMap || !Array.isArray(vectorMap) ||
            !vectorMap.every(point => Array.isArray(point) && point.length === 2 &&
                point.every(coord => typeof coord === 'number' && Number.isFinite(coord)))) {
            throw new Error(`vectorMap must be an array of point pairs with valid coordinates: ${vectorMap}`);
        }

        // Calculate initial bounds from vectorMap
        const bounds = ObjectVector.calculateInitialBounds(vectorMap);
        super(x, y, bounds.width, bounds.height, velocityX, velocityY);

        // Initialize animation properties
        this.currentFrameIndex = 0;
        this.delayCounter = 0;

        // Initialize vector properties
        this.color = "white";
        this.rotationAngle = 0;
        this.vectorMap = vectorMap;
        this.drawBounds = false;

        // Initialize bounds
        this.boundX = 0;
        this.boundY = 0;
        this.boundWidth = 0;
        this.boundHeight = 0;
        this.rotatedPoints = [];

        // Calculate initial object bounds
        this.calculateObjectBounds();

        // Update dimensions based on calculated bounds
        this.width = this.boundWidth;
        this.height = this.boundHeight;

        this.margin = this.width * 0.1; // 10%

        if (this.DEBUG) {
            console.log(this, x, y, bounds, this.width, this.height);
        }
    }

    checkWrapAround() {// Screen wrapping object logic
        const boundaries = CollisionUtils.getCompletelyOffScreenBoundaries(this, this.margin);

        if (boundaries.length === 0) {
            return
        }

        // Calculate half dimensions (vectors have a center point [-20,20])
        const halfWidth = (this.boundWidth ?? this.width) / 2;
        const halfHeight = (this.boundHeight ?? this.height) / 2;

        if (boundaries.includes('left')) { // off left - move to right
            this.x = CanvasUtils.getConfigWidth() + halfWidth;
        }
        if (boundaries.includes('right')) { // off right - move left
            this.x = -(halfWidth);
        }

        if (boundaries.includes('top')) { // off top - move bottom
            this.y = CanvasUtils.getConfigHeight() + halfHeight;
        }
        if (boundaries.includes('bottom')) { // off bottom - move top
            this.y = -(halfHeight);
        }
    }

    /** Helper function to calculate initial bounds from vectorMap
     * @param {Array<Array<number>>} vectorMap - Array of point pairs
     * @returns {{width: number, height: number}} Initial bounds
     */
    static calculateInitialBounds(vectorMap) {
        const xs = vectorMap.map(([x]) => x);
        const ys = vectorMap.map(([, y]) => y);
        return {
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    calculateObjectBounds() {
        // Calculate the actual geometric center of the vectorMap
        const centerX = Math.ceil(this.vectorMap.reduce((sum, [vx]) => sum + vx, 0) / this.vectorMap.length);
        const centerY = Math.ceil(this.vectorMap.reduce((sum, [, vy]) => sum + vy, 0) / this.vectorMap.length);

        // Rotate points and compute bounding box
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        const rotatedPoints = this.vectorMap.map(([vx, vy]) => {
            // Translate to origin (relative to center)
            const dx = vx - centerX;
            const dy = vy - centerY;

            // Apply rotation formula
            const rotatedPoint = AngleUtils.applyRotationToPoint(dx, dy, this.rotationAngle);

            // Translate back and add object's position
            const finalX = rotatedPoint.rotatedX + this.x;
            const finalY = rotatedPoint.rotatedY + this.y;

            // Update bounding box calculations (only need one set)
            minX = Math.min(minX, finalX);
            maxX = Math.max(maxX, finalX);
            minY = Math.min(minY, finalY);
            maxY = Math.max(maxY, finalY);

            return [finalX, finalY];
        });

        // Set the bounds of the object (rounded up)
        this.boundX = Math.ceil(minX);
        this.boundY = Math.ceil(minY);
        this.boundWidth = Math.ceil(maxX - minX);
        this.boundHeight = Math.ceil(maxY - minY);

        // Store rotated points for collision detection
        this.rotatedPoints = rotatedPoints;
    }

    setRotationAngle(angle) {
        this.rotationAngle = angle;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.calculateObjectBounds();
    }

    setDrawBounds() {
        this.drawBounds = true;
    }

    draw(lineWidth = 1.25, offsetX = 0, offsetY = 0) {
        if (!this.isAlive()) return;
        try {
            // Begin drawing
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.strokeStyle = this.color;
            CanvasUtils.ctx.lineWidth = lineWidth;

            // Use the pre-calculated rotated points
            if (!this.rotatedPoints || this.rotatedPoints.length === 0) {
                console.error("Rotated points are not available.");
                return;
            }

            // Draw using the pre-calculated rotated points
            this.rotatedPoints.forEach(([rx, ry], index) => {
                if (index === 0) {
                    CanvasUtils.ctx.moveTo(rx + offsetX, ry + offsetY);
                } else {
                    CanvasUtils.ctx.lineTo(rx + offsetX, ry + offsetY);
                }
            });

            // Finish shape
            CanvasUtils.ctx.closePath();
            CanvasUtils.ctx.stroke();

            // Draw bounds if enabled
            if (this.drawBounds) {
                // Draw center point at object's position
                CanvasUtils.drawCircle2(this.x + offsetX, this.y + offsetY, 2, "white");

                // Draw bounding box
                CanvasUtils.drawBounds(
                    this.boundX + offsetX,
                    this.boundY + offsetY,
                    this.boundWidth,
                    this.boundHeight,
                    "white",
                    lineWidth
                );
            }

        } catch (error) {
            console.error("Error occurred while drawing:", error.message);
            console.log("Object state:", this);
        }
    }

    collisionDetection(object, debug = false) {
        if (debug && object) {
            console.log(object);
        }

        // Check if any point of the object is inside the objectPoints
        for (let [pointX, pointY] of object.rotatedPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, this.rotatedPoints)) {
                return true; // Collision detected
            }
        }

        // Check if any point of the vectorPoints is inside the object (optional for mutual collision)
        for (let [pointX, pointY] of this.rotatedPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, object.rotatedPoints)) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }

    /** Destroys the object and cleans up resources.
       * @returns {boolean} True if cleanup was successful
       */
    destroy() {
        try {
            // Call parent destroy first
            const parentDestroyed = super.destroy();
            if (!parentDestroyed) {
                return false;
            }

            // Validate object state before destruction
            if (this.vectorMap === null) {
                return false; // Already destroyed
            }

            // Cleanup animation properties
            this.currentFrameIndex = null;
            this.delayCounter = null;

            // Cleanup vector properties
            this.color = null;
            this.rotationAngle = null;

            // Cleanup vector map
            if (this.vectorMap) {
                SystemUtils.cleanupArray(this.vectorMap);
                this.vectorMap = null;
            }

            // Cleanup bounds
            this.drawBounds = null;
            this.boundX = null;
            this.boundY = null;
            this.boundWidth = null;
            this.boundHeight = null;

            this.margin = null;

            // Cleanup rotated points
            if (this.rotatedPoints) {
                SystemUtils.cleanupArray(this.rotatedPoints);
                this.rotatedPoints = null;
            }

            return true; // Successful cleanup

        } catch (error) {
            console.error('Error during ObjectVector destruction:', error);
            return false;
        }
    }
}

export default ObjectVector;
