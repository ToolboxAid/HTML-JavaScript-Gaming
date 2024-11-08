// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// shield.js

import ObjectStatic from '../scripts/objectStatic.js';
import { canvasConfig, shieldConfig, spriteConfig } from './global.js'; 
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';

/**
 * Represents a shield object in the game.
 * Inherits from ObjectStatic and provides methods for drawing and applying bomb damage.
 * 
 * @class
 * @extends ObjectStatic
 */
class Shield extends ObjectStatic {
    /**
     * Frame representing the shield sprite as a 2D array of '0' and '1' characters.
     * @type {string[]}
     * @static
     */
    static frame = [
        "0000111111111111111110000",
        "0001111111111111111111000",
        "0011111111111111111111100",
        "0111111111111111111111110",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111111111111111111111",
        "1111111110000000111111111",
        "1111111100000000011111111",
        "1111111000000000001111111",
        "1111110000000000000111111",
        "1111110000000000000111111",
        "1111110000000000000111111",
    ];

    /**
     * Default bomb frame used as an overlay when no bomb object is provided.
     * @type {string[]}
     * @static
     */
    static defaultBomb = [
        "010",
        "100",
        "010",
        "001",
        "010",
        "100",
        "010",
        "001",
        "010",
        "100",
        "010",
    ];

    /**
     * Creates a new Shield instance.
     * @param {number} shieldNum - The index of the shield, used for positioning.
     */
    constructor(shieldNum) {
        const dimensions = CanvasUtils.spriteWidthHeight(Shield.frame, window.pixelSize);
        const shieldSpacing = (canvasConfig.width - shieldConfig.count * dimensions.width) / (shieldConfig.count + 1);
        const x = shieldSpacing + shieldNum * (dimensions.width + shieldSpacing);
        const y = shieldConfig.yPosition;
        super(x, y, dimensions.width, dimensions.height);
        
        /**
         * The frame of the shield, cloned from the static frame.
         * @type {string[][]}
         */
        this.frame = Shield.frame.map(row => [...row]);

        /**
         * Pixel size used for drawing the shield.
         * @type {number}
         */
        this.pixelSize = spriteConfig.pixelSize;
    }

    /**
     * Draws the shield on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        CanvasUtils.drawSprite(ctx, this.x, this.y, this.frame, this.pixelSize, shieldConfig.color);
    }

    /**
     * Applies damage from a bomb overlay to the shield.
     * Replaces overlapping '1's in the shield frame with '0's.
     * 
     * @param {Object} distructiveObject - The bomb object causing the damage.
     * @param {number} distructiveObject.x - The x-coordinate of the bomb.
     * @param {number} distructiveObject.y - The y-coordinate of the bomb.
     * @param {number} distructiveObject.currentFrameIndex - The current frame index of the bomb animation.
     * @param {string[][]} [distructiveObject.livingFrames] - Optional frames of the bomb animation.
     * @param {boolean} [doExplode=true] - Whether to apply random additional destruction.
     * @returns {boolean} - Returns true if any part of the shield was hit.
     */
    applyBigBoom(distructiveObject, doExplode = true) {
        const { x: bombX, y: bombY, currentFrameIndex } = distructiveObject || {};
        const { x: shieldX, y: shieldY } = this;
        let overlayFrame;

        // Determine the overlay frame to use
        if (distructiveObject && distructiveObject.livingFrames) {
            try {
                overlayFrame = distructiveObject.livingFrames[currentFrameIndex].map(row => Array.from(row));
            } catch {
                try{
                overlayFrame = distructiveObject.livingFrames[0].map(row => Array.from(row));
                }catch{
                    console.log("failed overlayFrame");
                    return;
                }
            }
        } else {
            overlayFrame = Shield.defaultBomb;
        }

        let shieldHit = false;
        const offsetX = Math.round((bombX - shieldX) / window.pixelSize);
        const offsetY = Math.round((bombY - shieldY) / window.pixelSize);

        // Apply the bomb overlay to the shield frame
        for (let c = 0; c < this.frame.length; c++) {
            for (let r = 0; r < this.frame[0].length; r++) {
                const targetX = r + offsetX;
                const targetY = c + offsetY;

                if (
                    targetX >= 0 && targetX < this.frame[0].length &&
                    targetY >= 0 && targetY < this.frame.length &&
                    overlayFrame[c]?.[r] === "1" &&
                    this.frame[targetY][targetX] === "1"
                ) {
                    shieldHit = true;
                    this.frame[targetY][targetX] = "0";

                    const destructionWidth = doExplode ? 2 : 4;
                    const pathStart = Math.max(0, targetX - destructionWidth);
                    const pathEnd = Math.min(this.frame[0].length, targetX + destructionWidth);

                    for (let i = pathStart; i < pathEnd; i++) {
                        if (this.frame[targetY][i] === "1" && (doExplode || Functions.randomGenerator(0, 1, false) > 0.33)) {
                            this.frame[targetY][i] = "0";
                        }
                    }
                }
            }
        }

        return shieldHit;
    }
}

export default Shield;
