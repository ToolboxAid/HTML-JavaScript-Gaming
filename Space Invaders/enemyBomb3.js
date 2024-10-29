// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb3.js

import Enemy from './Enemy.js';

const frames = [

  [
    "110",
    "010",
    "010",
    "010",
    "010",
    "010",
    "010",
    "010"
  ], [
    "110",
    "010",
    "011",
    "010",
    "010",
    "010",
    "010",
    "010"
  ], [
    "010",
    "010",
    "011",
    "010",
    "110",
    "010",
    "010",
    "010"
  ], [
    "010",
    "010",
    "010",
    "010",
    "110",
    "010",
    "011",
    "010"
  ], [
    "010",
    "010",
    "010",
    "010",
    "010",
    "010",
    "011",
    "010"
  ]
];

class EnemyBomb2 extends Enemy {
  constructor(x, y) {
    super(x, y, frames);
    this.value = 30;
  }
}

export default EnemyBomb2;
