// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// gameObjectManager.js

import GameObject from './gameObject.js';
import SystemUtils from '../../scripts/utils/systemUtils.js';
class GameObjectManager {
    static DEBUG = new URLSearchParams(window.location.search).has('gameObjectManager');
    #activeGameObjects;

    constructor() {
        this.#activeGameObjects = [];

        if (GameObjectManager.DEBUG) {
            console.log('GameObjects manager initialized');
        }
    }

    getActiveGameObjects() {
        return this.#activeGameObjects;
    }
    
    addGameObject(gameObject) {
        if (!gameObject || !(gameObject instanceof GameObject)) {
            console.error('Invalid gameObject:', gameObject);
            return null;
        }

        this.#activeGameObjects.push(gameObject);
        
        if (GameObjectManager.DEBUG) {
            console.log(`Added ${gameObject.type} gameObject:`, {
                id: gameObject.ID,
                total: this.#activeGameObjects.length
            });
        }

        return gameObject;
    }

    findGameObjectByID(gameObjectID) {
        if (!gameObjectID) {
            console.error('Invalid gameObjectID');
            return null;
        }

        const gameObject = this.#activeGameObjects.find(obj => obj.ID === gameObjectID);

        if (GameObjectManager.DEBUG) {
            if (gameObject) {
                console.log(`Found gameObject:`, {
                    id: gameObjectID,
                    type: gameObject.type,
                    total: this.#activeGameObjects.length
                });
            } else {
                console.warn(`No gameObject found:`, {
                    id: gameObjectID,
                    total: this.#activeGameObjects.length
                });
            }
        }

        return gameObject;
    }

    removeGameObject(gameObject) {
        if (!gameObject) {
            console.error('Invalid gameObject to remove');
            return false;
        }

        const index = this.#activeGameObjects.indexOf(gameObject);
        if (index === -1) {
            console.warn(`GameObject not found in active objects:`, {
                id: gameObject.ID,
                type: gameObject.type
            });
            return false;
        }

        // Call destroy and check result
        SystemUtils.destroy(gameObject);
        // if (!gameObject.destroy()) {
        //     console.error(`Failed to destroy gameObject:`, {
        //         id: gameObject.ID,
        //         type: gameObject.type
        //     });
        //     return false;
        // }

        this.#activeGameObjects.splice(index, 1);
        
        if (GameObjectManager.DEBUG) {
            console.log(`Removed gameObject:`, {
                id: gameObject.ID,
                type: gameObject.type,
                index: index,
                remaining: this.#activeGameObjects.length
            });
        }

        return true;
    }

    destroy() {
        try {
            if (GameObjectManager.DEBUG) {
                console.log(`Destroying GameObjectManager:`, {
                    objects: this.#activeGameObjects.length
                });
            }

            // Destroy all game objects
            while (this.#activeGameObjects.length > 0) {
                this.removeGameObject(this.#activeGameObjects[0]);
            }

            this.#activeGameObjects = null;
            return true;

        } catch (error) {
            console.error('Error during GameObjectManager destruction:', {
                error: error.message,
                stack: error.stack
            });
            return false;
        }
    }
}

export default GameObjectManager;
