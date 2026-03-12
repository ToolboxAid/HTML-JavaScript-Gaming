// ToolboxAid.com
// David Quesenberry
// Global Game Object Registry
// 03/2026

import GameObjectUtils from './game/gameObjectUtils.js';
import ObjectDebug from './utils/objectDebug.js';
import ObjectValidation from './utils/objectValidation.js';

class GameObjectRegistry {

    #objectsById;

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;
        this.#objectsById = new Map();

        ObjectDebug.log(this.debug, 'GameObjectRegistry created');
    }

    getObjectId(gameObject) {
        return GameObjectUtils.getObjectId(gameObject);
    }

    register(gameObject) {

        const id = this.getObjectId(gameObject);

        if (this.#objectsById.has(id)) {
            throw new Error(`Duplicate GameObject ID detected: ${id}`);
        }

        this.#objectsById.set(id, gameObject);

        ObjectDebug.log(this.debug, 'GameObject registered', {
            id: id,
            type: gameObject.type
        });

        return true;
    }

    unregister(gameObject) {

        const id = this.getObjectId(gameObject);

        if (!this.#objectsById.has(id)) {
            ObjectDebug.warn(this.debug, 'GameObject not found in registry', {
                id: id
            });
            return false;
        }

        this.#objectsById.delete(id);

        ObjectDebug.log(this.debug, 'GameObject unregistered', {
            id: id
        });

        return true;
    }

    validateId(id) {
        GameObjectUtils.validateId(id);
    }

    getById(id) {

        this.validateId(id);

        return this.#objectsById.get(id) || null;
    }

    hasId(id) {

        this.validateId(id);

        return this.#objectsById.has(id);
    }

    clear() {

        this.#objectsById.clear();

        ObjectDebug.log(this.debug, 'GameObjectRegistry cleared');
    }

    getCount() {
        return this.#objectsById.size;
    }
}

export default GameObjectRegistry;
