// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js'; // Required import
import Fullscreen from '../scripts/fullscreen.js'; // Required import

// Define the Game class
export default class Game {
    constructor() {
        this.currentDir = currentDir;
    }

    drawFilledCircle(ctx) {
        ctx.beginPath();
        ctx.arc(450, 550, 50, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }

    drawHollowCircle(ctx) {
        ctx.beginPath();
        ctx.arc(550, 550, 50, 0, Math.PI * 2);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawFilledSquare(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(350, 350, 100, 100);
    }

    drawHollowSquare(ctx) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(500, 350, 100, 100);
    }

    drawFilledTriangle(ctx) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(50, 100);
        ctx.lineTo(100, 250);
        ctx.lineTo(0, 250);
        ctx.closePath();
        ctx.fill();
    }

    drawHollowOval(ctx) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(200, 150, 75, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawGridLines(ctx) {
        for (let gx = 0; gx <= canvasConfig.height; gx += 100) {
            ctx.beginPath();
            ctx.moveTo(0, gx);
            ctx.lineTo(canvasConfig.width, gx);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#3600af';
            ctx.stroke();
        }
        for (let gy = 0; gy <= canvasConfig.width; gy += 100) {
            ctx.beginPath();
            ctx.moveTo(gy, 0);
            ctx.lineTo(gy, canvasConfig.height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ed9700';
            ctx.stroke();
        }
    }

    drawOverlappingRectangles(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(415, 115, 120, 120);
        ctx.fillStyle = 'red';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(430, 130, 90, 90);
        ctx.globalAlpha = 1.0; // Reset alpha to 1
        ctx.fillRect(445, 145, 60, 60);
        ctx.fillStyle = '#00808080';
        ctx.fillRect(460, 160, 70, 70);
    }

    gameLoop(ctx, deltaTime) {
        console.log(deltaTime);
        // Call each drawing function
        this.drawFilledCircle(ctx);
        this.drawHollowCircle(ctx);
        this.drawFilledSquare(ctx);
        this.drawHollowSquare(ctx);
        this.drawFilledTriangle(ctx);
        this.drawHollowOval(ctx);
        this.drawGridLines(ctx);
        this.drawOverlappingRectangles(ctx);
    }
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;