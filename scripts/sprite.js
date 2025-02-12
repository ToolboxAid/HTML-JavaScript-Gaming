// ToolboxAid.com
// David Quesenberry
// 01/27/2024
// sprite.js

import Palettes from './palettes.js';
import SystemUtils from './utils/systemUtils.js';
import Font5x6 from './font5x6.js';


class Sprite {

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

            // Add each line of the character frame to the sprite
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
        const requiredMetadataFields = ["sprite", "spriteGridSize", "spritePixelSize", "palette", "framesPerSprite"];
        const requiredLayerFields = ["spriteimage", "imageX", "imageY", "imageScale"];

        if (!jsonSprite.metadata || !jsonSprite.layers) {
            console.error(`jsonSprite.metadata ||  jsonSprite.layers missing\njsonSprite ${JSON.stringify(jsonSprite)}`);
            return false;
        }

        for (const field of requiredMetadataFields) {
            if (!(field in jsonSprite.metadata)) {
                console.error(`jsonSprite requiredMetadataFields missing field: ${field}, \njsonSprite ${JSON.stringify(jsonSprite)}`);
                return false;
            }
        }

        for (const layer of jsonSprite.layers) {
            if (!layer.metadata || !layer.data) {
                console.error(`jsonSprite missing: layer.metadata || layer.data`);
                return false;
            }

            for (const field of requiredLayerFields) {
                if (!(field in layer.metadata)) {
                    console.error(`jsonSprite requiredLayerFields missing  field: ${field}, \njsonSprite ${JSON.stringify(jsonSprite)}`);
                    return false;
                }
            }
        }

        return true;
    }

    static getLayerData(jsonSprite, frameIndex) {
        if (jsonSprite && jsonSprite.layers && jsonSprite.layers[frameIndex] && jsonSprite.layers[frameIndex].data) {
            return jsonSprite.layers[frameIndex].data;
        } else {
            console.error("Invalid layer data or index:", jsonSprite);
            return null;
        }
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
        if (jsonSprite && jsonSprite.layers && jsonSprite.layers[frameIndex]) {
            jsonSprite.layers[frameIndex].data = layerData;
        } else {
            console.error("Invalid layer data or index:", jsonSprite, frameIndex);
        }
    }

    static spamSprit2RGB = 2;
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

                if (Sprite.spamSprit2RGB++ < 2) {
                    console.log(`${Sprite.spamSprit2RGB}-1) ${JSON.stringify(layerData)}`);
                    console.log(`${Sprite.spamSprit2RGB}-2) ${paletteName}, ${JSON.stringify(Palettes.get())}`);
                }

                Sprite.updateLayerData(layerData);

                if (Sprite.spamSprit2RGB < 2) {
                    console.log(`${Sprite.spamSprit2RGB}-3) ${JSON.stringify(jsonSprite)}`);
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
        if (layerData && SystemUtils.getObjectType(layerData) === 'Object' && pixelSize >= 1) {
            const layer = layerData.layers[0]; // Only process the first layer
            const data = layer.data;
            let rowCount = data.length;
            let colCount = data[0].length;

            rowCount *= pixelSize;
            colCount *= pixelSize;

            rowCount = Math.ceil(rowCount);
            colCount = Math.ceil(colCount);

            return { width: colCount, height: rowCount };
        } else {
            //if (layerData && Array.isArray(layerData) && Array.isArray(layerData[0]) && pixelSize >= 1) {
            if (layerData
                && SystemUtils.getObjectType(layerData) === 'Array' 
                && SystemUtils.getObjectType(layerData[0]) === 'Array'
                && pixelSize >= 1) {
                let rowCount = layerData.length;
                let colCount = layerData[0].length;

                rowCount *= pixelSize;
                colCount *= pixelSize;

                rowCount = Math.ceil(rowCount);
                colCount = Math.ceil(colCount);

                return { width: colCount, height: rowCount };
            }
        }

        return { width: 10, height: 10, failure: true };
    }

    /**
     * @deprecated Used only for legacy dimensions, Use getLayerDimensions instead.
     */
    static getWidthHeight(object, pixelSize, debug = false) {
        if (Sprite.doOnce) {
            Sprite.doOnce = false;
            console.warn('getWidthHeight is deprecated. Use json data and getLayerDimensions instead.');
        }
        let width, height;

        if (Array.isArray(object) && Array.isArray(object[0])) {
            // Multi-dimensional array (each element is an array, implying rows of frames)
            let frame = object.map(row => Array.from(row));
            height = frame.length; // Number of rows
            width = frame[0]?.length || 0; // Length of each row (assuming uniform row lengths)

            if (debug) {
                console.log(`Multi-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame); // Display the actual frame for verification
            }
        } else if (Array.isArray(object)) {
            // Single-dimensional array (likely one frame as an array of strings or characters)
            let frame = Array.from(object); // Create a copy for manipulation
            height = frame.length; // Number of elements (lines or rows)
            width = frame[0]?.length || 1; // Length of each line or character    
            if (debug) {
                console.log(`Single-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame); // Display the actual frame for verification
            }
        } else {
            console.error("Invalid object format:", object);
            return { width: 0, height: 0 };
        }

        width = Math.round(width * pixelSize);
        height = Math.round(height * pixelSize);

        return { width: width, height: height };
    }

    static getTextRGB(text, palette) {
        let frame = Sprite.getFromText(text);
        frame.metadata.palette = 'custom';
        const array = Sprite.extractArray(palette)
        return Sprite.convert2RGB(frame, array);
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

}

export default Sprite;

