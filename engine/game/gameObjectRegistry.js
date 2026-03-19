// ToolboxAid.com
// David Quesenberry
// Global Game Object Registry
// 03/2026
//
// Runtime-neutral boundary note:
// - Role: internal engine/game identity and lookup registry.
// - Status: retained transitional boundary for compatibility.
// - This first runtime-neutral patch is comment-only and preserves behavior.
// - Non-registry coordination seams are marked as extraction candidates for later cleanup.

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

    // Runtime-neutral compatibility marker:
    // - Primary internal registry entry point retained for legacy call-path stability.
    // - Registry responsibility stays identity-oriented in this patch.
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

    // Runtime-neutral compatibility marker:
    // - Registry removal remains identity-oriented.
    // - Retained even where broader system coordination also participates in teardown.
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

    // Internal compatibility surface retained for existing lookup call paths.
    getById(id) {
        GameObjectUtils.validateId(id);

        return this.#objectsById.get(id) || null;
    }

    // Internal compatibility surface retained for existing lookup call paths.
    hasId(id) {
        GameObjectUtils.validateId(id);

        return this.#objectsById.has(id);
    }

    // Transitional boundary:
    // - Bulk identity reset remains here for compatibility.
    // - Retained without changing broader lifecycle ownership.
    clear() {

        this.#objectsById.clear();

        DebugLog.log(this.debug, null, 'GameObjectRegistry cleared');
    }

    // Internal compatibility surface retained for existing orchestration code.
    getCount() {
        return this.#objectsById.size;
    }
}

export default GameObjectRegistry;
