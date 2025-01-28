// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb1.js

import EnemyBomb from "./enemyBomb.js";
import { spriteConfig } from './global.js';

class EnemyBomb1 extends EnemyBomb {

  static livingFrames = [
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
    super(x, y, EnemyBomb1.livingFrames);
    this.velocityY = spriteConfig.bomb1VelocityX;
    this.spriteColor = spriteConfig.bomb1Color;
  }
}

export default EnemyBomb1;
