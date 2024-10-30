// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// Ground.js

import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized
import CanvasUtils from '../scripts/canvas.js';
import Functions from '../scripts/functions.js';

class Ground extends ObjectStatic {

    static Status = Object.freeze({
        ALIVE: 'alive',
        DEAD: 'dead'
    });

    static groundSize = 4;
    constructor(x, y,) {
        super(x, y, Ground.groundSize, Ground.groundSize);
        this.state = Ground.Status.ALIVE;
    }

    setIsDead() {
        this.state = Ground.Status.DEAD;
    }

    draw(ctx, spriteColor = "green") {
        if (this.state === Ground.Status.ALIVE) {
            super.draw(ctx, spriteColor);
        }
    }

}

export default Ground;
