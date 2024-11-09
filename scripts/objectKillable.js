// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectKillable.js

import ObjectDynamic from './objectDynamic.js';
import CanvasUtils from './canvas.js';
import { spriteConfig } from '../Space Invaders/global.js';

class ObjectKillable extends ObjectDynamic {
    static Status = Object.freeze({
        ALIVE: 'alive',
        DYING: 'dying',
        OTHER: 'other',
        DEAD: 'dead'
    });

    constructor(x, y, livingFrames, dyingFrames, velocityX = 0, velocityY = 0, dyingModulus = 5) {
        // Ensure livingFrames is provided and is not empty
        if (!livingFrames || livingFrames.length === 0) {
            throw new Error("livingFrames must be provided and cannot be empty.");
        }

        // Calculate dimensions based on the first living frame
        const dimensions = CanvasUtils.spriteWidthHeight(livingFrames[0], spriteConfig.pixelSize);

        super(x, y, dimensions.width, dimensions.height, velocityX, velocityY);

        this.status = ObjectKillable.Status.ALIVE;
        this.currentFrameIndex = 0;

        // Initialize living frames
        this.livingDelay = 0;
        this.livingFrames = livingFrames;
        this.livingFrameCount = this.livingFrames.length;

        // Initialize dying frames and replace with living frames if null or empty
        this.dyingDelay = 0;
        if (!dyingFrames || dyingFrames.length === 0) {
            this.dyingFrames = this.livingFrames;
        } else {
            this.dyingFrames = dyingFrames;
        }
        this.dyingFrameCount = this.dyingFrames.length;

        // Other properties
        this.otherDelay = 0;
        this.otherFrames = null;
        this.otherFrameCount = 0;

        // More properties
        this.dyingModulus = dyingModulus;
        this.spriteColor = "white";
        this.pixelSize = spriteConfig.pixelSize;
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
        if (incFrame) {
            this.currentFrameIndex++;
            if (this.currentFrameIndex >= this.livingFrameCount) {
                this.currentFrameIndex = 0;
            }
        } else {
            this.currentFrameIndex = Math.floor((this.livingDelay++ / this.dyingModulus) % this.livingFrameCount);
        }
    }

    handleDyingStatus() { // Handle DYING status
        console.log("Handling DYING status logic");
        this.dyingDelay++;
        if (this.dyingDelay >= this.dyingModulus * this.dyingFrameCount) {
            this.setIsOther();
        } else {
            this.currentFrameIndex = Math.floor((this.dyingDelay / this.dyingModulus) % this.dyingFrameCount);
        }
    }

    handleOtherStatus() { // Custom logic for OTHER status
        if (this.otherFrameCount++ > this.otherDelay) {
            console.log("Handling OTHER status to dead");
            this.setIsDead();
        } else {
            console.log("Handling OTHER status logic");
        }
    }

    handleDeadStatus() { // Custom logic for DEAD status
        console.log("Handling DEAD status logic");
    }

    processCollisionWith(object, updatePosition = false) {
        let collision = false;
        if (this.isAlive()) {
            collision = super.processCollisionWith(object, updatePosition);
        }
        return collision;
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

    setHit() {
        if (this.dyingFrames) {
            this.setIsDying();
        } else if (this.otherFrames) {
            this.setIsOther();
        } else {
            this.setIsDead();
        }
    }

    setIsDying() {
        this.status = ObjectKillable.Status.DYING;
    }

    setIsOther() {
        this.status = ObjectKillable.Status.OTHER;
    }

    setIsDead() {
        this.status = ObjectKillable.Status.DEAD;
    }

    setSpriteColor(spriteColor) {
        // Check if the color is a valid named color in the color map
        const isNamedColor = Object.values(CanvasUtils.colorMap).includes(spriteColor);

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

    setOtherFrames(otherDelay, otherFrames, otherFrameCount) {
        // Other properties
        this.otherDelay = otherDelay;
        this.otherFrames = otherFrames;
        this.otherFrameCount = otherFrameCount;
    }

    draw(ctx) {
        if (this.isAlive()) {
            CanvasUtils.drawSprite(ctx, this.x, this.y, this.livingFrames[this.currentFrameIndex], spriteConfig.pixelSize, this.spriteColor);
        } else {
            if (this.isDying()) {
                CanvasUtils.drawSprite(ctx, this.x, this.y, this.dyingFrames[this.currentFrameIndex], spriteConfig.pixelSize, this.spriteColor);
            } else {
                if (this.isOther()) {
                    console.log("draw other")
                    if (this.otherFrames){
                    CanvasUtils.drawSprite(ctx, this.x, this.y, this.otherFrames, spriteConfig.pixelSize, this.spriteColor);                    
                    }
                } else {
                    console.log("draw dead");
                }
            }
        }
    }

}

export default ObjectKillable;