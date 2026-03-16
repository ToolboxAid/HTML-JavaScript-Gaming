// ToolboxAid.com
// David Quesenberry
// Global Game Object Registry
// 03/2026

import GameObjectUtils from './gameObjectUtils.js';
import DebugLog from '../utils/debugLog.js';
import ObjectValidation from '../utils/objectValidation.js';

class GameObjectRegistry {

    #objectsById;

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;
        this.#objectsById = new Map();

        DebugLog.log(this.debug, null, 'GameObjectRegistry created');
    }

    register(gameObject) {
        const id = GameObjectUtils.getObjectId(gameObject);

        if (this.#objectsById.has(id)) {
            throw new Error(`Duplicate GameObject ID detected: ${id}`);
        }

        this.#objectsById.set(id, gameObject);

        DebugLog.log(this.debug, null, 'GameObject registered', {
            id: id,
            type: gameObject.type
        });

        return true;
    }

    unregister(gameObject) {
        const id = GameObjectUtils.getObjectId(gameObject);

        if (!this.#objectsById.has(id)) {
            DebugLog.warn(this.debug, null, 'GameObject not found in registry', {
                id: id
            });
            return false;
        }

        this.#objectsById.delete(id);

        DebugLog.log(this.debug, null, 'GameObject unregistered', {
            id: id
        });

        return true;
    }

    getById(id) {
        GameObjectUtils.validateId(id);

        return this.#objectsById.get(id) || null;
    }

    hasId(id) {
        GameObjectUtils.validateId(id);

        return this.#objectsById.has(id);
    }

    clear() {

        this.#objectsById.clear();

        DebugLog.log(this.debug, null, 'GameObjectRegistry cleared');
    }

    getCount() {
        return this.#objectsById.size;
    }
}

export default GameObjectRegistry;

