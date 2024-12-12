// ToolboxAid.com
// David Quesenberry
// 11/15/2024
// gameAttract.js - 2D tile map

import { canvasConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';
import Fullscreen from '../scripts/fullscreen.js';
import Functions from '../scripts/functions.js';

import Hero from './hero.js';

// The given tileMap data
const tileMap = [
    [ // furthest
        [0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [ // behind hero
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [ // hero layer
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [ // in front of hero
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 2, 3, 4],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
];

const tileSize = 60;
// Get the number of sets in the tile map (3)
const numberOfSets = tileMap.length;

// Get the number of rows in each set (4)
const numberOfRowsInFirstSet = tileMap[0].length;

// Get the length of a row (17)
const lengthOfFirstRowInFirstSet = tileMap[0][0].length;

const tileSetWidth = tileSize * lengthOfFirstRowInFirstSet;

const canvasMidPoint = canvasConfig.width / 2;

const scrollMax = tileSetWidth - (canvasMidPoint * 2);
if (scrollMax < 0){
    scrollMax = 0;
}

if (false){
    console.log("Number of sets:", numberOfSets);
    console.log("Number of rows in the first set:", numberOfRowsInFirstSet);
    console.log("Length of a row in the first set:", lengthOfFirstRowInFirstSet);
    console.log("Tile Set Width:", tileSetWidth);
    console.log("Canvas Mid Point:" ,canvasMidPoint);
    console.log("Scroll Max:" ,scrollMax);
}

const air = 1;
const barrier = 0;

class GameAttract {
    constructor() {
        this.hero = new Hero();
        this.hero.setTileMapInfo(tileSetWidth,canvasMidPoint,scrollMax);
        this.scrollPos = 0;
    }

    update(deltaTime, keyboardInput) {
        this.hero.update(deltaTime, keyboardInput);
    }

    // drawHero() {
    //     CanvasUtils.ctx.fillStyle = "rgb(0, 255 , 255)";
    //     CanvasUtils.ctx.fillRect(this.hero.x, this.hero.y, tileSize, tileSize); // draw a rectangle at (10, 10) with width=200 and height=200        

    // }

    drawSingleTileSet(currentSet) {
        const scrollPos = this.hero.getScrollPos();
        // Iterate over each row in a set
        for (let row = 0; row < currentSet.length; row++) {
            const currentRow = currentSet[row];
            // Iterate over each column in a row
            for (let col = 0; col < currentRow.length; col++) {
                switch (currentRow[col]) {
                    case 0:
                        CanvasUtils.ctx.fillStyle = "rgb(0, 0, 0)";
                        break;
                    case 1:
                        CanvasUtils.ctx.fillStyle = "rgb(255, 0, 0)";
                        break;
                    case 2:
                        CanvasUtils.ctx.fillStyle = "rgb(0, 255, 0 )";
                        break;
                    case 3:
                        CanvasUtils.ctx.fillStyle = "rgb(0 , 0, 255)";
                        break;
                    case 4:
                        CanvasUtils.ctx.fillStyle = "rgb(255 ,255, 0)";
                        break;
                    default:
                        //console.log("Current row " + row + ", col " + col + ": has an unknown value: " + value);
                        CanvasUtils.ctx.fillStyle = "rgb(255, 255 , 255)";
                }

                const x = (col * tileSize) - scrollPos;
                const y = row * tileSize;
                CanvasUtils.ctx.fillRect(x, y, tileSize, tileSize); // draw a rectangle
            }
        }
    }

    draw(show = true) {
        // this.displayAttract();
        const numberOfSets = tileMap.length;
        // Iterate over each set (or level) in the tile map
        for (let i = 0; i < tileMap.length; i++) {
            this.drawSingleTileSet(tileMap[i]);
        }

        this.hero.draw();
    }

    displayAttract() {
        CanvasUtils.ctx.fillStyle = "white";
        CanvasUtils.ctx.font = "30px Arial";
        CanvasUtils.ctx.fillText("Welcome to Asteroids!", 250, 200);
        CanvasUtils.ctx.fillText("Press `Enter` to Start", 250, 300);
    }

}

export default GameAttract;

