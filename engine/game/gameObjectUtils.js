// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// gameObjectUtils.js
//
// Runtime-neutral boundary note:
// - Role: internal engine/game object helper and validation utility.
// - Status: retained transitional boundary for compatibility.
// - This first runtime-neutral patch is comment-only and preserves behavior.
// - Mixed helper responsibilities are marked as extraction candidates for later cleanup.

import ObjectCleanup from '../utils/objectCleanup.js';
import NumberUtils from '../math/numberUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import StringValidation from '../utils/stringValidation.js';

class GameObjectUtils {
    constructor() {
        throw new Error('GameObjectUtils is a utility class with only static methods. Do not instantiate.');
    }

    // Transitional boundary:
    // - Constructor validation remains centralized here for compatibility.
    // - Candidate for later narrowing if object creation contracts move closer to public GameBase-facing APIs.
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

    // Transitional compatibility marker:
    // - Metadata initialization remains here to preserve current helper ownership.
    static initializeMetadata(target, { type, debug }) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        target.type = type;
        target.debug = debug;
    }

    // Transitional compatibility marker:
    // - Metadata teardown remains here for legacy call-path stability.
    static destroyMetadata(target) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        ObjectCleanup.nullifyProperties(target, ['type']);
    }

    // Runtime-neutral compatibility marker:
    // - Core object validation retained for manager, registry, and system coordination.
    // - Extraction candidate if domain-specific validation boundaries narrow later.
    static validateGameObject(gameObject, name = 'gameObject') {
        if (!gameObject || typeof gameObject !== 'object') {
            throw new Error(`${name} must be an object.`);
        }

        if (typeof gameObject.destroy !== 'function') {
            throw new Error(`${name} must define a destroy() method.`);
        }

        this.validateId(gameObject.ID, `${name}.ID`);
    }

    // Internal compatibility surface retained for existing identity validation.
    static validateId(id, name = 'id') {
        const isValidString = typeof id === 'string' && id.trim() !== '';
        const isValidNumber = NumberUtils.isFiniteNumber(id);

        if (!isValidString && !isValidNumber) {
            throw new Error(`${name} must be a non-empty string or finite number.`);
        }
    }

    // Internal compatibility surface retained for existing identity lookup code.
    static getObjectId(gameObject) {
        this.validateGameObject(gameObject);
        return gameObject.ID;
    }
}

export default GameObjectUtils;
