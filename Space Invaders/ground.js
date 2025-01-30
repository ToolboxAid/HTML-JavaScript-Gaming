// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// Ground.js

import { canvasConfig, spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized


class Ground extends ObjectStatic {

    static counter = 0;
    static Status = Object.freeze({
        ALIVE: 'alive',
        DEAD: 'dead'
    });

    static groundSize = 4;
    constructor(x, y,) {
        super(x, y, Ground.groundSize, Ground.groundSize);
        this.state = Ground.Status.ALIVE;
        this.isKillable = (Ground.counter++ % 2) === 0;
    }

    setIsDead() {
        if (this.isKillable) {
            this.state = Ground.Status.DEAD;
        }
    }

    draw() {
        if (this.state === Ground.Status.ALIVE) {
            super.draw(spriteConfig.groundColor);
        }
    }

    destroy() {
        super.destroy();
        this.state = null;
        this.isKillable = null;
    }

}

export default Ground;
