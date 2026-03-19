// ToolboxAid.com
// David Quesenberry
// Global Game Object Manager
// 03/2026
//
// Runtime-neutral boundary note:
// - Role: internal engine/game active-object manager.
// - Status: retained transitional boundary for compatibility.
// - This first runtime-neutral patch is comment-only and preserves behavior.
// - Extraction candidates are marked where manager responsibilities overlap with system or utility concerns.

import GameObjectUtils from './gameObjectUtils.js';
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

    // Compatibility surface:
    // - Internal read access retained for legacy call paths.
    // - Snapshot behavior remains unchanged in this runtime-neutral patch.
    getActiveGameObjects(useSnapshot = true) {
        if (useSnapshot) {
            return [...this.#activeGameObjects];
        }
        return this.#activeGameObjects;
    }

    // Internal compatibility surface retained for existing orchestration code.
    getCount() {
        return this.#activeGameObjects.length;
    }

    // Internal compatibility surface retained for existing orchestration code.
    hasGameObject(gameObject) {
        return this.#activeGameObjects.includes(gameObject);
    }

    // Runtime-neutral compatibility marker:
    // - Manager retains active-object orchestration at this boundary.
    // - Validation remains delegated to gameObjectUtils for compatibility.
    addGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

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

    // Transitional boundary:
    // - Manager currently coordinates both containment and destruction.
    // - Extraction candidate if lifecycle teardown moves to a narrower internal boundary later.
    removeGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

        const index = this.#activeGameObjects.indexOf(gameObject);

        if (index === -1) {
            DebugLog.warn(this.debug, null, 'GameObject not found in manager', {
                id: gameObject.ID
            });
            return false;
        }

        // Compatibility marker:
        // - Destruction remains delegated through shared system utilities.
        // - Retained for legacy call-path stability in this patch.
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

    // Transitional boundary:
    // - Bulk teardown is retained here for compatibility.
    // - Candidate for later lifecycle narrowing once manager/system ownership is cleaner.
    destroy() {
        for (let i = this.#activeGameObjects.length - 1; i >= 0; i -= 1) {
            this.removeGameObject(this.#activeGameObjects[i]);
        }

        this.#activeGameObjects = [];

        DebugLog.log(this.debug, null, 'GameObjectManager destroyed');

        return true;
    }
}

export default GameObjectManager;
