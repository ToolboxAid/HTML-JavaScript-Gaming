// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// tileMap.js

//import { canvasConfig, spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';

// The given tileMap data
const tileMapLevel1 = [
    [ // furthest
        [1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [ // behind hero
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [ // hero layer
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [ // in front of hero
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 2, 3, 4],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
];

class TileMap {

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvanHeight = height;

        this.tileSize = 0;

        this.scrollPos = 0;
        this.tileSetWidth = 0;
        this.canvasMidPoint = 0;
        this.scrollMax = 0;

        this.currentScrollPos;
    }


    setTileMapInfo(scrollPos = 0) {
        this.scrollPos = scrollPos;
        this.tileSize = 60;

        this.numberOfSets = tileMapLevel1.length;// Get the number of sets in the tile map (3)
        this.numberOfRowsInFirstSet = tileMapLevel1[0].length;// Get the number of rows in each set (4)
        this.lengthOfFirstRowInFirstSet = tileMapLevel1[0][0].length;// Get the length of a row (17)
        this.tileSetWidth = this.tileSize * this.lengthOfFirstRowInFirstSet;
        this.canvasMidPoint = this.canvasWidth / 2;

        this.scrollMax = this.tileSetWidth - (this.canvasMidPoint * 2);
        if (this.scrollMax < 0) {
            this.scrollMax = 0;
        }

        if (false) {
            console.log("Number of sets:", this.numberOfSets);
            console.log("Number of rows in the first set:", this.numberOfRowsInFirstSet);
            console.log("Length of a row in the first set:", this.lengthOfFirstRowInFirstSet);
            console.log("Tile Set Width:", this.tileSetWidth);
            console.log("Canvas Mid Point:", this.canvasMidPoint);
            console.log("Scroll Max:", this.scrollMax);
        }
    }

    update(deltaTime, hero) {
        if (hero.velocityX > 0
            && hero.x > this.canvasMidPoint
        ) {
            if (this.scrollPos < this.scrollMax) {
                this.scrollPos += hero.velocityX * deltaTime;
                hero.velocityX = 0;
            }
        } else {
            if (hero.velocityX < 0
                && hero.x < this.canvasMidPoint
            ) {
                if (this.scrollPos > 0) {
                    this.scrollPos += hero.velocityX * deltaTime;
                    hero.velocityX = 0;
                }
            }
        }

        if(this.scrollPos < 0){
            this.scrollPos = 0;
        } else if (this.scrollPos > this.scrollMax){
            this.scrollPos = this.scrollMax;
        }

        this.currentScrollPos = this.scrollPos + hero.x;

        if (false) {
            CanvasUtils.ctx.fillStyle = "white";
            CanvasUtils.ctx.font = "30px Arial";
            CanvasUtils.ctx.fillText(hero.x, 50, 500);
            CanvasUtils.ctx.fillText(this.scrollPos, 50, 550);
            CanvasUtils.ctx.fillText(this.scrollMax, 50, 600);
            CanvasUtils.ctx.fillText(this.canvasWidth, 50, 650);
            CanvasUtils.ctx.fillText(this.tileSetWidth, 50, 700);
            CanvasUtils.ctx.fillText(this.currentScrollPos, 50, 750);
            CanvasUtils.ctx.fillText(this.currentScrollPos + hero.width, 50, 800);
        }        

    }

    drawSetTileColor(currentColor) {
        switch (currentColor) {
            case 0:  // Transparent (air)
                CanvasUtils.ctx.fillStyle = "rgb(0, 0, 0, 0)";
                break;
            case 1: // Barrier (not passible)
                CanvasUtils.ctx.fillStyle = "rgb(255, 0, 0)";
                break;
            case 2: // Barrier (not passible)
                CanvasUtils.ctx.fillStyle = "rgb(0, 255, 0 )";
                break;
            case 3: // other
                CanvasUtils.ctx.fillStyle = "rgb(0 , 0, 255)";
                break;
            case 4: // other
                CanvasUtils.ctx.fillStyle = "rgb(255 ,255, 0)";
                break;
            default: // oops
                //console.log("Current row " + row + ", col " + col + ": has an unknown value: " + value);
                CanvasUtils.ctx.fillStyle = "rgb(255, 255 , 255)";
        }
    }

    drawSingleTileSet(currentSet) {
        // Iterate over each row in a set
        for (let row = 0; row < currentSet.length; row++) {
            const currentRow = currentSet[row];
            // Iterate over each column in a row
            for (let col = 0; col < currentRow.length; col++) {
                this.drawSetTileColor(currentRow[col]);
                const x = (col * this.tileSize) - this.scrollPos;
                const y = row * this.tileSize;
                //CanvasUtils.ctx.fillStyle = "rgb(255, 255, 255)";
                CanvasUtils.ctx.fillRect(x, y, this.tileSize, this.tileSize); // draw a rectangle
            }
        }
    }

    draw() {
        // Iterate over each set (or level) in the tile map
        for (let set = 0; set < this.numberOfSets; set++) {
            this.drawSingleTileSet(tileMapLevel1[set]);
        }
    }

}

export default TileMap;
