// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemySquid.js

import Enemy from './enemy.js';
import { spriteConfig } from './global.js'; // Import canvasConfig for canvas-related configurations

class EnemySquid extends Enemy {
    
    static livingFrames = [
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

    constructor(dropBombDelay) {
        super(EnemySquid.livingFrames, dropBombDelay);
        this.setSpriteColor(spriteConfig.squidColor);
        this.value = 20;
    }

    draw(ctx) {
        super.draw(ctx, spriteConfig.squidColor);
    }

}

export default EnemySquid;
