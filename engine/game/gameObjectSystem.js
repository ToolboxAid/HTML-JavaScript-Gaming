// ToolboxAid.com
// David Quesenberry
// Global Game Object System
// 03/2026
//
// PR-003 boundary note:
// - transitional orchestration boundary
// - system coordinates manager + registry sequencing and rollback
// - registry remains identity/lookup focused
// - manager remains active-object membership focused
//
// PR-004 lifecycle note:
// - system is the authoritative full-system lifecycle boundary
// - system owns top-level add/remove sequencing across manager + registry
// - system owns full clear/destroy entry points for the object system
// - manager teardown remains subordinate to system-level orchestration
//
// PR-005 collision note:
// - collision access is retained here only as a transitional compatibility facade
// - collision semantics live in GameCollision, not in system ownership
// - system passthrough methods remain for compatibility with existing engine/game call paths
//
// PR-008 migration note:
// - internal identity-oriented validation now uses GameObjectIdentityUtils directly
// - GameObjectUtils remains available as a compatibility bridge for existing callers elsewhere

import GameObjectIdentityUtils from './gameObjectIdentityUtils.js';
import GameObjectManager from './gameObjectManager.js';
import GameCollision from './gameCollision.js';
import GameObjectRegistry from './gameObjectRegistry.js';
import DebugLog from '../utils/debugLog.js';
import ObjectValidation from '../utils/objectValidation.js';

class GameObjectSystem {

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;
        this.manager = new GameObjectManager(debug);
        this.registry = new GameObjectRegistry(debug);

        // PR-005 collision note:
        // retained compatibility wiring to the canonical collision utility boundary.
        this.collision = GameCollision;

        DebugLog.log(this.debug, null, 'GameObjectSystem created');
    }

    addGameObject(gameObject) {
        GameObjectIdentityUtils.validateGameObject(gameObject);

        // PR-003 orchestration note:
        // system owns add sequencing across active membership and ID registration.
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

            this.manager.removeGameObject(gameObject);
            return false;
        }

        DebugLog.log(this.debug, null, 'GameObject added to system', {
            id: gameObject.ID,
            type: gameObject.type
        });

        return true;
    }

    removeGameObject(gameObject) {
        GameObjectIdentityUtils.validateGameObject(gameObject);

        // PR-003 orchestration note:
        // system owns remove sequencing and compensating rollback between
        // registry state and manager-owned active membership.
        //
        // PR-004 lifecycle note:
        // this is the authoritative full-system removal path because it coordinates
        // manager-owned teardown with registry-owned identity state.
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

    getGameObjectById(id) {
        return this.registry.getById(id);
    }

    hasGameObjectById(id) {
        return this.registry.hasId(id);
    }

    hasGameObject(gameObject) {
        GameObjectIdentityUtils.validateGameObject(gameObject);

        return this.manager.hasGameObject(gameObject);
    }

    getActiveGameObjects() {
        return this.manager.getActiveGameObjects();
    }

    getCount() {
        return this.manager.getCount();
    }

    intersects(objectA, objectB) {
        // PR-005 collision note:
        // transitional compatibility passthrough to GameCollision.
        return this.collision.intersects(objectA, objectB);
    }

    intersectsSides(objectA, objectB) {
        // PR-005 collision note:
        // transitional compatibility passthrough to GameCollision.
        return this.collision.intersectsSides(objectA, objectB);
    }

    isOutOfBounds(object, margin = 0) {
        // PR-005 collision note:
        // transitional compatibility passthrough to GameCollision.
        return this.collision.isOutOfBounds(object, margin);
    }

    getOutOfBoundsSides(object, margin = 0) {
        // PR-005 collision note:
        // transitional compatibility passthrough to GameCollision.
        return this.collision.getOutOfBoundsSides(object, margin);
    }

    clear() {
        // PR-003 boundary note:
        // full system clear is authoritative here because it coordinates
        // active-object removal through the manager-backed removal path.
        //
        // PR-004 lifecycle note:
        // system clear remains the top-level full object-system lifecycle path.
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

    destroy() {
        // PR-004 lifecycle note:
        // system destroy delegates to the authoritative full-system clear path.
        return this.clear();
    }
}

export default GameObjectSystem;
