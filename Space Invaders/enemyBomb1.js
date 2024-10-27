// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb1.js

import Enemy from './Enemy.js';

const frames= [
// New 5x8 pixel images
[
    "100",
    "010",
    "001",
    "010",
    "100",
    "010",
    "001",
  ],
  [
    "010",
    "100",
    "010",
    "001",
    "010",
    "100",
    "010",
  ],
  [
    "001",
    "010",
    "100",
    "010",
    "001",
    "010",
    "100",
  ],
  [
    "010",
    "001",
    "010",
    "100",
    "010",
    "001",
    "010",
  ]
  
];

class EnemyBomb1 extends Enemy {
    constructor(x, y) {
        super(x,y,frames);
        this.value = 30;
    }
}

export default EnemyBomb1;
