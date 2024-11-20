// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable2 from './objectKillable2.js';
import CanvasUtils from './canvas.js';

class ObjectVector extends ObjectKillable2 {
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
    }

    // Method to update the width and height based on the bounding box
    updateDimensions() {
        const { minX, minY, maxX, maxY } = ObjectVector.getBoundingBox(this.vectorMap, this.rotationAngle);
        this.width = maxX - minX;
        this.height = maxY - minY;
    }

    update(deltaTime){
        super.update(deltaTime);
        this.updateDimensions();
    }

    // Updated getBoundingBox method that accounts for rotation
    static getBoundingBox(points, rotationAngle = 0) {
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
        if (typeof color === 'string' && (color.startsWith('#') || color.match(/^[a-zA-Z]+$/))) {
            this.color = color;
        } else {
            console.error("Invalid color:", color);
            this.color = "white"; // Default to white
        }
    }

    draw(lineWidth = 2, offsetX = 0, offsetY = 0) {
        try {
            const { x, y, vectorMap, color } = this;

            const newX = x + offsetX;
            const newY = y + offsetY;

            let frameToDraw = vectorMap; // There's only one frame in the array

            if (!frameToDraw || !Array.isArray(frameToDraw)) {
                console.error("No valid frame to draw:", frameToDraw);
                return;
            }

            // Convert the rotation angle from degrees to radians
            const angleInRadians = (this.rotationAngle * Math.PI) / 180;

            // Calculate the center of the object (bounding box center)
            const centerX = newX + (this.width / 2);
            const centerY = newY + (this.height / 2);

            // Begin drawing
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.strokeStyle = color;
            CanvasUtils.ctx.lineWidth = lineWidth;

            frameToDraw.forEach(([px, py], index) => {
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
        } catch (error) {
            console.error("Error occurred while drawing:", error.message);
            console.error("Stack trace:", error.stack);
            console.log("Object state:", this);
        }
    }
}

export default ObjectVector;
