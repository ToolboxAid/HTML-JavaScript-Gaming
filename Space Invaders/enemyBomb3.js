// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// enemyBomb3.js

import EnemyBomb from "./enemyBomb.js";
import { spriteConfig } from './global.js';

class EnemyBomb3 extends EnemyBomb {

  static livingFrames = [

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
      "110",
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
    super(x, y, EnemyBomb3.livingFrames);
    this.velocityY = spriteConfig.bomb3VelocityX;
    this.spriteColor = spriteConfig.bomb3Color;
  }
}

export default EnemyBomb3;
