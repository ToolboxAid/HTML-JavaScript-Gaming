// ToolboxAid.com
// David Quesenberry
// Global Game Object Manager
// 03/2026
//
// PR-004 boundary note:
// - internal active-membership boundary
// - manager owns the active game object collection
// - manager supports add/remove operations for managed active objects
// - manager is retained as a compatibility surface for existing engine/game call paths
// - full-system sequencing, registry coordination, and top-level lifecycle authority remain outside this file
//
// PR-009 migration note:
// - manager now uses GameObjectIdentityUtils directly for object validation
// - this reduces reliance on the GameObjectUtils compatibility bridge in internal manager code

import GameObjectIdentityUtils from './gameObjectIdentityUtils.js';
import DebugLog from '../utils/debugLog.js';
import ObjectValidation from '../utils/objectValidation.js';
import SystemUtils from '../utils/systemUtils.js';

class GameObjectManager {

    #activeGameObjects;

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;
        this.#activeGameObjects = [];

        DebugLog.log(this.debug, null, 'GameObjectManager created');
    }

    getActiveGameObjects(useSnapshot = true) {
        if (useSnapshot) {
            return [...this.#activeGameObjects];
        }
        return this.#activeGameObjects;
    }

    getCount() {
        return this.#activeGameObjects.length;
    }

    hasGameObject(gameObject) {
        return this.#activeGameObjects.includes(gameObject);
    }

    addGameObject(gameObject) {
        GameObjectIdentityUtils.validateGameObject(gameObject);

        if (this.#activeGameObjects.includes(gameObject)) {
            DebugLog.warn(this.debug, null, 'GameObject already managed', {
                id: gameObject.ID
            });
            return false;
        }

        this.#activeGameObjects.push(gameObject);

        DebugLog.log(this.debug, null, 'GameObject added', {
            id: gameObject.ID,
            type: gameObject.type
        });

        return true;
    }

    removeGameObject(gameObject) {
        GameObjectIdentityUtils.validateGameObject(gameObject);

        const index = this.#activeGameObjects.indexOf(gameObject);

        if (index === -1) {
            DebugLog.warn(this.debug, null, 'GameObject not found in manager', {
                id: gameObject.ID
            });
            return false;
        }

        // PR-004 lifecycle note:
        // manager removal handles active-membership teardown for a managed object.
        // Full-system orchestration and registry sequencing remain system-owned.
        const destroyed = SystemUtils.destroy(gameObject);

        if (!destroyed) {
            DebugLog.error(this.debug, null, 'GameObject destroy failed', {
                id: gameObject.ID
            });
            return false;
        }

        this.#activeGameObjects.splice(index, 1);

        DebugLog.log(this.debug, null, 'GameObject removed', {
            id: gameObject.ID
        });

        return true;
    }

    destroy() {
        // PR-004 lifecycle note:
        // manager destroy is manager-scoped teardown of managed active membership.
        // It is not the authoritative full object-system lifecycle entry point.
        for (let i = this.#activeGameObjects.length - 1; i >= 0; i -= 1) {
            this.removeGameObject(this.#activeGameObjects[i]);
        }

        this.#activeGameObjects = [];

        DebugLog.log(this.debug, null, 'GameObjectManager destroyed');

        return true;
    }
}

export default GameObjectManager;
