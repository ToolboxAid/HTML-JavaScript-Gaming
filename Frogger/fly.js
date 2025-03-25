// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// fly.js

import objectPNG from '../scripts/objectPNG.js';

class Fly extends objectPNG {
    // - Type (fly)
    // - Speed/direction
    // - Sprite management
    // - Position updates
    constructor(x, y, width, height, speed) {
        super(x, y, width, height, speed);
        this.type = 'fly';
    }
    update() {
        this.x += this.speed;
        if (this.x > canvas.width) {
            this.x = -this.width;
        }

    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
export default Fly;
