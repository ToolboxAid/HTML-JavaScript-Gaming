// ToolboxAid.com
// David Quesenberry
// Global Game Object System
// 03/2026
//
// Runtime-neutral boundary note:
// - Role: public engine/game orchestration surface for object management, lookup, and collision access.
// - Status: retained transitional boundary for compatibility.
// - This first runtime-neutral patch is comment-only and preserves behavior.
// - Manager, registry, and collision overlap points are marked for later extraction or narrowing.

import GameObjectUtils from './gameObjectUtils.js';
import GameObjectManager from './gameObjectManager.js';
import GameCollision from './gameCollision.js';
import GameObjectRegistry from './gameObjectRegistry.js';
import DebugLog from '../utils/debugLog.js';
import ObjectValidation from '../utils/objectValidation.js';

class GameObjectSystem {

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;

        // Runtime-neutral compatibility marker:
        // - System currently composes manager, registry, and collision at one public boundary.
        // - Retained for legacy call-path stability while future narrowing is planned.
        this.manager = new GameObjectManager(debug);
        this.registry = new GameObjectRegistry(debug);
        this.collision = GameCollision;

        DebugLog.log(this.debug, null, 'GameObjectSystem created');
    }

    // Transitional boundary:
    // - Public orchestration entry point retained for compatibility.
    // - Coordinates validation, manager ownership, and registry identity in one place for now.
    addGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

        if (!this.manager.addGameObject(gameObject)) {
            DebugLog.warn(this.debug, null, 'Failed to add GameObject to manager', {
                id: gameObject.ID
            });
            return false;
        }

        try {
            this.registry.register(gameObject);
        } catch (error) {
            DebugLog.error(this.debug, null, 'Failed to register GameObject, rolling back manager add', {
                id: gameObject.ID,
                error: error.message
            });

            // Runtime-neutral compatibility marker:
            // - Rollback path is retained exactly to preserve current manager/registry coordination.
            this.manager.removeGameObject(gameObject);
            return false;
        }

        DebugLog.log(this.debug, null, 'GameObject added to system', {
            id: gameObject.ID,
            type: gameObject.type
        });

        return true;
    }

    // Transitional boundary:
    // - Public teardown entry point retained for compatibility.
    // - Coordinates registry and manager responsibilities that may narrow in a later PR.
    removeGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

        const unregistered = this.registry.unregister(gameObject);

        if (!unregistered) {
            DebugLog.warn(this.debug, null, 'GameObject was not registered', {
                id: gameObject.ID
            });
        }

        if (!this.manager.removeGameObject(gameObject)) {
            DebugLog.error(this.debug, null, 'Failed to remove GameObject from manager', {
                id: gameObject.ID
            });

            // Compatibility marker:
            // - Registry rollback remains here for legacy call-path stability.
            if (unregistered) {
                this.registry.register(gameObject);
            }

            return false;
        }

        DebugLog.log(this.debug, null, 'GameObject removed from system', {
            id: gameObject.ID
        });

        return true;
    }

    // Public compatibility surface retained for identity lookup.
    getGameObjectById(id) {
        return this.registry.getById(id);
    }

    // Public compatibility surface retained for identity lookup.
    hasGameObjectById(id) {
        return this.registry.hasId(id);
    }

    // Public compatibility surface retained for manager-backed containment checks.
    hasGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

        return this.manager.hasGameObject(gameObject);
    }

    // Public compatibility surface retained for manager-backed enumeration.
    getActiveGameObjects() {
        return this.manager.getActiveGameObjects();
    }

    // Public compatibility surface retained for manager-backed counts.
    getCount() {
        return this.manager.getCount();
    }

    // Runtime-neutral compatibility marker:
    // - Collision passthrough retained at the public system boundary.
    // - Extraction candidate if collision access separates from object orchestration later.
    intersects(objectA, objectB) {
        return this.collision.intersects(objectA, objectB);
    }

    // Runtime-neutral compatibility marker:
    // - Side-aware collision passthrough retained for compatibility.
    intersectsSides(objectA, objectB) {
        return this.collision.intersectsSides(objectA, objectB);
    }

    // Runtime-neutral compatibility marker:
    // - Bounds passthrough retained at the public system boundary.
    isOutOfBounds(object, margin = 0) {
        return this.collision.isOutOfBounds(object, margin);
    }

    // Runtime-neutral compatibility marker:
    // - Bounds-side passthrough retained at the public system boundary.
    getOutOfBoundsSides(object, margin = 0) {
        return this.collision.getOutOfBoundsSides(object, margin);
    }

    // Transitional boundary:
    // - Bulk clear currently coordinates public teardown through manager and registry.
    // - Retained exactly for compatibility in this first runtime-neutral patch.
    clear() {
        const activeGameObjects = this.manager.getActiveGameObjects(false);
        while (activeGameObjects.length > 0) {
            const gameObject = activeGameObjects[activeGameObjects.length - 1];
            if (!this.removeGameObject(gameObject)) {
                return false;
            }
        }

        DebugLog.log(this.debug, null, 'GameObjectSystem cleared');

        return true;
    }

    // Public compatibility surface retained for existing destroy call paths.
    destroy() {
        return this.clear();
    }
}

export default GameObjectSystem;
