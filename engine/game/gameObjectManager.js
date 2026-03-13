// ToolboxAid.com
// David Quesenberry
// Global Game Object Manager
// 03/2026

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

    getActiveGameObjects() {
        return [...this.#activeGameObjects];
    }

    getCount() {
        return this.#activeGameObjects.length;
    }

    hasGameObject(gameObject) {
        return this.#activeGameObjects.includes(gameObject);
    }

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

    findGameObjectById(id) {
        GameObjectUtils.validateId(id);

        const obj = this.#activeGameObjects.find(
            gameObject => gameObject.ID === id
        );

        return obj || null;
    }

    removeGameObject(gameObject) {
        GameObjectUtils.validateGameObject(gameObject);

        const index = this.#activeGameObjects.indexOf(gameObject);

        if (index === -1) {
            DebugLog.warn(this.debug, null, 'GameObject not found in manager', {
                id: gameObject.ID
            });
            return false;
        }

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

        for (const gameObject of [...this.#activeGameObjects]) {
            this.removeGameObject(gameObject);
        }

        this.#activeGameObjects = [];

        DebugLog.log(this.debug, null, 'GameObjectManager destroyed');

        return true;
    }
}

export default GameObjectManager;

