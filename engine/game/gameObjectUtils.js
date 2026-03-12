// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// gameObjectUtils.js

import ObjectCleanup from '../utils/objectCleanup.js';
import ObjectValidation from '../utils/objectValidation.js';

class GameObjectUtils {
    constructor() {
        throw new Error('GameObjectUtils is a utility class with only static methods. Do not instantiate.');
    }

    static validateConstructorArgs({
        x,
        y,
        imagePath,
        spriteWidth,
        spriteHeight,
        type,
        debug
    }) {
        ObjectValidation.finiteNumber(x, 'x');
        ObjectValidation.finiteNumber(y, 'y');
        ObjectValidation.nonEmptyString(imagePath, 'imagePath');
        ObjectValidation.positiveNumber(spriteWidth, 'spriteWidth');
        ObjectValidation.positiveNumber(spriteHeight, 'spriteHeight');
        ObjectValidation.nonEmptyString(type, 'type');
        ObjectValidation.boolean(debug, 'debug');
    }

    static initializeMetadata(target, { type, debug }) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        target.type = type;
        target.debug = debug;
    }

    static destroyMetadata(target) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        ObjectCleanup.nullifyProperties(target, ['type']);
    }
}

export default GameObjectUtils;
