// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// tileMap.js

//import { canvasConfig, spriteConfig } from './global.js';
import CanvasUtils from '../scripts/canvas.js';

// The given tileMap data
const tileMapLevel1 = [
    [ // behind hero 3 - furthest
        //                            1                             2           4
        // 1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4
        [0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
    ],
    [ // behind hero 2 - middle
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
    ],
    [ // behind hero 1 - nearest
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
        [0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
    ],
    [ // hero layer
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4], // 1
        [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 2
    ],
    [ // in front of hero        
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0], // 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 2
    ],
];

const heroLayer = 3;
// layer num --->       0     1     2    3   4
const layerSpeeds = [0.25, 0.50, 0.75, 1.0, 1.5]; // layers speeds per level

class TileMap {

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.tileSize = 0;

        this.scrollPosX = 0;
        this.tileSetWidth = 0;
        this.canvasMidPoint = 0;
        this.scrollMax = 0;

        this.currentscrollPosX = 0;

        this.maxX = 0;
        this.moveX = true;
    }

    resetCanves() {
        const canvas = document.getElementById('gameArea');

        // Change the canvas resolution
        canvas.width = 480; // Set the width of the canvas
        canvas.height = 480; // Set the height of the canvas

        // Optionally clear the canvas after resizing
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setTileMapInfo(scrollPosX = 0) {
        this.resetCanves();
        this.scrollPosX = scrollPosX;
        this.tileSize = 50;

        this.numberOfSets = tileMapLevel1.length;
        this.numberOfRowsInFirstSet = tileMapLevel1[0].length;
        this.lengthOfFirstRowInFirstSet = tileMapLevel1[0][0].length;
        this.tileSetWidth = this.tileSize * this.lengthOfFirstRowInFirstSet;
        this.canvasMidPoint = this.canvasWidth / 2;

        this.scrollMax = this.tileSetWidth - (this.canvasMidPoint * 2);
        if (this.scrollMax < 0) {
            this.scrollMax = 0;
        }

        if (false) {
            console.log("Number of layers:", this.numberOfSets);
            console.log("Number of rows in the first layer:", this.numberOfRowsInFirstSet);
            console.log("Length of a row in the first layer:", this.lengthOfFirstRowInFirstSet);
            console.log("Tile Set Width:", this.tileSetWidth);
            console.log("Canvas Mid Point:", this.canvasMidPoint);
            console.log("Scroll Max:", this.scrollMax);
        }
        console.log(this.canvasWidth, this.canvasHeight, this.tileSize);
        console.log("Number of 'X' Tiles: ", this.canvasWidth / this.tileSize);
        console.log("Number of 'Y' Tiles: ", this.canvasHeight / this.tileSize);

    }

    update(deltaTime, hero) {
        if (hero.velocityX > 0 && hero.x > this.canvasMidPoint && this.canvasWidth) {//} && this.moveX) {
            if (this.scrollPosX < this.scrollMax) {
                this.scrollPosX += hero.velocityX * deltaTime;
                hero.velocityX = 0;
            }
        } else {
            if (hero.velocityX < 0 && hero.x < this.canvasMidPoint) {
                if (this.scrollPosX > 0) {
                    this.scrollPosX += hero.velocityX * deltaTime;
                    hero.velocityX = 0;
                }
            }
        }

        if (this.scrollPosX < 0) {
            this.scrollPosX = 0;
        } else if (this.scrollPosX > this.scrollMax) {
            this.scrollPosX = this.scrollMax;
        }

        this.currentscrollPosX = this.scrollPosX + hero.x;

        if (true) {
            CanvasUtils.ctx.fillStyle = "white";
            CanvasUtils.ctx.font = "30px Arial";

            CanvasUtils.ctx.fillText("Hero X   :" + Math.round(hero.x), 50, 200);
            CanvasUtils.ctx.fillText("Scrl PosX:" + Math.round(this.scrollPosX), 50, 250);
            CanvasUtils.ctx.fillText("Scrl Max :" + Math.round(this.scrollMax), 50, 300);
            CanvasUtils.ctx.fillText("can Width:" + Math.round(this.canvasWidth) + "x" + Math.round(this.canvasHeight), 50, 350);
            CanvasUtils.ctx.fillText("set Width:" + Math.round(this.tileSetWidth), 50, 400);
            CanvasUtils.ctx.fillText("cur Pos  :" + Math.round(this.currentscrollPosX), 50, 450);
            CanvasUtils.ctx.fillText("cur Pos+W:" + Math.round(this.currentscrollPosX + hero.width), 50, 500);
            CanvasUtils.ctx.fillText("max X    :" + Math.round(this.maxX) + " move " + this.moveX, 50, 550);

            // const w = CanvasUtils.ctx.width;
            // const h = CanvasUtils.ctx.height;
            // console.log (w);

            var canvas = document.getElementById('gameArea');
            var width = canvas.width;
            var height = canvas.height;
            console.log(width, height);
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

    drawSingleTileLayer(layer, currentMap, hero) {
        // Iterate over each row in a layer
        for (let row = 0; row < currentMap.length; row++) {
            const currentRow = currentMap[row];
            // Iterate over each column in a row
            for (let col = 0; col < currentRow.length; col++) {
                this.drawSetTileColor(currentRow[col]);
                let offset = this.currentscrollPosX * layerSpeeds[layer];
                if (layer === heroLayer) {
                    offset = (this.scrollPosX * layerSpeeds[layer])
                }
                const x = (col * this.tileSize) - offset;
                const y = row * this.tileSize;
                CanvasUtils.ctx.fillRect(x, y, this.tileSize, this.tileSize);

                if (layer === heroLayer) {
                    if (x > this.maxX) {
                        this.maxX = x;
                    }
                }
            }
        }

        if (layer === heroLayer) {
            if (this.maxX < this.canvasWidth + 50) {
                this.moveX = false
            }
        }

        // If heroLayer is drawn, draw the hero on top of it.       if (layer === heroLayer) {
        hero.draw();
    }

    draw(hero) {
        // console.log("Cur Scroll X:",this.currentscrollPosX, "% x travel:",(this.currentscrollPosX/ this.tileSetWidth));
        //console.log("--------------------------------------");

        this.maxX = 0;
        this.moveX = true;

        // Iterate over each layer (or level) in the tile map
        for (let layer = 0; layer < this.numberOfSets; layer++) {
            this.drawSingleTileLayer(layer, tileMapLevel1[layer], hero);
        }
    }

}

export default TileMap;
