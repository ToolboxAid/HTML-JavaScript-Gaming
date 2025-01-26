// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spriteEditor.js

import Colors from "../scripts/colors.js";
import Palettes from "../scripts/palettes.js";
import MouseInput from '../scripts/mouse.js';
import Samples from "./samples.js";
import Functions from "../scripts/functions.js";

import { ImageScale } from "./imageScale.js";
import { Message } from './message.js';

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
    // hue, saturation, lightness
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

    static selectedColor = Palettes.transparent;
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

    //-------------------------------------------
    static mouse = null;

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
    static loadSample(name, jsonSprite, jsonImage, jsonPalette = null) {

        this.initialize();

        this.jsonSprite = JSON.parse(JSON.stringify(jsonSprite));
        this.jsonImages = JSON.parse(JSON.stringify(jsonImage));

        this.outputJsonData();
        this.loadSpriteFromTextarea();

        if (jsonPalette) {
            Palettes.palettes.custom = [...Samples.marioPalette.custom];
            this.showPaletteColors();
        }
        const textarea = document.getElementById('imageID');
        const jsonString = JSON.stringify(this.jsonImages, null, 2); // Indent with 2 spaces        
        textarea.value = jsonString;

        Message.add(`Loaded: '${name}'`)
    }
    static loadSample1() {
        this.loadSample('sample 1', Samples.sample1Sprite, Samples.sample1Image);
    }
    static loadSample2() {
        this.loadSample('sample 2', Samples.sample2Sprite, Samples.sample2Image);
    }
    static loadSample3() {
        this.loadSample('sample 3', Samples.sample3Sprite, Samples.sample3Image);
    }
    static loadSample4() {
        this.loadSample('sample 4', Samples.sample4Sprite, Samples.sample4Image);
    }
    static loadSample5() {
        this.loadSample('sample 5', Samples.sample5Sprite, Samples.sample5Image);
    }
    static loadSample6() {
        this.loadSample('sample 6', Samples.marioSprite, Samples.marioImage, Samples.marioPalette);
    }
    // ------------------------------------------
    /** Initialization methods*/
    static initialize() {
        Message.clear();
        this.initializeArrays();

        this.initializeCanvasEditor();
        this.initializeCanvasImage();

        // Setup our mouse
        this.mouse = new MouseInput(this.canvasEditor);

        // set paletteName on load
        this.updatePaletteDD();

        this.imageName = null;
        this.image = new Image();

        this.resetAnimationFrame();
        this.setCurrentFrameLayer(0);

        this.outputJsonData();

        this.loadSpriteFromTextarea();
        this.generateFrameLayerButtons();
        this.populateAnimationDropdown();
    }
    static initializeArrays() {
        for (let x = 0; x < this.maxGrid; x++) {
            this.spriteIndex[x] = new Array(this.maxGrid).fill('Ø');
        }
        Message.add(`Initialize array @ ${this.maxGrid}x${this.maxGrid}.`);
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

        Message.add(`Canvas Editor initialized @ ${this.canvasEditor.width}x${this.canvasEditor.height}.`);
    }
    static initializeCanvasImage() {
        // SpriteImage
        this.canvasImage = document.getElementById("spriteImage");

        if (!this.canvasImage) {
            alert("Canvas element with id 'spriteEditor' not found.");
            return;
        }
        this.canvasImage.addEventListener("click", this.handleCanvasImageClick);

        // Set the canvas iamge dimensions
        this.canvasImage.width = this.spriteImageSize;
        this.canvasImage.height = this.spriteImageSize;

        // Create a new CanvasRenderingContext2D object
        this.ctxImage = this.canvasImage.getContext("2d");

        Message.add(`Canvas Image initialized @ ${this.canvasImage.width}x${this.canvasImage.height}.`);

    }
 
    // ------------------------------------------
    // Palette methods.    
    /** Palette methods*/
    static updatePaletteDD() {
        // Get the dropdown element by its ID
        const dropdown = document.getElementById("paletteDropdown");

        // Set the selected value to 'crayola024' (or any other value you wish to select)
        dropdown.value = Palettes.activeName;
        // Trigger the change event manually if needed
        const event = new Event('change');
        dropdown.dispatchEvent(event);
    }
    static selectPalette(name) {
        if (!Palettes.palettes[name]) {
            alert(`Palette '${name}' not found.`);
            return false;
        }

        if (name === 'custom'){            
            Palettes.setCustom(Palettes.get());// it was set elseware, 
            this.jsonSprite.metadata.palette = Palettes.activeName;    
        }else{
            Palettes.set(name);
            this.jsonSprite.metadata.palette = Palettes.activeName;    
        }

        Message.add(`Selected palette: '${name}'.`);

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

        spriteTextarea.value = Palettes.getDetails()
            .replace(/'(\w+)'/g, '"$1"')  // Replace single quotes around keys with double quotes
            .replace(/'([^']+)'/g, '"$1"') // Replace single quotes around string values with double quotes
            // 4. Remove the trailing comma at the end of the array
            .replace(/,\s*$/, '')
            .replace(/;\s*$/, '');

        // Only custom palette can be updated by user
        if (Palettes.activeName === "custom") {
            spriteTextarea.disabled = false;
            spriteTextarea.value += "\n\n";
            spriteTextarea.value += "// Use transparent as sample code to add whatever colors you need.\n";
            spriteTextarea.value += "// FYI: no intelisence, errors will prevent palette from displaying.\n";
        } else {
            spriteTextarea.disabled = true;
        }
    }
    static setPaletteSortBy(arg) {
        Palettes.setSortByOrder(arg);
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
            Palettes.setCustom(customPalette);
        } catch (error) {
            console.error("Error parsing the palette data:", error);
            Message.add(`Error parsing the palette data: ${error.message}`);
        }
    }

    // ------------------------------------------
    // Background image methods
    /** Image methods*/
    static loadCurrentFrameImage() {
        // Check if the current frame and its metadata exist
        if (
            this.jsonSprite.layers &&
            this.jsonSprite.layers[this.currentFrame] &&
            this.jsonSprite.layers[this.currentFrame].metadata &&
            this.jsonSprite.layers[this.currentFrame].metadata.spriteimage
        ) {
            const imageName = this.jsonSprite.layers[this.currentFrame].metadata.spriteimage;

            // Check if the image exists in the jsonSprite.images object
            if (this.jsonImages && this.jsonImages[imageName]) {
                // Create the image and set its source
                const img = new Image();
                img.src = this.jsonImages[imageName]; // Set the image source to the base64 data

                // Check if the image has been updated
                if (this.imageName !== imageName) {
                    this.imageName = imageName;
                    this.image = img; // Store the image for further use
                    this.image = img;
                    Message.add(`Image '${imageName}' successfully loaded.`);
                }

                // Set image position
                this.imageX = this.jsonSprite.layers[this.currentFrame].metadata.imageX;
                this.imageY = this.jsonSprite.layers[this.currentFrame].metadata.imageY;
            } else {
                // Handle case where image is not found
                Message.add(`Image '${imageName}' not found in this.jsonImages for the current frame: ${this.currentFrame}.`);
                this.imageName = null;
                this.image = null;
            }
        } else {
            // Handle case where metadata is missing
            this.imageName = null;
            this.image = null;
            // Message.add(`No spriteimage metadata found for the current frame: ${this.currentFrame}.`);
        }
    }
    static setImageX(imageX) {
        if (typeof imageX === 'number' && !isNaN(imageX)) {
            this.imageX = 0;
            this.moveImageHorizontal(imageX);
        } else {
            Message.add("imageX is not a valid number:", imageX);
        }
    }
    static moveImageHorizontal(moveFactor) {
        this.imageX += moveFactor;
        this.jsonSprite.layers[this.currentFrame].metadata.imageX = this.imageX;

        this.outputJsonData();
    }
    static setImageY(imageY) {
        if (typeof imageY === 'number' && !isNaN(imageY)) {
            this.imageY = 0;
            this.moveImageVertical(imageY);
        } else {
            Message.add("imageY is not a valid number:", imageY);
        }
    }
    static moveImageVertical(moveFactor) {
        this.imageY += moveFactor;
        this.jsonSprite.layers[this.currentFrame].metadata.imageY = this.imageY;

        this.outputJsonData();
    }

    // ------------------------------------------ 
    /** Image Scale called from HTML */
    static updateImageScale(value) {
        ImageScale.updateImageScale(value, this.jsonSprite, this.currentFrame);
        this.outputJsonData();
    }

    // ------------------------------------------
    /** Grid methods*/
    static showSpriteGridDimensions() {
        Message.add(` Grid Size ${this.gridCellWidth}x${this.gridCellHeight}`);
    }
    static setSpriteGridSize(spriteGridSize) {
        if (typeof spriteGridSize === 'number' && !isNaN(spriteGridSize)) {
            this.spriteGridSize = 0;

            this.updateSpriteGridSize(spriteGridSize);
        } else {
            Message.add("spriteGridSize is not a valid number:", spriteGridSize);
        }
    }
    static updateSpriteGridSize(spriteGridSize) {
        this.spriteGridSize += spriteGridSize;
        if (this.spriteGridSize < 4.0) {
            this.spriteGridSize = 4.0;
            Message.add(`Min grid scall reached: ${this.spriteGridSize}`)
        }
        if (this.spriteGridSize > 80.0) {
            this.spriteGridSize = 80.0;
            Message.add(`Max grid scall reached: ${this.spriteGridSize}`)
        }
        this.jsonSprite.metadata.spriteGridSize = parseFloat(this.spriteGridSize.toFixed(1));
        this.outputJsonData();

    }
    static spriteAddRow() {
        // Ensure we don't exceed the maximum grid height
        if (this.gridCellHeight < this.maxGrid) {
            this.gridCellHeight++;

            // Iterate over all layers
            this.jsonSprite.layers.forEach((layer) => {
                const layerData = layer.data;

                // Add a new row to the bottom of the layer's data
                const newRow = Palettes.errorResult.symbol.repeat(layerData[0].length); // Create a row of 0s with the correct width
                layerData.push(newRow);
            });

            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            Message.add(`Cannot add row, gridCellHeight is already ${this.maxGrid}.`);
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
            this.jsonSprite.layers.forEach((layer) => {
                const layerData = layer.data;

                // Add a new column to the right of each row
                layer.data = layerData.map(row => row + Palettes.errorResult.symbol);
            });

            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            Message.add(`Cannot add column, gridCellWidth is already ${this.maxGrid}.`);
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
            this.jsonSprite.layers.forEach((layer) => {
                const layerData = layer.data;

                // Remove the last character (column) from each row
                layer.data = layerData.map(row => row.slice(0, -1));
            });

            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            Message.add("Cannot delete column, gridCellWidth is already at the minimum (1).");
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
            this.jsonSprite.layers.forEach((layer) => {
                const layerData = layer.data;

                // Remove the last row from the layer's data
                if (layerData.length > 0) {
                    layerData.pop();
                }
            });

            // Save the updated sprite data
            this.saveModifiedSprite();
        } else {
            Message.add(`Cannot delete row, gridCellHeight is already at the minimum value of 1.`);
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
            Message.add("spriteGridSize is not a valid number:", spritePixelSize);
        }
    }
    static updateSpritePixelSize(spritePixelSize) {
        this.spritePixelSize += spritePixelSize;
        if (this.spritePixelSize < 1.0) {
            this.spritePixelSize = 1.0;
            Message.add(`Min sprite pixel size reached: ${this.spritePixelSize}`)
        }
        if (this.spritePixelSize > 10.0) {
            this.spritePixelSize = 10.0;
            Message.add(`Max sprite pixel size reached: ${this.spritePixelSize}`)
        }
        this.jsonSprite.metadata.spritePixelSize = parseFloat(this.spritePixelSize.toFixed(2));

        this.outputJsonData();
    }
    static setFrameCount(framesPerSprite) {
        if (typeof framesPerSprite === 'string' && /^\d+$/.test(framesPerSprite)) {
            const num = Number(framesPerSprite);
            if (num < 0) {
                num = 0;
                Message.add(`Min FrameCount reached: ${num}`)
            }
            if (num > 60.0) {
                num = 60.0;
                Message.add(`Max FrameCount reached: ${num}`)
            }
            this.framesPerSprite = framesPerSprite;
            this.jsonSprite.metadata.framesPerSprite = this.framesPerSprite;
        } else {
            Message.add("framesPerSprite is not a valid string of numbers :", num);
        }
        this.outputJsonData();
    }

    // ------------------------------------------
    /** Draw methods*/
    static drawAll() {
        // Clear the canvas and set background color to #333333
        this.ctxEditor.clearRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);
        this.ctxEditor.fillStyle = '#333333';
        this.ctxEditor.fillRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);

        if (!(this.isAnimationActive) && this.imageName && this.image) {
            this.ctxEditor.save();
            this.ctxEditor.scale(ImageScale.value, ImageScale.value);
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
                const result = Palettes.getBySymbol(this.spriteIndex[x][y]);
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
                const result = Palettes.getBySymbol(this.spriteIndex[x][y]);

                if (Colors.isTransparent(result.hex)) {
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
        let sortedPalette = Palettes.sortColors();

        // Get Selected Color by Index
        const result = sortedPalette[this.selectedColorIndex];

        if (!result || !result.hex) {
            Functions.showStackTrace();
        }

        const rgb = Colors.hexToRgb(result.hex);
        const hsl = Colors.rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Display selected color details
        const selectedColorInfo = document.getElementById("selectedColorInfo");
        selectedColorInfo.innerHTML = `<h3>Selected Color Info</h3>` +
            `Palette:  ${Palettes.activeName} <br>` +
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
        let sortedPalette = Palettes.sortColors();

        // Draw the sorted palette
        for (let index = 0; index < sortedPalette.length; index++) {
            const result = sortedPalette[index];
            let div = index % this.paletteAcrossCnt;
            let mod = Math.floor(index / this.paletteAcrossCnt);
            const newX = div * this.paletteSize + this.paletteSpacing / 2;
            const newY = mod * this.paletteSize + this.paletteSpacing / 2;

            if (Colors.isTransparent(result.hex)) {
                this.drawTransparentX(newX, newY, this.spriteGridSize * this.paletteScale);
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
            Message.add("Container with id 'setCurrentFrameLayer' not found!");
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
            Message.add(`'animationDropdown' not found.`);
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
    static resetAnimationFrame() {
        const dropdown = document.getElementById("animationDropdown");

        if (dropdown) {
            this.isAnimationActive = false;
            dropdown.value = "0";// "Stop"
            // Trigger the change event manually if needed
            const event = new Event('change');
            dropdown.dispatchEvent(event);
        }
    }
    /** Animation methods*/
    static handleCanvasImageClick() { // Using SpriteEditor because it's called from a listener
        const dropdown = document.getElementById("animationDropdown");

        if (dropdown) {
            if (SpriteEditor.isAnimationActive) {
                dropdown.value = "0"; //"Stop"
            } else {
                dropdown.value = SpriteEditor.lastAnimationDD;
            }
            // Trigger the change event manually if needed
            const event = new Event('change');
            dropdown.dispatchEvent(event);
        }
    }

    static lastAnimationDD = "10";  // set default
    static isAnimationActive = false;
    static animationFrameRate = 0;
    static animationFrameRateCount = 0;
    static setAnimationFrameRate(animationFrameRate) {
        this.animationFrameRate = animationFrameRate;
        if (this.animationFrameRate > 0) {
            this.isAnimationActive = true;
            this.lastAnimationDD = animationFrameRate;
            this.setFrameCount(this.lastAnimationDD);

        } else {
            this.isAnimationActive = false;
        }
    }
    static animateSpriteImage() {
        // Exit if no animation is needed
        // Convert animationFrameRate to a number and check if it equals 0
        const animationFrameRate = Number(this.animationFrameRate);
        if (!animationFrameRate || animationFrameRate <= 0) {
            return;
        }

        // Increment frame rate counter
        this.animationFrameRateCount++;

        // Check if it's time to advance to the next frame
        if (this.animationFrameRateCount >= this.animationFrameRate) {
            this.animationFrameRateCount = 0; // Reset counter
            this.nextCurrentFrameLayer(); // Move to the next frame
        }
    }

    // ------------------------------------------
    /** Current Frame Layer */
    static setCurrentFrameLayer(currentFrame) {
        if (
            this.jsonSprite.layers &&
            currentFrame >= 0 &&
            currentFrame < this.jsonSprite.layers.length
        ) {
            this.currentFrame = currentFrame;
            //Message.add(`Current Layer frame at index: ${this.currentFrame}`);
        } else {
            Message.add(`Invalid currentFrame or layers data: ${currentFrame}`);
        }

        this.loadSpriteFromJSON();

        this.generateFrameLayerButtons();

        this.loadCurrentFrameImage();
    }
    static prevCurrentFrameLayer() {
        if (this.currentFrame === 0) {
            this.setCurrentFrameLayer(this.jsonSprite.layers.length - 1);
        } else {
            this.setCurrentFrameLayer(--this.currentFrame);
        }
    }
    static nextCurrentFrameLayer() {
        if (this.currentFrame === this.jsonSprite.layers.length - 1) {
            this.setCurrentFrameLayer(0);
        } else {
            this.setCurrentFrameLayer(++this.currentFrame);
        }
    }

    // ------------------------------------------
    /** JSON methods */
    static outputJsonData() {
        // Locate the textarea in the document
        const textArea = document.getElementById("spriteID");

        // Convert the JSON object into a formatted string
        const jsonString = JSON.stringify(this.jsonSprite, null, 2); // Indent with 2 spaces

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
            Message.add("The required 'firstLayerData' does not exist.");
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
        let originalLayer = this.jsonSprite.layers[this.currentFrame];
        let tempLayer = JSON.parse(JSON.stringify(originalLayer));

        tempLayer.metadata.imageX = layerIndex;
        tempLayer.metadata.imageY = this.currentFrame;

        this.jsonSprite.layers.splice(this.currentFrame, 0, tempLayer);

        this.currentFrame += layerIndex;

        Message.add(`Layer added at: ${this.currentFrame}`);
        this.setCurrentFrameLayer(this.currentFrame);

        this.outputJsonData();
    }
    static subLayer() {
        // Prevent removal if there's only one layer remaining
        if (this.jsonSprite.layers.length <= 1) {
            Message.add("Cannot remove the last remaining layer.");
            return;
        }

        if (this.currentFrame >= 0 && this.currentFrame < this.jsonSprite.layers.length) {
            this.jsonSprite.layers.splice(this.currentFrame, 1);

            let currentFrame = this.currentFrame;
            if (this.currentFrame > this.jsonSprite.layers.length - 1) {
                this.currentFrame = this.jsonSprite.layers.length - 1;
            }
            Message.add(`Layer removed at index: ${currentFrame}`);
            this.setCurrentFrameLayer(this.currentFrame);

            this.outputJsonData();
        } else {
            Message.add(`Invalid layer index: ${currentFrame} ${this.currentFrame}`);
        }
    }
    static setPaletteDropDown(value = "default") {
        const dropdown = document.getElementById("paletteDropdown");
        if (dropdown) {
            dropdown.value = value; //

            // Trigger the change event manually if needed
            const event = new Event('change');
            dropdown.dispatchEvent(event);
        }
    }
    static setStaticVarsFromJson() {
        // Access metadata.sprite
        //this.selectPalette(this.jsonSprite.metadata.palette);
        this.setPaletteDropDown(this.jsonSprite.metadata.palette);
        this.setSpritePixelSize(this.jsonSprite.metadata.spritePixelSize);
        this.setSpriteGridSize(this.jsonSprite.metadata.spriteGridSize);

        this.framesPerSprite = this.jsonSprite.metadata.framesPerSprite || "10";
        this.lastAnimationDD = this.framesPerSprite;

        if (false) {
            console.log('Sprite:', sprite);
            console.log('Sprite Grid Size:', this.spriteGridSize);
            console.log('Sprite Pixel Size:', this.spritePixelSize);
            console.log('Palette:', Palettes.activeName);

        }
        // Access metadata.layer frames
        this.setImageX(this.jsonSprite.layers[this.currentFrame].metadata.imageX);
        this.setImageY(this.jsonSprite.layers[this.currentFrame].metadata.imageY);

        const imageScale = this.jsonSprite.layers[this.currentFrame].metadata.imageScale;
        ImageScale.setImageScale(imageScale, this.jsonSprite, this.currentFrame);
        this.outputJsonData();

        this.loadCurrentFrameImage();
        if (false) {
            console.log('ImageX:', this.imageX);
            console.log('ImageY:', this.imageY);
            console.log('ImageScale:', ImageScale.value);
        }
    }
    static loadSpriteFromTextarea() {
        const textarea = document.getElementById('spriteID');
        const jsonString = textarea.value;

        try {
            // Parse the JSON string into an object
            const parsedData = JSON.parse(jsonString);
            // Assign the parsed data to this.jsonSprite
            if (typeof SpriteEditor !== 'undefined') {
                this.jsonSprite = parsedData;
                this.setStaticVarsFromJson();
                this.generateFrameLayerButtons();
                this.loadSpriteFromJSON();
            } else {
                Message.add('SpriteEditor is not defined.')
            }
        } catch (error) {
            Message.add(`Invalid spriteID JSON format: ${error} \n`);
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
            // Assign the parsed data to this.jsonSprite
            if (typeof SpriteEditor !== 'undefined') {
                this.jsonImages = parsedData;
                this.loadCurrentFrameImage();
            } else {
                Message.add('imageID is not defined.')
            }
        } catch (error) {
            Message.add(`Invalid imageID JSON format: ${error} \n `);
        }
    }

    static saveModifiedSprite() {

        // Assuming spriteIndex is a 2D array with gridX and gridY dimensions
        const updatedData = [];

        // Iterate over each row (height) and each column (width)
        for (let x = 0; x < this.gridCellHeight; x++) {
            let row = '';
            for (let y = 0; y < this.gridCellWidth; y++) {
                row += this.spriteIndex[y][x] || Palettes.transparent; // 'Ø' as a fallback for missing data
            }
            updatedData.push(row);
        }

        // Update the JSON data's first layer
        if (this.jsonSprite.layers && this.jsonSprite.layers[this.currentFrame]) {
            this.jsonSprite.layers[this.currentFrame].data = updatedData;
        }

    }

    static copyJSON() {
        const camelCasePalete = Functions.toCamelCase(this.jsonSprite.metadata.sprite, "palette");
        const camelCaseSprite = Functions.toCamelCase(this.jsonSprite.metadata.sprite, "sprite");
        const camelCaseImage = Functions.toCamelCase(this.jsonSprite.metadata.sprite, "image");

        // Get the textarea element
        const textarea = document.getElementById("spriteID");

        // Check if the textarea exists and has content
        if (textarea && textarea.value) {
            // Prepare JSON strings
            const jsonImagesString = JSON.stringify(this.jsonImages, null, 2);

            let jsonPaletteString = "";

            if (Palettes.activeName === "custom") {
                jsonPaletteString = "static " + camelCasePalete + " = {\ncustom: " +
                    JSON.stringify(Palettes.get(), null, 0)
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
                        Message.add("JSON copied to clipboard!");
                    })
                    .catch((error) => {
                        Message.add("An error occurred while copying JSON.");
                        console.error("Error copying JSON to clipboard:", error);
                    });
            } else {
                // Fallback for older browsers using execCommand
                console.warn("Clipboard API not supported. Falling back to execCommand.");
                Message.add("Clipboard API not supported. Falling back to execCommand.");

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
                        Message.add("JSON copied to clipboard!");
                    } else {
                        Message.add("Failed to copy JSON.");
                    }
                } catch (err) {
                    console.error("Error copying JSON using execCommand:", err);
                    Message.add("An error occurred while copying JSON.");
                } finally {
                    // Clean up
                    document.body.removeChild(tempTextarea);
                }
            }
        } else {
            Message.add("No JSON data to copy!");
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
        if (mouse.mouseX > (this.spriteGridSize * this.paletteAcrossCnt) * this.paletteScale) {
            // Determine which sprite cell clicked
            this.selectedCellX = Math.floor((mouse.mouseX - this.gridX) / this.spriteGridSize);
            this.selectedCellY = Math.floor((mouse.mouseY - this.gridY) / this.spriteGridSize);

            if (this.selectedCellX < 0 || this.selectedCellX > this.gridCellWidth - 1 ||
                this.selectedCellY < 0 || this.selectedCellY > this.gridCellHeight - 1) {
                return;
            }

            // Get the sorted palette colors from SpritePalettes
            let sortedPalette = Palettes.sortColors();

            // Set the array elements
            let result = sortedPalette[this.selectedColorIndex];
            this.spriteIndex[this.selectedCellX][this.selectedCellY] = result.symbol;

            this.saveModifiedSprite();

            this.outputJsonData();


        } else {
            // Determine which palette color was clicked
            const clickedPaletteX = Math.floor(mouse.mouseX / this.paletteSize);
            const clickedPaletteY = Math.floor(mouse.mouseY / this.paletteSize);
            const clickedPaletteIndex = clickedPaletteX + clickedPaletteY * this.paletteAcrossCnt;

            if (clickedPaletteIndex > Palettes.getLength() - 1) {
                return; // don't allow invalid color index
            }

            this.selectedColorIndex = clickedPaletteIndex;
            this.paletteSelectedX = clickedPaletteX;
            this.paletteSelectedY = clickedPaletteY;
        }
    }
    static handleCanvasRightClick(mouse) {

        if (mouse.mouseX > (this.spriteGridSize * this.paletteAcrossCnt) * this.paletteScale) {
            // Determine which sprite cell clicked
            this.selectedCellX = Math.floor((mouse.mouseX - this.gridX) / this.spriteGridSize);
            this.selectedCellY = Math.floor((mouse.mouseY - this.gridY) / this.spriteGridSize);

            if (this.selectedCellX < 0 || this.selectedCellX > this.gridCellWidth - 1 ||
                this.selectedCellY < 0 || this.selectedCellY > this.gridCellHeight - 1) {
                return;
            }

            // Get the sorted palette colors from SpritePalettes
            let symbolToFind = this.spriteIndex[this.selectedCellX][this.selectedCellY];

            let sortedPalette = Palettes.sortColors();
            const index = sortedPalette.findIndex(entry => entry.symbol === symbolToFind);

            if (index !== -1) {
                this.selectedColorIndex = index;
                this.paletteSelectedX = index % 5;
                this.paletteSelectedY = Math.floor(index / 5);
            }

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
// --------------------------------------------------------------------------
// Non Class supporting methods
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// JavaScript to handle dropdown selection and call Palettes.setPalette
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
            const animationFrameRate = event.target.value;
            if (typeof SpriteEditor !== 'undefined' && typeof SpriteEditor.selectPalette === 'function') {
                SpriteEditor.setAnimationFrameRate(animationFrameRate);
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
                SpriteEditor.add("Failed to update current frame(s) image.");
            }

            SpriteEditor.add(`Image loaded and set: '${SpriteEditor.imageName}'`);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file); // Read the file as a Data URL
});

// --------------------------------------------------------------------------
// Add event listener for palette (change in json text content)
const textareaPalette = document.getElementById('paletteID');
textareaPalette.addEventListener('input', (event) => {
    Message.add(`Palette JSON data changed.`);
    SpriteEditor.loadPaletteFromTextarea();
});

// --------------------------------------------------------------------------
// Add event listener for input (change in json text content)
const textareaSprite = document.getElementById('spriteID');
textareaSprite.addEventListener('input', (event) => {
    Message.add(`Sprite JSON data changed.`);
    SpriteEditor.loadSpriteFromTextarea();
});

// --------------------------------------------------------------------------
// Add event listener for images (change in json text content)
const textareaImages = document.getElementById('imageID');
textareaImages.addEventListener('input', (event) => {
    Message.add(`Image JSON data changed.`);
    SpriteEditor.loadImageFromTextarea();
});
