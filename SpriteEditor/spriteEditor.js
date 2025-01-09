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
            "spriteGridSize": 30,
            "spritePixelSize": 3,
            "palette": "default",
        },
        "layers": [
            {
                "metadata": {
                    "spriteimage": "",
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
                  "&ØØØ",
                  "&ØØØ",
                  "&ØØØ",
                  "&ØØØ"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 2,
                  "imageScale": 1.5
                },
                "data": [
                  "Ø&ØØ",
                  "&ØØØ",
                  "&ØØØ",
                  "&ØØØ"
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
                  "ØØ&Ø",
                  "Ø&ØØ",
                  "&ØØØ",
                  "&ØØØ"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 3,
                  "imageScale": 1.5
                },
                "data": [
                  "ØØØ&",
                  "ØØ&Ø",
                  "Ø&ØØ",
                  "&ØØØ"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 4,
                  "imageScale": 1.5
                },
                "data": [
                  "ØØØ&",
                  "ØØØ&",
                  "ØØ&Ø",
                  "Ø&ØØ"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 5,
                  "imageScale": 1.5
                },
                "data": [
                  "ØØØ&",
                  "ØØØ&",
                  "ØØØ&",
                  "ØØ&Ø"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 6,
                  "imageScale": 1.5
                },
                "data": [
                  "ØØØ&",
                  "ØØØ&",
                  "ØØØ&",
                  "ØØØ&"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 7,
                  "imageScale": 1.5
                },
                "data": [
                  "&ØØØ",
                  "ØØØ&",
                  "ØØØ&",
                  "ØØØ&"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 8,
                  "imageScale": 1.5
                },
                "data": [
                  "&ØØØ",
                  "&ØØØ",
                  "ØØØ&",
                  "ØØØ&"
                ]
              },
              {
                "metadata": {
                  "spriteimage": "test.jpg",
                  "imageX": 1,
                  "imageY": 9,
                  "imageScale": 1.5
                },
                "data": [
                  "&ØØØ",
                  "&ØØØ",
                  "&ØØØ",
                  "ØØØ&"
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
                  "&ØØØ",
                  "&ØØØ",
                  "&ØØØ",
                  "&ØØØ"
                ]
              }
            ]
          };

        SpriteEditor.jsonData = jsonData;
        this.outputJsonData();
        this.loadJsonFromTextarea();
    }
    static loadSample2() {
        SpriteEditor.addMessages('loadSample1');
        const jsonData = {
            "metadata": {
              "sprite": "sprite starter json",
              "spriteGridSize": 44,
              "spritePixelSize": 3,
              "palette": "default"
            },
            "layers": [
              {
                "metadata": {
                  "spriteimage": "RaspberryPi.png",
                  "imageX": 331,
                  "imageY": 61,
                  "imageScale": 0.55
                },
                "data": [
                  "eeØØØØØØØØ",
                  "eeeeØØØØØØ",
                  "ØeeeØØddØØ",
                  "ØØeeeddØØØ",
                  "ØØØØedØØØØ",
                  "ØØØ####ØØØ",
                  "ØØ#####%ØØ",
                  "Ø######%%Ø",
                  "Ø%%ØØØØ%%%",
                  "%%%%ØØ%%%%",
                  "%%%%ØØ%%%%",
                  "Ø%%Ø##Ø%%Ø",
                  "ØØ%#####ØØ",
                  "ØØØ####ØØØ",
                  "ØØØØ##ØØØØ"
                ]
              }
            ],
            "images": {
              "RaspberryPi.png": "data:image/png;base64,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"
            }
          };
          SpriteEditor.jsonData = jsonData;
          this.outputJsonData();
          this.loadJsonFromTextarea();
          this.loadCurrentFrameImage();

          this.imageName = SpriteEditor.imageName;
          this.imageName = "RaspberryPi.png";
          const img = new Image();
          img.src = SpriteEditor.jsonData.images[this.imageName];
          this.image = img;

          console.log(this.imageName);          
          console.log(this.image);          
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
        this.generateFrameLayerButtons();
        this.populateAnimationDropdown();
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
    static loadCurrentFrameImage() {
        // Check if the current frame and its metadata exist
        if (
            SpriteEditor.jsonData.layers &&
            SpriteEditor.jsonData.layers[SpriteEditor.currentFrame] &&
            SpriteEditor.jsonData.layers[SpriteEditor.currentFrame].metadata &&
            SpriteEditor.jsonData.layers[SpriteEditor.currentFrame].metadata.spriteimage
        ) {
            const imageName = SpriteEditor.jsonData.layers[SpriteEditor.currentFrame].metadata.spriteimage;
    
            // Check if the image exists in the jsonData.images object
            if (SpriteEditor.jsonData.images && SpriteEditor.jsonData.images[imageName]) {
                const img = new Image();
                img.onload = () => {
                    console.log(`Image '${imageName}' successfully loaded.`);
                    SpriteEditor.image = img; // Store the image for further use
                };
                img.src = SpriteEditor.jsonData.images[imageName]; // Set the image source to the base64 data
            } else {
                console.error(`Image '${imageName}' not found in SpriteEditor.jsonData.images.`);
            }
        } else {
            console.error("No spriteimage metadata found for the current frame.");
        }

        //TODO: image load should be here.
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
            this.imageScale = 0;
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
        // Ensure we don't exceed the maximum grid height
        if (this.gridCellHeight < this.maxGrid) {
            this.gridCellHeight++;
    
            // Iterate over all layers
            SpriteEditor.jsonData.layers.forEach((layer) => {
                const layerData = layer.data;
    
                // Add a new row to the bottom of the layer's data
                const newRow = SpritePalettes.errorResult.symbol.repeat(layerData[0].length); // Create a row of 0s with the correct width
                layerData.push(newRow);
            });
    
            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            this.addMessages(`Cannot add row, gridCellHeight is already ${this.maxGrid}.`);
        }
    
        // Update sprite grid dimensions display
        this.showSpriteGridDimensions();
    }    
    static spriteAddColumn() {
        // Ensure we don't exceed the maximum grid width
        if (this.gridCellWidth < this.maxGrid) {
            this.gridCellWidth++;
    
            // Iterate over all layers
            SpriteEditor.jsonData.layers.forEach((layer) => {
                const layerData = layer.data;
    
                // Add a new column to the right of each row
                layer.data = layerData.map(row => row + SpritePalettes.errorResult.symbol);
            });
    
            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            this.addMessages(`Cannot add column, gridCellWidth is already ${this.maxGrid}.`);
        }
    
        // Update sprite grid dimensions display
        this.showSpriteGridDimensions();
    }
    static spriteAddColumn() {
        // Ensure we don't exceed the maximum grid width
        if (this.gridCellWidth < this.maxGrid) {
            this.gridCellWidth++;
    
            // Iterate over all layers
            SpriteEditor.jsonData.layers.forEach((layer) => {
                const layerData = layer.data;
    
                // Add a new column to the right of each row
                layer.data = layerData.map(row => row + SpritePalettes.errorResult.symbol);
            });
    
            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            this.addMessages(`Cannot add column, gridCellWidth is already ${this.maxGrid}.`);
        }
    
        // Update sprite grid dimensions display
        this.showSpriteGridDimensions();
    }
    static spriteDelColumn() {
        // Ensure we don't remove columns below the minimum grid width (1 column)
        if (this.gridCellWidth > 1) {
            this.gridCellWidth--;
    
            // Iterate over all layers
            SpriteEditor.jsonData.layers.forEach((layer) => {
                const layerData = layer.data;
    
                // Remove the last character (column) from each row
                layer.data = layerData.map(row => row.slice(0, -1));
            });
    
            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            this.addMessages("Cannot delete column, gridCellWidth is already at the minimum (1).");
        }
    
        // Update sprite grid dimensions display
        this.showSpriteGridDimensions();
    }        
    static spriteDelRow() {
        // Ensure we don't go below the minimum grid height
        if (this.gridCellHeight > 1) {
            this.gridCellHeight--;
    
            // Iterate over all layers
            SpriteEditor.jsonData.layers.forEach((layer) => {
                const layerData = layer.data;
    
                // Remove the last row from the layer's data
                if (layerData.length > 0) {
                    layerData.pop();
                }
            });
    
            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            this.addMessages(`Cannot delete row, gridCellHeight is already at the minimum value of 1.`);
        }
    
        // Update sprite grid dimensions display
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

    static generateFrameLayerButtons() {
        const container = document.getElementById("setCurrentFrameLayer");
        if (!container) {
            this.addMessages("Container with id 'setCurrentFrameLayer' not found!");
            return;
        }

        // Clear existing buttons in the container
        container.innerHTML = "";

        // Add buttons based on the number of layers
        this.jsonData.layers.forEach((_, index) => {
            const button = document.createElement("button");
            button.textContent = index;
            button.id = `frameButton-${index}`; // Unique ID for each button
            button.classList.add("frameButton");

            // Set initial 'currentFrame' class for the current frame
            if (index === this.currentFrame) {
                button.classList.add("currentFrame");
            }

            // Attach onclick event to set the current frame
            button.onclick = () => this.setCurrentFrameLayer(index);

            // Append the button to the container
            container.appendChild(button);

            // Add a <br> after every 5 buttons
            if ((index + 1) % 5 === 0) {
                const lineBreak = document.createElement("br");
                container.appendChild(lineBreak);
            }
        });

    }
    static populateAnimationDropdown() {
        const dropdown = document.getElementById("animationDropdown");

        if (!dropdown) {
            this.addMessages(`'animationDropdown' not found.`);
            return;
        }

        // Clear any existing options
        dropdown.innerHTML = "";

        // Add the "Stop" option
        const stopOption = document.createElement("option");
        stopOption.value = 0;
        stopOption.textContent = "Stop";
        dropdown.appendChild(stopOption);

        // Add options for 1/60 to 60/60
        for (let i = 1; i <= 60; i++) {
            const option = document.createElement("option");
            option.value = i; // Set value to the current number
            const frameDuration = (i / 60).toFixed(4); // Calculate frame duration with 4 decimal places
            option.textContent = `${frameDuration}/sec`; // Set text as "1 - 0.0166"
            dropdown.appendChild(option);
        }
    }

    //output sprite details
    static outputJsonData() {
        // this.generateFrameLayerButtons();
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
        this.gridCellWidth = firstLayerData[0].length;  // Number of columns
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

        SpriteEditor.jsonData.layers.splice(this.currentFrame, 0, tempLayer);

        this.currentFrame += layerIndex;

        this.addMessages(`Layer added at: ${this.currentFrame}`);
        this.setCurrentFrameLayer(this.currentFrame)
    }
    // Remove a layer at the specified index
    static subLayer() {
        // Prevent removal if there's only one layer remaining
        if (SpriteEditor.jsonData.layers.length <= 1) {
            this.addMessages("Cannot remove the last remaining layer.");
            return;
        }

        if (this.currentFrame >= 0 && this.currentFrame < SpriteEditor.jsonData.layers.length) {
            SpriteEditor.jsonData.layers.splice(this.currentFrame, 1);

            let currentFrame = this.currentFrame;
            if (this.currentFrame > SpriteEditor.jsonData.layers.length - 1) {
                this.currentFrame = SpriteEditor.jsonData.layers.length - 1;
            }
            this.addMessages(`Layer removed at index: ${currentFrame}`);
            this.setCurrentFrameLayer(this.currentFrame);
        } else {
            this.addMessages(`Invalid layer index: ${currentFrame} ${this.currentFrame}`);
        }
    }

    // ------------------------------------------------
    // json methods
    static setCurrentFrameLayer(currentFrame) {
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

        this.loadSpriteFromJSON();

        this.outputJsonData();
        this.generateFrameLayerButtons();
    }

    static prevCurrentFrameLayer() {
        if (this.currentFrame === 0) {
            this.setCurrentFrameLayer(SpriteEditor.jsonData.layers.length - 1);
        } else {
            this.setCurrentFrameLayer(--this.currentFrame);
        }
    }
    static nextCurrentFrameLayer() {
        if (this.currentFrame === SpriteEditor.jsonData.layers.length - 1) {
            this.setCurrentFrameLayer(0);
        } else {
            this.setCurrentFrameLayer(++this.currentFrame);
        }
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

        this.generateFrameLayerButtons();
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

    static frameRate = 0;
    static frameRateCurrent = 0;
    static setAnimationFrameRate(frameRate) {
        this.frameRate = frameRate;
    }
    static animateSpriteImage() {
        // Exit if no animation is needed
        // Convert frameRate to a number and check if it equals 0
        const frameRate = Number(this.frameRate);
        if (!frameRate || frameRate <= 0) {
            return;
        }

        // Increment frame rate counter
        this.frameRateCurrent++;

        // Check if it's time to advance to the next frame
        if (this.frameRateCurrent >= this.frameRate) {
            this.frameRateCurrent = 0; // Reset counter
            this.nextCurrentFrameLayer(); // Move to the next frame
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
        SpriteEditor.animateSpriteImage();
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

document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('animationDropdown');

    // Ensure the dropdown exists before attaching the event listener
    if (dropdown) {
        dropdown.addEventListener('change', (event) => {
            const frameRate = event.target.value;
            if (typeof SpriteEditor !== 'undefined' && typeof SpriteEditor.selectPalette === 'function') {
                SpriteEditor.setAnimationFrameRate(frameRate);
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

    // Read and process the image
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Set the image in SpriteEditor and log a message
            SpriteEditor.image = img;
            SpriteEditor.imageName = file.name;

            // Add image to JSON with the key being the name and value being the image data
            SpriteEditor.jsonData.images = SpriteEditor.jsonData.images || {};
            SpriteEditor.jsonData.images[SpriteEditor.imageName] = e.target.result; // Store the base64 string
//            console.log(SpriteEditor.imageName, img.src, SpriteEditor.jsonData.images);

            // Update the current frame's metadata with the image name
            if (
                SpriteEditor.jsonData.layers &&
                SpriteEditor.jsonData.layers[SpriteEditor.currentFrame] &&
                SpriteEditor.jsonData.layers[SpriteEditor.currentFrame].metadata
            ) {
                SpriteEditor.jsonData.layers[SpriteEditor.currentFrame].metadata.spriteimage = SpriteEditor.imageName;
            } else {
                SpriteEditor.addMessages("Failed to update current frame's image metadata.");
            }

            SpriteEditor.addMessages(`Image loaded and set: '${SpriteEditor.imageName}'`);
        };
        img.src = e.target.result; // Set the image source to the file's base64 data

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
