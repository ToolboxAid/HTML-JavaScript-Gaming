// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyOctopus.js

import Enemy from './Enemy.js';
import { spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations

const frames= [
    [
        "00011000",
        "00111100",
        "01111110",
        "11011011",
        "11111111",
        "00100100",
        "01011010",
        "10100101"
      ],
       [
        "00011000",
        "00111100",
        "01111110",
        "11011011",
        "11111111",
        "01000010",
        "10000001",
        "01000010"
      ]
];

class EnemyOctopus extends Enemy {
    constructor(x, y) {
        super(x,y,frames);
        this.value = 20;
    }
    
    draw(ctx){
        super.draw(ctx, spriteConfig.octopusColor);
    }
}

export default EnemyOctopus;
