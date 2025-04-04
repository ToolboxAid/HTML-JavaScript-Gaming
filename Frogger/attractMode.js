import { canvasConfig } from './global.js';
import Level from './level.js';
import GameObjectManager from './gameObjects/gameObjectManager.js';
import CanvasUtils from '../scripts/canvas.js';

// Game Objects

// Water hazard
import LogMED from './gameObjects/logMED.js';
import LogLRG from './gameObjects/logLRG.js';
import LogSM from './gameObjects/logSM.js';
import Turtle from './gameObjects/turtle.js';
import TurtleSink from './gameObjects/turtleSink.js';
// Road hazard
import Car0 from './gameObjects/car0.js';
import Car1 from './gameObjects/car1.js';
import Car2 from './gameObjects/car2.js';
import Dozer from './gameObjects/dozer.js';
import Snake from './gameObjects/snake.js';
import Truck from './gameObjects/truck.js';

class AttractMode {
    static DEBUG = new URLSearchParams(window.location.search).has('attract');

    // Base Y positions
    static BASE = Object.freeze({
        WATER: 579,
        ROAD: 571,
        SPACING: 63,
        VELOCITYY: 0,
    });

    // static SPACING = Object.freeze(63);  // Makes it immutable 
    // //static get SPACING() { return 63; }

    // Derived offsets from BASE.WATER
    static OFFSET = Object.freeze({
        get WATER() { return AttractMode.BASE.WATER; },
        get ROAD() { return AttractMode.BASE.ROAD; },
        get ALIGATOR() { return AttractMode.BASE.WATER - 18; },
        get BEAVER() { return AttractMode.BASE.WATER - 24; },
        get BONUS() { return AttractMode.BASE.WATER - 5; },
        get SNAKE() { return AttractMode.BASE.WATER - 5; }
    });

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

    // Water hazard
    createLogMED = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const logMED = new LogMED(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            logMED.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(logMED);
    };

    createLogLRG = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const logLRG = new LogLRG(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            logLRG.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(logLRG);
    };

    createLogSM = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const logSM = new LogSM(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            logSM.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(logSM);
    };

    createTurtle = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const turtle = new Turtle(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            turtle.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(turtle);
    }; 
    createTurtleSink = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const turtleSink = new TurtleSink(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            turtleSink.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(turtleSink);
    };    
    // Safety zone snakes
    createSnake = (x, row, velocityX, flip = false) => {
        const offsetYwater = 579;
        const offsetY = offsetYwater - 5;
        const snake = new Snake(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            snake.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(snake);
    };

    // Road

    createCar0 = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const car0 = new Car0(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            car0.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(car0);
    };
    createCar1 = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const car1 = new Car1(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            car1.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(car1);
    };
    createCar2 = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const car2 = new Car2(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            car2.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(car2);
    };
    createDozer = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const dozer = new Dozer(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            dozer.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(dozer);
    };
    createTruck = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.OFFSET.WATER - 5;
        const truck = new Truck(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            truck.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject2(truck);
    };

    initializeGameObjects() {
        const spacing = 63;
        const offsetYwater = 579;
        const offsetYroad = 571;
        const offsetYaligator = offsetYwater - 18;
        const offsetYbeaver = offsetYwater - 24;
        const offsetYbonus = offsetYwater - 5;

        // Water hazard
        // Row 10: Logs moving right
        //        this.gameObjectManager.addGameObject('logMed', 0, offsetYwater + (spacing * -6), 1);
        this.createLogMED(300, -6, 200);
        this.gameObjectManager.addGameObject('aligator', -300, offsetYaligator + (spacing * -6), 1);
        //this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -6), 1);

        // Row 9: Logs moving left
//        this.gameObjectManager.addGameObject('turtle', 0, offsetYwater + (spacing * -5), -1);
        //this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -5), -1);
        this.createTurtleSink(640, -5, -200);
        this.createTurtleSink(710, -5, -200);
        this.createTurtleSink(780, -5, -200);

        // Row 8: Logs moving right
        this.createLogLRG(300, -4, 200);
        this.createSnake(500, -4, 50, true);

        //this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -4), 1);
        // Row 7: Logs moving right
        this.createLogSM(300, -3, 200);

        //this.gameObjectManager.addGameObject('logSm', 0, offsetYwater + (spacing * -3), 1);
        //this.gameObjectManager.addGameObject('beaver', 400, offsetYbeaver + (spacing * -3), 1);
        this.gameObjectManager.addGameObject('bonus', 600, offsetYbonus + (spacing * -3), 1);

        // Row 6: Turtle moving left
        this.createTurtle(300, -2, -200);
        this.createTurtle(370, -2, -200);
        this.createTurtle(440, -2, -200);


        //this.gameObjectManager.addGameObject('turtleSink', 0, offsetYwater + (spacing * -2), -1);
        //this.gameObjectManager.addGameObject('beaver', 200, offsetYbeaver + (spacing * -2), -1);

        // safety zone snake(s)
        this.createSnake(500, -1, -50);
        this.createSnake(75, -1, 50, true);

        // vihicles
        // Row 5: Trucks moving left
        this.createTruck(300, 0, -200);
        this.createTruck(500, 0, -200);

        // Row 4: White cars moving right
        this.createCar2(300, 1, 200);
        this.createCar2(500, 1, 200);

        // Row 3: Pink cars moving left
        this.createCar1(300, 2, -200);
        this.createCar1(500, 2, -200);

        // Row 2: Bulldozers moving Right
        this.createDozer(100, 3, 200);
        this.createDozer(300, 3, 200);

        // Row 1: Cars moving left
        this.createCar0(100, 4, -200);
        this.createCar0(300, 4, -200);

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