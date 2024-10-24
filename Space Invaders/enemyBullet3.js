import Enemy from './Enemy.js';

const frames = [
  // New 5x8 pixel images
  [
    "110",
    "010",
    "011",

    "010",
    "010",
    "010",
    "010",
    "010"
  ],
  [
    "010",
    "010",

    "011",
    "010",
    "110",

    "010",
    "010",
    "010"
  ],  [
    "010",
    "010",
    "010",
    "010",

    "110",
    "010",
    "011",

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

class EnemyBullet2 extends Enemy {
  constructor(x, y) {
    super(x, y, frames);
    this.value = 30;
  }
}

export default EnemyBullet2;
