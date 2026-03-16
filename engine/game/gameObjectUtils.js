// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// gameObjectUtils.js

import ObjectCleanup from '../utils/objectCleanup.js';
import NumberUtils from '../math/numberUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import StringValidation from '../utils/stringValidation.js';

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
        NumberUtils.finiteNumber(x, 'x');
        NumberUtils.finiteNumber(y, 'y');
        StringValidation.nonEmptyString(imagePath, 'imagePath');
        NumberUtils.positiveNumber(spriteWidth, 'spriteWidth');
        NumberUtils.positiveNumber(spriteHeight, 'spriteHeight');
        StringValidation.nonEmptyString(type, 'type');
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

    static validateGameObject(gameObject, name = 'gameObject') {
        if (!gameObject || typeof gameObject !== 'object') {
            throw new Error(`${name} must be an object.`);
        }

        if (typeof gameObject.destroy !== 'function') {
            throw new Error(`${name} must define a destroy() method.`);
        }

        this.validateId(gameObject.ID, `${name}.ID`);
    }

    static validateId(id, name = 'id') {
        const isValidString = typeof id === 'string' && id.trim() !== '';
        const isValidNumber = NumberUtils.isFiniteNumber(id);

        if (!isValidString && !isValidNumber) {
            throw new Error(`${name} must be a non-empty string or finite number.`);
        }
    }

    static getObjectId(gameObject) {
        this.validateGameObject(gameObject);
        return gameObject.ID;
    }
}

export default GameObjectUtils;
