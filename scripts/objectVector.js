// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable from './objectKillable.js';
import CanvasUtils from './canvas.js';

class ObjectVector extends ObjectKillable {
    constructor(x, y, vectorMap, velocityX = 0, velocityY = 0) {
        // Validate that vectorMap is a single array of point pairs
        if (!Array.isArray(vectorMap) || !vectorMap.every(point => Array.isArray(point) && point.length === 2)) {
            throw new Error("vectorMap must be an array of point pairs (e.g., [[x, y], [x, y], ...]).");
        }

        // Calculate object dimensions based on the bounding box of the rotated frame
        const { minX, minY, maxX, maxY } = ObjectVector.getBoundingBox(vectorMap, 0);  // Initial bounding box without rotation
        const width = maxX - minX;
        const height = maxY - minY;

        super(x, y, width, height, velocityX, velocityY);

        // Store the vector map (frame data)
        this.vectorMap = vectorMap;

        this.currentFrameIndex = 0; // For animation frame tracking
        this.delayCounter = 0;

        // Default properties
        this.color = "white"; // Default color for vector shapes

        this.rotationAngle = 0;

        this.drawBounds = false;
    }

    setRotationAngle(angle){
        this.rotationAngle= angle;
    }

    updateDimensions() {// Method to update the width and height based on the bounding box
        const { minX, minY, maxX, maxY } = ObjectVector.getBoundingBox(this.vectorMap, this.rotationAngle);
        this.width = maxX - minX;
        this.height = maxY - minY;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.updateDimensions();
    }

    static getBoundingBox(points, rotationAngle = 0) {// Updated getBoundingBox method that accounts for rotation
        // Calculate the center of the object (this could be done outside this function)
        const centerX = 0;
        const centerY = 0;

        // Convert the rotation angle from degrees to radians
        const angleInRadians = (rotationAngle * Math.PI) / 180;

        // Rotate all points and calculate the min and max bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        points.forEach(([px, py]) => {
            // Apply rotation around the center of the object
            const rotatedX = centerX + (px * Math.cos(angleInRadians) - py * Math.sin(angleInRadians));
            const rotatedY = centerY + (px * Math.sin(angleInRadians) + py * Math.cos(angleInRadians));

            // Update the bounding box
            minX = Math.min(minX, rotatedX);
            minY = Math.min(minY, rotatedY);
            maxX = Math.max(maxX, rotatedX);
            maxY = Math.max(maxY, rotatedY);
        });

        return { minX, minY, maxX, maxY };
    }

    setColor(color) {
        if (CanvasUtils.isValidColor(color)) {
            this.color = color;
        } else {
            console.error("Invalid color:", color);
            this.color = "white"; // Default to white
        }
    }

    setDrawBounds() {
        this.drawBounds = true;
    }

    draw(lineWidth = 2, offsetX = 0, offsetY = 0) {
        try {
            if (!this.vectorMap || !Array.isArray(this.vectorMap)) {
                console.error("No valid frame to draw:", this.vectorMap);
                return;
            }

            const newX = this.x + offsetX;
            const newY = this.y + offsetY;

            // Convert the rotation angle from degrees to radians
            const angleInRadians = (this.rotationAngle * Math.PI) / 180;

            // Calculate the center of the object (bounding box center)
            const centerX = newX + (this.width / 2);
            const centerY = newY + (this.height / 2);

            // Begin drawing
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.strokeStyle = this.color;
            CanvasUtils.ctx.lineWidth = lineWidth;

            this.vectorMap.forEach(([px, py], index) => {
                if (!Array.isArray([px, py]) || [px, py].length !== 2) {
                    console.error("Invalid point in frame:", [px, py]);
                    return;
                }

                // Apply rotation around the center of the object
                const transformedX = centerX + (px * Math.cos(angleInRadians) - py * Math.sin(angleInRadians));
                const transformedY = centerY + (px * Math.sin(angleInRadians) + py * Math.cos(angleInRadians));

                // Draw the path
                if (index === 0) {
                    CanvasUtils.ctx.moveTo(transformedX, transformedY);
                } else {
                    CanvasUtils.ctx.lineTo(transformedX, transformedY);
                }
            });

            // Finish drawing
            CanvasUtils.ctx.closePath();
            CanvasUtils.ctx.stroke();


            if (this.drawBounds) {
                CanvasUtils.drawBounds(this.x, this.y, this.width, this.height, 'white', 1);  // Blue color and line width of 2
            }

        } catch (error) {
            console.error("Error occurred while drawing:", error.message);
            console.error("Stack trace:", error.stack);
            console.log("Object state:", this);
        }
    }

    collisionDetection(object) {
        // Rotate and translate the asteroid's vectorMap based on its rotationAngle and position
        const asteroidPoints = this.vectorMap.map(([px, py]) => {
            const angleInRadians = (this.rotationAngle * Math.PI) / 180;
            const rotatedX = this.x + px * Math.cos(angleInRadians) - py * Math.sin(angleInRadians);
            const rotatedY = this.y + px * Math.sin(angleInRadians) + py * Math.cos(angleInRadians);
            return [rotatedX, rotatedY];
        });

        // Rotate and translate the object's vectorMap based on its rotationAngle and position
        const objectPoints = object.vectorMap.map(([px, py]) => {
            const angleInRadians = (object.rotationAngle * Math.PI) / 180;
            const rotatedX = object.x + px * Math.cos(angleInRadians) - py * Math.sin(angleInRadians);
            const rotatedY = object.y + px * Math.sin(angleInRadians) + py * Math.cos(angleInRadians);
            return [rotatedX, rotatedY];
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

    wrapAround() {// Screen wrapping object logic
        if (this.x > window.gameAreaWidth) this.x = this.width * -1;
        if (this.x + this.width < 0) this.x = window.gameAreaWidth;
        if (this.y > window.gameAreaHeight) this.y = this.height * -1;
        if (this.y + this.height < 0) this.y = window.gameAreaHeight;
    }

    checkOutOfBounds() { // Object outside canvas window
        if (
            this.x > window.width ||
            this.x < 0 ||
            this.y > window.height ||
            this.y < 0
        ) {
            return true;
        }
        return false;
    }

}

export default ObjectVector;
