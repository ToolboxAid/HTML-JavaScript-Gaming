// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBullet1.js

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

class EnemyBullet1 extends Enemy {
    constructor(x, y) {
        super(x,y,frames);
        this.value = 30;
    }
}

export default EnemyBullet1;
