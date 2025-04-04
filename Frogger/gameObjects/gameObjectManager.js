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
            beaver: {
                offsetY: -10,
                sprite: './assets/images/beaver_sprite_48w_48h_2f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48,
                height: 48
            },

            bonus: {
                offsetY: 0,
                sprite: './assets/images/bonus_sprite_36w_42h_6f.png',
                spriteX: 36 * 2,
                spriteY: 0,
                width: 36,
                height: 42
            },
        };

        if (GameObjectManager.DEBUG) {
            console.log('GameObjects manager initialized');
        }
    }

    // Add a new gameObject
    addGameObject(gameObjectType, x, y) {
        const gameObjectConfig = this.gameObjectTypes[gameObjectType];
        console.log("gameObjectConfig", gameObjectConfig);
        if (!gameObjectConfig) {
            console.error(`Invalid gameObject gameObjectType: ${gameObjectType}`);
            return null;
        }

        // Create a new gameObject instance
        const gameObject = new GameObject(
            x, y,
            gameObjectConfig.sprite,
            gameObjectConfig.spriteX, gameObjectConfig.spriteY,
            gameObjectConfig.width, gameObjectConfig.height,
            1.5, // Pixel size
            'black',
            gameObjectType,
            Math.random() < 0.5 ? -10 : 10,  // 50% chance of -1 or 1 -- velocityX
            0 // velocityY
        );

        this.activeGameObjects.push(gameObject);

        if (GameObjectManager.DEBUG) {
            console.log(`Added ${gameObjectType} gameObject at (${x},${y})`);
        }

        return gameObject;
    }

    addGameObject2(gameObject) {
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
