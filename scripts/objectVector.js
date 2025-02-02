// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable from './objectKillable.js';
import CanvasUtils from './canvas.js';

import Functions from './functions.js';
import Physics from './physics.js';

class ObjectVector extends ObjectKillable {
    constructor(x, y, vectorMap, velocityX, velocityY) {
        // Validate that vectorMap is a single array of point pairs
        if (!Array.isArray(vectorMap) || !vectorMap.every(point => Array.isArray(point) && point.length === 2)) {
            throw new Error("vectorMap must be an array of point pairs (e.g., [[x, y], [x, y], ...]).");
        }
        // if (!this.vectorMap || !Array.isArray(this.vectorMap)) {
        //     console.error("No valid frame to draw:", this.vectorMap);
        //     return;
        // }

        const posNum = 1;
        super(x, y, posNum, posNum, velocityX, velocityY);

        // Store the vector map (frame data)
        this.vectorMap = vectorMap;

        this.calculateObjectBounds();

        this.currentFrameIndex = 0; // For animation frame tracking
        this.delayCounter = 0;

        // Default properties
        this.color = "white"; // Default color for vector shapes

        this.rotationAngle = 0;

        this.drawBounds = false;
    }

    setRotationAngle(angle) {
        this.rotationAngle = angle;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.calculateObjectBounds();
    }

    calculateObjectBounds() {
        // Calculate the geometric center of the vectorMap
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
            const rotatedPoint = Functions.applyRotationToPoint(dx, dy, this.rotationAngle);

            // Translate back to the center
            const finalX = rotatedPoint.rotatedX + centerX;
            const finalY = rotatedPoint.rotatedY + centerY;

            // Update bounding box calculations
            if (finalX < minX) minX = finalX;
            if (finalX > maxX) maxX = finalX;
            if (finalY < minY) minY = finalY;
            if (finalY > maxY) maxY = finalY;

            // Update bounding box calculations
            minX = Math.floor(Math.min(minX, finalX));
            maxX = Math.ceil(Math.max(maxX, finalX));
            minY = Math.floor(Math.min(minY, finalY));
            maxY = Math.ceil(Math.max(maxY, finalY));

            return [finalX, finalY];
        });

        // Set the bounds of the object on screen
        this.boundX = this.x + minX - centerX;
        this.boundY = this.y + minY - centerY;
        this.boundWidth = maxX - minX + 1;
        this.boundHeight = maxY - minY + 1;
    }

    setDrawBounds() {
        this.drawBounds = true;
    }

    draw(lineWidth = 1, offsetX = 0, offsetY = 0) {
        try {
            const newX = this.x + offsetX;
            const newY = this.y + offsetY;

            // Ensure width and height are defined (fallback to default values if not)
            const width = this.width || 0;
            const height = this.height || 0;

            // Calculate the center of the object (bounding box center)
            const centerX = newX + (width / 2);
            const centerY = newY + (height / 2);

            // Begin drawing
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.strokeStyle = this.color;
            CanvasUtils.ctx.lineWidth = lineWidth;

            this.vectorMap.forEach(([px, py], index) => {
                if (!Array.isArray([px, py]) || [px, py].length !== 2) {
                    console.error("Invalid point in frame:", [px, py]);
                    return;
                }

                // Apply rotation formula
                const rotatedPoint = Functions.applyRotationToPoint(px, py, this.rotationAngle);

                // Draw the path
                if (index === 0) {
                    CanvasUtils.ctx.moveTo(rotatedPoint.rotatedX + centerX, rotatedPoint.rotatedY + centerY);
                } else {
                    CanvasUtils.ctx.lineTo(rotatedPoint.rotatedX + centerX, rotatedPoint.rotatedY + centerY);
                }
            });

            // Finish drawing
            CanvasUtils.ctx.closePath();
            CanvasUtils.ctx.stroke();

            if (this.drawBounds) {
                // Draw center point
                CanvasUtils.drawCircle2(this.x, this.y, 2, "white");
                CanvasUtils.drawBounds(
                    this.boundX,
                    this.boundY,
                    this.boundWidth,
                    this.boundHeight,
                    "white", lineWidth);
            }

        } catch (error) {
            console.error("Error occurred while drawing:", error.message);
            console.error("Stack trace:", error.stack);
            console.log("Object state:", this);
        }
    }

    wrapAround() {// Screen wrapping object logic
        if (this.x > CanvasUtils.getWidth()) this.x = this.width * -1;
        if (this.x + this.width < 0) this.x = CanvasUtils.getWidth();
        if (this.y > CanvasUtils.getHeight()) this.y = this.height * -1;
        if (this.y + this.height < 0) this.y = CanvasUtils.getHeight();
    }

    collisionDetection(object, debug = false) {
        if (debug && object) {
            console.log(object);
        }

        // Rotate and translate the asteroid's vectorMap based on its rotationAngle and position
        const asteroidPoints = this.vectorMap.map(([px, py]) => {
            const angleInRadians = (this.rotationAngle * Math.PI) / 180;
            const rotatedX = this.x + px * Math.cos(angleInRadians) - py * Math.sin(angleInRadians);
            const rotatedY = this.y + px * Math.sin(angleInRadians) + py * Math.cos(angleInRadians);
            return [rotatedX, rotatedY]; // return values to asteroidPoints
        });

        // Rotate and translate the object's vectorMap based on its rotationAngle and position
        const objectPoints = object.vectorMap.map(([px, py]) => {
            const angleInRadians = (object.rotationAngle * Math.PI) / 180;
            const rotatedX = object.x + px * Math.cos(angleInRadians) - py * Math.sin(angleInRadians);
            const rotatedY = object.y + px * Math.sin(angleInRadians) + py * Math.cos(angleInRadians);
            return [rotatedX, rotatedY]; // return values to objectPoints
        });

        // Check if any point of the object is inside the asteroid
        for (let [pointX, pointY] of objectPoints) {
            if (this.isPointInsidePolygon(pointX, pointY, asteroidPoints)) {
                return true; // Collision detected
            }
        }

        // Check if any point of the asteroid is inside the object (optional for mutual collision)
        for (let [pointX, pointY] of asteroidPoints) {
            if (this.isPointInsidePolygon(pointX, pointY, objectPoints)) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }

    isPointInsidePolygon(x, y, polygon) {// Helper method: Point-in-Polygon test using ray-casting algorithm
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];
            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

}

export default ObjectVector;
