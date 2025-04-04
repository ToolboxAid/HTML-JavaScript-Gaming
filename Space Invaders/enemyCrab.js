// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyCrab.js

import Enemy from './enemy.js';
import { spriteConfig } from './global.js';

class EnemyCrab extends Enemy {

    static livingFrames = [
        [
            "000011110000",
            "011111111110",
            "111111111111",
            "111001100111",
            "111111111111",
            "000110011000",
            "001101101100",
            "110000000011",
        ],
        [
            "000011110000",
            "011111111110",
            "111111111111",
            "111001100111",
            "111111111111",
            "001110011100",
            "011001100110",
            "001100001100",
        ]
    ];

    constructor(dropBombDelay) {
        super(EnemyCrab.livingFrames, dropBombDelay);
        this.setSpriteColor(spriteConfig.crabColor);
        this.value = 10;
    }

    destroy() {
        super.destroy();
        this.value = null;
    }

}

export default EnemyCrab;
