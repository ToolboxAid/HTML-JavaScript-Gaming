// ToolboxAid.com
// David Quesenberry
// Global Game Object System
// 03/2026

import GameObject from './gameObject.js';
import GameObjectManager from './gameObjectManager.js';
import GameObjectRegistry from './gameObjectRegistry.js';
import ObjectDebug from './utils/objectDebug.js';
import ObjectValidation from './utils/objectValidation.js';

class GameObjectSystem {

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;
        this.manager = new GameObjectManager(debug);
        this.registry = new GameObjectRegistry(debug);

        ObjectDebug.log(this.debug, 'GameObjectSystem created');
    }

    addGameObject(gameObject) {

        ObjectValidation.instanceOf(gameObject, 'gameObject', GameObject);

        if (!this.manager.addGameObject(gameObject)) {
            ObjectDebug.warn(this.debug, 'Failed to add GameObject to manager', {
                id: gameObject.objectId ?? gameObject.ID
            });
            return false;
        }

        if (!this.registry.register(gameObject)) {
            ObjectDebug.error(this.debug, 'Failed to register GameObject, rolling back manager add', {
                id: gameObject.objectId ?? gameObject.ID
            });

            this.manager.removeGameObject(gameObject);
            return false;
        }

        ObjectDebug.log(this.debug, 'GameObject added to system', {
            id: gameObject.objectId ?? gameObject.ID,
            type: gameObject.type
        });

        return true;
    }

    removeGameObject(gameObject) {

        ObjectValidation.instanceOf(gameObject, 'gameObject', GameObject);

        if (!this.manager.hasGameObject(gameObject)) {
            ObjectDebug.warn(this.debug, 'GameObject not found in manager', {
                id: gameObject.ID
            });
            return false;
        }

        if (!this.registry.unregister(gameObject)) {
            ObjectDebug.warn(this.debug, 'GameObject not found in registry', {
                id: gameObject.ID
            });
        }

        if (!this.manager.removeGameObject(gameObject)) {
            ObjectDebug.error(this.debug, 'Failed to remove GameObject from manager', {
                id: gameObject.ID
            });
            return false;
        }

        ObjectDebug.log(this.debug, 'GameObject removed from system', {
            id: gameObject.ID
        });

        return true;
    }

    getGameObjectById(id) {

        ObjectValidation.nonEmptyString(id, 'id');

        return this.registry.getById(id);
    }

    hasGameObjectById(id) {

        ObjectValidation.nonEmptyString(id, 'id');

        return this.registry.hasId(id);
    }

    hasGameObject(gameObject) {

        ObjectValidation.instanceOf(gameObject, 'gameObject', GameObject);

        return this.manager.hasGameObject(gameObject);
    }

    getActiveGameObjects() {
        return this.manager.getActiveGameObjects();
    }

    getCount() {
        return this.manager.getCount();
    }

    clear() {

        for (const gameObject of this.manager.getActiveGameObjects()) {
            this.removeGameObject(gameObject);
        }

        ObjectDebug.log(this.debug, 'GameObjectSystem cleared');

        return true;
    }

    destroy() {

        this.clear();

        ObjectDebug.log(this.debug, 'GameObjectSystem destroyed');

        return true;
    }
}

export default GameObjectSystem;