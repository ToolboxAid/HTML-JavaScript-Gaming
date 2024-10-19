// ToolboxAid.com
// David Quesenberry
// paddle.js
// 10/16/2024

import { paddleConfig, canvasConfig } from './global.js';
import ObjectStatic from '../scripts/objectStatic.js';
import Functions from '../scripts/functions.js';

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
        this.keys = {
            up: this.isLeft ? 'KeyA' : 'ArrowUp',
            down: this.isLeft ? 'KeyZ' : 'ArrowDown'
        };

        this.movement = {
            up: false,
            down: false
        };

        this.bindKeys();
    }

    incrementScore() {
        this.score++;

        if (this.score >= paddleConfig.winnerScore) {
            // Ball Bounce Sound:
            // Frequency: Approximately 400 Hz
            // Duration: Around 100 milliseconds
            // Description: A short beep sound that played whenever the ball hit the paddles or the walls.
            Functions.playSound(1000, 0.5);
            Paddle.winner = true;
        } else {
            // Score Sound:
            // Frequency: Approximately 300 Hz to 400 Hz (varied based on the version)
            // Duration: Usually longer than the bounce sounds, around 200-500 milliseconds
            // Description: A sound indicating a score was made, usually more pronounced than the bounce sound.
            Functions.playSound(350, 0.25);
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
        } else if (this.y + this.height > window.gameAreaHeight) {
            this.y = window.gameAreaHeight - this.height;
        }
    }

    // Key binding and handling
    bindKeys() {
        document.addEventListener('keydown', (event) => {
            if (event.code === this.keys.up) {
                this.movement.up = true; // Mark up movement
            } else if (event.code === this.keys.down) {
                this.movement.down = true; // Mark down movement
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.code === this.keys.up) {
                this.movement.up = false; // Clear up movement
            } else if (event.code === this.keys.down) {
                this.movement.down = false; // Clear down movement
            }
        });
    }

    // Update method to handle movements
    update() {
        if (this.movement.up) {
            this.move(-1); // Move up
        }
        if (this.movement.down) {
            this.move(1); // Move down
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Paddle;
