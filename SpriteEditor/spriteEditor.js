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
    static paletteSortOrder = "hue"; // hue, saturation, lightness
    static paletteAcrossCnt = 5;
    static paletteDownCnt = 36;
    static paletteSize = 30;

    static paletteSelectedX = 0;
    static paletteSelectedY = 0;
    static paletteScale = this.paletteSize / this.spriteSize;

    static paletteSpacing = 10;

    // Palette to load
    static paletteName = null;

    //-------------------------------------------
    // Grid information
    static maxGrid = 32;
    static gridCellWidth = this.maxGrid;
    static gridCellHeight = this.maxGrid;
    static spriteIndex = new Array(this.gridCellWidth);

    static gridX = this.paletteSize * (this.paletteAcrossCnt + 1) + this.paletteSize / 4;
    static gridY = this.paletteSize;

    static selectedColor = SpritePalettes.transparentColor;
    static selectedColorIndex = 0;
    static selectedCellX = 0;
    static selectedCellY = 0;

    //-------------------------------------------
    // Define the width, height, and Image of the sprite
    static spritePixelSize = 5;
    static spriteImageSize = this.maxGrid * this.spritePixelSize + 4;
    static spriteSize = 50;

    //-------------------------------------------
    // Grid Image
    static imageName = './8bit tiles.jpg';
    static image = null;
    static imageX = this.gridX;
    static imageY = this.gridY;
    static imageScale = 1.0; // Zoom factor

    //-------------------------------------------
    static mouse = null;

    // TODO: Need to figure out multi frames for animation

    static initialize() {

        this.initializeArrays();

        this.initializeCanvasEditor();
        this.initializeCanvasImage();

        // Setup our mouse
        SpriteEditor.mouse = new MouseInput(this.canvasEditor);

        // set paletteName to load
        SpriteEditor.paletteName = "default";
        SpritePalettes.setPalette(SpriteEditor.paletteName);
        this.showPalette();
        this.loadSprite();

        // load background image
        this.image = new Image();
        this.image.src = SpriteEditor.imageName;

        // image loading errors:
        this.image.onerror = (error) => {
            console.error("Failed to load image:", error);
        };
    }

    static initializeCanvasEditor() {
        // Get the canvas element
        this.canvasEditor = document.getElementById("spriteEditor");

        if (!this.canvasEditor) {
            console.error("Canvas element with id 'spriteEditor' not found.");
            return;
        }

        // Set the canvas dimensions
        this.canvasEditor.width = 1024; // 2075;
        this.canvasEditor.height = 1200;

        // Create a new CanvasRenderingContext2D object
        this.ctxEditor = this.canvasEditor.getContext("2d");

        console.debug("Canvas Editor initialized with dimensions:", this.canvasEditor.width, "x", this.canvasEditor.height, ".");
    }

    static initializeCanvasImage() {
        // SpriteImage
        this.canvasImage = document.getElementById("spriteImage");

        if (!this.canvasImage) {
            console.error("Canvas element with id 'spriteEditor' not found.");
            return;
        }

        // Set the canvas iamge dimensions
        this.canvasImage.width = this.spriteImageSize;
        this.canvasImage.height = this.spriteImageSize;

        // Create a new CanvasRenderingContext2D object
        this.ctxImage = this.canvasImage.getContext("2d");

        console.debug("Canvas Image initialized with dimensions:", this.canvasImage.width, "x", this.canvasImage.height, ".");
    }

    static initializeArrays() {
        for (let x = 0; x < this.maxGrid; x++) {
            this.spriteIndex[x] = new Array(this.maxGrid).fill('Ø');
        }
    }

    static showPalette() {
        const spriteTextarea = document.getElementById("paletteID");  // Ensure the textarea element exists

        if (!spriteTextarea) {
            console.error("Sprite textarea not found.");
            return;
        }

        spriteTextarea.value = "";
        spriteTextarea.value += `#  Sym  Hex      Name\n`;
        spriteTextarea.value += `-  ---  -------  --------\n`;
        spriteTextarea.value = SpritePalettes.getPaletteDetails();
    }

    static loadSprite() {
        const spriteTextarea = document.getElementById("spriteID");
        const spriteContent = spriteTextarea.value.trim();

        const lines = spriteContent.split("\n").map(line => line.trim());

        const rows = [];
        const metadata = {};

        for (const line of lines) {
            if (line.startsWith("// meta:")) {
                // Extract metadata by splitting on the first colon
                const [key, value] = line.slice(8).split(/:(.+)/).map(part => part.trim());
                metadata[key] = value;
            } else if (line.startsWith('"')) {
                // It's a sprite row, remove quotes and store it
                rows.push(line.replace(/"/g, ""));
            }
        }

        this.imageName = metadata['imageName'];
        if (this.imageName === undefined) {
            throw new Error(`imageName not found:${this.imageName} in meta:`);
        }

        this.imageScale = Number(metadata['imageS']);
        this.imageX = Number(metadata['imageX']);
        this.imageY = Number(metadata['imageY']);

        this.paletteName = metadata['palette'];

        this.spriteSize = Number(metadata['spriteS']);

        this.paletteScale = (this.paletteSize / this.spriteSize)

        // // Set grid dimensions based on the parsed rows
        this.gridCellHeight = rows.length;
        this.gridCellWidth = rows[0]?.length - 1 || 0;

        for (let y = 0; y < this.gridCellHeight; y++) {
            const row = rows[y];
            for (let x = 0; x < this.gridCellWidth; x++) {
                // Get letter/symbol
                const letter = row[x];

                // Update spriteIndex
                if (letter === undefined) {
                    this.spriteIndex[x][y] = SpritePalettes.errorResult.symbol;
                } else {
                    this.spriteIndex[x][y] = letter;
                }
            }
        }
    }

    static moveImageHorizontal(moveFactor) {
        this.imageX += moveFactor;
    }
    static moveImageVertical(moveFactor) {
        this.imageY += moveFactor;
    }
    static zoomImage(zoomFactor) {
        this.imageScale += zoomFactor;
        if (this.imageScale >= 5.0) {
            this.imageScale = 5.0;
        } else if (this.imageScale <= 0.3) {
            this.imageScale = 0.3;
        }
    }

    static zoomGrid(zoomFactor) {
        this.spriteSize += zoomFactor;
    }

    static spriteAddRow() {
        if (this.gridCellHeight < this.maxGrid) {
            this.gridCellHeight++;
        } else {
            console.error(`Cannot add row, gridCellHeight is already ${this.maxGrid}.`);
        }
    }
    static spriteAddColumn() {
        if (this.gridCellWidth < this.maxGrid) {
            this.gridCellWidth++;
        } else {
            console.error(`Cannot add column, gridCellWidth is already ${this.maxGrid}.`);
        }
    }
    static spriteDelColumn() {
        if (this.gridCellWidth > 1) {
            this.gridCellWidth--;
        } else {
            console.error("Cannot remove column, gridCellWidth is already 1.");
        }
    }
    static spriteDelRow() {
        if (this.gridCellHeight > 1) {
            this.gridCellHeight--;
        } else {
            console.error("Cannot remove row, gridCellHeight is already 1.");
        }
    }

    static setSortBy(arg) {
        this.paletteSortOrder = arg;
    }

    static drawAll() {
        // Clear the canvas and set background color to #333333
        this.ctxEditor.clearRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);
        this.ctxEditor.fillStyle = '#333333';
        this.ctxEditor.fillRect(0, 0, this.canvasEditor.width, this.canvasEditor.height);

        this.ctxEditor.save();
        this.ctxEditor.scale(this.imageScale, this.imageScale);
        this.ctxEditor.drawImage(this.image, this.imageX, this.imageY);
        this.ctxEditor.restore();

        this.drawGrid();
        this.drawPalette();
        this.drawSelectedColor();
        this.drawSpriteImage();
        this.outputSprite();
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
            this.ctxEditor.moveTo(x * this.spriteSize + this.gridX, this.gridY);
            this.ctxEditor.lineTo(x * this.spriteSize + this.gridX, this.spriteSize * this.gridCellHeight + this.gridY);
            this.ctxEditor.stroke();
        }

        // Lines on Y
        for (var y = 0; y < this.gridCellHeight + 1; y++) {
            this.ctxEditor.beginPath();
            this.ctxEditor.moveTo(this.gridX, y * this.spriteSize + this.gridY);
            this.ctxEditor.lineTo(this.spriteSize * this.gridCellWidth + this.gridX, y * this.spriteSize + this.gridY);
            this.ctxEditor.stroke();
        }

        // draw sprite array colors on grid
        for (var x = 0; x < this.gridCellWidth; x++) {
            for (var y = 0; y < this.gridCellHeight; y++) {
                const result = SpritePalettes.getBySymbol(this.spriteIndex[x][y]);

                if (result.hex === SpritePalettes.transparentColor) {
                    const gridCellPosX = this.gridX + (this.spriteSize * x) + this.spriteSize / 4;
                    const gridCellPosY = this.gridY + (this.spriteSize * y) + this.spriteSize / 4;

                    this.drawTransparentX(gridCellPosX, gridCellPosY, this.spriteSize / 2);
                } else {
                    this.drawColor(x, y, result.hex);
                }
            }
        }
    }
    static drawColor(x, y, color) {
        // Draw a circle on the selected sprite
        this.ctxEditor.beginPath();
        this.ctxEditor.arc((this.spriteSize * x) + this.gridX + this.spriteSize / 2,
            (this.spriteSize * y) + this.gridY + this.spriteSize / 2,
            this.spriteSize / 3, 0, 2 * Math.PI);
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
        let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPallet(), SpriteEditor.paletteSortOrder);

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
        this.paletteScale = (this.paletteSize / this.spriteSize);

        // Clear location
        this.ctxEditor.clearRect(0, 0, this.spriteSize * this.paletteAcrossCnt * this.paletteScale + this.paletteSpacing, this.canvasEditor.height); // Clear the canvasEditor
        this.ctxEditor.fillStyle = 'black';
        this.ctxEditor.fillRect(0, 0, this.spriteSize * this.paletteAcrossCnt * this.paletteScale + this.paletteSpacing, this.canvasEditor.height); // Fill the entire canvasEditor

        // Get the sorted palette colors from SpritePalettes
        let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPallet(), SpriteEditor.paletteSortOrder);

        // Draw the sorted palette
        for (let index = 0; index < sortedPalette.length; index++) {
            const result = sortedPalette[index];
            let div = index % this.paletteAcrossCnt;
            let mod = Math.floor(index / this.paletteAcrossCnt);
            const newX = div * this.paletteSize + this.paletteSpacing / 2;
            const newY = mod * this.paletteSize + this.paletteSpacing / 2;

            if (result.hex === SpritePalettes.transparentColor) {
                SpriteEditor.drawTransparentX(newX, newY, this.spriteSize * this.paletteScale);
            } else {
                this.ctxEditor.fillStyle = result.hex;
                this.ctxEditor.fillRect(newX, newY, this.spriteSize * this.paletteScale - this.paletteSpacing / 2, this.spriteSize * this.paletteScale - this.paletteSpacing / 2);
            }
        }
    }

    static outputSprite() {
        // Format textArea sprite
        let textArea = "[\n";

        textArea += `// meta:imageName:${this.imageName}\n`;
        textArea += `// meta:imageX:${this.imageX}\n`;
        textArea += `// meta:imageY:${this.imageY}\n`;
        textArea += `// meta:imageS:${this.imageScale.toFixed(2)}\n`;

        textArea += `// meta:palette:${this.paletteName}\n`;

        textArea += `// meta:spriteS:${this.spriteSize.toFixed(1)}\n`;

        for (let x = 0; x < this.gridCellHeight; x++) {
            let line = "";

            for (let y = 0; y < this.gridCellWidth; y++) {

                const letterIndex = this.spriteIndex[y][x];
                line += letterIndex;
            }

            // Add a comma for all lines except the last one
            textArea += '"' + line + '"' + (x < this.gridCellHeight - 1 ? ',\n' : '\n');
        }
        textArea += ']';

        // Place textArea in spriteTextarea
        const spriteTextarea = document.getElementById("spriteID");
        spriteTextarea.value = textArea;
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
        if (mouse.mouseX > (SpriteEditor.spriteSize * SpriteEditor.paletteAcrossCnt) * SpriteEditor.paletteScale) {
            // Determine which sprite cell clicked
            SpriteEditor.selectedCellX = Math.floor((mouse.mouseX - SpriteEditor.gridX) / SpriteEditor.spriteSize);
            SpriteEditor.selectedCellY = Math.floor((mouse.mouseY - SpriteEditor.gridY) / SpriteEditor.spriteSize);

            if (SpriteEditor.selectedCellX < 0 || SpriteEditor.selectedCellX > SpriteEditor.gridCellWidth - 1 ||
                SpriteEditor.selectedCellY < 0 || SpriteEditor.selectedCellY > SpriteEditor.gridCellHeight - 1) {
                return;
            }

            // Get the sorted palette colors from SpritePalettes
            let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPallet(), SpriteEditor.paletteSortOrder);

            // Set the array elements
            let result = sortedPalette[SpriteEditor.selectedColorIndex];
            SpriteEditor.spriteIndex[SpriteEditor.selectedCellX][SpriteEditor.selectedCellY] = result.symbol;
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

        if (mouse.mouseX > (SpriteEditor.spriteSize * SpriteEditor.paletteAcrossCnt) * SpriteEditor.paletteScale) {
            // Determine which sprite cell clicked
            SpriteEditor.selectedCellX = Math.floor((mouse.mouseX - SpriteEditor.gridX) / SpriteEditor.spriteSize);
            SpriteEditor.selectedCellY = Math.floor((mouse.mouseY - SpriteEditor.gridY) / SpriteEditor.spriteSize);

            if (SpriteEditor.selectedCellX < 0 || SpriteEditor.selectedCellX > SpriteEditor.gridCellWidth - 1 ||
                SpriteEditor.selectedCellY < 0 || SpriteEditor.selectedCellY > SpriteEditor.gridCellHeight - 1) {
                return;
            }

            // Get the sorted palette colors from SpritePalettes
            let symbolToFind = SpriteEditor.spriteIndex[SpriteEditor.selectedCellX][SpriteEditor.selectedCellY];

            let sortedPalette = SpritePalettes.sortColors(SpritePalettes.getPallet(), SpriteEditor.paletteSortOrder);
            const index = sortedPalette.findIndex(entry => entry.symbol === symbolToFind);

            if (index !== -1) {
                SpriteEditor.selectedColorIndex = index;
                SpriteEditor.paletteSelectedX = index % 5;
                SpriteEditor.paletteSelectedY = Math.floor(index / 5);
            }

        }
    }

    static gameUpdate() {
        SpriteEditor.mouse.update();

        if (SpriteEditor.mouse.isButtonJustPressed(0)) {
            SpriteEditor.handleCanvasLeftClick(SpriteEditor.mouse);
        }

        if (SpriteEditor.mouse.isButtonJustPressed(2)) {
            SpriteEditor.handleCanvasRightClick(SpriteEditor.mouse);
        }

        SpriteEditor.drawAll();
    }

    // Start the game loop
    static gameLoop() {
        SpriteEditor.gameUpdate();
        requestAnimationFrame(SpriteEditor.gameLoop);
    }

}

window.onload = () => {
    // Call initialize after canvasEditor is assigned
    SpriteEditor.initialize();

    // Start gameLoop
    SpriteEditor.gameLoop();
};
