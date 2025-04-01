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
            car1: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 2
            },
            bulldozer: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 1
            },

            truck: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48 * 2,
                spriteY: 0,
                width: 48 * 2,
                height: 42,
                speed: 1.5
            },
            car2: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48 * 4,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 2
            },
            car3: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48 * 5,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 2
            },

            logSm: {
                sprite: './assets/images/log_sprite_60w_30h_10f.png',
                spriteX: 0,
                spriteY: 0,
                width: 60 * 2,
                height: 30,
                speed: 2
            },
            logMed: {
                sprite: './assets/images/log_sprite_60w_30h_10f.png',
                spriteX: 60 * 2,
                spriteY: 0,
                width: 60 * 3,
                height: 30,
                speed: 2
            },
            logLrg: {
                sprite: './assets/images/log_sprite_60w_30h_10f.png',
                spriteX: 60 * 5,
                spriteY: 0,
                width: 60 * 5,
                height: 30,
                speed: 2
            },
            turtle: {
                sprite: './assets/images/turtle_sprite_45w_33h_5f.png',
                spriteX: 0,
                spriteY: 0,
                width: 45 * 3,
                height: 30,
                speed: 2
            },
            turtleSink: {
                sprite: './assets/images/turtle_sprite_45w_33h_5f.png',
                spriteX: 45 * 2,
                spriteY: 0,
                width: 45 * 3,
                height: 30,
                speed: 2
            },
            aligator: {
                offsetY: -10,
                sprite: './assets/images/aligator_sprite_48w_48h_4f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48 * 3,
                height: 48,
                speed: 2
            },
            beaver: {
                offsetY: -10,
                sprite: './assets/images/beaver_sprite_48w_48h_2f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48,
                height: 48,
                speed: 2
            },
            snake: {
                offsetY: -15,
                sprite: './assets/images/snake_sprite_84w_33h_4f.png',
                spriteX: 0,
                spriteY: 0,
                width: 84,
                height: 33,
                speed: 2
            },
            bonus: {
                offsetY: 0,
                sprite: './assets/images/bonus_sprite_36w_42h_6f.png',
                spriteX: 36 * 2,
                spriteY: 0,
                width: 36,
                height: 42,
                speed: 2
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

    addGameObject2(gameObject, x, y) {
        this.activeGameObjects.push(gameObject);

        if (GameObjectManager.DEBUG) {
            console.log(`Added ${gameObject} gameObject at (${x},${y})`);
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
