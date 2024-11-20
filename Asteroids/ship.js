// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import CanvasUtils from '../scripts/canvas.js';

class Ship extends ObjectVector {
    constructor(x, y, velocityX = 0, velocityY = 0) {
        const vectorMap = [[-20, 16], [28, 0], [-20, -16], [-12, -8], [-12, 8]];

        velocityX = (Math.random() - 0.5) * 300;
        velocityY = (Math.random() - 0.5) * 300;

        super(x, y, vectorMap, velocityX, velocityY);

        this.velocityRotation = (Math.random() - 0.5) * 5;
    }

    update(deltaTime) {
        this.rotationAngle += this.velocityRotation;
        super.update(deltaTime);
        this.wrapAround();
    }

    wrapAround() {// Screen wrapping logic
        if (this.x > canvasConfig.width) this.x = this.width * -1;
        if (this.x + this.width < 0) this.x = canvasConfig.width;
        if (this.y > canvasConfig.height) this.y = this.height * -1;
        if (this.y + this.height < 0) this.y = canvasConfig.height;
    }

    draw() {
        super.draw();
        CanvasUtils.drawBounds(this.x, this.y, this.width, this.height, 'white', 1);  // Blue color and line width of 2
    }

}

export default Ship;
