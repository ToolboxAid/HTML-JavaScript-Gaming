// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// ship.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';

class Ship extends ObjectVector {
    constructor() {
        const vectorMap = [[-20, 16], [28, 0], [-20, -16], [-12, -8], [-12, 8]];

        // start in center of screen
        const x = canvasConfig.width/2;
        const y = canvasConfig.height/2;

        // const velocityX = (Math.random() - 0.5) * 300;
        // const velocityY = (Math.random() - 0.5) * 300;

        super(x, y, vectorMap,);//, velocityX, velocityY);

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

}

export default Ship;

// Example usage
const ship = new Ship(100, 100);
console.log('Ship:', ship);
