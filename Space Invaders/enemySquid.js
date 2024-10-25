// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemySquid.js

import Enemy from './Enemy.js';
import { spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations

const frames= [
    [
        "00100000100",
        "10010001001",
        "10111111101",
        "11101110111",
        "01111111110",
        "00100000100",
        "00100000100",
        "01000000010"
    ],
    [
        "00100000100",
        "00010001000",
        "00111111100",
        "01101110110",
        "11111111111",
        "10100000101",
        "10100000101",
        "00011011000"
    ]
];

class EnemySquid extends Enemy {
    constructor(x, y) {
        super(x,y,frames);
        this.value = 10;
    }
    draw(ctx){
        super.draw(ctx, spriteConfig.squidColor);
    }

}

export default EnemySquid;
