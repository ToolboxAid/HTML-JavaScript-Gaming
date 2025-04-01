import { canvasConfig } from './global.js';
import Level from './level.js';
import GameObjectManager from './gameObjects/gameObjectManager.js';
import CanvasUtils from '../scripts/canvas.js';

// Game Objects
import Snake from './gameObjects/snake.js';

class AttractMode {
    static DEBUG = new URLSearchParams(window.location.search).has('attract');

    constructor() {
        // Initialize game components
        this.level = new Level();
        this.gameObjectManager = new GameObjectManager();

        // Attract mode state
        this.isActive = true;
        this.demoTimer = 0;
        this.maxDemoTime = 30 * 60; // 30 seconds at 60fps

        // Initialize gameObjects for demo
        this.initializeGameObjects();

        if (AttractMode.DEBUG) {
            console.log('Attract mode initialized');
        }
    }

    initializeGameObjects() {
        const spacing = 63;
        const offsetYwater = 579;
        const offsetYroad = 571;
        const offsetYaligator = offsetYwater - 18;
        const offsetYbeaver = offsetYwater - 24;
        const offsetYsnake = offsetYwater - 5;
        const offsetYbonus = offsetYwater - 5;

        // Water hazard
        // Row 10: Logs moving right
        this.gameObjectManager.addGameObject('logMed', 0, offsetYwater + (spacing * -6), 1);
        this.gameObjectManager.addGameObject('aligator', -300, offsetYaligator + (spacing * -6), 1);
        this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -6), 1);

        // Row 9: Logs moving left
        this.gameObjectManager.addGameObject('turtle', 0, offsetYwater + (spacing * -5), -1);
        this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -5), -1);

        // Row 8: Logs moving right
        this.gameObjectManager.addGameObject('logLrg', 0, offsetYwater + (spacing * -4), 1);
        this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -4), 1);
        this.gameObjectManager.addGameObject('snake', 500, offsetYsnake + (spacing * -4), 1);

        // Row 7: Logs moving right
        this.gameObjectManager.addGameObject('logSm', 0, offsetYwater + (spacing * -3), 1);
        this.gameObjectManager.addGameObject('beaver', 400, offsetYbeaver + (spacing * -3), 1);
        this.gameObjectManager.addGameObject('bonus', 600, offsetYbonus + (spacing * -3), 1);

        // Row 6: Logs moving left
        this.gameObjectManager.addGameObject('turtleSink', 0, offsetYwater + (spacing * -2), -1);
        this.gameObjectManager.addGameObject('beaver', 200, offsetYbeaver + (spacing * -2), -1);

// safety zone snake(s)
        const snake1X = 500;
        const snake1Y = offsetYsnake + (spacing * -1);
        const snake1VX = -50;
        const snake1VY = 0;
        const snake1 = new Snake(snake1X,snake1Y,snake1VX,snake1VY);
        this.gameObjectManager.addGameObject2(snake1);

        const snake2X = 500;
        const snake2Y = offsetYsnake + (spacing * -1);
        const snake2VX = 50;
        const snake2VY = 0;
        const snake2 = new Snake(snake2X, snake2Y, snake2VX, snake2VY);
        snake2.setFlip('horizontal');
        this.gameObjectManager.addGameObject2(snake2);

        // vihicles
        // Row 5: Trucks moving left
        this.gameObjectManager.addGameObject('truck', 0, offsetYroad + (spacing * 0), -1);
        this.gameObjectManager.addGameObject('truck', 200, offsetYroad + (spacing * 0), -1);

        // Row 4: White cars moving right
        this.gameObjectManager.addGameObject('car3', 700, offsetYroad + (spacing * 1), 1);
        this.gameObjectManager.addGameObject('car3', 600, offsetYroad + (spacing * 1), 1);


        // Row 3: Pink cars moving left
        this.gameObjectManager.addGameObject('car2', 200, offsetYroad + (spacing * 2), -1);
        this.gameObjectManager.addGameObject('car2', 500, offsetYroad + (spacing * 2), -1);

        // Row 2: Bulldozers moving Right
        this.gameObjectManager.addGameObject('bulldozer', 200, offsetYroad + (spacing * 3), 1);
        this.gameObjectManager.addGameObject('bulldozer', 400, offsetYroad + (spacing * 3), 1);

        // Row 1: Cars moving left
        this.gameObjectManager.addGameObject('car1', 100, offsetYroad + (spacing * 4), -1);
        this.gameObjectManager.addGameObject('car1', 300, offsetYroad + (spacing * 4), -1);


        if (AttractMode.DEBUG) {
            console.log(`GameObjects: ${this.gameObjectManager.activeGameObjects.length}
                ${this.gameObjectManager.activeGameObjects}`);
            for (const gameObject of this.gameObjectManager.activeGameObjects) {
                console.log(`GameObject: ${gameObject.gameObjectType}, Position: (${gameObject.x}, ${gameObject.y}), VelocityX: ${gameObject.velocityX}`);
            }
        }
    }

    update(deltaTime) {
        //if (!this.isActive) return;
        this.level.update(deltaTime);

        // Update demo timer
        this.demoTimer++;
        if (this.demoTimer >= this.maxDemoTime) {
            this.isActive = false;
        }

        // Update all gameObjects
        for (const gameObject of this.gameObjectManager.activeGameObjects) {
            // Move gameObject
            gameObject.update(deltaTime);

            // Wrap around screen
            if (gameObject.velocityX > 0 && gameObject.x > CanvasUtils.getConfigWidth() + gameObject.width) {
                gameObject.x = -gameObject.width;
            } else if (gameObject.velocityX < 0 && gameObject.x < -gameObject.width * 2) {
                gameObject.x = CanvasUtils.getConfigWidth() + gameObject.width;
            }
        }

    }

    draw() {
        // Draw level
        this.level.draw();

        // Draw gameObjects
        for (const gameObject of this.gameObjectManager.activeGameObjects) {
            gameObject.draw();
        }

    }

    isComplete() {
        return !this.isActive;
    }
}

export default AttractMode;