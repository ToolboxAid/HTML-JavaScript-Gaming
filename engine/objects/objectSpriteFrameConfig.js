import SystemUtils from '../utils/systemUtils.js';
import Sprite from '../sprite.js';
import ObjectValidation from '../utils/objectValidation.js';

class ObjectSpriteFrameConfig {
    constructor() {
        throw new Error('ObjectSpriteFrameConfig is a utility class with only static methods. Do not instantiate.');
    }

    static getFrameType(object) {
        if (!object) {
            return 'null';
        }

        if (SystemUtils.getObjectType(object) === 'Object') {
            return 'json';
        }

        if (
            Array.isArray(object) &&
            object.length > 0 &&
            typeof object[0] === 'string'
        ) {
            return 'singleFrame';
        }

        if (
            Array.isArray(object) &&
            object.length > 0 &&
            Array.isArray(object[0]) &&
            object[0].length > 0 &&
            typeof object[0][0] === 'string'
        ) {
            return 'multiFrame';
        }

        if (SystemUtils.getObjectType(object) === 'String') {
            return 'string';
        }

        return 'unknown';
    }

    static extractArray(obj) {
        for (const value of Object.values(obj)) {
            if (Array.isArray(value)) {
                return value;
            }
        }

        throw new Error('No array found in the object.');
    }

    static normalizeFrames(frames, frameType) {
        if (!frames) {
            return null;
        }

        if (frameType === 'json') {
            return frames;
        }

        if (frameType === 'singleFrame') {
            return [frames];
        }

        if (frameType === 'multiFrame') {
            return frames;
        }

        throw new Error(`Unsupported frame type for normalization: ${frameType}`);
    }

    static create(livingFrames, dyingFrames = null, pixelSize = 1, palette = null) {
        if (!livingFrames || (Array.isArray(livingFrames) && livingFrames.length === 0)) {
            throw new Error('livingFrames must be provided.');
        }

        const frameType = ObjectSpriteFrameConfig.getFrameType(livingFrames);

        let spritePixelSize = pixelSize;
        let dimensions = null;

        let normalizedLivingFrames = null;
        let normalizedDyingFrames = null;

        let livingDelay = 30;
        let dyingDelay = 7;

        let livingFrameCount = 0;
        let dyingFrameCount = 0;

        switch (frameType) {
            case 'json': {
                Sprite.validateJsonFormat(livingFrames);

                spritePixelSize = livingFrames.metadata.spritePixelSize;
                livingDelay = livingFrames.metadata.framesPerSprite ?? 30;

                let paletteArray = null;
                if (palette) {
                    paletteArray = ObjectSpriteFrameConfig.extractArray(palette);
                }

                normalizedLivingFrames = Sprite.convert2RGB(livingFrames, paletteArray);
                dimensions = Sprite.getLayerDimensions(normalizedLivingFrames[0], spritePixelSize);
                livingFrameCount = normalizedLivingFrames.length;

                if (dyingFrames) {
                    Sprite.validateJsonFormat(dyingFrames);

                    dyingDelay = dyingFrames.metadata.framesPerSprite ?? 7;
                    normalizedDyingFrames = Sprite.convert2RGB(dyingFrames, paletteArray);
                    dyingFrameCount = normalizedDyingFrames.length;
                }

                break;
            }

            case 'singleFrame':
            case 'multiFrame': {
                ObjectValidation.positiveNumber(spritePixelSize, 'pixelSize');

                normalizedLivingFrames = ObjectSpriteFrameConfig.normalizeFrames(livingFrames, frameType);
                dimensions = Sprite.getLayerDimensions(normalizedLivingFrames[0], spritePixelSize);
                livingFrameCount = normalizedLivingFrames.length;

                if (dyingFrames) {
                    const dyingFrameType = ObjectSpriteFrameConfig.getFrameType(dyingFrames);
                    normalizedDyingFrames = ObjectSpriteFrameConfig.normalizeFrames(dyingFrames, dyingFrameType);
                    dyingFrameCount = normalizedDyingFrames.length;
                }

                break;
            }

            default:
                throw new Error(`Unsupported frame type: ${frameType}`);
        }

        return {
            frameType,
            pixelSize: spritePixelSize,
            dimensions,
            livingFrames: normalizedLivingFrames,
            dyingFrames: normalizedDyingFrames,
            livingDelay,
            dyingDelay,
            livingFrameCount,
            dyingFrameCount
        };
    }
}

export default ObjectSpriteFrameConfig;
