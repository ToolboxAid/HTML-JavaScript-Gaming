// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// shield.js

import { canvasConfig, shieldConfig, spriteConfig } from './global.js';

import ObjectStatic from '../scripts/objectStatic.js';
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';
import Sprite from '../scripts/sprite.js';

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
        "00100001",
        "00000000",
        "10011000",
        "00011000",
        "00011000",
        "00011000",
        "00011000",
        "00011001",
        "00000000",
        "10000100",
    ];

    /**
     * Creates a new Shield instance.
     * @param {number} shieldNum - The index of the shield, used for positioning.
     */
    constructor(shieldNum) {
        const dimensions = Sprite.getWidthHeight(Shield.frame, window.pixelSize);
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
     */
    draw() {
        CanvasUtils.drawSprite(this.x, this.y, this.frame, this.pixelSize, shieldConfig.color);
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
    applyBigBoom(distructiveObject, doExplode = true, adjY = 0) {
        const { x: bombX, y: bombY, currentFrameIndex } = distructiveObject || {};
        const { x: shieldX, y: shieldY } = this;
        let overlayFrame;

        // Determine the overlay frame to use
        if (distructiveObject && distructiveObject.livingFrames) {
            try {
                overlayFrame = distructiveObject.livingFrames[currentFrameIndex].map(row => Array.from(row));
            } catch {
                try {
                    overlayFrame = distructiveObject.livingFrames[0].map(row => Array.from(row));
                } catch {
                    try {
                        overlayFrame = distructiveObject.livingFrames;
                    } catch {
                        console.log("-------------------failed overlayFrame-------------------");
                        console.log(distructiveObject.livingFrames[currentFrameIndex]);
                        console.log(distructiveObject.livingFrames[0]);
                        console.log(distructiveObject.livingFrames);
                        overlayFrame = Shield.defaultBomb;
                    }
                }
            }
        } else {
            console.log("using `defaultBomb`");
            overlayFrame = Shield.defaultBomb;
        }

        //overlayFrame = Shield.defaultBomb;

        let shieldHit = false;
        const offsetX = Math.round((bombX - shieldX) / window.pixelSize);
        const offsetY = Math.round((bombY - shieldY) / window.pixelSize) + adjY;

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
                    this.frame[targetY][targetX] = "0"; // zero/blank the target frame.

                    if (true) {
                        let destructionWidth = 2; // Width of the destruction area horizontally
                        let destructionHeight = 2; // Height of the destruction area vertically

                        if (!doExplode) {
                            destructionWidth += 2; // Width of the destruction area horizontally
                            destructionHeight += 2; // Height of the destruction area vertically
                        }

                        const pathStartX = Math.max(0, targetX - destructionWidth);
                        const pathEndX = Math.min(this.frame[0].length, targetX + destructionWidth);

                        // Vertical range from -2 rows (up) to +2 rows (down)
                        const pathStartY = Math.max(0, targetY - destructionHeight);
                        const pathEndY = Math.min(this.frame.length, targetY + destructionHeight);

                        const centerX = pathStartX + (pathEndX - pathStartX) / 2; // Calculate horizontal center
                        const centerY = pathStartY + (pathEndY - pathStartY) / 2; // Calculate vertical center

                        for (let y = pathStartY; y <= pathEndY; y++) {
                            for (let x = pathStartX; x <= pathEndX; x++) {
                                // Calculate distance from the center
                                const distanceFromCenterX = Math.abs(x - centerX);
                                const distanceFromCenterY = Math.abs(y - centerY);
                                const maxDistanceX = (pathEndX - pathStartX) / 2;
                                const maxDistanceY = (pathEndY - pathStartY) / 2;

                                // Calculate probability threshold based on distance from the center
                                let probabilityX = 0.2 + (1 - (distanceFromCenterX / maxDistanceX)) * 0.8;
                                let probabilityY = 0.2 + (1 - (distanceFromCenterY / maxDistanceY)) * 0.8;

                                // Use the combined adjusted probability for explosion effect
                                if (!doExplode) {
                                    probabilityX = 1;
                                    probabilityY = 1;
                                }
                                const combinedProbability = (probabilityX + probabilityY) / 2;

                                //console.log(`X Index: ${x}, Y Index: ${y}, Probability: ${combinedProbability.toFixed(2)}`);

                                // Apply the explosion effect based on the combined probability
                                if (Functions.randomRange(0, 1, false) < combinedProbability) {
                                    try {
                                        this.frame[y][x] = "0";
                                    } catch {
                                        //console.log("invalid position: ", x, y);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return shieldHit;
    }
}

export default Shield;
