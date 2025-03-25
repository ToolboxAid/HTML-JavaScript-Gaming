// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// snake.js

import objectPNG from '../scripts/objectPNG.js';

class Snake extends objectPNG {
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
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Snake;
