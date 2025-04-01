// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// log.js

import ObjectPNG from '../../scripts/objectPNG.js';

class Log extends ObjectPNG {
    // - Type (beaver)
    // - Sprite management
    // - Position updates
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.type = 'log';
    }
    update() {
        if (this.x > canvas.width) {
            this.x = -this.width;
        }
    }
    draw() {
        ctx.fillStyle = 'brown';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
export default Log;
