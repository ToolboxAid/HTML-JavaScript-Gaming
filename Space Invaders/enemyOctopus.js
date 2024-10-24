import Enemy from './Enemy.js';

const frames= [
    [
        "00011000",
        "00111100",
        "01111110",
        "11011011",
        "11111111",
        "00100100",
        "01011010",
        "10100101"
      ],
       [
        "00011000",
        "00111100",
        "01111110",
        "11011011",
        "11111111",
        "01000010",
        "10000001",
        "01000010"
      ]
];

class EnemyOctopus extends Enemy {
    constructor(x, y) {
        super(x,y,frames);
        this.value = 20;
    }
}

export default EnemyOctopus;
