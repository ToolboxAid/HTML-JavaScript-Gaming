// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectSprite.js

import CanvasUtils from './canvas.js';

//TODO: this class has to much ties to Space Invaders.
//TODO: this class has to much ties to Space Invaders.
//TODO: this class has to much ties to Space Invaders.
import { canvasConfig, spriteConfig } from '../Space Invaders/global.js';

import ObjectKillable2 from './objectKillable2.js';



class ObjectSprite extends ObjectKillable2 {
    constructor(x, y, livingFrames, dyingFrames, velocityX = 0, velocityY = 0) {
        // Ensure livingFrames is provided and is not empty
        if (!livingFrames || livingFrames.length === 0) {
            throw new Error("livingFrames must be provided and cannot be empty.");
        }

        // Calculate dimensions based on the first living frame
        const dimensions = CanvasUtils.spriteWidthHeight(livingFrames[0], spriteConfig.pixelSize);

        super(x, y, dimensions.width, dimensions.height, velocityX, velocityY);

        // this.status = ObjectKillable2.Status.ALIVE;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;

        // Initialize living frames
        this.livingDelay = 10;
        this.livingFrames = livingFrames;
        this.livingFrameCount = this.livingFrames.length;

        // Initialize dying frames and replace with living frames if null or empty
        this.dyingDelay = 3;
        this.dyingFrames = dyingFrames;
        this.dyingFrameCount = this.dyingFrames ? this.dyingFrames.length : 0;

        // Other properties
        this.otherDelay = 0;
        this.otherFrame = null;

        // More properties
        this.spriteColor = "white";
        this.pixelSize = spriteConfig.pixelSize;
    }

    handleAliveStatus(deltaTime, incFrame) { // Handle ALIVE status
        super.handleAliveStatus(deltaTime, incFrame);
        if (incFrame) {
            this.currentFrameIndex++;
            if (this.currentFrameIndex >= this.livingFrameCount) {
                this.currentFrameIndex = 0;
            }
        } else {
            this.delayCounter++;
            if (this.delayCounter >= this.livingDelay) {
                this.delayCounter = 0;
                this.currentFrameIndex++;
                if (this.currentFrameIndex >= this.livingFrameCount) {
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

    setSpriteColor(spriteColor) {
        // Check if the color is a valid named color in the color map
        const isNamedColor = Object.values(CanvasUtils.colorMapSprite).includes(spriteColor);

        // Check if the color is a valid hexadecimal color code
        const isHexColor = /^#([0-9A-F]{3}){1,2}$/i.test(spriteColor);

        if (isNamedColor || isHexColor) {
            this.spriteColor = spriteColor;
        } else {
            console.error("Invalid color:", spriteColor);
            this.spriteColor = 'white'; // Default to white or another default color
        }
    }

    setPixelSize(pixelSize) {
        if (pixelSize <= 0 || typeof pixelSize !== 'number') {
            console.error("Invalid pixelSize: It must be a positive number. Current value:", pixelSize);
        }
        this.pixelSize = pixelSize;
    }

    setOtherFrame(otherDelay, otherFrame) { // Other properties        
        this.otherDelay = otherDelay;
        this.otherFrame = otherFrame;
    }

    draw(offsetX = 0, offsetY = 0) {
        try {
            const { x, y, currentFrameIndex, spriteColor, livingFrames, dyingFrames, otherFrame, pixelSize } = this;

            const newX = x + offsetX;
            const newY = y + offsetY;

            if (this.isAlive()) {
                if (livingFrames?.[currentFrameIndex]) {
                    CanvasUtils.drawSprite(newX, newY, livingFrames[currentFrameIndex], pixelSize, spriteColor);
                }
                return;
            }

            if (this.isDying()) {
                if (dyingFrames?.[currentFrameIndex]) {
                    CanvasUtils.drawSprite(newX, newY, dyingFrames[currentFrameIndex], pixelSize, spriteColor);
                }
                return;
            }

            if (this.isOther()) {
                if (otherFrame) {
                    const otherX = Math.max(25, Math.min(newX, canvasConfig.width - 100));
                    CanvasUtils.drawSprite(otherX, newY, otherFrame, pixelSize, spriteColor);
                }
                return;
            }
            if (this.isDead()) {
                return;
            }

            //this.setIsOther()
            console.log("No valid frame to draw for current status: ", this.status);
        } catch (error) {
            console.error("Error occurred:", error.message);
            console.error("Stack trace:", error.stack);
            console.log("Object state:", this);
        }
    }

}

export default ObjectSprite;