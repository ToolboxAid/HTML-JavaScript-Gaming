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

        // Get the width and height based on the bounding box
        // const bounds = ObjectVector.calculateBoundingBox({ x: x, y: y, rotationAngle: 0, vectorMap: vectorMap });

        // Call super with calculated width and height
        //        super(x, y, bounds.width, bounds.height, velocityX, velocityY);
        super(x, y, 1, 1, velocityX, velocityY);

        // this.drawX = bounds.x;
        // this.drawY = bounds.y;
        // this.drawWidth = bounds.width;
        // this.drawHeight = bounds.height;

        // Store the vector map (frame data)
        this.vectorMap = vectorMap;

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
        this.updateDimensions();
    }

    updateDimensions() {// Method to update the width and height based on the bounding box
        const bounds = this.calculateBoundingBox({ x: this.x, y: this.y, rotationAngle: this.rotationAngle, vectorMap: this.vectorMap });

        this.drawX = bounds.x;
        this.drawY = bounds.y;
        this.drawWidth = bounds.width;
        this.drawHeight = bounds.height;
    }

    calculateBoundingBox({ x, y, rotationAngle, vectorMap }) {
        if (!vectorMap || !Array.isArray(vectorMap)) {
            console.error("Invalid vectorMap:", vectorMap);
            return { x: 0, y: 0, width: 0, height: 0 }; // Prevent breaking
        }

        // Calculate the geometric center of the vectorMap
        const centerX = vectorMap.reduce((sum, [vx]) => sum + vx, 0) / vectorMap.length;
        const centerY = vectorMap.reduce((sum, [, vy]) => sum + vy, 0) / vectorMap.length;

        // Convert rotation angle from degrees to radians
        const radians = (rotationAngle * Math.PI) / 180;

        // Rotate points and compute bounding box
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        const rotatedPoints = vectorMap.map(([vx, vy]) => {
            // Translate to origin (relative to center)
            const dx = vx - centerX;
            const dy = vy - centerY;

            // Apply rotation formula
            const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians);
            const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians);

            // Translate back to the center
            const finalX = rotatedX + centerX;
            const finalY = rotatedY + centerY;

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

        // Debug logs
        if (this.drawBounds) {
            console.log("Rotated Points:", rotatedPoints);
            console.log(
                "Bounding Box:",
                `minX: ${minX}, maxX: ${maxX}, minY: ${minY}, maxY: ${maxY}`
            );
        }

        this.boundX = x + minX - centerX;
        this.boundY = y + minY - centerY;
        this.boundWidth = maxX - minX +1;
        this.boundHeight = maxY - minY +1;
        // Return bounding box with the object's position
        return {
            x: x + minX - centerX,
            y: y + minY - centerY,
            width: maxX - minX,
            height: maxY - minY
        };
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

    draw(lineWidth = 1, offsetX = 0, offsetY = 0) {
        try {
            if (!this.vectorMap || !Array.isArray(this.vectorMap)) {
                console.error("No valid frame to draw:", this.vectorMap);
                return;
            }

            let newX = this.x + offsetX;
            let newY = this.y + offsetY;

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
                lineWidth = 10;
                // // Calculate the bounding box with the correct position
                const bounds = this.calculateBoundingBox({
                    x: this.x,
                    y: this.y,
                    rotationAngle: this.rotationAngle,
                    vectorMap: this.vectorMap
                });

                // CanvasUtils.drawBounds(
                //     bounds.x + (this.width / 2),
                //     bounds.y + (this.height / 2),
                //     bounds.width,
                //     bounds.height, 
                //     "white", 1);

                // this.boundX = x + minX - centerX;
                // this.boundY = y + minY - centerY;
                // this.boundWidth = maxX - minX;
                // this.boundHeight = maxY - minY;
                console.log(this.boundX, this.boundY, this.boundHeight, this.boundWidth);
                CanvasUtils.drawCircle2(this.x, this.y, 2, "white");
                CanvasUtils.drawBounds(
                    this.boundX,
                    this.boundY,
                    this.boundWidth,
                    this.boundHeight,
                    "white", 1);

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
