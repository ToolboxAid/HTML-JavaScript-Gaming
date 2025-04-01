// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// fly.js

import ObjectPNG from '../../scripts/objectPNG.js';

class Fly extends ObjectPNG {
    // - Type (fly)
    // - Sprite management
    // - Position updates
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.type = 'fly';
    }
    update() {
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
