// ToolboxAid.com
// David Quesenberry
// 01/27/2024
// sprite.js

import Palettes from '../renderers/assets/palettes.js';
import Font5x6 from '../renderers/assets/font5x6.js';
import SpriteFrameUtils from './spriteFrameUtils.js';

class Sprite {

    // Enable debug mode: game.html?sprite
    static DEBUG = typeof window !== 'undefined'
        && window.location
        && new URLSearchParams(window.location.search).has('sprite');

    /** Constructor for Sprite class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const sprite = new Sprite(); // Throws Error
     * 
     * ✅ Do this:
     * Sprite.transformPoints(...); // Use static methods directly
     */
    constructor() {
        throw new Error('Sprite is a utility class with only static methods. Do not instantiate.');
    }

    /**
     *  Sprite methods
     */
    static getText(text, space = 1) {
        // Initialize the sprite array
        const sprite = [];

        // Find the maximum height of characters (assuming all characters have the same height)
        const charHeight = Font5x6.font5x6['A']?.length || 7;

        // Prepare an empty row for spacing
        const emptyRow = '0'.repeat(space);

        // Initialize empty rows
        for (let i = 0; i < charHeight; i++) {
            sprite.push('');
        }

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char] || Font5x6.font5x6[' '];

            // Add each line of the character frame to the sprite
            for (let row = 0; row < charHeight; row++) {
                // Add character row + space for each line in the sprite
                sprite[row] += frame[row] + emptyRow;
            }
        }

        return sprite;
    }

    static getFromText(text, space = 1) {
        // Initialize the sprite array
        const sprite = [];

        // Find the maximum height of characters (assuming all characters have the same height)
        const sampleFrame = Font5x6.getLayerDataByKey('A');
        const charHeight = sampleFrame?.length || 7;

        // Prepare an empty row for spacing
        const emptyRow = '0'.repeat(space);

        // Initialize empty rows
        for (let i = 0; i < charHeight; i++) {
            sprite.push('');
        }

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.getLayerDataByKey(char) || Font5x6.getLayerDataByKey(' ');

            for (let row = 0; row < charHeight; row++) {
                sprite[row] += frame[row] + emptyRow;
            }
        }

        // Create the JSON object in the specified format
        const jsonSprite = {
            "metadata": {
                "sprite": "Font5x6",
                "spriteGridSize": 1,
                "spritePixelSize": 3,
                "palette": "default",
                "framesPerSprite": 30
            },
            "layers": [
                {
                    "metadata": {
                        "spriteimage": "",
                        "imageX": 0,
                        "imageY": 0,
                        "imageScale": 1.0,
                    },
                    "data": sprite
                }
            ]
        };

        return jsonSprite;
    }

    static validateJsonFormat(jsonSprite) {
        return SpriteFrameUtils.validateJsonFormat(jsonSprite);
    }

    static getLayerData(jsonSprite, frameIndex) {
        return SpriteFrameUtils.getLayerData(jsonSprite, frameIndex);
    }
    static noSpamUpdate = 0;
    static updateLayerData(layerData) {
        for (let row = 0; row < layerData.length; row++) {
            // Convert the row string to an array for modification
            let rowArray = Array.from(layerData[row]);
            for (let col = 0; col < rowArray.length; col++) {
                const pixel = rowArray[col];
                const color = Palettes.getBySymbol(pixel);
                // if (Sprite.noSpamUpdate++ < 20) {
                //     console.log(`${Sprite.noSpamUpdate}) Pixel: ${pixel} "HEX: ${color.hex}`);
                // }
                rowArray[col] = color.hex;
            }
            // Assign the modified array back to the layerData
            layerData[row] = rowArray;
        }
    }
    static setLayerData(jsonSprite, layerData, frameIndex) {
        SpriteFrameUtils.setLayerData(jsonSprite, layerData, frameIndex);
    }

    static spamSprite2RGB = 2;
    static convert2RGB(jsonSprite, paletteArray = null) {
        let paletteName = jsonSprite.metadata.palette;
        if (paletteName === 'custom') {
            Palettes.setCustom(paletteArray);
        } else {
            Palettes.set(paletteName)
        }

        if (Sprite.validateJsonFormat(jsonSprite)) { // everything is fine    
            // Iterate over jsonSprite.layers
            for (let i = 0; i < jsonSprite.layers.length; i++) {
                const layerData = Sprite.getLayerData(jsonSprite, i);

                if (Sprite.spamSprite2RGB++ < 2) {
                    console.log(`${Sprite.spamSprite2RGB}-1) ${JSON.stringify(layerData)}`);
                    console.log(`${Sprite.spamSprite2RGB}-2) ${paletteName}, ${JSON.stringify(Palettes.get())}`);
                }

                Sprite.updateLayerData(layerData);

                if (Sprite.spamSprite2RGB < 2) {
                    console.log(`${Sprite.spamSprite2RGB}-3) ${JSON.stringify(jsonSprite)}`);
                }

                Sprite.setLayerData(jsonSprite, layerData, i);
            }
            return jsonSprite;
        } else {
            console.error("Not sure what to do with this.")
            return null;
        }
    }

    // accepts JSON object and a 2D frame array
    static getLayerDimensions(layerData, pixelSize) { // layerData is the Sprite Editor Json Sprite data.
        return SpriteFrameUtils.getLayerDimensions(layerData, pixelSize);
    }

    /**
     * @deprecated Used only for legacy dimensions, Use getLayerDimensions instead.
     */
    static getWidthHeight(object, pixelSize, debug = false) {
        if (Sprite.doOnce) {
            Sprite.doOnce = false;
            console.warn('getWidthHeight is deprecated. Use json data and getLayerDimensions instead.');
        }
        return SpriteFrameUtils.getWidthHeight(object, pixelSize, debug);
    }

    static getTextRGB(text, palette) {
        let frame = Sprite.getFromText(text);
        frame.metadata.palette = 'custom';
        const array = Sprite.extractArray(palette)
        return Sprite.convert2RGB(frame, array);
    }

    static extractArray(obj) {
        return SpriteFrameUtils.extractArray(obj);
    }

}

export default Sprite;

