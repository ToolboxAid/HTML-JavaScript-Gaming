// ToolboxAid.com
// David Quesenberry
// AttractMode.js
// 11/14/2024

import { canvasConfig, spriteConfig, shieldConfig } from "./global.js";

import CanvasUtils from "../scripts/canvas.js";
import Enemy from "./enemy.js";

import EnemyCrab from "./enemyCrab.js";
import EnemySquid from "./enemySquid.js";
import EnemyOctopus from "./enemyOctopus.js"
import Shield from "./shield.js";
import Ground from "./ground.js";

export default class AttractMode {
    static delayCounter = 0;

    constructor() {
        this.enemies = null;

        this.gameEnemies = new Map();

        this.shields = [];
        this.grounds = [];

        this.reset();
    }

    initializeGameEnemy() {
        let enemy = null;
        switch (Enemy.getRow()) {
            case 0:
            case 1:
                enemy = new EnemyCrab(0);
                break;
            case 2:
            case 3:
                enemy = new EnemySquid(0);
                break;
            case 4:
                enemy = new EnemyOctopus(0);
                break;
            default:
                enemy = new EnemyCrab(0);
                console.log("Unknown enemy type!");
                break;
        }

        this.gameEnemies.set(enemy.key, enemy);

        if (Enemy.isEnemiesInitialized()) {
            Enemy.remainingEnemies = this.gameEnemies.size;
            this.findBottom();
            this.gameState = "player1";

            Enemy.enemyID = 0;
        }
        this.draw();
    }

    initializeGameShields() {
        for (let i = 0; i < shieldConfig.count; i++) {
            this.shields.push(new Shield(i));
        }
    }

    initializeGameGround() {
        for (let i = 0; i < canvasConfig.width; i += Ground.groundSize) {
            const ground = new Ground(i, spriteConfig.groundY);
            this.grounds.push(ground);
        }
    }

    update() {
        let deltaTime = 1 / 16;
        switch (AttractMode.delayCounter++) {
            case 0:
                this.initializeGameShields();
                this.initializeGameGround();
            // break;
            case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            case 8: case 9: case 10: case 11: case 12: case 13: case 14:
            case 15: case 16: case 17: case 18: case 19: case 20: case 21:
                this.initializeGameEnemy();
                break;
            case 22:
                Enemy.nextID = this.gameEnemies.size;
                break;
            default:
                Enemy.setNextID();
                this.gameEnemies.forEach((enemy) => { enemy.update(deltaTime, true); });
                if (AttractMode.delayCounter > 1500) {
                    const killEntry = this.gameEnemies.entries().next().value;
                    if (killEntry) {
                        const [key, enemyObject] = killEntry;
                        if (enemyObject.isAlive()) {
                            enemyObject.setIsDying();
                        }
                    }
                }

                this.gameEnemies.forEach((enemy, key) => {
                    if (enemy.isDead()) {
                        this.gameEnemies.delete(key);
                    }
                });

                if (this.gameEnemies.size === 0) {
                    this.reset();
                }
                break;
        }
    }

    draw() {
        CanvasUtils.drawText(170, 200, "Welcome to Space Invaders!", 3.5, "white");
        CanvasUtils.drawText(210, 300, "Press `Enter` to Start", 3.5, "white");

        this.gameEnemies.forEach((enemy, key) => { enemy.draw(); });
        this.shields.forEach(shield => { shield.draw(); });
        this.grounds.forEach(ground => { ground.draw(); });
    }

    reset() {
        // Make sure it is empty
        this.gameEnemies.forEach((enemy, key) => {
                this.gameEnemies.delete(key);
        });

        AttractMode.delayCounter = 0;
        Enemy.enemyID = 0;
        Enemy.enemyRow = 0;
        Enemy.enemyCol = 0;
    }
}
