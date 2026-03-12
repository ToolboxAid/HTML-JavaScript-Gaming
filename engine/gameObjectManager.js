// ToolboxAid.com
// David Quesenberry
// Global Game Object Manager
// 03/2026

import GameObject from './gameObject.js';
import ObjectDebug from './utils/objectDebug.js';
import ObjectValidation from './utils/objectValidation.js';
import SystemUtils from './utils/systemUtils.js';

class GameObjectManager {

    #activeGameObjects;

    constructor(debug = false) {

        ObjectValidation.boolean(debug, 'debug');

        this.debug = debug;
        this.#activeGameObjects = [];

        ObjectDebug.log(this.debug, 'GameObjectManager created');
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

        ObjectValidation.instanceOf(gameObject, 'gameObject', GameObject);

        if (this.#activeGameObjects.includes(gameObject)) {
            ObjectDebug.warn(this.debug, 'GameObject already managed', {
                id: gameObject.ID
            });
            return false;
        }

        this.#activeGameObjects.push(gameObject);

        ObjectDebug.log(this.debug, 'GameObject added', {
            id: gameObject.ID,
            type: gameObject.type
        });

        return true;
    }

    findGameObjectById(id) {

        ObjectValidation.nonEmptyString(id, 'id');

        const obj = this.#activeGameObjects.find(
            gameObject => gameObject.ID === id
        );

        return obj || null;
    }

    removeGameObject(gameObject) {

        ObjectValidation.instanceOf(gameObject, 'gameObject', GameObject);

        const index = this.#activeGameObjects.indexOf(gameObject);

        if (index === -1) {
            ObjectDebug.warn(this.debug, 'GameObject not found in manager', {
                id: gameObject.ID
            });
            return false;
        }

        const destroyed = SystemUtils.destroy(gameObject);

        if (!destroyed) {
            ObjectDebug.error(this.debug, 'GameObject destroy failed', {
                id: gameObject.ID
            });
            return false;
        }

        this.#activeGameObjects.splice(index, 1);

        ObjectDebug.log(this.debug, 'GameObject removed', {
            id: gameObject.ID
        });

        return true;
    }

    destroy() {

        for (const gameObject of [...this.#activeGameObjects]) {
            this.removeGameObject(gameObject);
        }

        this.#activeGameObjects = [];

        ObjectDebug.log(this.debug, 'GameObjectManager destroyed');

        return true;
    }
}

export default GameObjectManager;