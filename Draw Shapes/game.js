// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js'; // Import canvasConfig
import GameBase from '../scripts/gamebase.js';
import CanvasUtils from '../scripts/canvas.js';

// Define the Game class
class Game extends GameBase {
    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
    }

    async onInitialize() {
        console.log("onInit");
    }

    drawFilledCircle() {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(450, 550, 50, 0, Math.PI * 2);
        CanvasUtils.ctx.fillStyle = 'yellow';
        CanvasUtils.ctx.fill();
    }

    drawHollowCircle() {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(550, 550, 50, 0, Math.PI * 2);
        CanvasUtils.ctx.strokeStyle = 'red';
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.stroke();
    }

    drawFilledSquare() {
        CanvasUtils.ctx.fillStyle = 'yellow';
        CanvasUtils.ctx.fillRect(350, 350, 100, 100);
    }

    drawHollowSquare() {
        CanvasUtils.ctx.strokeStyle = 'red';
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.strokeRect(500, 350, 100, 100);
    }

    drawFilledTriangle() {
        CanvasUtils.ctx.fillStyle = 'blue';
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(50, 100);
        CanvasUtils.ctx.lineTo(100, 250);
        CanvasUtils.ctx.lineTo(0, 250);
        CanvasUtils.ctx.closePath();
        CanvasUtils.ctx.fill();
    }

    drawHollowOval() {
        CanvasUtils.ctx.strokeStyle = 'orange';
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.ellipse(200, 150, 75, 50, 0, 0, Math.PI * 2);
        CanvasUtils.ctx.stroke();
    }

    drawGridLines() {
        for (let gx = 0; gx <= canvasConfig.height; gx += 100) {
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.moveTo(0, gx);
            CanvasUtils.ctx.lineTo(canvasConfig.width, gx);
            CanvasUtils.ctx.lineWidth = 3;
            CanvasUtils.ctx.strokeStyle = '#3600af';
            CanvasUtils.ctx.stroke();
        }
        for (let gy = 0; gy <= canvasConfig.width; gy += 100) {
            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.moveTo(gy, 0);
            CanvasUtils.ctx.lineTo(gy, canvasConfig.height);
            CanvasUtils.ctx.lineWidth = 3;
            CanvasUtils.ctx.strokeStyle = '#ed9700';
            CanvasUtils.ctx.stroke();
        }
    }

    drawOverlappingRectangles() {
        CanvasUtils.ctx.fillStyle = 'yellow';
        CanvasUtils.ctx.fillRect(415, 115, 120, 120);
        CanvasUtils.ctx.fillStyle = 'red';
        CanvasUtils.ctx.globalAlpha = 0.5;
        CanvasUtils.ctx.fillRect(430, 130, 90, 90);
        CanvasUtils.ctx.globalAlpha = 1.0; // Reset alpha to 1
        CanvasUtils.ctx.fillRect(445, 145, 60, 60);
        CanvasUtils.ctx.fillStyle = '#00808080';
        CanvasUtils.ctx.fillRect(460, 160, 70, 70);
    }

    gameLoop(deltaTime) {
        console.log(deltaTime);
        // Call each drawing function
        this.drawFilledCircle();
        this.drawHollowCircle();
        this.drawFilledSquare();
        this.drawHollowSquare();
        this.drawFilledTriangle();
        this.drawHollowOval();
        this.drawGridLines();
        this.drawOverlappingRectangles();
    }
}

export default Game;

const game = new Game();
