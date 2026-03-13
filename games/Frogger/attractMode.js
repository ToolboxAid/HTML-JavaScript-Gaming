import DebugFlag from '../../engine/utils/debugFlag.js';

import { canvasConfig } from './global.js';

import GameObjectSystem from '../../engine/gameObjectSystem.js';
import CanvasUtils from '../../engine/core/canvas.js';

// Game Objects
import GameUI from './gameUI.js';
import LevelManager from './levelManager.js';

// Home
import HomeAlligator from './gameObjects/home_alligator.js';
import HomeFly from './gameObjects/home_fly.js';
import HomeFrog from './gameObjects/home_frog.js';

// Water hazard
import Aligator from './gameObjects/aligator.js';
import LogMED from './gameObjects/logMED.js';
import LogLRG from './gameObjects/logLRG.js';
import LogSM from './gameObjects/logSML.js';
import Turtle from './gameObjects/turtle.js';
import TurtleSink from './gameObjects/turtleSink.js';
import Beaver from './gameObjects/beaver.js';
import Snake from './gameObjects/snake.js';
import Bonus from './gameObjects/bonus.js';

// Road hazard
import Car0 from './gameObjects/car0.js';
import Car1 from './gameObjects/car1.js';
import Car2 from './gameObjects/car2.js';
import Dozer from './gameObjects/dozer.js';
import Truck from './gameObjects/truck.js';

class AttractMode {
    static DEBUG = DebugFlag.has('attract');

    // Base Y positions
    static BASE = Object.freeze({
        WATER: 570,
        SPACING: 63,
    });

    constructor() {
        // Initialize game components
        this.gameUI = new GameUI();
        this.gameObjectSystem = new GameObjectSystem(AttractMode.DEBUG);

        this.levelManager = new LevelManager(this);
        this.levelManager.initializeLevel(2);

        // Attract mode state
        this.demoActive = true;
        this.demoTimer = 0;
        this.maxDemoTime = 30 * 60; // 30 seconds at 60fps

        // Initialize gameObjects for demo
        //this.initializeGameObjects();

        if (AttractMode.DEBUG) {
            console.log('Attract mode initialized');
        }
    }

    // Home
    createHomeAlligator = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const homeAlligator = new HomeAlligator(
            x - 5,
            offsetY + (AttractMode.BASE.SPACING * row) - 9,
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            homeAlligator.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(homeAlligator);
    };

    createHomeFly = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const homeFly = new HomeFly(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            homeFly.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(homeFly);
    };

    createHomeFrog = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const homeFrog = new HomeFrog(
            x - 5,
            offsetY + (AttractMode.BASE.SPACING * row) - 10,
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            homeFrog.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(homeFrog);
    };

    // Water hazard
    createAligator = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const aligator = new Aligator(
            x,
            offsetY + (AttractMode.BASE.SPACING * row) - 15,
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            aligator.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(aligator);
    };

    createLogMED = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const logMED = new LogMED(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            logMED.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(logMED);
    };

    createLogLRG = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const logLRG = new LogLRG(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            logLRG.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(logLRG);
    };

    createLogSM = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const logSM = new LogSM(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            logSM.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(logSM);
    };

    createTurtle = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const turtle = new Turtle(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            turtle.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(turtle);
    };

    createTurtleSink = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const turtleSink = new TurtleSink(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            turtleSink.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(turtleSink);
    };

    createBeaver = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const beaver = new Beaver(
            x,
            offsetY + (AttractMode.BASE.SPACING * row) - 10,
            velocityX,
            AttractMode.BASE.VELOCITYY,
            this.gameObjectSystem.getActiveGameObjects()
        );

        if (flip) {
            beaver.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(beaver);
    };

    createBonus = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const bonus = new Bonus(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            bonus.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(bonus);
    };

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

        return this.gameObjectSystem.addGameObject(snake);
    };

    createCar0 = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const car0 = new Car0(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            car0.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(car0);
    };

    createCar1 = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const car1 = new Car1(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            car1.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(car1);
    };

    createCar2 = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const car2 = new Car2(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            car2.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(car2);
    };

    createDozer = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const dozer = new Dozer(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            dozer.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(dozer);
    };

    createTruck = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const truck = new Truck(
            x,
            offsetY + (AttractMode.BASE.SPACING * row),
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            truck.setFlip('horizontal');
        }

        return this.gameObjectSystem.addGameObject(truck);
    };

    initializeGameObjects() {
        if (AttractMode.DEBUG) {
            console.log(`GameObjects: ${this.gameObjectSystem.getActiveGameObjects().length}`);
            for (const gameObject of this.gameObjectSystem.getActiveGameObjects()) {
                console.log(`GameObject: ${gameObject.type}, Position: (${gameObject.x}, ${gameObject.y}), VelocityX: ${gameObject.velocityX}`);
            }
        }
    }

    update(deltaTime) {
        this.gameUI.update(deltaTime);

        this.levelManager.update(deltaTime);

        this.demoTimer++;
        if (this.demoTimer >= this.maxDemoTime) {
            this.demoActive = false;
        }

        for (const gameObject of this.gameObjectSystem.getActiveGameObjects()) {
            gameObject.update(deltaTime);

            if (gameObject.velocityX > 0 && gameObject.x > CanvasUtils.getConfigWidth() + gameObject.width) {
                gameObject.x = -gameObject.width;
            } else if (gameObject.velocityX < 0 && gameObject.x < -gameObject.width * 2) {
                gameObject.x = CanvasUtils.getConfigWidth() + gameObject.width;
            }

            if (gameObject.isDead()) {
                if (AttractMode.DEBUG) {
                    console.log(`GameObject is dead: ${gameObject.type}, 
                        Position: (${gameObject.x}, ${gameObject.y}), 
                        VelocityX: ${gameObject.velocityX},
                        ID: ${gameObject.ID}`);
                }
                this.gameObjectSystem.removeGameObject(gameObject);
            }
        }
    }

    draw() {
        this.gameUI.draw();

        for (const gameObject of this.gameObjectSystem.getActiveGameObjects()) {
            if (!gameObject.isDead()) {
                gameObject.draw();
            }
        }
    }

    isComplete() {
        return !this.demoActive;
    }
}

export default AttractMode;


