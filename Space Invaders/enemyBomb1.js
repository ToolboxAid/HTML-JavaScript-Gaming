// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb1.js

import EnemyBomb from "./enemyBomb.js";



// super(x, y, level, frames);
// this.level = level;

class EnemyBomb1 extends EnemyBomb {


  static frames = [

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


  constructor(x, y) {
    super(x, y, EnemyBomb1.frames);
  }
}

export default EnemyBomb1;
