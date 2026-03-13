// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// spriteFrameUtils.js

import SystemUtils from '../utils/systemUtils.js';

class SpriteFrameUtils {
    constructor() {
        throw new Error('SpriteFrameUtils is a utility class with only static methods. Do not instantiate.');
    }

    static validateJsonFormat(jsonSprite) {
        const requiredMetadataFields = ['sprite', 'spriteGridSize', 'spritePixelSize', 'palette', 'framesPerSprite'];
        const requiredLayerFields = ['spriteimage', 'imageX', 'imageY', 'imageScale'];

        if (!jsonSprite.metadata || !jsonSprite.layers) {
            console.error(`jsonSprite.metadata || jsonSprite.layers missing\njsonSprite ${JSON.stringify(jsonSprite)}`);
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
                console.error('jsonSprite missing: layer.metadata || layer.data');
                return false;
            }

            for (const field of requiredLayerFields) {
                if (!(field in layer.metadata)) {
                    console.error(`jsonSprite requiredLayerFields missing field: ${field}, \njsonSprite ${JSON.stringify(jsonSprite)}`);
                    return false;
                }
            }
        }

        return true;
    }

    static getLayerData(jsonSprite, frameIndex) {
        if (jsonSprite && jsonSprite.layers && jsonSprite.layers[frameIndex] && jsonSprite.layers[frameIndex].data) {
            return jsonSprite.layers[frameIndex].data;
        }

        console.error('Invalid layer data or index:', jsonSprite);
        return null;
    }

    static setLayerData(jsonSprite, layerData, frameIndex) {
        if (jsonSprite && jsonSprite.layers && jsonSprite.layers[frameIndex]) {
            jsonSprite.layers[frameIndex].data = layerData;
            return;
        }

        console.error('Invalid layer data or index:', jsonSprite, frameIndex);
    }

    static getLayerDimensions(layerData, pixelSize) {
        if (layerData && SystemUtils.getObjectType(layerData) === 'Object' && pixelSize >= 1) {
            const data = layerData.layers[0].data;
            const rowCount = Math.ceil(data.length * pixelSize);
            const colCount = Math.ceil(data[0].length * pixelSize);
            return { width: colCount, height: rowCount };
        }

        if (layerData
            && SystemUtils.getObjectType(layerData) === 'Array'
            && SystemUtils.getObjectType(layerData[0]) === 'Array'
            && pixelSize >= 1) {
            const rowCount = Math.ceil(layerData.length * pixelSize);
            const colCount = Math.ceil(layerData[0].length * pixelSize);
            return { width: colCount, height: rowCount };
        }

        return { width: 10, height: 10, failure: true };
    }

    static getWidthHeight(object, pixelSize, debug = false) {
        let width;
        let height;

        if (Array.isArray(object) && Array.isArray(object[0])) {
            const frame = object.map(row => Array.from(row));
            height = frame.length;
            width = frame[0]?.length || 0;

            if (debug) {
                console.log(`Multi-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame);
            }
        } else if (Array.isArray(object)) {
            const frame = Array.from(object);
            height = frame.length;
            width = frame[0]?.length || 1;

            if (debug) {
                console.log(`Single-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame);
            }
        } else {
            console.error('Invalid object format:', object);
            return { width: 0, height: 0 };
        }

        return {
            width: Math.round(width * pixelSize),
            height: Math.round(height * pixelSize)
        };
    }

    static extractArray(obj) {
        const values = Object.values(obj);
        for (const value of values) {
            if (Array.isArray(value)) {
                return value;
            }
        }
        throw new Error('No array found in the object.');
    }
}

export default SpriteFrameUtils;
