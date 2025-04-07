import { canvasConfig } from './global.js';
import Level from './level.js';
import GameObjectManager from './gameObjects/gameObjectManager.js';
import CanvasUtils from '../scripts/canvas.js';

// Game Objects
// Home
import HomeAligator from './gameObjects/home_aligator.js';
import HomeFly from './gameObjects/home_fly.js';
import HomeFrog from './gameObjects/home_frog.js';


// Water hazard
import Aligator from './gameObjects/aligator.js';
import LogMED from './gameObjects/logMED.js';
import LogLRG from './gameObjects/logLRG.js';
import LogSM from './gameObjects/logSM.js';
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
    static DEBUG = new URLSearchParams(window.location.search).has('attract');

    // Base Y positions
    static BASE = Object.freeze({
        WATER: 570,
        SPACING: 63,
    });

    constructor() {
        // Initialize game components
        this.level = new Level();
        this.gameObjectManager = new GameObjectManager();

        // Attract mode state
        this.demoActive = true;
        this.demoTimer = 0;
        this.maxDemoTime = 30 * 60; // 30 seconds at 60fps

        // Initialize gameObjects for demo
        this.initializeGameObjects();

        if (AttractMode.DEBUG) {
            console.log('Attract mode initialized');
        }
    }

    // Home
    createHomeAligator = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const homeAligator = new HomeAligator(
            x - 5,
            offsetY + (AttractMode.BASE.SPACING * row) - 9,
            velocityX,
            AttractMode.BASE.VELOCITYY
        );

        if (flip) {
            homeAligator.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject(homeAligator);
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

        return this.gameObjectManager.addGameObject(homeFly);
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

        return this.gameObjectManager.addGameObject(homeFrog);
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

        return this.gameObjectManager.addGameObject(aligator);
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

        return this.gameObjectManager.addGameObject(logMED);
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

        return this.gameObjectManager.addGameObject(logLRG);
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

        return this.gameObjectManager.addGameObject(logSM);
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

        return this.gameObjectManager.addGameObject(turtle);
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

        return this.gameObjectManager.addGameObject(turtleSink);
    };
    createBeaver = (x, row, velocityX, flip = false) => {
        const offsetY = AttractMode.BASE.WATER;
        const beaver = new Beaver(
            x,
            offsetY + (AttractMode.BASE.SPACING * row) - 10,
            velocityX,
            AttractMode.BASE.VELOCITYY,
            this.gameObjectManager.getActiveGameObjects()
        );

        if (flip) {
            beaver.setFlip('horizontal');
        }

        return this.gameObjectManager.addGameObject(beaver);
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

        return this.gameObjectManager.addGameObject(bonus);
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

        return this.gameObjectManager.addGameObject(snake);
    };

    // Road
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

        return this.gameObjectManager.addGameObject(car0);
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

        return this.gameObjectManager.addGameObject(car1);
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

        return this.gameObjectManager.addGameObject(car2);
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

        return this.gameObjectManager.addGameObject(dozer);
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

        return this.gameObjectManager.addGameObject(truck);
    };

    initializeGameObjects() {

        let objectLog = null;
        let objectSnake = null;
        let objectBeaver = null;
        let objectBonus = null;
        let objectHomeAligator = null;
        let objectHomeFrog = null;

        const homeY = 70;
        const homeOffsetX = 230 - 70;

        // Row 11: Home
        objectHomeFrog = this.createHomeFrog(homeY + homeOffsetX * 1, -7, 0);
        objectHomeFrog = this.createHomeFrog(homeY + homeOffsetX * 2, -7, 0);
        objectHomeFrog.setWink();
        // objectHomeFrog = this.createHomeFrog(homeY+homeOffsetX*3, -7, 0);
        // objectHomeFrog = this.createHomeFrog(homeY+homeOffsetX*4, -7, 0);
        // objectHomeFrog.setWink();

        objectHomeAligator = this.createHomeAligator(homeY + homeOffsetX * 3, -7, 0);
        objectHomeAligator = this.createHomeAligator(homeY + homeOffsetX * 4, -7, 0);
        objectHomeAligator.setBite();

        this.createHomeFly(homeY, -7, 0);
        // this.createHomeFly(homeY+homeOffsetX*1, -7, 0);
        // this.createHomeFly(homeY+homeOffsetX*2, -7, 0);
        // this.createHomeFly(homeY+homeOffsetX*3, -7, 0);
        //this.createHomeFly(homeY+homeOffsetX*4, -7, 0);



        // Water hazard
        // Row 10: Logs moving right
        this.createAligator(0, -6, 200);

        objectLog = this.createLogMED(300, -6, 200);
        objectSnake = this.createSnake(500, -4, 50, true);
        objectSnake.attachedToObject(objectLog);
        // objectBonus = this.createBonus(400, -3, 36);
        // objectBonus.attachedToObject(objectLog);        
        //        this.gameObjectManager.addGameObject('aligator', -300, offsetYaligator + (spacing * -6), 1);
        //this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -6), 1);
        objectBeaver = this.createBeaver(300, -6, 300);

        // Row 9: Logs moving left
        //this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -5), -1);
        this.createTurtleSink(640, -5, -200);
        this.createTurtleSink(710, -5, -200);
        this.createTurtleSink(780, -5, -200);

        // Row 8: Logs moving right
        objectLog = this.createLogLRG(100, -4, 150);
        objectBonus = this.createBonus(400, -3, 36);
        objectBonus.attachedToObject(objectLog);

        //this.gameObjectManager.addGameObject('beaver', 250, offsetYbeaver + (spacing * -4), 1);

        // Row 7: Logs moving right
        objectLog = this.createLogSM(300, -3, 250);
        objectSnake = this.createSnake(500, -4, 50, true);
        objectSnake.attachedToObject(objectLog);
        // objectBonus = this.createBonus(400, -3, 36);
        // objectBonus.attachedToObject(objectLog);
        //this.gameObjectManager.addGameObject('beaver', 400, offsetYbeaver + (spacing * -3), 1);

        // Row 6: Turtle moving left
        this.createTurtle(300, -2, -200);
        this.createTurtle(370, -2, -200);
        this.createTurtle(440, -2, -200);
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
            console.log(`GameObjects: ${this.gameObjectManager.getActiveGameObjects().length}`);
            for (const gameObject of this.gameObjectManager.getActiveGameObjects()) {
                console.log(`GameObject: ${gameObject.type}, Position: (${gameObject.x}, ${gameObject.y}), VelocityX: ${gameObject.velocityX}`);
            }
        }
    }

    update(deltaTime) {
        this.level.update(deltaTime);

        // Update demo timer
        this.demoTimer++;
        if (this.demoTimer >= this.maxDemoTime) {
            this.demoActive = false;
        }

        // Update all gameObjects
        for (const gameObject of this.gameObjectManager.getActiveGameObjects()) {
            // Move gameObject
            gameObject.update(deltaTime);

            // Wrap around screen
            if (gameObject.velocityX > 0 && gameObject.x > CanvasUtils.getConfigWidth() + gameObject.width) {
                gameObject.x = -gameObject.width;
            } else if (gameObject.velocityX < 0 && gameObject.x < -gameObject.width * 2) {
                gameObject.x = CanvasUtils.getConfigWidth() + gameObject.width;
            }

            // Check if gameObject is dead
            if (gameObject.isDead()) {
                console.log(`GameObject is dead: ${gameObject.type}, 
                    Position: (${gameObject.x}, ${gameObject.y}), 
                    VelocityX: ${gameObject.velocityX},
                    ID: ${gameObject.ID}`);
                this.gameObjectManager.removeGameObject(gameObject);
            }
        }
    }

    draw() {
        // Draw level
        this.level.draw();

        // Draw gameObjects
        console.log(this.gameObjectManager.getActiveGameObjects().length);
        for (const gameObject of this.gameObjectManager.getActiveGameObjects()) {
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