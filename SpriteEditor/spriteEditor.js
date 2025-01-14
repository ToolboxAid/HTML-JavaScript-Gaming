// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spriteEditor.js

import SpritePalettes from "../scripts/spritePalettes.js";
import MouseInput from '../scripts/mouse.js';
import { Demo } from "./demo.js";
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
    static maxGrid = 64;
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

    static currentFrame = 0;

    static jsonSprite = {
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
                    "imageX": 0,
                    "imageY": 0,
                    "imageScale": 2.0,
                },
                "data": [
                    "ØØØØ",
                    "ØØØØ",
                    "ØØØØ",
                    "ØØØØ",
                ]
            }
        ]
    };
    static jsonImages = {
    };

    // ------------------------------------------
    /** Samples methods*/
    static loadSample(jsonSprite, jsonImage, jsonPalette = null) {

        this.initialize();

        SpriteEditor.jsonSprite = jsonSprite;
        SpriteEditor.jsonImages = jsonImage;

        this.outputJsonData();
        this.loadSpriteFromTextarea();

        SpriteEditor.updatePaletteDD();

        if (jsonPalette) {
            SpritePalettes.palettes.custom = [...Demo.marioPalette.custom];
            this.showPaletteColors();
        }
        const textarea = document.getElementById('imageID');
        const jsonString = JSON.stringify(SpriteEditor.jsonImages, null, 2); // Indent with 2 spaces        
        textarea.value = jsonString;
    }
    static loadSample1() {
        SpriteEditor.addMessages('sample1')
        this.loadSample(Demo.sample1Sprite, Demo.sample1Image);
    }
    static loadSample2() {
        SpriteEditor.addMessages('sample2')
        this.loadSample(Demo.sample2Sprite, Demo.sample2Image);
    }
    static loadSample3() {
        SpriteEditor.addMessages('sample3')
        this.loadSample(Demo.sample3Sprite, Demo.sample3Image);
    }
    static loadSample4() {
        SpriteEditor.addMessages('sample4')
        this.loadSample(Demo.sample4Sprite, Demo.sample4Image);
    }
    static loadSample5() {
        SpriteEditor.addMessages('sample5')
        this.loadSample(Demo.sample5Sprite, Demo.sample5Image);
    }
    static loadSample6() {
        SpriteEditor.addMessages('sample6')
        this.loadSample(Demo.marioSprite, Demo.marioImage, Demo.marioPalette);
    }
    // ------------------------------------------
    /** Initialization methods*/
    static initialize() {
        this.clearMessages();
        this.initializeArrays();

        this.initializeCanvasEditor();
        this.initializeCanvasImage();

        // Setup our mouse
        this.mouse = new MouseInput(this.canvasEditor);

        // set paletteName on load
        this.updatePaletteDD();

        this.imageName = null;
        this.image = new Image();

        this.outputJsonData();

        this.loadSpriteFromTextarea();
        this.generateFrameLayerButtons();
        this.populateAnimationDropdown();

        this.setAnimationRate();
        this.setCurrentFrameLayer(0);
    }
    static initializeArrays() {
        for (let x = 0; x < this.maxGrid; x++) {
            this.spriteIndex[x] = new Array(this.maxGrid).fill('Ø');
        }
        this.addMessages(`Initialize array @ ${this.maxGrid}x${this.maxGrid}.`);
    }
    static initializeCanvasEditor() {
        // Get the canvas element
        this.canvasEditor = document.getElementById("spriteEditorID");

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
        this.canvasImage.addEventListener("click", this.handleAnimationClick);

        // Set the canvas iamge dimensions
        this.canvasImage.width = this.spriteImageSize;
        this.canvasImage.height = this.spriteImageSize;

        // Create a new CanvasRenderingContext2D object
        this.ctxImage = this.canvasImage.getContext("2d");

        this.addMessages(`Canvas Image initialized @ ${this.canvasImage.width}x${this.canvasImage.height}.`);

    }

    static lastAnimationDD = "10";  // set default
    static handleAnimationClick(event) {
        const dropdown = document.getElementById("animationDropdown");

        if (dropdown) {
            if (SpriteEditor.animationActive) {
                SpriteEditor.animationActive = false;
                SpriteEditor.lastAnimationDD = dropdown.value;
                SpriteEditor.setAnimationRate();
            } else {
                SpriteEditor.setAnimationRate(SpriteEditor.lastAnimationDD);
            }
        }


    }

    // ------------------------------------------
    /** Message methods*/
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
            this.addMessages(`Add '#ØØØØØØØØ' to palette for Transparent.`)
        }
    }

    // ------------------------------------------
    // Palette methods.    
    /** Palette methods*/
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
        SpriteEditor.jsonSprite.metadata.palette = SpriteEditor.paletteName;

        this.addMessages(`Selected palette: '${name}'.`);

        this.outputJsonData();
        this.showPaletteColors();

        return true;
    }
    static showPaletteColors() {
        const spriteTextarea = document.getElementById("paletteID");  // Ensure the textarea element exists

        if (!spriteTextarea) {
            alert(`Sprite textarea 'paletteID' not found.`);
            return;
        }

        spriteTextarea.value = SpritePalettes.getPaletteDetails()
            .replace(/'(\w+)'/g, '"$1"')  // Replace single quotes around keys with double quotes
            .replace(/'([^']+)'/g, '"$1"') // Replace single quotes around string values with double quotes
            // 4. Remove the trailing comma at the end of the array
            .replace(/,\s*$/, '')
            .replace(/;\s*$/, '');

        // Only custom palette can be updated by user
        if (SpriteEditor.paletteName === "custom") {
            spriteTextarea.disabled = false;
            spriteTextarea.value += "\n\n";
            spriteTextarea.value += "// Use transparent as sample code to add whatever colors you need.\n";
            spriteTextarea.value += "// FYI: no intelisence, errors will prevent palette from displaying.\n";
        } else {
            spriteTextarea.disabled = true;
        }
    }
    static setPaletteSortBy(arg) {
        this.paletteSortOrder = arg;
    }

    static loadPaletteFromTextarea() {
        // Get the value from the textarea
        const paletteTextarea = document.getElementById("paletteID").value;

        // Step 1: Remove comments
        const withoutComments = paletteTextarea.replace(/\/\/.*$/gm, '');

        // Step 2: Remove `custom:` and trim whitespace
        const withoutCustomKey = withoutComments.replace(/custom:\s*/, '').trim();

        // Step 3: Convert to valid JSON:
        const validJSON = withoutCustomKey
            .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // Enclose keys in double quotes
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,\s*}/g, '}') // Remove trailing commas in objects
            .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

        try {
            // Parse the cleaned string into JSON
            const customPalette = JSON.parse(validJSON);

            // Use the parsed palette
            SpritePalettes.setCustomPalette(customPalette);
        } catch (error) {
            console.error("Error parsing the palette data:", error);
            this.addMessages(`Error parsing the palette data: ${error.message}`);
        }
    }

    // // Call the function to load the palette
    // loadPaletteFromTextarea();


    // ------------------------------------------
    // Background image methods
    /** Image methods*/
    static loadCurrentFrameImage() {
        // Check if the current frame and its metadata exist
        if (
            SpriteEditor.jsonSprite.layers &&
            SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame] &&
            SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata &&
            SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata.spriteimage
        ) {
            const imageName = SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata.spriteimage;
    
            // Check if the image exists in the jsonSprite.images object
            if (SpriteEditor.jsonImages && SpriteEditor.jsonImages[imageName]) {
                // Create the image and set its source
                const img = new Image();
                img.src = SpriteEditor.jsonImages[imageName]; // Set the image source to the base64 data
    
                // Check if the image has been updated
                if (this.imageName !== imageName) {
                    this.imageName = imageName;
                    SpriteEditor.image = img; // Store the image for further use
                    this.image = img;
                    this.addMessages(`Image '${imageName}' successfully loaded.`);
                }
    
                // Set image position
                this.imageX = SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata.imageX;
                this.imageY = SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata.imageY;
            } else {
                // Handle case where image is not found
                this.addMessages(`Image '${imageName}' not found in SpriteEditor.jsonImages for the current frame: ${this.currentFrame}.`);
                this.imageName = null;
                this.image = null;
            }
        } else {
            // Handle case where metadata is missing
            this.imageName = null;
            this.image = null;
            // this.addMessages(`No spriteimage metadata found for the current frame: ${SpriteEditor.currentFrame}.`);
        }
    }
    
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
        SpriteEditor.jsonSprite.layers[this.currentFrame].metadata.imageX = this.imageX;

        this.outputJsonData();
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
        SpriteEditor.jsonSprite.layers[this.currentFrame].metadata.imageY = this.imageY;

        this.outputJsonData();
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
        SpriteEditor.jsonSprite.layers[this.currentFrame].metadata.imageScale = this.imageScale;

        this.outputJsonData();
    }

    // ------------------------------------------
    /** Grid methods*/
    static showSpriteGridDimensions() {
        this.addMessages(` Grid Size ${this.gridCellWidth}x${this.gridCellHeight}`);
    }
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
        SpriteEditor.jsonSprite.metadata.spriteGridSize = parseFloat(this.spriteGridSize.toFixed(1));
        this.outputJsonData();

    }
    static spriteAddRow() {
        // Ensure we don't exceed the maximum grid height
        if (this.gridCellHeight < this.maxGrid) {
            this.gridCellHeight++;

            // Iterate over all layers
            SpriteEditor.jsonSprite.layers.forEach((layer) => {
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

        this.outputJsonData();
    }
    static spriteAddColumn() {
        // Ensure we don't exceed the maximum grid width
        if (this.gridCellWidth < this.maxGrid) {
            this.gridCellWidth++;

            // Iterate over all layers
            SpriteEditor.jsonSprite.layers.forEach((layer) => {
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

        this.outputJsonData();
    }
    static spriteDelColumn() {
        // Ensure we don't remove columns below the minimum grid width (1 column)
        if (this.gridCellWidth > 1) {
            this.gridCellWidth--;

            // Iterate over all layers
            SpriteEditor.jsonSprite.layers.forEach((layer) => {
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

        this.outputJsonData();
    }
    static spriteDelRow() {
        // Ensure we don't go below the minimum grid height
        if (this.gridCellHeight > 1) {
            this.gridCellHeight--;

            // Iterate over all layers
            SpriteEditor.jsonSprite.layers.forEach((layer) => {
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

        this.outputJsonData();
    }
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
        //SpriteEditor.jsonSprite.metadata.spritePixelSize = this.spritePixelSize.toFixed(2);
        SpriteEditor.jsonSprite.metadata.spritePixelSize = parseFloat(this.spritePixelSize.toFixed(2));

        this.outputJsonData();
    }

    // ------------------------------------------
    /** Draw methods*/
    static drawAll() {
        // Clear the canvas and set background color to #333333
        this.ctxEditor.clearRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);
        this.ctxEditor.fillStyle = '#333333';
        this.ctxEditor.fillRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);

        if (!(this.animationActive) && this.imageName && this.image) {
            this.ctxEditor.save();
            this.ctxEditor.scale(this.imageScale, this.imageScale);
            this.ctxEditor.drawImage(this.image, this.imageX, this.imageY);
            this.ctxEditor.restore();
        }

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

    // ------------------------------------------
    /** Frame/Animation methods*/
    static generateFrameLayerButtons() {
        const container = document.getElementById("setCurrentFrameLayer");
        if (!container) {
            this.addMessages("Container with id 'setCurrentFrameLayer' not found!");
            return;
        }

        // Clear existing buttons in the container
        container.innerHTML = "";

        // Add buttons based on the number of layers
        this.jsonSprite.layers.forEach((_, index) => {
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
    static setAnimationRate(value = "0") {

        const dropdown = document.getElementById("animationDropdown");
        if (dropdown) {
            // Set the selected value to '0' to 'Stop' or 1-60 for frames
            dropdown.value = value; //

            // Trigger the change event manually if needed
            const event = new Event('change');
            dropdown.dispatchEvent(event);
        }
    }
    static setCurrentFrameLayer(currentFrame) {
        if (
            SpriteEditor.jsonSprite.layers &&
            currentFrame >= 0 &&
            currentFrame < SpriteEditor.jsonSprite.layers.length
        ) {
            this.currentFrame = currentFrame;
            //this.addMessages(`Current Layer frame at index: ${this.currentFrame}`);
        } else {
            this.addMessages(`Invalid currentFrame or layers data: ${currentFrame}`);
        }

        this.loadSpriteFromJSON();

        this.generateFrameLayerButtons();

        this.loadCurrentFrameImage();
    }
    static prevCurrentFrameLayer() {
        if (this.currentFrame === 0) {
            this.setCurrentFrameLayer(SpriteEditor.jsonSprite.layers.length - 1);
        } else {
            this.setCurrentFrameLayer(--this.currentFrame);
        }
    }
    static nextCurrentFrameLayer() {
        if (this.currentFrame === SpriteEditor.jsonSprite.layers.length - 1) {
            this.setCurrentFrameLayer(0);
        } else {
            this.setCurrentFrameLayer(++this.currentFrame);
        }
    }
    /** Animation methods*/
    static animationActive = false;
    static frameRate = 0;
    static frameRateCount = 0;
    static setAnimationFrameRate(frameRate) {
        this.frameRate = frameRate;
        if (this.frameRate > 0) {
            this.animationActive = true;
        } else {
            this.animationActive = false;
        }
    }
    static animateSpriteImage() {
        // Exit if no animation is needed
        // Convert frameRate to a number and check if it equals 0
        const frameRate = Number(this.frameRate);
        if (!frameRate || frameRate <= 0) {
            return;
        }

        // Increment frame rate counter
        this.frameRateCount++;

        // Check if it's time to advance to the next frame
        if (this.frameRateCount >= this.frameRate) {
            this.frameRateCount = 0; // Reset counter
            this.nextCurrentFrameLayer(); // Move to the next frame
        }
    }

    static showStackTrace() {
        const trace = new Error("Show stack trace:");
        console.log(trace.stack);
    }
    // ------------------------------------------
    /** JSON methods*/
    static outputJsonData() {
        // Locate the textarea in the document
        const textArea = document.getElementById("spriteID");

        // Convert the JSON object into a formatted string
        const jsonString = JSON.stringify(SpriteEditor.jsonSprite, null, 2); // Indent with 2 spaces

        if (textArea.value === jsonString) {
            return;
        }

        // Set the textarea value
        textArea.value = jsonString;

        // Assuming jsonSprite is the JSON object that contains the data
        // Validate that jsonSprite, layers, the first layer, and its data exist
        //const firstLayerData = SpriteEditor?.jsonSprite?.layers?.[0]?.data ?? null;
        const firstLayerData = SpriteEditor?.jsonSprite?.layers?.[this.currentFrame]?.data ?? null;

        if (firstLayerData) {
            // Use firstLayerData safely
            this.loadSpriteFromJSON();
        } else {
            this.addMessages("The required 'firstLayerData' does not exist.");
            return;
        }
    }
    static loadSpriteFromJSON() {
        const firstLayerData = SpriteEditor?.jsonSprite?.layers?.[this.currentFrame]?.data ?? null;
        if (firstLayerData === null) {
            console.log("null");
            return;
        }
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
        let originalLayer = SpriteEditor.jsonSprite.layers[this.currentFrame];
        let tempLayer = JSON.parse(JSON.stringify(originalLayer));

        tempLayer.metadata.imageX = layerIndex;
        tempLayer.metadata.imageY = this.currentFrame;

        SpriteEditor.jsonSprite.layers.splice(this.currentFrame, 0, tempLayer);

        this.currentFrame += layerIndex;

        this.addMessages(`Layer added at: ${this.currentFrame}`);
        this.setCurrentFrameLayer(this.currentFrame);

        this.outputJsonData();
    }
    static subLayer() {
        // Prevent removal if there's only one layer remaining
        if (SpriteEditor.jsonSprite.layers.length <= 1) {
            this.addMessages("Cannot remove the last remaining layer.");
            return;
        }

        if (this.currentFrame >= 0 && this.currentFrame < SpriteEditor.jsonSprite.layers.length) {
            SpriteEditor.jsonSprite.layers.splice(this.currentFrame, 1);

            let currentFrame = this.currentFrame;
            if (this.currentFrame > SpriteEditor.jsonSprite.layers.length - 1) {
                this.currentFrame = SpriteEditor.jsonSprite.layers.length - 1;
            }
            this.addMessages(`Layer removed at index: ${currentFrame}`);
            this.setCurrentFrameLayer(this.currentFrame);

            this.outputJsonData();
        } else {
            this.addMessages(`Invalid layer index: ${currentFrame} ${this.currentFrame}`);
        }
    }
    static setStaticVarsFromJson() {
        // Access metadata.sprite
        this.selectPalette(SpriteEditor.jsonSprite.metadata.palette);
        this.setSpritePixelSize(SpriteEditor.jsonSprite.metadata.spritePixelSize);
        this.setSpriteGridSize(SpriteEditor.jsonSprite.metadata.spriteGridSize);

        if (false) {
            console.log('Sprite:', sprite);
            console.log('Sprite Grid Size:', this.spriteGridSize);
            console.log('Sprite Pixel Size:', SpriteEditor.spritePixelSize);
            console.log('Palette:', SpriteEditor.paletteName);
        }
        // Access metadata.layer frames
        this.setImageX(SpriteEditor.jsonSprite.layers[this.currentFrame].metadata.imageX);
        this.setImageY(SpriteEditor.jsonSprite.layers[this.currentFrame].metadata.imageY);
        this.setImageScale(SpriteEditor.jsonSprite.layers[this.currentFrame].metadata.imageScale);

        this.loadCurrentFrameImage();
        if (false) {
            console.log('ImageX:', this.imageX);
            console.log('ImageY:', this.imageY);
            console.log('ImageScale:', this.imageScale);
        }
    }
    static loadSpriteFromTextarea() {
        const textarea = document.getElementById('spriteID');
        const jsonString = textarea.value;

        try {
            // Parse the JSON string into an object
            const parsedData = JSON.parse(jsonString);
            // Assign the parsed data to SpriteEditor.jsonSprite
            if (typeof SpriteEditor !== 'undefined') {
                SpriteEditor.jsonSprite = parsedData;
                this.setStaticVarsFromJson();
                this.generateFrameLayerButtons();
                this.loadSpriteFromJSON();
            } else {
                SpriteEditor.addMessages('SpriteEditor is not defined.')
            }
        } catch (error) {
            SpriteEditor.addMessages(`Invalid spriteID JSON format: ${error} \n`);
            console.log(`Invalid spriteID JSON format: ${error} \n ${error.message} \n ${jsonString}`);
            alert("I must be trashing some variable...\n'spriteID' failure, \n if the issue persists, press 'F5' to reset");
        }

    }
    static loadImageFromTextarea() {
        const textarea = document.getElementById('imageID');
        const jsonString = textarea.value;
        try {
            // Parse the JSON string into an object
            const parsedData = JSON.parse(jsonString);
            // Assign the parsed data to SpriteEditor.jsonSprite
            if (typeof SpriteEditor !== 'undefined') {
                SpriteEditor.jsonImages = parsedData;
                this.loadCurrentFrameImage();
            } else {
                SpriteEditor.addMessages('imageID is not defined.')
            }
        } catch (error) {
            SpriteEditor.addMessages(`Invalid imageID JSON format: ${error} \n `);
        }
    }

    static saveModifiedSprite() {

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
        if (SpriteEditor.jsonSprite.layers && SpriteEditor.jsonSprite.layers[this.currentFrame]) {
            SpriteEditor.jsonSprite.layers[this.currentFrame].data = updatedData;
        }

    }

    static toCamelCase(...args) {
        return args
            .join(' ') // Concatenate all arguments with a space in between
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .trim() // Remove leading and trailing spaces
            .split(/\s+/) // Split into words
            .map((word, index) =>
                index === 0
                    ? word // First word remains lowercase
                    : word.charAt(0).toUpperCase() + word.slice(1) // Capitalize subsequent words
            )
            .join(''); // Combine into camel case
    }


    static copyJSON() {
        const camelCasePalete = this.toCamelCase(SpriteEditor.jsonSprite.metadata.sprite, "palette");
        const camelCaseSprite = this.toCamelCase(SpriteEditor.jsonSprite.metadata.sprite, "sprite");
        const camelCaseImage = this.toCamelCase(SpriteEditor.jsonSprite.metadata.sprite, "image");

        // Get the textarea element
        const textarea = document.getElementById("spriteID");

        // Check if the textarea exists and has content
        if (textarea && textarea.value) {
            // Prepare JSON strings
            const jsonImagesString = JSON.stringify(SpriteEditor.jsonImages, null, 2);



            let jsonPaletteString = "";
            if (SpriteEditor.paletteName === "custom") {
                jsonPaletteString = "static " + camelCasePalete + " = {\ncustom: " +
                    JSON.stringify(SpritePalettes.getPalette(), null, 0)
                        .replace(/(\r\n|\n|\r)/g, '') // Remove all carriage returns and line feeds
                        .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // Enclose keys in double quotes
                        .replace(/'/g, '"') // Replace single quotes with double quotes
                        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
                        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
                        .replace(/\},/g, '},\n') // Add a newline after each closing brace
                        .replace(/\[\s*\{/g, '[\n{') // Replace "[ {" with "[\n{"
                    + "\n};"; // Close the array with a newline before the closing bracket
            }

            // Create the modified text
            const modifiedText =
                "static " + camelCaseSprite + " = " + textarea.value + "; \n" +
                "static " + camelCaseImage + " = " + jsonImagesString + ";\n" +
                jsonPaletteString;
            // Use Clipboard API if supported
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(modifiedText)
                    .then(() => {
                        this.addMessages("JSON copied to clipboard!");
                    })
                    .catch((error) => {
                        console.error("Error copying JSON to clipboard:", error);
                        this.addMessages("An error occurred while copying JSON.");
                    });
            } else {
                // Fallback for older browsers using execCommand
                console.warn("Clipboard API not supported. Falling back to execCommand.");
                this.addMessages("Clipboard API not supported. Falling back to execCommand.");

                // Create a temporary textarea
                const tempTextarea = document.createElement("textarea");
                document.body.appendChild(tempTextarea);

                tempTextarea.value = modifiedText; // Set the text
                tempTextarea.style.position = "fixed"; // Prevent scrolling to bottom
                tempTextarea.select();
                tempTextarea.setSelectionRange(0, tempTextarea.value.length); // For mobile

                try {
                    const success = document.execCommand("copy");
                    if (success) {
                        this.addMessages("JSON copied to clipboard!");
                    } else {
                        this.addMessages("Failed to copy JSON.");
                    }
                } catch (err) {
                    console.error("Error copying JSON using execCommand:", err);
                    this.addMessages("An error occurred while copying JSON.");
                } finally {
                    // Clean up
                    document.body.removeChild(tempTextarea);
                }
            }
        } else {
            this.addMessages("No JSON data to copy!");
        }
    }

    // ------------------------------------------
    /** canvas click methods*/
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

            this.outputJsonData();


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
    static showHideData() {
        // Select the box3 element
        const box3 = document.querySelector('.box3');
        const button = document.getElementById('showHide');

        if (box3) {
            // Check if the element is currently hidden
            const isHidden = box3.classList.contains('hidden');

            if (isHidden) {
                // If hidden, show it
                box3.classList.remove('hidden');
                if (button) button.textContent = "Hide data";
            } else {
                // If visible, hide it
                box3.classList.add('hidden');
                if (button) button.textContent = "Show data"; // Update button text
            }
        } else {
            console.error("box3 element not found.");
        }
    }

    // ------------------------------------------
    /** the game loop  */
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
        alert('paletteDropdown not found.');
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
        alert('animationDropdown not found.');
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
            if (
                SpriteEditor.jsonSprite.layers &&
                SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame] &&
                SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata
            ) {
                SpriteEditor.jsonSprite.layers[SpriteEditor.currentFrame].metadata.spriteimage = SpriteEditor.imageName;
                SpriteEditor.jsonImages[SpriteEditor.imageName] = e.target.result;
                SpriteEditor.outputJsonData();

                const textarea = document.getElementById('imageID');
                textarea.value = JSON.stringify(SpriteEditor.jsonImages, null, 2);
            } else {
                SpriteEditor.addMessages("Failed to update current frame(s) image.");
            }

            SpriteEditor.addMessages(`Image loaded and set: '${SpriteEditor.imageName}'`);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file); // Read the file as a Data URL
});

// --------------------------------------------------------------------------
// Add event listener for palette (change in json text content)
const textareaPalette = document.getElementById('paletteID');
textareaPalette.addEventListener('input', (event) => {
    SpriteEditor.addMessages(`Palette JSON data changed.`);
    SpriteEditor.loadPaletteFromTextarea();
});

// --------------------------------------------------------------------------
// Add event listener for input (change in json text content)
const textareaSprite = document.getElementById('spriteID');
textareaSprite.addEventListener('input', (event) => {
    SpriteEditor.addMessages(`Sprite JSON data changed.`);
    SpriteEditor.loadSpriteFromTextarea();
});

// --------------------------------------------------------------------------
// Add event listener for images (change in json text content)
const textareaImages = document.getElementById('imageID');
textareaImages.addEventListener('input', (event) => {
    SpriteEditor.addMessages(`Image JSON data changed.`);
    SpriteEditor.loadImageFromTextarea();
});

