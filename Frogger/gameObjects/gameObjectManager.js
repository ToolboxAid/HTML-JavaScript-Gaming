// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// gameObjectManager.js

import GameObject from './gameObject.js';
import SystemUtils from '../../scripts/utils/systemUtils.js';
class GameObjectManager {
    static DEBUG = new URLSearchParams(window.location.search).has('gameObjects');

    constructor() {
        // List of active gameObjects
        this.activeGameObjects = [];

        // GameObject types and their properties
        this.gameObjectTypes = {

            aligator: {
                offsetY: -10,
                sprite: './assets/images/aligator_sprite_48w_48h_4f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48 * 3,
                height: 48
            },

        };

        if (GameObjectManager.DEBUG) {
            console.log('GameObjects manager initialized');
        }
    }

    addGameObject(gameObject) {
        this.activeGameObjects.push(gameObject);

        return gameObject;
    }

    // this.findGameObjectByID(gameObject.ID); // Tested and working
    findGameObjectByID(gameObjectID) {
        // Change obj.id to obj.objectID to match the property name
        const gameObject = this.activeGameObjects.find(obj => obj.ID === gameObjectID);

        if (GameObjectManager.DEBUG) {
            console.log(`Finding gameObject with ID: ${gameObjectID}`);
            if (gameObject) {
                console.log(`Found gameObject with ID ${gameObjectID}:`, gameObject);
            } else {
                console.warn(`No gameObject with ID ${gameObjectID} found in ${this.activeGameObjects.length} objects`);
            }
        }

        return gameObject;
    }

    // Remove a gameObject
    removeGameObject(gameObject) {
        const index = this.activeGameObjects.indexOf(gameObject);
        if (index > -1) {
            this.activeGameObjects.splice(index, 1);
            if (GameObjectManagerGameObjectManager.DEBUG) {
                console.log(`Removed gameObject at index ${index}`);
            }
        }
    }
}

export default GameObjectManager;
