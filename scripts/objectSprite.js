// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectSprite.js

import CanvasUtils from './canvas.js';
import Colors from './colors.js';
import ObjectKillable from './objectKillable.js';
import Functions from './functions.js';
import Sprite from './sprite.js';

class ObjectSprite extends ObjectKillable {

    constructor(x, y, livingFrames, dyingFrames, pixelSize, palette) {
        // Ensure livingFrames is provided and is not empty
        if (!livingFrames || livingFrames.length === 0) {
            throw new Error("livingFrames must be provided.");
        }

        // Calculate dimensions based on the first living frame
        let spritePixelSize = pixelSize;
        let dimensions = null;
        let livingArray = livingFrames;
        let livingDelay = 30;
        let livingFrameCount = livingFrames.length;
        // Assumes living, dying, other are all the same frameType
        const frameType = ObjectSprite.getFrameType(livingFrames);

        let dyingArray = dyingFrames;
        let dyingDelay = 7;
        let dyingFrameCount = 0;

        switch (frameType) {
            case 'json':
                //console.log('Handling an object');
                Sprite.validateJsonFormat(livingFrames);
                spritePixelSize = livingFrames.metadata.spritePixelSize;
                dimensions = Sprite.getLayerDimensions(livingFrames, spritePixelSize);

                // Living
                livingFrameCount = livingFrames.layers.length;
                livingDelay = livingFrames.metadata.framesPerSprite;

                let paletteArray = null;
                if (palette) {
                    paletteArray = ObjectSprite.extractArray(palette);
                }
                livingArray = Sprite.convert2RGB(livingFrames, paletteArray);

                // Dying
                if (dyingFrames){
                dyingFrameCount = dyingFrames.layers.length;
                dyingDelay = dyingFrames.metadata.framesPerSprite;

                dyingArray = Sprite.convert2RGB(dyingFrames, paletteArray);                
                }
                break;
            case 'array':
                //console.log('Handling an array');
                if (pixelSize <= 0 || typeof pixelSize !== 'number') {
                    throw new Error("Invalid pixelSize: It must be a positive number. Current value:", pixelSize);
                }
                dimensions = Sprite.getWidthHeight(livingFrames, spritePixelSize);
                break;
            case 'doubleArray':
                if (pixelSize <= 0 || typeof pixelSize !== 'number') {
                    throw new Error("Invalid pixelSize: It must be a positive number. Current value:", pixelSize);
                }
                //console.log('Handling a double array');
                dimensions = Sprite.getWidthHeight(livingFrames[0], spritePixelSize);
                break;
            default:
                console.error(`Unknown value: ${ObjectSprite.getFrameType(livingFrames)}`);
                break;
        }

        super(x, y, dimensions.width, dimensions.height);

        this.frameType = frameType;

        this.pixelSize = spritePixelSize;

        this.currentFrameIndex = 0;
        this.delayCounter = 0;

        // Initialize living frames
        this.livingDelay = livingDelay;
        this.livingFrames = livingArray;
        this.livingFrameCount = livingFrameCount;

        // Initialize dying frames
        this.dyingDelay = dyingDelay;
        this.dyingFrames = dyingArray;
        this.dyingFrameCount = this.dyingFrames ? this.dyingFrames.length : 0;

        // Other frames
        this.otherDelay = 0;
        this.otherFrame = null;

        // More properties
        this.spriteColor = "white";
    }

    static getFrameType(object) {
        if (object) {
            if (Functions.getObjectType(object) === "Object") {
                // Json data
                return "json";
            } else if (Array.isArray(object) && Array.isArray(object[0])) {
                // Multi-dimensional array (each element is an array, implying rows of frames)
                return "doubleArray";
            } else if (Array.isArray(object)) {
                // Single-dimensional array (likely one frame as an array of strings or characters)
                return "array";
            } else if (Functions.getObjectType(object) === "String") {
                // String data
                return "string";
            } else {
                console.log(Functions.getObjectType(object));
            }
        } else {
            return "null";
        }
    }

    static extractArray(obj) {
        const values = Object.values(obj);
        for (const value of values) {
            if (Array.isArray(value)) {
                return value;
            }
        }
        throw new Error("No array found in the object.");
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
        // Check if the color is a valid named color in the color map, ignoring case
        const isValidSymbol = Colors.isValidSymbol(spriteColor);

        // Check if the color is a valid hexadecimal color code
        const isHexColor = Colors.isValidHexColor(spriteColor);

        if (isValidSymbol || isHexColor) {
            this.spriteColor = spriteColor;
        } else {
            try {
                throw new Error("Invalid color:", spriteColor);
            } catch (e) {
                console.log(e.stack);
            }
            this.spriteColor = Colors.getRandomColor();// 'white'; // Default to white
        }
    }

    setOtherFrame(otherDelay, otherFrame) { // Other properties        
        this.otherDelay = otherDelay;
        this.otherFrame = otherFrame;
    }

    draw(offsetX = 0, offsetY = 0) {
        if (this.frameType === "json") {
            this.drawRGB(offsetX, offsetY);
            return;
        }
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
                    const otherX = Math.max(25, Math.min(newX, window.gameAreaWidth));
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

    drawRGB(offsetX = 0, offsetY = 0) {
        try {
            const { x, y, currentFrameIndex, livingFrames, dyingFrames, otherFrame, pixelSize } = this;

            const newX = x + offsetX;
            const newY = y + offsetY;

            if (this.isAlive()) {
                if (livingFrames.layers[this.currentFrameIndex].data) {
                    const frame = livingFrames.layers[this.currentFrameIndex].data;
                    if (frame) {
                        CanvasUtils.drawSpriteRGB(newX, newY, frame, pixelSize);
                    } else {
                        // no frame to draw (do something random)
                        CanvasUtils.drawSpriteRGB(newX, newY, livingFrames[currentFrameIndex], pixelSize);
                    }

                }
                return;
            }

            if (this.isDying()) {
                console.log("Status: Dying");
                if (dyingFrames?.[currentFrameIndex]) {
                    console.log("Drawing dying frame:", dyingFrames[currentFrameIndex]);
                    CanvasUtils.drawSpriteRGB(newX, newY, dyingFrames[currentFrameIndex], pixelSize);
                }
                return;
            }

            if (this.isOther()) {
                console.log("Status: Other");
                if (otherFrame) {
                    const otherX = Math.max(25, Math.min(newX, window.gameAreaWidth));
                    console.log("Drawing other frame:", otherFrame);
                    CanvasUtils.drawSpriteRGB(otherX, newY, otherFrame, pixelSize);
                }
                return;
            }
            if (this.isDead()) {
                console.log("Status: Dead");
                return;
            }

            console.log("No valid frame to draw for current status:", this.status);
        } catch (error) {
            console.error("Error occurred:", error.message);
            console.error("Stack trace:", error.stack);
            console.log("Object state:", this);
        }
    }

}

export default ObjectSprite;