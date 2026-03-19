// ToolboxAid.com
// David Quesenberry
// 03/19/2026
// gameObjectIdentityUtils.js
//
// PR-007 boundary note:
// - internal identity-focused utility boundary
// - owns object validity checks, ID validation, and object ID access
// - extracted from the mixed gameObjectUtils surface
// - intended for future direct internal usage while compatibility delegation remains in GameObjectUtils

import NumberUtils from '../math/numberUtils.js';

class GameObjectIdentityUtils {
    constructor() {
        throw new Error('GameObjectIdentityUtils is a utility class with only static methods. Do not instantiate.');
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

export default GameObjectIdentityUtils;
