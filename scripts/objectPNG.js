// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectPNG.js

import CanvasUtils from './canvas.js';
import ObjectKillable from './objectKillable.js';
import SystemUtils from './utils/systemUtils.js';
import AngleUtils from './math/angleUtils.js';

class ObjectPNG extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectPNG');

    static Flip = Object.freeze({
        NONE: 'none',
        HORIZONTAL: 'horizontal', // left & right
        VERTICAL: 'vertial',      // top & bottom
        BOTH: 'both'
    })

    constructor(x, y,
        spritePath,
        spriteX, spriteY,
        spriteWidth = 50,
        spriteHeight = 50,
        pixelSize = 1,
        transparentColor = 'black',
        velocityX, velocityY
    ) {
        super(x, y, spriteWidth, spriteHeight, velocityX, velocityY);
        if (SystemUtils.getObjectType(this) === "Snake") {
            console.log("object PNG con", this.x, this.y);
        }

        // Initialize properties
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.pixelSize = pixelSize;
        this.isLoaded = false;
        this.spritePath = spritePath;

        this.boundWidth = this.width * this.pixelSize;
        this.boundHeight = this.height * this.pixelSize;

        this.horizontalFlip = false;
        this.verticalFlip = false;
        this.setRotation(0);

        // Load sprite
        ObjectPNG.loadSprite(spritePath, transparentColor)
            .then(png => {
                this.png = png;
                this.isLoaded = true;
                if (SystemUtils.getObjectType(this) === "Snake") {
                    console.log(this.png)
                }
            })
            .catch(error => {
                console.error("Failed to load sprite:", error);
            });

        // Set src AFTER setting up onload handler
        if (ObjectPNG.DEBUG) {
            console.warn("ObjectPNG exit", spritePath);
        }
    }

    setFlip(flipType = 'none') {
        // Ensure flipType is lowercase for case-insensitive comparison
        flipType = flipType.toLowerCase();

        // Validate and set the flip enum value
        if (Object.values(ObjectPNG.Flip).includes(flipType)) {
            this.flip = flipType;
        } else {
            console.warn(`Invalid flip type: ${flipType}. Using 'none' instead.`);
            this.flip = ObjectPNG.Flip.NONE;
        }

        if (ObjectPNG.DEBUG) {
            console.log(`Flip set to '${this.flip}' (scale: ${this.pixelSize})`);
        }
    }
    setRotation(rotation) {
        this.rotation = AngleUtils.toRadians(rotation);
    }

    static async loadSprite(spritePath, transparentColor = 'black') {
        return new Promise((resolve, reject) => {
            console.log("loadSprite", spritePath);
            const png = new Image();

            png.onload = () => {
                if (ObjectPNG.DEBUG) {
                    console.warn("ObjectPNG loadSprite.onload");
                }

                if (png.width === 0 || png.height === 0) {
                    const error = new Error("Loaded image has invalid dimensions");
                    console.error(error);
                    reject(error);
                    return;
                }

                // Process transparency
                const transparentPng = ObjectPNG.makeTransparent(png, transparentColor);

                if (ObjectPNG.DEBUG) {
                    console.warn(`Sprite loaded: ${spritePath}`,
                        `Size: ${png.width}x${png.height}`);
                }

                resolve(transparentPng);

                console.log("loadSprite exit 1", spritePath);
            };

            png.onerror = (error) => {
                console.error(`Error loading sprite: ${spritePath}`, error);
                reject(error);

                console.log("loadSprite exit 2", spritePath);
            };

            png.src = spritePath;
            console.log("loadSprite exit 3", spritePath);
        });
    }

    static makeTransparent(png, transparentColor) {
        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = png.width;
        tempCanvas.height = png.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw image
        tempCtx.drawImage(png, 0, 0);

        // Get image data
        const imageData = tempCtx.getImageData(0, 0, png.width, png.height);
        const data = imageData.data;

        // Convert color to RGB
        const tempDiv = document.createElement('div');
        tempDiv.style.backgroundColor = transparentColor;
        document.body.appendChild(tempDiv);
        const colorStyle = window.getComputedStyle(tempDiv).backgroundColor;
        document.body.removeChild(tempDiv);
        const [r, g, b] = colorStyle.match(/\d+/g).map(Number);

        // Set transparency
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
                data[i + 3] = 0;
            }
        }

        // Update canvas with transparent image
        tempCtx.putImageData(imageData, 0, 0);

        // Create new image
        const transparentImage = new Image();
        transparentImage.src = tempCanvas.toDataURL();
        return transparentImage;
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

    update(deltaTime) {
        if (!this.isAlive()) return;
        super.update(deltaTime);
    }

    static spamCntr = 0;
    drawObjectDetails(centerX, centerY, rotation, newX, newY, scaledWidth, scaledHeight) {

        // Reset transform for debug overlay
        CanvasUtils.ctx.restore();
        CanvasUtils.ctx.save();

        // Draw rotation center point
        CanvasUtils.ctx.fillStyle = 'yellow';
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        CanvasUtils.ctx.fill();

        // Draw rotation direction indicator
        CanvasUtils.ctx.strokeStyle = 'lime';
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(centerX, centerY);
        CanvasUtils.ctx.lineTo(
            centerX + Math.cos(rotation) * 20,
            centerY + Math.sin(rotation) * 20
        );
        CanvasUtils.ctx.stroke();

        // Draw bounding box (unrotated for reference)
        CanvasUtils.ctx.strokeStyle = 'red';
        CanvasUtils.ctx.strokeRect(newX, newY, scaledWidth, scaledHeight);

        // Draw debug text
        CanvasUtils.ctx.fillStyle = 'yellow';
        CanvasUtils.ctx.font = '12px Arial';
        CanvasUtils.ctx.textAlign = 'left';

        const debugText = [
            `Pos: (${newX}, ${newY})`,
            `Size: ${scaledWidth}x${scaledHeight}`,
            `Rotation: ${Math.round(rotation * 180 / Math.PI)}°`,
            `Center: (${Math.round(centerX)}, ${Math.round(centerY)})`,
            `frameCnt: ${this.counter} frame ${this.frame}`
        ];

        debugText.forEach((text, i) => {
            CanvasUtils.ctx.fillText(text, newX + scaledWidth + 15, newY + (i * 15) + 15);
        });
    }
    draw(offsetX = 0, offsetY = 0) {
        if (!this.isLoaded || !this.png.complete) {
            console.warn("Sprite not loaded or incomplete");
            return;
        }

        try {
            const { x, y, png, pixelSize, spriteX, spriteY, spriteWidth, spriteHeight, rotation } = this;

            // Debug validation of numeric properties
            if (ObjectPNG.DEBUG) {
                const numericProps = {
                    x, y, pixelSize, spriteX, spriteY,
                    spriteWidth, spriteHeight, rotation
                };

                const invalidProps = Object.entries(numericProps)
                    .filter(([key, value]) =>
                        typeof value !== 'number' || Number.isNaN(value))
                    .map(([key, value]) => ({
                        property: key,
                        value: value,
                        type: typeof value
                    }));

                if (invalidProps.length > 0) {
                    SystemUtils.showStackTrace(
                        'Invalid numeric properties detected in ObjectPNG.draw',
                        new Error('Property validation failed'),
                        {
                            invalidProperties: invalidProps,
                            objectType: SystemUtils.getObjectType(this),
                            position: { x, y },
                            sprite: {
                                dimensions: { spriteWidth, spriteHeight },
                                position: { spriteX, spriteY },
                                scale: pixelSize,
                                rotation: rotation
                            }
                        }
                    );
                }
            }

            // Calculate positions and dimensions
            const newX = Math.floor(x + offsetX);
            const newY = Math.floor(y + offsetY);
            const scaledWidth = Math.max(1, Math.floor(spriteWidth * pixelSize));
            const scaledHeight = Math.max(1, Math.floor(spriteHeight * pixelSize));

            // Save context state
            CanvasUtils.ctx.save();

            // Move to sprite center for rotation
            const centerX = newX + scaledWidth / 2;
            const centerY = newY + scaledHeight / 2;
            CanvasUtils.ctx.translate(centerX, centerY);

            // Set rendering flags based on flip type
            switch (this.flip) {
                case ObjectPNG.Flip.HORIZONTAL:
                    CanvasUtils.ctx.scale(-1, 1);
                    break;
                case ObjectPNG.Flip.VERTICAL:
                    CanvasUtils.ctx.scale(1, -1);
                    break;
                case ObjectPNG.Flip.BOTH:
                    CanvasUtils.ctx.scale(-1, -1);
                    break;
                case ObjectPNG.Flip.NONE:
                default:
                    break;
            }

            CanvasUtils.ctx.rotate(this.rotation);

            // Draw sprite centered at transformed origin
            CanvasUtils.ctx.drawImage(
                png,
                spriteX, spriteY,            // Source x,y
                spriteWidth, spriteHeight,    // Source width,height
                -scaledWidth / 2,             // Destination x (centered)
                -scaledHeight / 2,            // Destination y (centered)
                scaledWidth, scaledHeight     // Destination width,height
            );

            if (ObjectPNG.DEBUG) {
                this.drawObjectDetails(centerX, centerY, rotation, newX, newY, scaledWidth, scaledHeight);
            }

            // Restore context
            CanvasUtils.ctx.restore();

        } catch (error) {
            console.error("Draw error:", error);
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

    /**
     * Destroys the object and cleans up resources.
     * @returns {boolean} True if cleanup was successful
     */
    destroy() {
        if (ObjectPNG.DEBUG) {
            console.log(`Destroying ${SystemUtils.getObjectType(this)}`, {
                position: { x: this.x, y: this.y },
                sprite: {
                    path: this.spritePath,
                    loaded: this.isLoaded,
                    size: this.pixelSize
                }
            });
        }

        // Check if already destroyed
        if (!this.isLoaded && this.png === null) {
            if (ObjectPNG.DEBUG) {
                console.warn('ObjectPNG already destroyed');
            }
            return false;
        }

        // Store values for final logging
        const finalState = {
            path: this.spritePath,
            frame: this.currentFrameIndex,
            pixelSize: this.pixelSize,
            isLoaded: this.isLoaded
        };

        // Call parent destroy first
        const parentDestroyed = super.destroy();
        if (!parentDestroyed) {
            console.error('Parent ObjectKillable destruction failed');
            return false;
        }

        // Clean up PNG-specific properties
        this.png.onload = null;
        this.png.onerror = null;
        this.png = null;
        this.pixelSize = null;
        this.currentFrameIndex = null;
        this.delayCounter = null;
        this.transparentColor = null;
        this.frameCount = null;
        this.isLoaded = null;

        if (ObjectPNG.DEBUG) {
            console.log(`Successfully destroyed ${SystemUtils.getObjectType(this)}`, finalState);
        }

        return true;
    }

}

export default ObjectPNG;