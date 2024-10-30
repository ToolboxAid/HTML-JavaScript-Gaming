// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb3.js

import EnemyBomb from "./enemyBomb.js";

class EnemyBomb3 extends EnemyBomb {
  
  static frames = [

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

  constructor(x, y) {
    super(x, y, EnemyBomb3.frames);
  }
}

export default EnemyBomb3;
