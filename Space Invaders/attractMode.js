// ToolboxAid.com
// David Quesenberry
// AttractMode.js
// 11/14/2024

import CanvasUtils from "../scripts/canvas.js";
import Enemy from "./enemy.js";

export default class AttractMode {
    constructor() {
        this.enemies = null;
        this.shields = null;
        this.grounds = null;
    }

    setup(enemies, shields, grounds) {
        this.enemies = enemies;
        this.shields = shields;
        this.grounds = grounds;
    }

    static count = 0;
    update(deltaTime) {

        Enemy.setNextID();

        if (AttractMode.count++ < 300){
            this.enemies.forEach((enemy, key) => {
                enemy.update(deltaTime, true);
            });
        }else{
            AttractMode.count = 0;
            this.enemies.forEach((enemy, key) => {
                enemy.setIsDead();
            });
        }
    }

    draw() {
        CanvasUtils.drawText(150, 200, "Welcome to the Game!", 3.5, "white");
        CanvasUtils.drawText(150, 300, "Press `Enter` to Start", 3.5, "white");

        this.enemies.forEach(enemy =>  { enemy.draw (CanvasUtils.ctx); });
        this.shields.forEach(shield => { shield.draw(CanvasUtils.ctx); });
        this.grounds.forEach(ground => { ground.draw(CanvasUtils.ctx); });

        console.log(this.enemies.size);
    }

    reset() {
        // // Clear the board
        // for (let i = 0; i < this.board.length; i++) {
        //     this.board[i] = null;
        // }

        // // Reset player to 'X'
        // this.currentPlayer = 'X';

        // this.moveInterval = 1; // Time between moves in milliseconds

        // // Reset elapsed time, moves made, and max moves
        // this.elapsedTime = 0;
        // this.movesMade = 0;
    }
}
