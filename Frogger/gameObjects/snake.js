// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// snake.js

import GameObject from './gameObject.js';

class Snake extends GameObject {
    // - Type (snake)
    // - Speed/direction
    // - Sprite management
    // - Position updates

    constructor(x, y, width, height, speed) {
        super(x, y, width, height, speed);
        this.type = 'snake';
    }
    update() {
        this.x += this.speed;
        if (this.x > canvas.width) {
            this.x = -this.width;
        }
    }
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width+100, this.height);
    }
}

export default Snake;
