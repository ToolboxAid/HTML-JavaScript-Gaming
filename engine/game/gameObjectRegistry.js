// ToolboxAid.com
// David Quesenberry
// Global Game Object Registry
// 03/2026
//
// PR-003 boundary note:
// - internal registry boundary
// - registry owns ID registration and ID lookup only
// - retained as a compatibility surface for existing engine/game call paths
// - lifecycle destruction and multi-part sequencing remain outside this file
//
// PR-008 migration note:
// - internal identity-oriented callers now use GameObjectIdentityUtils directly
// - this reduces reliance on the GameObjectUtils compatibility bridge in registry code

import GameObjectIdentityUtils from './gameObjectIdentityUtils.js';
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
        const id = GameObjectIdentityUtils.getObjectId(gameObject);

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
        const id = GameObjectIdentityUtils.getObjectId(gameObject);

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
        GameObjectIdentityUtils.validateId(id);

        return this.#objectsById.get(id) || null;
    }

    hasId(id) {
        GameObjectIdentityUtils.validateId(id);

        return this.#objectsById.has(id);
    }

    clear() {

        // PR-003 boundary note:
        // registry clear is storage-only and does not perform full system removal,
        // lifecycle coordination, or rollback sequencing.
        this.#objectsById.clear();

        DebugLog.log(this.debug, null, 'GameObjectRegistry cleared');
    }

    getCount() {
        return this.#objectsById.size;
    }
}

export default GameObjectRegistry;
