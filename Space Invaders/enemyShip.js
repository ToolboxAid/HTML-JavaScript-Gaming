// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyShip.js

import Enemy from './Enemy.js';
import { spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations

const frames= [
    [
        "0000000000000000",
        "0000011111100000",
        "0001111111111000",
        "0011111111111100",
        "0110110110110110",
        "1111111111111111",
        "0011100110001110",
        "0001000000000100"
      ],
      [
        "0000000000000000",
        "0000011111100000",
        "0001111111111000",
        "0011111111111100",
        "0110110110110110",
        "1111111111111111",
        "0011100110001110",
        "0001000000000100"
      ]
];

class EnemyShip extends Enemy {
    constructor(x, y) {
        super(x,y,frames);
        this.value = 30;
    }

    
    draw(ctx){
        super.draw(ctx, spriteConfig.shipColor);
    }

}

export default EnemyShip;
