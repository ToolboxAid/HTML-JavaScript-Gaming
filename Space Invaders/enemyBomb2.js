// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb2.js

import EnemyBomb from "./enemyBomb.js";
import { spriteConfig } from './global.js';

class EnemyBomb2 extends EnemyBomb {

  static livingFrames = [

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
    ], [
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

  constructor(x, y) {
    super(x, y, EnemyBomb2.livingFrames);
    this.velocityY = spriteConfig.bomb2VelocityX;
    this.spriteColor = spriteConfig.bomb2Color;
  }
}

export default EnemyBomb2;
