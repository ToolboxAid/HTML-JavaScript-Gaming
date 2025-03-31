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

    constructor(x, y,
        spritePath,
        spriteX, spriteY,
        spriteWidth = 50,
        spriteHeight = 50,
        pixelSize = 4,
        transparentColor = 'black',
        //rotation=90
        velocityX, velocityY        
    ) {


        super(x, y, spriteWidth, spriteHeight,velocityX, velocityY);
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
        //this.rotation = AngleUtils.toRadians(rotation);

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

    // draw1(offsetX = 0, offsetY = 0) {
    //     try {
    //         const { x, y, currentFrameIndex, transparentColor, livingFrames, dyingFrames, otherFrame, pixelSize } = this;

    //         const newX = x + offsetX;
    //         const newY = y + offsetY;

    //         if (this.isAlive()) {
    //             if (livingFrames?.[currentFrameIndex]) {
    //                 CanvasUtils.drawSprite(newX, newY, livingFrames[currentFrameIndex], pixelSize, transparentColor);
    //             }
    //             return;
    //         }

    //         if (this.isDying()) {
    //             if (dyingFrames?.[currentFrameIndex]) {
    //                 CanvasUtils.drawSprite(newX, newY, dyingFrames[currentFrameIndex], pixelSize, transparentColor);
    //             }
    //             return;
    //         }

    //         if (this.isOther()) {
    //             if (this.otherFrame) {
    //                 CanvasUtils.drawSprite(newX, newY, otherFrame, pixelSize, transparentColor);
    //             }
    //             return;
    //         }

    //         if (this.isDead()) {
    //             return;
    //         }

    //         console.warn("No valid frame to draw for current status: ", this.status, this);
    //     } catch (error) {
    //         console.error("Error occurred:", error.message);
    //         console.error("Stack trace:", error.stack);
    //         console.log("Object state:", this);
    //     }
    // }

    update(deltaTime) {
        if (!this.isAlive()) return;
        super.update(deltaTime);
    }

    static spamCntr = 0;
    // draw2(offsetX = 0, offsetY = 0) {
    //     if (!this.isLoaded || !this.png.complete) {
    //         console.warn("Sprite not loaded or incomplete");
    //         return;
    //     }
    //     try {
    //         const { x, y, png, pixelSize,
    //             spriteX, spriteY,
    //             spriteWidth, spriteHeight,
    //             rotation } = this;

    //         // Calculate positions and dimensions
    //         const newX = Math.floor(x + offsetX);
    //         const newY = Math.floor(y + offsetY);
    //         const scaledWidth = Math.max(1, Math.floor(spriteWidth * pixelSize));
    //         const scaledHeight = Math.max(1, Math.floor(spriteHeight * pixelSize));

    //         // Save context state
    //         CanvasUtils.ctx.save();

    //         // Move to center point for rotation
    //         CanvasUtils.ctx.translate(newX + scaledWidth / 2, newY + scaledHeight / 2);
    //         CanvasUtils.ctx.rotate(rotation);


    //         // Draw sprite centered at origin
    //         CanvasUtils.ctx.drawImage(
    //             png,
    //             0, spriteY,
    //             spriteWidth, spriteHeight,
    //             x, y,
    //             scaledWidth, scaledHeight
    //         );

    //         console.log("draw", png, spriteX, spriteY, spriteWidth, spriteHeight, x, y, scaledWidth, scaledHeight);
    //         // Draw debug info
    //         /* ****************************************************************/
    //         if (ObjectPNG.DEBUG) {
    //             CanvasUtils.ctx.textAlign = 'left';
    //             CanvasUtils.ctx.font = '11px Arial';


    //             CanvasUtils.ctx.fillRect(x, this.y, this.spriteWidth, this.spriteHeight);

    //             CanvasUtils.ctx.fillStyle = 'black';
    //             CanvasUtils.ctx.fillText(x, x, y + 20);
    //             CanvasUtils.ctx.fillText(newX1, x, y + 40);

    //         }

    //         // Restore context
    //         CanvasUtils.ctx.restore();


    //         if (ObjectPNG.DEBUG) {
    //             // Draw rotation debug info
    //             this.drawDebugRotation(newX, newY, scaledWidth, scaledHeight);
    //         }

    //     } catch (error) {
    //         if (ObjectPNG.spamCntr++ < 5) {
    //             const errorDetails = {
    //                 message: error.message,
    //                 sprite: {
    //                     loaded: this.isLoaded,
    //                     complete: this.png?.complete,
    //                     dimensions: {
    //                         spriteX: this.spriteX,
    //                         spriteY: this.spriteY,
    //                         width: this.spriteWidth,
    //                         height: this.spriteHeight,
    //                         scale: this.pixelSize
    //                     }
    //                 }
    //             };
    //             ObjectPNG.DEBUG && console.warn("Sprite state during error:", errorDetails);
    //             SystemUtils.showStackTrace(`Error drawing sprite: ${error.message}`, error, errorDetails);
    //         }
    //     }
    // }
    // draw3(offsetX = 0, offsetY = 0) {
    //     if (!this.isLoaded || !this.png.complete) {
    //         console.warn("Sprite not loaded or incomplete");
    //         return;
    //     }

    //     try {
    //         const { x, y, png, pixelSize, spriteX, spriteY, spriteWidth, spriteHeight, rotation } = this;

    //         // Calculate positions and dimensions
    //         const newX = Math.floor(x + offsetX);
    //         const newY = Math.floor(y + offsetY);
    //         const scaledWidth = Math.max(1, Math.floor(spriteWidth * pixelSize));
    //         const scaledHeight = Math.max(1, Math.floor(spriteHeight * pixelSize));

    //         // Save context state
    //         CanvasUtils.ctx.save();

    //         // Draw sprite without rotation first
    //         CanvasUtils.ctx.drawImage(
    //             png,
    //             spriteX, spriteY,            // Source x,y
    //             spriteWidth, spriteHeight,    // Source width,height
    //             newX, newY,                   // Destination x,y
    //             scaledWidth, scaledHeight     // Destination width,height
    //         );

    //         if (ObjectPNG.DEBUG) {
    //             // Draw bounding box
    //             CanvasUtils.ctx.strokeStyle = 'red';
    //             CanvasUtils.ctx.strokeRect(newX, newY, scaledWidth, scaledHeight);

    //             // Draw debug text
    //             CanvasUtils.ctx.fillStyle = 'yellow';
    //             CanvasUtils.ctx.font = '12px Arial';
    //             CanvasUtils.ctx.textAlign = 'left';

    //             const debugText = [
    //                 `Pos: (${newX}, ${newY})`,
    //                 `Size: ${scaledWidth}x${scaledHeight}`,
    //                 `Sprite: (${spriteX}, ${spriteY})`,
    //                 `Scale: ${pixelSize}x`
    //             ];

    //             debugText.forEach((text, i) => {
    //                 CanvasUtils.ctx.fillText(text, newX, newY + scaledHeight + 15 + (i * 15));
    //             });
    //         }

    //         // Restore context
    //         CanvasUtils.ctx.restore();

    //     } catch (error) {
    //         console.error("Draw error:", error);
    //     }
    // }
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

            if (SystemUtils.getObjectType(this) === "Snake") {

                if (Number.isNaN(this.x)) {
                    this.x = 400;
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

            const rotationRad = rotation * Math.PI / 180;
            CanvasUtils.ctx.rotate(rotationRad);

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

            if (SystemUtils.getObjectType(this) === "Snake") {
                if (this.x === 400) {
                    this.x = 400;
                    console.warn('X coordinate was NaN, resetting to ',
                        this.x, this.y, offsetX, offsetY,
                        spriteWidth, spriteHeight, pixelSize,
                        this.velocityX, this.velocityY, 
                        this.direction);
                    CanvasUtils.ctx.fillStyle = 'yellow';
                    CanvasUtils.ctx.fillRect(100, this.y, 50, 50);//this.x

                }
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

    destroy() {
        // Call parent destructor first
        super.destroy();

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
        super.destroy();
    }

}

export default ObjectPNG;