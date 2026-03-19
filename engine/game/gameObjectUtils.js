// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// gameObjectUtils.js
//
// PR-006 boundary note:
// - transitional mixed utility surface for engine/game compatibility
// - currently combines validation, metadata setup/cleanup, and object helper concerns
// - retained as a compatibility surface for existing call paths during boundary cleanup
// - validation/metadata sections below are likely future extraction candidates
// - not yet aligned as a long-term public GameBase-facing boundary
//
// PR-007 boundary note:
// - identity-focused helpers are now extracted to GameObjectIdentityUtils
// - this file retains compatibility delegation for existing callers
// - constructor/metadata helpers remain here pending later cleanup

import ObjectCleanup from '../utils/objectCleanup.js';
import NumberUtils from '../math/numberUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import StringValidation from '../utils/stringValidation.js';
import GameObjectIdentityUtils from './gameObjectIdentityUtils.js';

class GameObjectUtils {
    constructor() {
        throw new Error('GameObjectUtils is a utility class with only static methods. Do not instantiate.');
    }

    // PR-006 seam note:
    // validation/constructor-argument support is a likely future extraction seam.
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

    // PR-006 seam note:
    // metadata initialization/cleanup is a separate concern from object ID validation.
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

    // PR-007 compatibility note:
    // delegated identity validation bridge retained for existing call paths.
    static validateGameObject(gameObject, name = 'gameObject') {
        return GameObjectIdentityUtils.validateGameObject(gameObject, name);
    }

    static validateId(id, name = 'id') {
        return GameObjectIdentityUtils.validateId(id, name);
    }

    static getObjectId(gameObject) {
        return GameObjectIdentityUtils.getObjectId(gameObject);
    }
}

export default GameObjectUtils;
