// ToolboxAid.com
// David Quesenberry
// Global Game Object System
// 03/2026

import GameObjectUtils from './game/gameObjectUtils.js';
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
        GameObjectUtils.validateGameObject(gameObject);

        if (!this.manager.addGameObject(gameObject)) {
            ObjectDebug.warn(this.debug, 'Failed to add GameObject to manager', {
                id: gameObject.ID
            });
            return false;
        }

        if (!this.registry.register(gameObject)) {
            ObjectDebug.error(this.debug, 'Failed to register GameObject, rolling back manager add', {
                id: gameObject.ID
            });

            this.manager.removeGameObject(gameObject);
            return false;
        }

        ObjectDebug.log(this.debug, 'GameObject added to system', {
            id: gameObject.ID,
            type: gameObject.type
        });

        return true;
    }

    removeGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

        const unregistered = this.registry.unregister(gameObject);

        if (!unregistered) {
            ObjectDebug.warn(this.debug, 'GameObject was not registered', {
                id: gameObject.ID
            });
        }

        if (!this.manager.removeGameObject(gameObject)) {
            ObjectDebug.error(this.debug, 'Failed to remove GameObject from manager', {
                id: gameObject.ID
            });

            if (unregistered) {
                this.registry.register(gameObject);
            }

            return false;
        }

        ObjectDebug.log(this.debug, 'GameObject removed from system', {
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

    clear() {

        for (const gameObject of this.manager.getActiveGameObjects()) {
            this.removeGameObject(gameObject);
        }

        ObjectDebug.log(this.debug, 'GameObjectSystem cleared');

        return true;
    }

    destroy() {
        return this.clear();
    }
}

export default GameObjectSystem;
