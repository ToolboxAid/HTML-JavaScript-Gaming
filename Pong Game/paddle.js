// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// paddle.js

import { canvasConfig, paddleConfig } from './global.js';
import ObjectStatic from '../scripts/objectStatic.js';
import { AudioPlayer } from '../scripts/audioPlayer.js';
import CanvasUtils from '../scripts/canvas.js';

import GamepadMapSNES from '../scripts/gamepadMapSNES.js';

class Paddle extends ObjectStatic {

    static winner = false; // Default to false

    constructor(isLeft) {
        const width = paddleConfig.width;
        const height = paddleConfig.height;
        const x = isLeft ? paddleConfig.offset : canvasConfig.width - paddleConfig.offset - width;
        const y = (canvasConfig.height / 2) - (height / 2);

        super(x, y, width, height);
        this.color = isLeft ? paddleConfig.leftColor : paddleConfig.rightColor;
        this.speed = paddleConfig.speed;
        this.isLeft = isLeft; // Track if this is the left paddle
        this.score = 0;

        // Bind the keys for this paddle
        this.controls = {
            keyboard: {
                up: this.isLeft ? 'KeyA' : 'ArrowUp',
                down: this.isLeft ? 'KeyZ' : 'ArrowDown'
            },
            gamepad: {
                up: this.isLeft ? GamepadMapSNES.Axes.X : GamepadMapSNES.Axes.X,
                down: this.isLeft ? GamepadMapSNES.Axes.X : GamepadMapSNES.Axes.X
            }
        };


        this.movement = {
            up: false,
            down: false
        };

        // Tail properties
        this.previousPositions = []; // Array to store previous positions
        this.tailLength = 15; // Length of the tail
        this.tailOpacities = []; // Array to store opacity values
        this.fadeSpeed = 0.1; // Speed of fading out the tail
    }

    incrementScore() {
        this.score++;

        if (this.score >= paddleConfig.winnerScore) {
            AudioPlayer.playFrequency(1000, 0.5);
            Paddle.winner = true;
        } else {
            AudioPlayer.playFrequency(350, 0.25);
        }
    }

    resetScore() {
        this.score = 0;
    }

    // Method to move the paddle up or down
    move(direction) {
        this.y += direction * this.speed;

        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.height > canvasConfig.height) {
            this.y = canvasConfig.height - this.height;
        }

        // Update previous positions for the tail
        this.updateTail();
    }

    // Update tail positions
    updateTail() {
        this.previousPositions.push({ x: this.x, y: this.y });
        this.tailOpacities.push(1); // Start with full opacity

        if (this.previousPositions.length > this.tailLength) {
            this.previousPositions.shift(); // Remove the oldest position if exceeding the tail length
            this.tailOpacities.shift(); // Remove the oldest opacity value
        }
    }

    // Update opacity values over time
    updateTailOpacities() {
        for (let i = 0; i < this.tailOpacities.length; i++) {
            this.tailOpacities[i] -= this.fadeSpeed; // Decrease opacity
            if (this.tailOpacities[i] < 0) {
                this.tailOpacities[i] = 0; // Ensure opacity doesn't go below 0
            }
        }
    }

    //TODO: need to improve how keyboard and gamepad are used.
    // Update method to handle movements
    update(keyboardInput, gamepadInput) {

        // Check keyboard controls
        this.movement.up = keyboardInput.getKeysDown().includes(this.controls.keyboard.up);
        this.movement.down = keyboardInput.getKeysDown().includes(this.controls.keyboard.down);

        // Get gamepads
        const gamepads = navigator.getGamepads();
        const gamepadIndex = this.isLeft ? 0 : 1;
        const gamepad = gamepads[gamepadIndex];

        if (gamepad) {
            // Movement check
            const dPad = GamepadMapSNES.getDPad(gamepad);
            this.movement.up = this.movement.up || dPad.up;
            this.movement.down = this.movement.down || dPad.down;
        }

        // Apply movement
        if (this.movement.up) {
            this.move(-1); // Move up
        }
        if (this.movement.down) {
            this.move(1); // Move down
        }
        // Update tail opacities whether moving or not
        this.updateTailOpacities();
    }

    draw() {
        // Draw the tail

        for (let i = 0; i < this.previousPositions.length; i++) {
            const pos = this.previousPositions[i];
            const opacity = this.tailOpacities[i];
            CanvasUtils.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.15})`; // Fade effect
            CanvasUtils.ctx.fillRect(pos.x, pos.y, this.width, this.height);
        }

        super.draw(this.color);
    }
}

export default Paddle;
