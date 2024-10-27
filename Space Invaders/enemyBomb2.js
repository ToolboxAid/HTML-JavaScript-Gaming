// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb2.js

import Enemy from './Enemy.js';

const frames = [
  // New 5x8 pixel images
  [
    "111",
    "010",
    "010",
    "010",
    "010",
    "010",
    "010",
    "010"
  ],
  [
    "010",
    "010",
    "111",
    "010",
    "010",
    "010",
    "010",
    "010"
  ],  [
    "010",
    "010",
    "010",
    "010",
    "111",
    "010",
    "010",
    "010",
  ],
  [
    "010",
    "010",
    "010",
    "010",
    "010",
    "010",
    "111",
    "010",
  ]
];

class EnemyBomb2 extends Enemy {
  constructor(x, y) {
    super(x, y, frames);
    this.value = 30;
  }
}

export default EnemyBomb2;
