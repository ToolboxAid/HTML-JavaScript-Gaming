// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectKillable.js

import ObjectDynamic from './objectDynamic.js';
import CanvasUtils from './canvas.js';

class ObjectKillable extends ObjectDynamic {
    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        OTHER: 'other',
        DEAD: 'dead'
    });

    constructor(x, y, width, height, velocityX = 0, velocityY = 0) {
        // // Ensure livingFrames is provided and is not empty
        // if (!livingFrames || livingFrames.length === 0) {
        //     throw new Error("livingFrames must be provided and cannot be empty.");
        // }

        // // Calculate dimensions based on the first living frame
        // const dimensions = CanvasUtils.spriteWidthHeight(livingFrames[0], spriteConfig.pixelSize);

        super(x, y, width, height, velocityX, velocityY);

        this.status = ObjectKillable.Status.ALIVE;
        // this.currentFrameIndex = 0;

        // this.delayCounter = 0;

        // // Initialize living frames
        // this.livingDelay = 10;
        // // this.livingFrames = livingFrames;
        // // this.livingFrameCount = this.livingFrames.length;

        // // Initialize dying frames and replace with living frames if null or empty
        // this.dyingDelay = 3;
        // // this.dyingFrames = dyingFrames;
        // // this.dyingFrameCount = this.dyingFrames ? this.dyingFrames.length : 0;

        // // Other properties
        // this.otherDelay = 0;
        // this.otherFrame = null;

        // // More properties
        // this.spriteColor = "white";
        // this.pixelSize = spriteConfig.pixelSize;
    }

    update(deltaTime, incFrame = false) {
        switch (this.status) {
            case ObjectKillable.Status.ALIVE: // Handle ALIVE status
                this.handleAliveStatus(deltaTime, incFrame);
                break;
            case ObjectKillable.Status.DYING: // Handle DYING status
                this.handleDyingStatus();
                break;
            case ObjectKillable.Status.OTHER: // Handle OTHER status
                this.handleOtherStatus();
                break;
            case ObjectKillable.Status.DEAD: // Handle DEAD status
                this.handleDeadStatus();
                break;
            default:  // Handle OOPS - Handle unknown status
                console.error("OOPS : Unknown status:", this.status);
                break;
        }
    }

    handleAliveStatus(deltaTime, incFrame) { // Handle ALIVE status
        super.update(deltaTime);
        // if (incFrame) {
        //     this.currentFrameIndex++;
        //     if (this.currentFrameIndex >= this.livingFrameCount) {
        //         this.currentFrameIndex = 0;
        //     }
        // } else {
        //     this.delayCounter++;
        //     if (this.delayCounter >= this.livingDelay) {
        //         this.delayCounter = 0;
        //         this.currentFrameIndex++;
        //         if (this.currentFrameIndex >= this.livingFrameCount) {
        //             this.currentFrameIndex = 0;
        //         }
        //     }
        // }
    }

    handleDyingStatus() {
        // // Check if the delay count reached the threshold set by dyingDelay
        // if (this.delayCounter++ >= this.dyingDelay) {
        //     // Reset the delay count
        //     this.delayCounter = 0;

        //     // Move to the next frame
        //     this.currentFrameIndex++;

        //     // If all frames have been displayed, transition to 'Other' status
        //     if (this.currentFrameIndex >= this.dyingFrameCount) {
        //         this.setIsOther();
        //     }
        // }
    }

     handleOtherStatus() { // Custom logic for OTHER status
    //     if (this.delayCounter++ >= this.otherDelay) {
    //         this.setIsDead();
    //     }
     }

     handleDeadStatus() { // Custom logic for DEAD status
     }

    isAlive() {
        return this.status === ObjectKillable.Status.ALIVE;
    }

    isDying() {
        return this.status === ObjectKillable.Status.DYING;
    }

    isOther() {
        return this.status === ObjectKillable.Status.OTHER;
    }

    isDead() {
        return this.status === ObjectKillable.Status.DEAD;
    }

    // setHit() {
    //     if (this.dyingFrames) {
    //         this.setIsDying();
    //     } else if (this.otherFrame) {
    //         this.setIsOther();
    //     } else {
    //         this.setIsDead();
    //     }
    // }

    setIsAlive() {
        this.status = ObjectKillable.Status.ALIVE;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setIsDying() {
        this.status = ObjectKillable.Status.DYING;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setIsOther() {
        this.status = ObjectKillable.Status.OTHER;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    setIsDead() {
        this.status = ObjectKillable.Status.DEAD;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    // setSpriteColor(spriteColor) {
    //     // Check if the color is a valid named color in the color map
    //     const isNamedColor = Object.values(CanvasUtils.colorMapSprite).includes(spriteColor);

    //     // Check if the color is a valid hexadecimal color code
    //     const isHexColor = /^#([0-9A-F]{3}){1,2}$/i.test(spriteColor);

    //     if (isNamedColor || isHexColor) {
    //         this.spriteColor = spriteColor;
    //     } else {
    //         console.error("Invalid color:", spriteColor);
    //         this.spriteColor = 'white'; // Default to white or another default color
    //     }
    // }

    // setPixelSize(pixelSize) {
    //     if (pixelSize <= 0 || typeof pixelSize !== 'number') {
    //         console.error("Invalid pixelSize: It must be a positive number. Current value:", pixelSize);
    //     }
    //     this.pixelSize = pixelSize;
    // }

    // setOtherFrame(otherDelay, otherFrame) { // Other properties        
    //     this.otherDelay = otherDelay;
    //     this.otherFrame = otherFrame;
    // }

//     draw(ctx, offsetX = 0, offsetY = 0) {
//         super.draw(CanvasUtils.ctx);
// }

    // // Example method
    // draw(ctx, offsetX = 0, offsetY = 0) {
    //     try {
    //         const { x, y, currentFrameIndex, spriteColor, livingFrames, dyingFrames, otherFrame } = this;
    //         const pixelSize = spriteConfig.pixelSize;

    //         const newX = x + offsetX;
    //         const newY = y + offsetY;

    //         if (this.isAlive()) {
    //             if (livingFrames?.[currentFrameIndex]) {
    //                 CanvasUtils.drawSprite(newX, newY, livingFrames[currentFrameIndex], pixelSize, spriteColor);
    //             }
    //             return;
    //         }

    //         if (this.isDying()) {
    //             if (dyingFrames?.[currentFrameIndex]) {
    //                 CanvasUtils.drawSprite(newX, newY, dyingFrames[currentFrameIndex], pixelSize, spriteColor);
    //             }
    //             return;
    //         }

    //         if (this.isOther()) {
    //             if (otherFrame) {
    //                 const otherX = Math.max(25, Math.min(x, canvasConfig.width - 100));
    //                 CanvasUtils.drawSprite(otherX, newY, otherFrame, pixelSize, spriteColor);
    //             }
    //             return;
    //         }
    //         if (this.isDead()) {
    //             return;
    //         }

    //         //this.setIsOther()
    //         console.log("No valid frame to draw for current status: ", this.status);
    //     } catch (error) {
    //         console.error("Error occurred:", error.message);
    //         console.error("Stack trace:", error.stack);
    //         console.log("Object state:", this);
    //     }
    // }

}

export default ObjectKillable;