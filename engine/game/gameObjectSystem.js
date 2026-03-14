// ToolboxAid.com
// David Quesenberry
// Global Game Object System
// 03/2026

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
        this.manager = new GameObjectManager(debug);
        this.registry = new GameObjectRegistry(debug);
        this.collision = GameCollision;

        DebugLog.log(this.debug, null, 'GameObjectSystem created');
    }

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
        GameObjectUtils.validateGameObject(gameObject);

        return this.manager.hasGameObject(gameObject);
    }

    getActiveGameObjects() {
        return this.manager.getActiveGameObjects();
    }

    getCount() {
        return this.manager.getCount();
    }

    intersects(objectA, objectB) {
        return this.collision.intersects(objectA, objectB);
    }

    intersectsSides(objectA, objectB) {
        return this.collision.intersectsSides(objectA, objectB);
    }

    isOutOfBounds(object, margin = 0) {
        return this.collision.isOutOfBounds(object, margin);
    }

    getOutOfBoundsSides(object, margin = 0) {
        return this.collision.getOutOfBoundsSides(object, margin);
    }

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

    destroy() {
        return this.clear();
    }
}

export default GameObjectSystem;

