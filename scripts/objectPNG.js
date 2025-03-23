// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectPNG.js

import CanvasUtils from './canvas.js';
import ObjectKillable from './objectKillable.js';
import SystemUtils from './utils/systemUtils.js';
import AngleUtils from './math/angleUtils.js';

class ObjectPNG extends ObjectKillable {

    // Debug mode enabled via URL parameter: game.html?objectPNG
    static DEBUG = new URLSearchParams(window.location.search).has('objectPNG');

    constructor(x, y, spritePath, spriteX, spriteY, spriteWidth, spriteHeight, pixelSize = 1, transparentColor = 'black') {
        if (!spriteWidth || !spriteHeight) {
            throw new Error("Sprite dimensions must be non-zero");
        }

        console.warn("ObjectPNG constructor", x, y, spriteX, spriteY, spriteWidth, spriteHeight);

        super(x, y, spriteWidth, spriteHeight);

        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.transparentColor = transparentColor;
        this.pixelSize = pixelSize;

        // Initialize sprite loading
        this.png = new Image();
        this.isLoaded = false;

        this.png.onload = () => {
            if (ObjectPNG.DEBUG) {
                console.warn("ObjectPNG png.onload");
            }
            if (this.png.width === 0 || this.png.height === 0) {
                console.error("Loaded image has invalid dimensions");
                return;
            }

            // Process transparency
            this.setTransparentBackground();

            if (ObjectPNG.DEBUG) {
                console.warn(`Sprite loaded: ${spritePath}`,
                    `Size: ${this.spriteWidth}x${this.spriteHeight}`,
                    `Position: ${this.x},${this.y}`);
            }
            this.isLoaded = true;
        };

        this.png.onerror = (error) => {
            console.error(`Error loading sprite: ${spritePath}`, error);
        };

        this.png.src = spritePath;

        this.rotation = AngleUtils.toRadians(0);

        // Set src AFTER setting up onload handler
        if (ObjectPNG.DEBUG) {
            console.warn("ObjectPNG constructor", this.png.src);
            console.warn("ObjectPNG exit", this.png.src);
        }
    }

    setTransparentBackground() {
        // Create temporary canvas to analyze image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.png.width;
        tempCanvas.height = this.png.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw image to temporary canvas
        tempCtx.drawImage(this.png, 0, 0);

        // Get image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        // Convert transparentColor to RGB
        const tempDiv = document.createElement('div');
        tempDiv.style.backgroundColor = this.transparentColor;
        document.body.appendChild(tempDiv);
        const colorStyle = window.getComputedStyle(tempDiv).backgroundColor;
        document.body.removeChild(tempDiv);
        const [r, g, b] = colorStyle.match(/\d+/g).map(Number);

        // Set alpha to 0 for pixels matching transparentColor
        for (let i = 0; i < data.length; i += 4) {
//            const offset = 402*4;
            const offset = 0*4;
            if (ObjectPNG.DEBUG && i > offset && i < offset+25) {
                console.log("i:", i, "PRE: data[i]:", data[i], "data[i+1]:", data[i + 1], "data[i+2]:", data[i + 2], "data[i+3]:", data[i + 3]);
            }
            if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
                data[i + 3] = 0; // Set alpha channel to 0
            }
            if (ObjectPNG.DEBUG && i > offset && i < offset+25) {
                console.log("i:", i, "POST: data[i]:", data[i], "data[i+1]:", data[i + 1], "data[i+2]:", data[i + 2], "data[i+3]:", data[i + 3]);
            }
        }

        // Put modified image data back
        tempCtx.putImageData(imageData, 0, 0);

        // Create new image with transparency
        const transparentImage = new Image();
        transparentImage.src = tempCanvas.toDataURL();

        // Replace original image with transparent version
        this.png = transparentImage;
    }

    handleAliveStatus(deltaTime, incFrame) { // Handle ALIVE status
        super.handleAliveStatus(deltaTime, incFrame);
        if (incFrame) {
            this.currentFrameIndex++;
            if (this.currentFrameIndex >= this.frameCount) {
                this.currentFrameIndex = 0;
            }
        } else {
            this.delayCounter++;
            if (this.delayCounter >= this.livingDelay) {
                this.delayCounter = 0;
                this.currentFrameIndex++;
                if (this.currentFrameIndex >= this.frameCount) {
                    this.currentFrameIndex = 0;
                }
            }
        }
    }

    handleDyingStatus() {
        super.handleDyingStatus();
        // Check if the delay count reached the threshold set by dyingDelay
        if (this.delayCounter++ >= this.dyingDelay) {
            // Reset the delay count
            this.delayCounter = 0;

            // Move to the next frame

            this.currentFrameIndex++;

            // If all frames have been displayed, transition to 'Other' status
            if (this.currentFrameIndex >= this.dyingFrameCount) {
                this.setIsOther();
            }
        }
    }

    handleOtherStatus() { // Custom logic for OTHER status
        super.handleOtherStatus();
        if (this.delayCounter++ >= this.otherDelay) {
            this.setIsDead();
        }
    }

    handleDeadStatus() { // Custom logic for DEAD status
        super.handleDeadStatus();
    }

    setHit() {
        if (this.dyingFrames) {
            this.setIsDying();
        } else if (this.otherFrame) {
            this.setIsOther();
        } else {
            this.setIsDead();
        }
    }

    setOtherFrame(otherDelay, otherFrame) { // Other properties        
        this.otherDelay = otherDelay;
        this.otherFrame = otherFrame;
    }

    draw1(offsetX = 0, offsetY = 0) {
        try {
            const { x, y, currentFrameIndex, transparentColor, livingFrames, dyingFrames, otherFrame, pixelSize } = this;

            const newX = x + offsetX;
            const newY = y + offsetY;

            if (this.isAlive()) {
                if (livingFrames?.[currentFrameIndex]) {
                    CanvasUtils.drawSprite(newX, newY, livingFrames[currentFrameIndex], pixelSize, transparentColor);
                }
                return;
            }

            if (this.isDying()) {
                if (dyingFrames?.[currentFrameIndex]) {
                    CanvasUtils.drawSprite(newX, newY, dyingFrames[currentFrameIndex], pixelSize, transparentColor);
                }
                return;
            }

            if (this.isOther()) {
                if (this.otherFrame) {
                    CanvasUtils.drawSprite(newX, newY, otherFrame, pixelSize, transparentColor);
                }
                return;
            }

            if (this.isDead()) {
                return;
            }

            console.warn("No valid frame to draw for current status: ", this.status, this);
        } catch (error) {
            console.error("Error occurred:", error.message);
            console.error("Stack trace:", error.stack);
            console.log("Object state:", this);
        }
    }


    update(deltaTime) {
        if (!this.isAlive()) return;
        super.update(deltaTime);
    }

    static spamCntr = 0;
    draw(offsetX = 0, offsetY = 0) {
        if (!this.isLoaded || !this.png.complete) {
            return;
        }

        try {
            const { x, y, png, pixelSize, spriteX, spriteY, spriteWidth, spriteHeight, rotation } = this;

            // Calculate positions and dimensions
            const newX = Math.floor(x + offsetX);
            const newY = Math.floor(y + offsetY);
            const scaledWidth = Math.max(1, Math.floor(spriteWidth * pixelSize));
            const scaledHeight = Math.max(1, Math.floor(spriteHeight * pixelSize));

            // Save context state
            CanvasUtils.ctx.save();

            // Move to center point for rotation
            CanvasUtils.ctx.translate(newX + scaledWidth / 2, newY + scaledHeight / 2);
            CanvasUtils.ctx.rotate(rotation);

            // Draw sprite centered at origin
            CanvasUtils.ctx.drawImage(
                png,
                Math.floor(spriteX), Math.floor(spriteY),
                spriteWidth, spriteHeight,
                -scaledWidth / 2, -scaledHeight / 2,  // Center the sprite
                scaledWidth, scaledHeight
            );

            // Restore context
            CanvasUtils.ctx.restore();

            if (ObjectPNG.DEBUG) {
                // Draw rotation debug info
                this.drawDebugRotation(newX, newY, scaledWidth, scaledHeight);
            }

        } catch (error) {
            if (ObjectPNG.spamCntr++ < 5) {
                const errorDetails = {
                    message: error.message,
                    sprite: {
                        loaded: this.isLoaded,
                        complete: this.png?.complete,
                        dimensions: {
                            spriteX: this.spriteX,
                            spriteY: this.spriteY,
                            width: this.spriteWidth,
                            height: this.spriteHeight,
                            scale: this.pixelSize
                        }
                    }
                };
                ObjectPNG.DEBUG && console.warn("Sprite state during error:", errorDetails);
                SystemUtils.showStackTrace(`Error drawing sprite: ${error.message}`, error, errorDetails);
            }
        }
    }
    // Helper method to draw debug visualization
    drawDebugRotation(x, y, width, height) {
        const ctx = CanvasUtils.ctx;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        // Draw center point
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw rotation direction
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(this.rotation) * 20,
            centerY + Math.sin(this.rotation) * 20
        );
        ctx.stroke();
    }

    destroy() {
        // Call parent destructor first
        super.destroy();

        // Clean up PNG-specific properties
        this.png = null;
        this.pixelSize = null;
        this.currentFrameIndex = null;
        this.delayCounter = null;
        this.transparentColor = null;
        this.frameCount = null;

        this.png.onload = null;
        this.png.onerror = null;
        this.isLoaded = null;
        super.destroy();
    }

}

export default ObjectPNG;