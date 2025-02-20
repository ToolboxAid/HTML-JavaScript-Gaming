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
    constructor(x, y, vectorMap, velocityX, velocityY) {
        // Validate that vectorMap is a single array of point pairs
        if (!vectorMap || !Array.isArray(vectorMap) || !vectorMap.every(point => Array.isArray(point) && point.length === 2)) {
            throw new Error("vectorMap must be present and an array of point pairs (e.g., [[x, y], [x, y], ...]).");
        }

        const width = 99;
        const height = 99;
        super(x, y, width, height, velocityX, velocityY);

        this.currentFrameIndex = 0; // For animation frame tracking
        this.delayCounter = 0;

        // Default properties
        this.color = "white"; // Default color for vector shapes

        this.rotationAngle = 0;

        // Store the vector map (frame data)
        this.vectorMap = vectorMap;

        // Set the bounds of the object
        this.drawBounds = false;

        this.boundX = 0;
        this.boundY = 0;
        this.boundWidth = 0;
        this.boundHeight = 0;

        // Store rotated points for collision detection
        this.rotatedPoints = [];

        this.calculateObjectBounds();

        this.width = this.boundWidth;
        this.height = this.boundHeight;
    }

    setRotationAngle(angle) {
        this.rotationAngle = angle;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.calculateObjectBounds();
    }

    calculateObjectBounds() {
        // Calculate the actual geometric center of the vectorMap
        const centerX = this.vectorMap.reduce((sum, [vx]) => sum + vx, 0) / this.vectorMap.length;
        const centerY = this.vectorMap.reduce((sum, [, vy]) => sum + vy, 0) / this.vectorMap.length;

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

        // Set the bounds of the object
        this.boundX = minX;
        this.boundY = minY;
        this.boundWidth = maxX - minX;
        this.boundHeight = maxY - minY;

        // Store rotated points for collision detection
        this.rotatedPoints = rotatedPoints;

        // console.log("calculateObjectBounds",
        //     this.boundX,this.boundY,
        //     this.boundWidth, this.boundHeight,
        //     this.rotatedPoints
        // );
    }

    setDrawBounds() {
        this.drawBounds = true;
    }

    draw(lineWidth = 1, offsetX = 0, offsetY = 0) {
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

    destory() {
        super.destroy();

        this.currentFrameIndex = null;
        this.delayCounter = null;

        // Default properties
        this.color = null; // Default color for vector shapes

        this.rotationAngle = null;

        // Store the vector map (frame data)
        this.vectorMap = null;

        // Set the bounds of the object
        this.drawBounds = null;

        this.boundX = null;
        this.boundY = null;
        this.boundWidth = null;
        this.boundHeight = null;

        // Store rotated points for collision detection
        this.rotatedPoints = null;
    }
}

export default ObjectVector;
