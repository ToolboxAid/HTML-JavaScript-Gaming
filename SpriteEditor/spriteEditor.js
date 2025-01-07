// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spriteEditor.js

import SpritePalettes from "../scripts/spritePalettes.js";
import MouseInput from '../scripts/mouse.js';

//-------------------------------------------
export class SpriteEditor {

    // Canvas Editor
    static canvasEditor = null;
    static ctxEditor = null;

    // Canvas Image
    static canvasImage = null;
    static ctxImage = null;

    //-------------------------------------------
    // Palette information
    // default, crayola008, crayola016, crayola024, crayola032, crayola048, crayola064,
    // crayola096, crayola120, crayola150, javascript, spaceInvaders, test, w3c, custom
    static paletteName = 'default';
    // hue, saturation, lightness
    static paletteSortOrder = "hue";
    static paletteAcrossCnt = 5;
    static paletteDownCnt = 36;
    static paletteSize = 30;

    static paletteSelectedX = 0;
    static paletteSelectedY = 0;
    static paletteScale = this.paletteSize / this.spriteGridSize;

    static paletteSpacing = 10;

    //-------------------------------------------
    // Grid information
    static maxGrid = 32;
    static gridCellWidth = 8; //this.maxGrid;
    static gridCellHeight = 8; //this.maxGrid;
    static spriteIndex = new Array(this.gridCellWidth);

    static gridX = this.paletteSize * (this.paletteAcrossCnt + 1) + this.paletteSize / 4;
    static gridY = this.paletteSize;

    static selectedColor = SpritePalettes.transparentColor;
    static selectedColorIndex = 0;
    static selectedCellX = 0;
    static selectedCellY = 0;

    //-------------------------------------------
    // Define the width, height, and size of the sprite
    static spritePixelSize = 7;
    static spriteImageSize = this.maxGrid * this.spritePixelSize + 4;

    static spriteGridSize = 40; // in pixel

    //-------------------------------------------
    // Image details
    static imageName = null;
    static image = null;
    static imageX = 0;
    static imageY = 0;
    static imageScale = 1.5; // Zoom factor

    //-------------------------------------------
    static mouse = null;

    static initMessages = true;

    // TODO: Need to figure out multi frames for animation

    static currentFrame = 0;
    static jsonData = {
        "metadata": {
            "sprite": "sprite starter json",
            "spriteGridSize": 10,
            "spritePixelSize": 8,
            "palette": "default",
        },
        "layers": [
            {
                "metadata": {
                    "spriteimage": "test.jpg",
                    "imageX": 100,
                    "imageY": 45,
                    "imageScale": 2.0,
                },
                "data": [
                    "0000",
                    "0000",
                    "0000",
                    "0000",
                ]
            }
        ]
    };


    // ------------------------------------------
    // load samples

    static loadSample1() {
        SpriteEditor.addMessages('loadSample1');
        const jsonData = {
            "metadata": {
                "sprite": "starter json",
                "spriteGridSize": 5,
                "spritePixelSize": 5,
                "palette": "default",
            },
            "layers": [
                {
                    "metadata": {
                        "spriteimage": "test.jpg",
                        "imageX": 0,
                        "imageY": 0,
                        "imageScale": 2,
                    },
                    "data": [
                        "0000",
                        "0000",
                        "0000",
                        "0000",
                    ]
                }
            ]
        };
        SpriteEditor.jsonData = jsonData;
        //SpriteEditor.imageName = './1 bit tiles.jpg';
    }
    static loadSample2() {
        SpriteEditor.addMessages('loadSample2')
        const jsonData = {
            "metadata": {
              "sprite": "sprite starter json",
              "spriteGridSize": 65,
              "spritePixelSize": 8,
              "palette": "default"
            },
            "layers": [
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 100,
                  "imageY": 45,
                  "imageScale": 1.5
                },
                "data": [
                  "!!!!",
                  "ØØØØ",
                  "ØØØØ",
                  "ØØØØ"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 1,
                  "imageScale": 1.5
                },
                "data": [
                  "ØØØØ",
                  "\"\"\"\"",
                  "ØØØØ",
                  "ØØØØ"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 0,
                  "imageScale": 1.5
                },
                "data": [
                  "ØØØØ",
                  "ØØØØ",
                  "####",
                  "ØØØØ"
                ]
              }
            ]
          };

        SpriteEditor.jsonData = jsonData;
        this.outputJsonData();
        this.loadJsonFromTextarea();
    }
    static loadSample3() {
        SpriteEditor.addMessages('loadSample3')

        //SpriteEditor.imageName = './3 bit tiles.jpg';
    }
    static loadSample4() {
        SpriteEditor.addMessages('loadSample4')

        SpriteEditor.imageName = './4 bit tiles.jpg';
    }

    // ------------------------------------------
    static initialize() {
        //static spriteImageSize = this.maxGrid * this.spritePixelSize + 4;
        console.log("ps", this.spritePixelSize, this.maxGrid * this.spritePixelSize + 4);

        this.clearMessages();
        this.initializeArrays();

        this.initializeCanvasEditor();
        this.initializeCanvasImage();

        // Setup our mouse
        this.mouse = new MouseInput(this.canvasEditor);

        // set paletteName on load
        this.updatePaletteDD();

        this.image = new Image();

        this.outputJsonData();

        this.loadJsonFromTextarea();
    }
    // ------------------------------------------
    // Message methods
    static addMessages(message) {
        const formattedTimestamp = new Date().toLocaleString().replace(/,/g, '');
        const textarea = document.getElementById('messagesID');
        textarea.value += `${formattedTimestamp} ${message} \n`;
        textarea.disabled = true;
    }
    static clearMessages() {
        const textarea = document.getElementById('messagesID');
        textarea.value = "";
        this.addMessages(`Messages Cleared.`)
        if (this.initMessages) {
            this.initMessages = false;
            this.addMessages(`Press 'F11' to enter/exit full screen.`)
            this.addMessages(`Add '#00000000' to palette for Transparent.`)
        }
    }

    // ------------------------------------------
    // Initialization methods.
    static initializeArrays() {
        for (let x = 0; x < this.maxGrid; x++) {
            this.spriteIndex[x] = new Array(this.maxGrid).fill('Ø');
        }
        this.addMessages(`Initialize array @ ${this.maxGrid}x${this.maxGrid}.`);
    }
    static initializeCanvasEditor() {
        // Get the canvas element
        this.canvasEditor = document.getElementById("spriteEditor");

        if (!this.canvasEditor) {
            alert("Canvas element with id 'spriteEditor' not found.");
            return;
        }

        // Set the canvas dimensions
        this.canvasEditor.width = 1024; // 2075;
        this.canvasEditor.height = 1200;

        // Create a new CanvasRenderingContext2D object
        this.ctxEditor = this.canvasEditor.getContext("2d");

        this.addMessages(`Canvas Editor initialized @ ${this.canvasEditor.width}x${this.canvasEditor.height}.`);
    }
    static initializeCanvasImage() {
        // SpriteImage
        this.canvasImage = document.getElementById("spriteImage");

        if (!this.canvasImage) {
            alert("Canvas element with id 'spriteEditor' not found.");
            return;
        }

        // Set the canvas iamge dimensions
        this.canvasImage.width = this.spriteImageSize;
        this.canvasImage.height = this.spriteImageSize;

        // Create a new CanvasRenderingContext2D object
        this.ctxImage = this.canvasImage.getContext("2d");

        this.addMessages(`Canvas Image initialized @ ${this.canvasImage.width}x${this.canvasImage.height}.`);
    }

    // ------------------------------------------
    // Palette methods.    
    static updatePaletteDD() {
        // Get the dropdown element by its ID
        const dropdown = document.getElementById("paletteDropdown");

        // Set the selected value to 'crayola024' (or any other value you wish to select)
        dropdown.value = this.paletteName;
        // Trigger the change event manually if needed
        const event = new Event('change');
        dropdown.dispatchEvent(event);
    }
    static selectPalette(name) {
        if (!SpritePalettes.palettes[name]) {
            alert(`Palette '${name}' not found.`);
            return false;
        }
        SpriteEditor.paletteName = name;
        SpritePalettes.setPalette(name);

        this.addMessages(`Selected palette: '${name}'.`);

        // const trace = new Error("Show stack trace:");
        // console.log(trace.stack);

        return true;
    }
    static showPaletteColors() {
        const spriteTextarea = document.getElementById("paletteID");  // Ensure the textarea element exists

        if (!spriteTextarea) {
            alert(`Sprite textarea '${paletteID}' not found.`);
            return;
        }

        spriteTextarea.value = SpritePalettes.getPaletteDetails();

        // Only custom palette can be updated by user
        if (SpriteEditor.paletteName === "custom") {
            spriteTextarea.disabled = false;
            spriteTextarea.value += "// Use transparent as sample code to add whatever colors you need.\n";
            spriteTextarea.value += "// FYI: no intelisence, errors will prevent palette from displaying.\n";
        } else {
            spriteTextarea.disabled = true;
        }
    }
    static setPaletteSortBy(arg) {
        this.paletteSortOrder = arg;
    }

    // static loadSprite() {
    //     // const spriteTextarea = document.getElementById("spriteID");
    //     // const spriteContent = spriteTextarea.value.trim();

    //     // const lines = spriteContent.split("\n").map(line => line.trim());

    //     // const rows = [];
    //     // const metadata = {};

    //     // for (const line of lines) {
    //     //     if (line.startsWith("// meta:")) {
    //     //         // Extract metadata by splitting on the first colon
    //     //         const [key, value] = line.slice(8).split(/:(.+)/).map(part => part.trim());
    //     //         metadata[key] = value;
    //     //     } else if (line.startsWith('"')) {
    //     //         // It's a sprite row, remove quotes and store it
    //     //         rows.push(line.replace(/"/g, ""));
    //     //     }
    //     // }

    //     // this.imageName = metadata['imageName'];
    //     // if (this.imageName === undefined) {
    //     //     alert(`Image not loaded `);
    //     //     //throw new Error(`imageName not found:${this.imageName} in meta:`);
    //     // }

    //     // this.imageScale = Number(metadata['imageS']);
    //     // this.imageX = Number(metadata['imageX']);
    //     // this.imageY = Number(metadata['imageY']);

    //     // this.paletteName = metadata['palette'];

    //     // this.spriteGridSize = Number(metadata['spriteS']);

    //     // this.paletteScale = (this.paletteSize / this.spriteGridSize)

    //     // // // Set grid dimensions based on the parsed rows
    //     // this.gridCellHeight = rows.length;
    //     // this.gridCellWidth = rows[0]?.length - 1 || 0;

    //     // for (let y = 0; y < this.gridCellHeight; y++) {
    //     //     const row = rows[y];
    //     //     for (let x = 0; x < this.gridCellWidth; x++) {
    //     //         // Get letter/symbol
    //     //         const letter = row[x];

    //     //         // Update spriteIndex
    //     //         if (letter === undefined) {
    //     //             this.spriteIndex[x][y] = SpritePalettes.errorResult.symbol;
    //     //         } else {
    //     //             this.spriteIndex[x][y] = letter;
    //     //         }
    //     //     }
    //     // }
    // }

    /** */
    // ------------------------------------------
    // Background image methods
    static setImageX(imageX) {
        if (typeof imageX === 'number' && !isNaN(imageX)) {
            this.imageX = 0;
            this.moveImageHorizontal(imageX);
        } else {
            this.addMessages("imageX is not a valid number:", imageX);
        }
    }
    static moveImageHorizontal(moveFactor) {
        this.imageX += moveFactor;
        SpriteEditor.jsonData.layers[this.currentFrame].metadata.imageX = this.imageX;
    }

    static setImageY(imageY) {
        if (typeof imageY === 'number' && !isNaN(imageY)) {
            this.imageY = 0;
            this.moveImageVertical(imageY);
        } else {
            this.addMessages("imageY is not a valid number:", imageY);
        }
    }
    static moveImageVertical(moveFactor) {
        this.imageY += moveFactor;
        SpriteEditor.jsonData.layers[this.currentFrame].metadata.imageY = this.imageY;
    }

    static setImageScale(imageScale) {
        if (typeof imageScale === 'number' && !isNaN(imageScale)) {
            imageScale = 0;
            this.updateImageScale(imageScale);
        } else {
            this.addMessages("'imageScale' is not a valid number:", imageScale);
        }
    }
    static updateImageScale(imageScale) {
        this.imageScale += imageScale;
        if (this.imageScale > 5.0) {
            this.imageScale = 5.0;
            this.addMessages(`Max image scale reached: ${this.imageScale}`)
        } else if (this.imageScale < 0.01) {
            this.imageScale = 0.01;
            this.addMessages(`Min image scale reached: ${this.imageScale}`)
        }
        SpriteEditor.jsonData.layers[this.currentFrame].metadata.imageScale = this.imageScale;
    }

    // ------------------------------------------
    // Grid methods
    static setSpriteGridSize(spriteGridSize) {
        if (typeof spriteGridSize === 'number' && !isNaN(spriteGridSize)) {
            this.spriteGridSize = 0;
            this.updateSpriteGridSize(spriteGridSize);
        } else {
            this.addMessages("spriteGridSize is not a valid number:", spriteGridSize);
        }
    }
    static updateSpriteGridSize(spriteGridSize) {
        this.spriteGridSize += spriteGridSize;
        if (this.spriteGridSize < 4.0) {
            this.spriteGridSize = 4.0;
            this.addMessages(`Min grid scall reached: ${this.spriteGridSize}`)
        }
        if (this.spriteGridSize > 80.0) {
            this.spriteGridSize = 80.0;
            this.addMessages(`Max grid scall reached: ${this.spriteGridSize}`)
        }
        SpriteEditor.jsonData.metadata.spriteGridSize = this.spriteGridSize;
    }
    static showSpriteGridDimensions() {
        this.addMessages(` Grid Size ${this.gridCellWidth}x${this.gridCellHeight}`);
    }
    static spriteAddRow() {
        if (this.gridCellHeight < this.maxGrid) {
            this.gridCellHeight++;
            this.saveModifiedSprite();
        } else {
            this.addMessages(`Cannot add row, gridCellHeight is already ${this.maxGrid}.`);
        }
        this.showSpriteGridDimensions();
    }
    static spriteAddColumn() {
        if (this.gridCellWidth < this.maxGrid) {
            this.gridCellWidth++;
            this.saveModifiedSprite();
        } else {
            this.addMessages(`Cannot add column, gridCellWidth is already ${this.maxGrid}.`);
        }
        this.showSpriteGridDimensions();
    }
    static spriteDelColumn() {
        if (this.gridCellWidth > 1) {
            this.gridCellWidth--;
            this.saveModifiedSprite();
        } else {
            this.addMessages("Cannot remove column, gridCellWidth is already 1.");
        }
        this.showSpriteGridDimensions();
    }
    static spriteDelRow() {
        if (this.gridCellHeight > 1) {
            this.gridCellHeight--;
            this.saveModifiedSprite();
        } else {
            this.addMessages("Cannot remove row, gridCellHeight is already 1.");
        }
        this.showSpriteGridDimensions();
    }

    // ------------------------------------------
    // Grid methods
    static setSpritePixelSize(spritePixelSize) {
        if (typeof spritePixelSize === 'number' && !isNaN(spritePixelSize)) {
            this.spritePixelSize = 0;
            this.updateSpritePixelSize(spritePixelSize);
        } else {
            this.addMessages("spriteGridSize is not a valid number:", spritePixelSize);
        }
    }
    static updateSpritePixelSize(spritePixelSize) {
        this.spritePixelSize += spritePixelSize;
        if (this.spritePixelSize < 1.0) {
            this.spritePixelSize = 1.0;
            this.addMessages(`Min sprite pixel size reached: ${this.spritePixelSize}`)
        }
        if (this.spritePixelSize > 10.0) {
            this.spritePixelSize = 10.0;
            this.addMessages(`Max sprite pixel size reached: ${this.spritePixelSize}`)
        }
        SpriteEditor.jsonData.metadata.spritePixelSize = this.spritePixelSize;
    }
    // ------------------------------------------
    // Draw methods
    static drawAll() {
        // Clear the canvas and set background color to #333333
        this.ctxEditor.clearRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);
        this.ctxEditor.fillStyle = '#333333';
        this.ctxEditor.fillRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);

        if (this.imageName) {
            this.ctxEditor.save();
            this.ctxEditor.scale(this.imageScale, this.imageScale);
            this.ctxEditor.drawImage(this.image, this.imageX, this.imageY);
            this.ctxEditor.restore();
        }

        this.outputJsonData();

        this.showPaletteColors();

        this.drawGrid();
        this.drawPalette();
        this.drawSelectedColor();
        this.drawSpriteImage();
    }
    static drawSpriteImage() {
        const fillColor = "#888888";
        const offset = 2;

        // Clear the canvas and set background fillColor
        this.ctxImage.clearRect(0, 0, this.canvasImage.width, this.canvasImage.height);
        this.ctxImage.fillStyle = fillColor;
        this.ctxImage.fillRect(0, 0, this.canvasImage.width, this.canvasImage.height);

        // Sprite image
        for (var x = 0; x < this.gridCellWidth; x++) {
            for (var y = 0; y < this.gridCellHeight; y++) {
                const gridCellPosX = x * this.spritePixelSize + offset;
                const gridCellPosY = y * this.spritePixelSize + offset;

                // Update sprite color
                const result = SpritePalettes.getBySymbol(this.spriteIndex[x][y]);
                this.ctxImage.fillStyle = result.hex;
                this.ctxImage.fillRect(gridCellPosX, gridCellPosY, this.spritePixelSize, this.spritePixelSize);
            }
        }
    }
    static drawGrid() {
        this.ctxEditor.strokeStyle = "black";
        this.ctxEditor.fillStyle = "black";

        this.ctxEditor.lineWidth = 2;

        // Lines on X
        for (var x = 0; x < this.gridCellWidth + 1; x++) {
            this.ctxEditor.beginPath();
            this.ctxEditor.moveTo(x * this.spriteGridSize + this.gridX, this.gridY);
            this.ctxEditor.lineTo(x * this.spriteGridSize + this.gridX, this.spriteGridSize * this.gridCellHeight + this.gridY);
            this.ctxEditor.stroke();
        }

        // Lines on Y
        for (var y = 0; y < this.gridCellHeight + 1; y++) {
            this.ctxEditor.beginPath();
            this.ctxEditor.moveTo(this.gridX, y * this.spriteGridSize + this.gridY);
            this.ctxEditor.lineTo(this.spriteGridSize * this.gridCellWidth + this.gridX, y * this.spriteGridSize + this.gridY);
            this.ctxEditor.stroke();
        }

        // draw sprite array colors on grid
        for (var x = 0; x < this.gridCellWidth; x++) {
            for (var y = 0; y < this.gridCellHeight; y++) {
                const result = SpritePalettes.getBySymbol(this.spriteIndex[x][y]);

                if (result.hex === SpritePalettes.transparentColor) {
                    const gridCellPosX = this.gridX + (this.spriteGridSize * x) + this.spriteGridSize / 4;
                    const gridCellPosY = this.gridY + (this.spriteGridSize * y) + this.spriteGridSize / 4;

                    this.drawTransparentX(gridCellPosX, gridCellPosY, this.spriteGridSize / 2);
                } else {
                    this.drawColor(x, y, result.hex);
                }
            }
        }
    }
    static drawColor(x, y, color) {
        // Draw a circle on the selected sprite
        this.ctxEditor.beginPath();
        this.ctxEditor.arc((this.spriteGridSize * x) + this.gridX + this.spriteGridSize / 2,
            (this.spriteGridSize * y) + this.gridY + this.spriteGridSize / 2,
            this.spriteGridSize / 3, 0, 2 * Math.PI);
        this.ctxEditor.strokeStyle = color;
        this.ctxEditor.fillStyle = color;
        this.ctxEditor.stroke();
        this.ctxEditor.fill();
    }
    static drawTransparentX(x, y, size) {
        // Calculate circle parameters
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size / 3;

        // Draw the circle
        this.ctxEditor.beginPath();
        this.ctxEditor.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctxEditor.fillStyle = '#ffffff88'; // 50% white
        this.ctxEditor.fill();
        this.ctxEditor.strokeStyle = '#FF000088'; // 50% transparent red
        this.ctxEditor.lineWidth = 2;
        this.ctxEditor.stroke();

        // Draw the X
        this.ctxEditor.beginPath();
        this.ctxEditor.moveTo(centerX - radius, centerY - radius);
        this.ctxEditor.lineTo(centerX + radius, centerY + radius);
        this.ctxEditor.moveTo(centerX + radius, centerY - radius);
        this.ctxEditor.lineTo(centerX - radius, centerY + radius);
        this.ctxEditor.lineWidth = 2;
        this.ctxEditor.stroke();
    }
    static drawSelectedColor() {
        // show selected color
        this.ctxEditor.strokeStyle = "white";
        this.ctxEditor.lineWidth = 4;
        this.ctxEditor.strokeRect(
            this.paletteSelectedX * this.paletteSize + this.paletteSpacing / 4,
            this.paletteSelectedY * this.paletteSize + this.paletteSpacing / 4,
            this.paletteSize, this.paletteSize);

        // Get the sorted palette colors from SpritePalettes
        let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPalette(), SpriteEditor.paletteSortOrder);

        // Get Selected Color by Index
        const result = sortedPalette[SpriteEditor.selectedColorIndex];
        const rgb = SpritePalettes.hexToRgb(result.hex);
        const hsl = SpritePalettes.rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Display selected color details
        const selectedColorInfo = document.getElementById("selectedColorInfo");
        selectedColorInfo.innerHTML = `<h3>Selected Color Info</h3>` +
            `Palette:  ${SpriteEditor.paletteName} <br>` +
            `Index:  ${this.selectedColorIndex} <br>` +
            `Char:   ${result.symbol} <br>` +
            `Code:   ${result.hex} <br>` +
            `Name:   ${result.name} <br>` +
            `H: ${hsl.h}  S: ${hsl.s}  L: ${hsl.l}`;
    }
    static drawPalette() {// hue, saturation, lightness
        this.paletteScale = (this.paletteSize / this.spriteGridSize);

        // Clear location
        this.ctxEditor.clearRect(0, 0, this.spriteGridSize * this.paletteAcrossCnt * this.paletteScale + this.paletteSpacing, this.canvasEditor.height); // Clear the canvasEditor
        this.ctxEditor.fillStyle = 'black';
        this.ctxEditor.fillRect(0, 0, this.spriteGridSize * this.paletteAcrossCnt * this.paletteScale + this.paletteSpacing, this.canvasEditor.height); // Fill the entire canvasEditor

        // Get the sorted palette colors from SpritePalettes
        let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPalette(), SpriteEditor.paletteSortOrder);

        // Draw the sorted palette
        for (let index = 0; index < sortedPalette.length; index++) {
            const result = sortedPalette[index];
            let div = index % this.paletteAcrossCnt;
            let mod = Math.floor(index / this.paletteAcrossCnt);
            const newX = div * this.paletteSize + this.paletteSpacing / 2;
            const newY = mod * this.paletteSize + this.paletteSpacing / 2;

            if (result.hex === SpritePalettes.transparentColor) {
                SpriteEditor.drawTransparentX(newX, newY, this.spriteGridSize * this.paletteScale);
            } else {
                this.ctxEditor.fillStyle = result.hex;
                this.ctxEditor.fillRect(newX, newY, this.spriteGridSize * this.paletteScale - this.paletteSpacing / 2, this.spriteGridSize * this.paletteScale - this.paletteSpacing / 2);
            }
        }
    }

    //output sprite details
    static outputJsonData() {
        //SpriteEditor.loadJsonSprite();
        // Locate the textarea in the document
        const textArea = document.getElementById("spriteID");

        // Convert the JSON object into a formatted string
        const jsonString = JSON.stringify(SpriteEditor.jsonData, null, 2); // Indent with 2 spaces

        if (textArea.value === jsonString) {
            return;
        }

        // Set the textarea value
        textArea.value = jsonString;

        // Assuming jsonData is the JSON object that contains the data
        // Validate that jsonData, layers, the first layer, and its data exist
        //const firstLayerData = SpriteEditor?.jsonData?.layers?.[0]?.data ?? null;
        const firstLayerData = SpriteEditor?.jsonData?.layers?.[this.currentFrame]?.data ?? null;

        if (firstLayerData) {
            // Use firstLayerData safely
        } else {
            this.addMessages("The required data does not exist.");
            return;
        }

        this.loadSpriteFromJSON();

    }

    static loadSpriteFromJSON() {
        const firstLayerData = SpriteEditor?.jsonData?.layers?.[this.currentFrame]?.data ?? null;
        // Update gridCellWidth and gridCellHeight based on firstLayerData
        this.gridCellWidth = firstLayerData[this.currentFrame].length;  // Number of columns
        this.gridCellHeight = firstLayerData.length;    // Number of rows

        // Map the first layer's `data` to `spriteIndex`
        for (let y = 0; y < firstLayerData.length; y++) {
            for (let x = 0; x < firstLayerData[y].length; x++) {
                if (y < this.maxGrid && x < this.maxGrid) {
                    this.spriteIndex[x][y] = firstLayerData[y][x];
                }
            }
        }
    }

    static addLayer(layerIndex) {
        // Create a deep copy of the layer at `this.currentFrame`
        let originalLayer = SpriteEditor.jsonData.layers[this.currentFrame];
        let tempLayer = JSON.parse(JSON.stringify(originalLayer));

        tempLayer.metadata.imageX = layerIndex;
        tempLayer.metadata.imageY = this.currentFrame;

        SpriteEditor.jsonData.layers.splice(layerIndex, 0, tempLayer);

        this.currentFrame += layerIndex;

        this.addMessages(`Layer added @ ${layerIndex}`);
        this.setCurrentFrameLayer(this.currentFrame)

console.log(SpriteEditor.jsonData.layers);
    }

    // Remove a layer at the specified index
    static subLayer() {
        if (this.currentFrame >= 0 && this.currentFrame < SpriteEditor.jsonData.layers.length) {
            SpriteEditor.jsonData.layers.splice(this.currentFrame, 1);

            if (this.currentFrame > SpriteEditor.jsonData.layers.length) {
                this.currentFrame = SpriteEditor.jsonData.layers.length
            }

            this.setCurrentFrameLayer(this.currentFrame);
            this.addMessages("Layer removed at index:", this.currentFrame);
        } else {
            this.addMessages("Invalid layer index:", this.currentFrame);
        }
    }

    // ------------------------------------------------
    // json methods
    static setCurrentFrameLayer(currentFrame) {
console.log(currentFrame, this.currentFrame);

        if (
            SpriteEditor.jsonData.layers &&
            currentFrame >= 0 &&
            currentFrame < SpriteEditor.jsonData.layers.length
        ) {
            this.currentFrame = currentFrame;
            this.addMessages(`Current Layer frame at index: ${this.currentFrame}`);
        } else {
            this.addMessages(`Invalid currentFrame or layers data: ${currentFrame}`);
        }
        //TODO: need to copy new current layer to sprite array

        this.loadSpriteFromJSON();

        this.outputJsonData();
    }

    static setStaticVarsFromJson() {
        // Access metadata.sprite
        const sprite = SpriteEditor.jsonData.metadata.sprite;
        this.selectPalette(SpriteEditor.jsonData.metadata.palette);
        this.updatePaletteDD();
        this.setSpritePixelSize(SpriteEditor.jsonData.metadata.spritePixelSize);
        this.setSpriteGridSize(SpriteEditor.jsonData.metadata.spriteGridSize);

        if (false) {
            console.log('Sprite:', sprite);
            console.log('Sprite Grid Size:', this.spriteGridSize);
            console.log('Sprite Pixel Size:', SpriteEditor.spritePixelSize);
            console.log('Palette:', SpriteEditor.paletteName);
        }
        // Access metadata.layer frames
        const spriteImage = SpriteEditor.jsonData.layers[this.currentFrame].metadata.spriteimage;
        this.setImageX(SpriteEditor.jsonData.layers[this.currentFrame].metadata.imageX);
        this.setImageY(SpriteEditor.jsonData.layers[this.currentFrame].metadata.imageY);
        this.setImageScale(SpriteEditor.jsonData.layers[this.currentFrame].metadata.imageScale);

        if (false) {
            console.log('Sprite Image:', spriteImage);
            console.log('ImageX:', this.imageX);
            console.log('ImageY:', this.imageY);
            console.log('ImageScale:', this.imageScale);
        }
    }

    // Method to load JSON from textarea to SpriteEditor.jsonData
    static loadJsonFromTextarea() {
        const textarea = document.getElementById('spriteID');
        const jsonString = textarea.value;
        try {
            // Parse the JSON string into an object
            const parsedData = JSON.parse(jsonString);
console.log(jsonString);
            // Assign the parsed data to SpriteEditor.jsonData
            if (typeof SpriteEditor !== 'undefined') {
                SpriteEditor.jsonData = parsedData;
                this.setStaticVarsFromJson();
            } else {
                SpriteEditor.addMessages('SpriteEditor is not defined.')
            }
        } catch (error) {
            SpriteEditor.addMessages(`Invalid JSON format: ${error} \n ${textarea.value}`);
        }
    }

    static saveModifiedSprite() {
        console.log("modspr");
        // Assuming spriteIndex is a 2D array with gridX and gridY dimensions
        const updatedData = [];

        // Iterate over each row (height) and each column (width)
        for (let x = 0; x < this.gridCellHeight; x++) {
            let row = '';
            for (let y = 0; y < this.gridCellWidth; y++) {
                row += this.spriteIndex[y][x] || SpritePalettes.transparentColor; // 'Ø' as a fallback for missing data
            }
            updatedData.push(row);
        }

        // Update the JSON data's first layer
        if (SpriteEditor.jsonData.layers && SpriteEditor.jsonData.layers[this.currentFrame]) {
            SpriteEditor.jsonData.layers[this.currentFrame].data = updatedData;
        }

    }

    static copyJSON() {
        // Get the textarea element
        const textarea = document.getElementById("spriteID");

        // Check if the textarea exists and has content
        if (textarea && textarea.value) {
            // Select the text in the textarea
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length); // For mobile devices

            try {
                // Copy the selected text to the clipboard
                const success = document.execCommand("copy");
                if (success) {
                    this.addMessages("JSON copied to clipboard!");
                } else {
                    this.addMessages("Failed to copy JSON.");
                }
            } catch (err) {
                console.error("Error copying JSON:", err);
                this.addMessages("An error occurred while copying JSON.");
            }

            // Deselect the text
            textarea.setSelectionRange(0, 0);
        } else {
            this.addMessages("No JSON data to copy!");
        }
    }

    static getMousePositionOncanvas(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        return { x, y };
    }

    static handleCanvasLeftClick(mouse) {
        if (mouse.mouseX > (SpriteEditor.spriteGridSize * SpriteEditor.paletteAcrossCnt) * SpriteEditor.paletteScale) {
            // Determine which sprite cell clicked
            SpriteEditor.selectedCellX = Math.floor((mouse.mouseX - SpriteEditor.gridX) / SpriteEditor.spriteGridSize);
            SpriteEditor.selectedCellY = Math.floor((mouse.mouseY - SpriteEditor.gridY) / SpriteEditor.spriteGridSize);

            if (SpriteEditor.selectedCellX < 0 || SpriteEditor.selectedCellX > SpriteEditor.gridCellWidth - 1 ||
                SpriteEditor.selectedCellY < 0 || SpriteEditor.selectedCellY > SpriteEditor.gridCellHeight - 1) {
                return;
            }

            // Get the sorted palette colors from SpritePalettes
            let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPalette(), SpriteEditor.paletteSortOrder);

            // Set the array elements
            let result = sortedPalette[SpriteEditor.selectedColorIndex];
            SpriteEditor.spriteIndex[SpriteEditor.selectedCellX][SpriteEditor.selectedCellY] = result.symbol;

            SpriteEditor.saveModifiedSprite();
        } else {
            // Determine which palette color was clicked
            const clickedPaletteX = Math.floor(mouse.mouseX / SpriteEditor.paletteSize);
            const clickedPaletteY = Math.floor(mouse.mouseY / SpriteEditor.paletteSize);
            const clickedPaletteIndex = clickedPaletteX + clickedPaletteY * SpriteEditor.paletteAcrossCnt;

            if (clickedPaletteIndex > SpritePalettes.getLength() - 1) {
                return; // don't allow invalid color index
            }

            SpriteEditor.selectedColorIndex = clickedPaletteIndex;
            SpriteEditor.paletteSelectedX = clickedPaletteX;
            SpriteEditor.paletteSelectedY = clickedPaletteY;
        }
    }
    static handleCanvasRightClick(mouse) {

        if (mouse.mouseX > (SpriteEditor.spriteGridSize * SpriteEditor.paletteAcrossCnt) * SpriteEditor.paletteScale) {
            // Determine which sprite cell clicked
            SpriteEditor.selectedCellX = Math.floor((mouse.mouseX - SpriteEditor.gridX) / SpriteEditor.spriteGridSize);
            SpriteEditor.selectedCellY = Math.floor((mouse.mouseY - SpriteEditor.gridY) / SpriteEditor.spriteGridSize);

            if (SpriteEditor.selectedCellX < 0 || SpriteEditor.selectedCellX > SpriteEditor.gridCellWidth - 1 ||
                SpriteEditor.selectedCellY < 0 || SpriteEditor.selectedCellY > SpriteEditor.gridCellHeight - 1) {
                return;
            }

            // Get the sorted palette colors from SpritePalettes
            let symbolToFind = SpriteEditor.spriteIndex[SpriteEditor.selectedCellX][SpriteEditor.selectedCellY];

            let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPalette(), SpriteEditor.paletteSortOrder);
            const index = sortedPalette.findIndex(entry => entry.symbol === symbolToFind);

            if (index !== -1) {
                SpriteEditor.selectedColorIndex = index;
                SpriteEditor.paletteSelectedX = index % 5;
                SpriteEditor.paletteSelectedY = Math.floor(index / 5);
            }

        }
    }

    // the game loop
    static gameLoop() {
        SpriteEditor.mouse.update();

        if (SpriteEditor.mouse.isButtonDown(0)) {
            SpriteEditor.handleCanvasLeftClick(SpriteEditor.mouse);
        }

        if (SpriteEditor.mouse.isButtonJustPressed(2)) {
            SpriteEditor.handleCanvasRightClick(SpriteEditor.mouse);
        }

        SpriteEditor.drawAll();
        requestAnimationFrame(SpriteEditor.gameLoop);
    }

}

window.onload = () => {
    // Call initialize after canvasEditor is assigned
    SpriteEditor.initialize();

    // Start gameLoop
    SpriteEditor.gameLoop();
};

// --------------------------------------------------------------------------
// JavaScript to handle dropdown selection and call SpritePalettes.setPalette
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('paletteDropdown');

    // Ensure the dropdown exists before attaching the event listener
    if (dropdown) {
        dropdown.addEventListener('change', (event) => {
            const selectedPalette = event.target.value;
            if (typeof SpriteEditor !== 'undefined' && typeof SpriteEditor.selectPalette === 'function') {
                SpriteEditor.selectPalette(selectedPalette);
            } else {
                alert('SpriteEditor.selectPalette is not defined.');
            }
        });
    } else {
        alert('Dropdown not found.');
    }
});

// --------------------------------------------------------------------------
// Select the file input and file name element
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
// Supported MIME types
const supportedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon' // For .ico files
];

// Handle file input change
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    // Check if a file is selected
    if (!file) {
        fileName.textContent = 'No image selected!';
        return;
    }

    // Update file name display
    fileName.textContent = file.name;

    // Validate file type
    if (!supportedTypes.includes(file.type)) {
        alert('Invalid file type! Please upload a valid image.');
        return;
    }

    // Read and draw the image
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Clear the canvas and draw the uploaded image
            console.log(img);
            SpriteEditor.image = img;
            SpriteEditor.imageName = file.name;
            SpriteEditor.addMessages(`Image loaded: '${SpriteEditor.imageName}'`);
        };
        img.src = e.target.result; // Set the image source
    };
    reader.readAsDataURL(file); // Read the file as a Data URL
});

// --------------------------------------------------------------------------
// Add event listener for input (change in json text content)
const textarea = document.getElementById('spriteID');
textarea.addEventListener('input', (event) => {
    SpriteEditor.addMessages(`Sprite JSON data changed.`);
    SpriteEditor.loadJsonFromTextarea();
});
