// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyOctopus.js

import Enemy from './enemy.js';
import { spriteConfig } from './global.js';

class EnemyOctopus extends Enemy {

    static livingFrames = [
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

    constructor(dropBombDelay) {
        super(EnemyOctopus.livingFrames, dropBombDelay);
        this.setSpriteColor(spriteConfig.octopusColor);
        this.value = 30;
    }

    destroy() {
        super.destroy();
        this.value = null;
    }
    
}

export default EnemyOctopus;
