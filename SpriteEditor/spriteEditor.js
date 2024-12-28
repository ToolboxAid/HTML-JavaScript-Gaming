//
//
//
//

import SpritePallets from "../scripts/spritePallets.js";

window.onload = () => {
    SpriteEditor.initialize();
};


//-------------------------------------------
export class SpriteEditor {

    // Canvas Editor
    static canvasEditor = null;
    static ctxEditor = null;

    // Canvas Image
    static canvasImage = null;
    static ctxImage = null;


    //-------------------------------------------
    // Define the pallet
    static transparentColor = "#00000000";
    static palletAcrossCnt = 5;
    static palletDownCnt = 36;
    static palletSize = 30;

    //-------------------------------------------
    // Grid information
    static maxGrid = 32;
    static gridCellWidth = this.maxGrid;
    static gridCellHeight = this.maxGrid;
    static spriteIndex = new Array(this.gridCellWidth);
    static spriteColor = new Array(this.gridCellWidth);

    //-------------------------------------------

    static gridX = this.palletSize * (this.palletAcrossCnt + 1) + this.palletSize / 4;
    static gridY = this.palletSize;

    static selectedColor = this.transparentColor;
    static selectedColorIndex = 0;
    static selectedCellX = 0;
    static selectedCellY = 0;

    //-------------------------------------------
    // Define the width, height, and Image of the sprite
    static imageSize = 5;
    static spriteImageSize = this.maxGrid * this.imageSize + 4;
    static spriteSize = 50

    static image = null;
    static imageX = this.gridX;
    static imageY = this.gridY;

    //-------------------------------------------
    // Pallet information
    static palletSelectedX = 0;
    static palletSelectedY = 0;
    static palletScale = (this.palletSize / this.spriteSize);

    static palletSpacing = 10;

    static initialize() {
        this.initializeArrays();

        this.initializeCanvasEditor();
        this.initializeCanvasImage();

        // Add event listener to the canvas
        if (this.canvasEditor) {
            this.canvasEditor.addEventListener("click", this.handleCanvasClick);
        } else {
            console.error("Canvas 'SpriteEditor' not found!");
        }

        // 
        this.loadPallet();
        this.loadSprite();

        // load background image
        this.image = new Image();
        this.image.src = './8bit tiles.jpg';

        this.drawAll();
    }

    //-------------------------------------------
    static initializeCanvasEditor() {
        // Get the canvas element
        this.canvasEditor = document.getElementById("spriteEditor");

        if (!this.canvasEditor) {
            console.error("Canvas element with id 'spriteEditor' not found.");
            return;
        }

        // Set the canvas dimensions
        this.canvasEditor.width = 1600;
        this.canvasEditor.height = 1200;

        // Create a new CanvasRenderingContext2D object
        this.ctxEditor = this.canvasEditor.getContext("2d");

        console.log("Canvas Editor initialized with dimensions:", this.canvasEditor.width, "x", this.canvasEditor.height, ".");
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

        console.log("Canvas Image initialized with dimensions:", this.canvasImage.width, "x", this.canvasImage.height, ".");
    }

    static initializeArrays() {
        for (let x = 0; x < this.maxGrid; x++) {
            this.spriteIndex[x] = new Array(this.maxGrid).fill('0');
            this.spriteColor[x] = new Array(this.maxGrid).fill(this.transparentColor);
        }
    }

    static scaleFactor = 1.0; // Zoom factor

    static palletLetters = [];
    static palletColors = [];
    static palletNames = [];

    static spritePalletMap = null;

    static loadPallet() {

        // // Example usage:
        // console.log(SpritePallets.getByIndex('default', 1)); // { symbol: '"', hex: '#FFB6C1', name: 'LightPink' }
        // console.log(SpritePallets.getBySymbol('default', 'Ø')); // { symbol: '!', hex: '#FFC0CB', name: 'Pink' }
        // console.log(SpritePallets.getByHex('default', '#FF1493')); // { symbol: '$', hex: '#FF1493', name: 'DeepPink' }

        // console.log(SpritePallets.getByIndex('Crayola16', 5)); // { symbol: 'B', hex: '#FF8833', name: 'Orange' }
        // console.log(SpritePallets.getBySymbol('Crayola16', 'A')); // { symbol: 'A', hex: '#ED0A3F', name: 'Red' }
        // console.log(SpritePallets.getBySymbol('Crayola16', 'Ø')); // { symbol: 'A', hex: '#ED0A3F', name: 'Red' }
        // console.log(SpritePallets.getByHex('Crayola16', '#1F75FE')); // { symbol: 'E', hex: '#0066CC', name: 'Blue' }

        // SpritePallets.default.forEach((pallet, index) => {
        //     pallet.symbol = index.toString();
        // });

        // // Iterate over the spritePallets object (the 'default' property)
        // Object.entries(palette).forEach(([symbol, { hex, name }]) => {
        //     console.log(`Symbol: ${symbol}, Hex: ${hex}, Name: ${name}`);
        // });

        // // Check if the index is within bounds
        // let index = 20;
        // if (index >= 0 && index < entries.length) {
        //     const [symbol, { hex, name }] = entries[index];
        //     console.log(`Symbol: ${symbol}, Hex: ${hex}, Name: ${name}`);
        // } else {
        //     console.log("Index out of bounds");
        // }

        const palletID = document.getElementById('palletID');
        const palletText = palletID.value;

        // Remove comments and extra whitespace, then split by commas
        const cleanContent = palletText
            .replace(/\/\/.*/g, '')  // Remove comments
            .replace(/\s+/g, '')     // Remove extra spaces
            .trim();

        // Initialize arrays and Set to track duplicates
        this.palletLetters = [];
        this.palletColors = [];
        const letterSet = new Set();  // Set to check for duplicates

        // Match the key-value pairs (e.g., 'R': 'Red')
        //const regex = /'([^']+)'\s*:\s*'([^']+)'/g;
        const regex = /'([^']+)'\s*:\s*'([^']+)'\s*:\s*'([^']+)'/g;

        let match;

        // Parse the content and populate the arrays
        while ((match = regex.exec(cleanContent)) !== null) {
            const letter = match[1];
            const color = match[2];
            const name = match[3];

            // Check for duplicate letters
            if (letterSet.has(letter)) {
                throw new Error(`Duplicate letter found: ${letter},  ${color},  ${name}`);
            }

            letterSet.add(letter);
            this.palletLetters.push(letter);
            this.palletColors.push(color);
            this.palletNames.push(name);
        }
    }

    static loadSprite() {
        const spriteTextarea = document.getElementById("spriteID");
        const spriteContent = spriteTextarea.value.trim();

        // Parse rows from the input, removing brackets and splitting by commas
        const rows = spriteContent.replace(/[\[\]]/g, "").split(",").map(row => row.trim().replace(/"/g, ""));

        // Set grid dimensions based on the parsed rows
        this.gridCellHeight = rows.length;
        this.gridCellWidth = rows[0]?.length || 0;

        // Process each row and populate spriteIndex and spriteColor
        for (let y = 0; y < this.gridCellHeight; y++) {
            const row = rows[y];
            for (let x = 0; x < this.gridCellWidth; x++) {
                // Get letter/symbol
                const letter = row[x];

                // Update spriteIndex
                this.spriteIndex[x][y] = letter;

                // Update sprite color
                this.spriteColor[x][y] = SpritePallets.getBySymbol('default', letter).hex;
            }
        }

        //SpritePallets.dumpPallet();
                    // Iterate through the palette and display all details
                    const paletteName = "default";
                    const palette = SpritePallets[paletteName];
                    console.log(`Details of "${paletteName}" palette:`);
                    palette.forEach((pallet, index) => {
                        console.log(`Index: ${index}, Symbol: ${pallet.symbol}, Hex: ${pallet.hex}, Name: ${pallet.name}`);
                    });
    }

    static moveImageHorizontal(moveFactor) {
        this.imageX += moveFactor;
        this.drawAll();
    }
    static moveImageVertical(moveFactor) {
        this.imageY += moveFactor;
        this.drawAll();
    }

    static zoomImage(zoomFactor) {
        this.scaleFactor += zoomFactor;
        if (this.scaleFactor >= 5.0) {
            this.scaleFactor = 5.0;
        } else if (this.scaleFactor <= 0.3) {
            this.scaleFactor = 0.3;
        }
        this.drawAll();
    }

    static zoomGrid(zoomFactor) {
        this.spriteSize += zoomFactor;
        this.drawAll();
    }

    static spriteAddRow() {
        if (this.gridCellHeight < this.maxGrid) {
            this.gridCellHeight++;
            this.drawAll();
        } else {
            console.error("Cannot add row, gridCellHeight is already 32.");
        }
    }
    static spriteAddColumn() {
        if (this.gridCellWidth < this.maxGrid) {
            this.gridCellWidth++;
            this.drawAll();
        } else {
            console.error("Cannot add column, gridCellWidth is already 32.");
        }
    }
    static spriteDelColumn() {
        if (this.gridCellWidth > 1) {
            this.gridCellWidth--;
            this.drawAll();
        } else {
            console.error("Cannot remove column, gridCellWidth is already 0.");
        }
    }
    static spriteDelRow() {
        if (this.gridCellHeight > 1) {
            this.gridCellHeight--;
            this.drawAll();
        } else {
            console.error("Cannot remove row, gridCellHeight is already 0.");
        }
    }

    static drawAll() {
        // Clear the canvas and set background color to #333333
        this.ctxEditor.clearRect(0, 0, this.canvasEditor.width, this.canvasEditor.height); // Clear the canvasEditor
        this.ctxEditor.fillStyle = '#333333'; // Set background color to dark gray
        this.ctxEditor.fillRect(0, 0, this.canvasEditor.width, this.canvasEditor.height); // Fill the entire canvasEditor

        this.ctxEditor.save();
        this.ctxEditor.scale(this.scaleFactor, this.scaleFactor);
        this.ctxEditor.drawImage(this.image, this.imageX, this.imageY);
        this.ctxEditor.restore();

        this.drawGrid();
        this.drawPallet();
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
                const gridCellPosX = x * this.imageSize + offset;
                const gridCellPosY = y * this.imageSize + offset;

                this.ctxImage.fillStyle = this.spriteColor[x][y];
                this.ctxImage.fillRect(gridCellPosX, gridCellPosY, this.imageSize, this.imageSize);
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

        // Grid
        for (var x = 0; x < this.gridCellWidth; x++) {
            for (var y = 0; y < this.gridCellHeight; y++) {
                if (this.spriteColor[x][y] === undefined) {
                    this.spriteColor[x][y] = this.transparentColor;
                }
                if (this.spriteColor[x][y] === this.transparentColor) {
                    const gridCellPosX = this.gridX + (this.spriteSize * x) + this.spriteSize / 4;
                    const gridCellPosY = this.gridY + (this.spriteSize * y) + this.spriteSize / 4;

                    this.drawTransparentX(gridCellPosX, gridCellPosY, this.spriteSize / 2);
                } else {
                    this.drawColor(x, y, this.spriteColor[x][y]);
                    if (false) {
                        const gridCellPosX = gridX + (spriteSize * x) + spriteSize / 3;
                        const gridCellPosY = gridY + (spriteSize * y) + (spriteSize / 3) + 15;

                        // Set font properties
                        this.ctxEditor.font = '20px Arial';
                        this.ctxEditor.fillStyle = 'black';

                        // Draw filled text
                        this.ctxEditor.fillText(spriteIndex[x][y], gridCellPosX, gridCellPosY);

                        // Optional: Outline the text
                        this.ctxEditor.strokeStyle = 'white';
                        this.ctxEditor.strokeText(spriteIndex[x][y], gridCellPosX, gridCellPosY);
                    }
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
        const centerX = x + size / 2; // Center X-coordinate
        const centerY = y + size / 2; // Center Y-coordinate
        const radius = size / 3;      // Radius of the circle

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
        this.ctxEditor.strokeStyle = "white";
        this.ctxEditor.lineWidth = 4;
        this.ctxEditor.strokeRect(
            this.palletSelectedX * this.palletSize + this.palletSpacing / 4,
            this.palletSelectedY * this.palletSize + this.palletSpacing / 4,
            this.palletSize, this.palletSize);

        const selectedColorInfo = document.getElementById("selectedColorInfo");
        selectedColorInfo.innerHTML = `<b>Selected Color Info</b><br>` +
            `Index:  ${this.selectedColorIndex} <br>` +
            `Char:   ${this.palletLetters[this.selectedColorIndex]} <br>` +
            `Code:   ${this.palletColors[this.selectedColorIndex]} <br>` +
            `Name:   ${this.palletNames[this.selectedColorIndex]} `;
    }
    static drawPallet() {
        this.palletScale = (this.palletSize / this.spriteSize);

        // clear location
        this.ctxEditor.clearRect(0, 0, this.spriteSize * this.palletAcrossCnt * this.palletScale + this.palletSpacing, this.canvasEditor.height); // Clear the canvasEditor
        this.ctxEditor.fillStyle = 'black';
        this.ctxEditor.fillRect(0, 0, this.spriteSize * this.palletAcrossCnt * this.palletScale + this.palletSpacing, this.canvasEditor.height); // Fill the entire canvasEditor

        // draw the colors
        for (var i = 0; i < this.palletColors.length + 1; i++) {
            let div = i % this.palletAcrossCnt;
            let mod = Math.floor(i / this.palletAcrossCnt);
            const newX = div * this.palletSize + this.palletSpacing / 2;
            const newY = mod * this.palletSize + this.palletSpacing / 2;
            const result = SpritePallets.getByIndex('default', i)

            if (result.hex === SpriteEditor.transparentColor) {
                SpriteEditor.drawTransparentX(newX, newY, this.spriteSize * this.palletScale);
            } else {
                this.ctxEditor.fillStyle = result.hex;
                this.ctxEditor.fillRect(newX, newY, this.spriteSize * this.palletScale - this.palletSpacing / 2, this.spriteSize * this.palletScale - this.palletSpacing / 2);
            }
        }
    }

    static outputSprite() {
        let c = "[\n";
        //console.log(this.spriteIndex);
        for (let x = 0; x < this.gridCellHeight; x++) {
            let r = "";
            for (let y = 0; y < this.gridCellWidth; y++) {
                const letterIndex = this.spriteIndex[y][x];
                //console.log(letterIndex, this.palletLetters[letterIndex], this.palletLetters);
                r += letterIndex;//palletLetters[letterIndex];
            }
            c += '"' + r + '",\n';
        }
        c += ']';
        //console.log(c);
        const spriteTextarea = document.getElementById("spriteID");
        spriteTextarea.value = c;
    }

    static entries = Object.entries(SpritePallets.default);

    static getMousePositionOncanvas(canvas, event) {
        const rect = canvas.getBoundingClientRect(); // Get canvas bounding box
        const scaleX = canvas.width / rect.width;   // Scale factor for X
        const scaleY = canvas.height / rect.height; // Scale factor for Y

        const x = (event.clientX - rect.left) * scaleX; // Adjusted X coordinate
        const y = (event.clientY - rect.top) * scaleY;  // Adjusted Y coordinate

        return { x, y };
    }

    // Add an event listener to the canvas for clicks
    //canvasEditor.addEventListener("click", function (event) {
    static handleCanvasClick(event) {
        const mouse = SpriteEditor.getMousePositionOncanvas(SpriteEditor.canvasEditor, event);

        if (mouse.x > (SpriteEditor.spriteSize * SpriteEditor.palletAcrossCnt) * SpriteEditor.palletScale) {
            // Determine which sprite cell clicked
            SpriteEditor.selectedCellX = Math.floor((mouse.x - SpriteEditor.gridX) / SpriteEditor.spriteSize);
            SpriteEditor.selectedCellY = Math.floor((mouse.y - SpriteEditor.gridY) / SpriteEditor.spriteSize);

            if (SpriteEditor.selectedCellX < 0 || SpriteEditor.selectedCellX > SpriteEditor.gridCellWidth - 1 ||
                SpriteEditor.selectedCellY < 0 || SpriteEditor.selectedCellY > SpriteEditor.gridCellHeight - 1) {
                return;
            }

            // Set the array elements
            SpriteEditor.spriteIndex[SpriteEditor.selectedCellX][SpriteEditor.selectedCellY] = SpriteEditor.palletLetters[SpriteEditor.selectedColorIndex];
            SpriteEditor.spriteColor[SpriteEditor.selectedCellX][SpriteEditor.selectedCellY] = SpriteEditor.palletColors[SpriteEditor.selectedColorIndex];
        } else {
            // Determine which pallet color was clicked
            const clickedPalletX = Math.floor(mouse.x / SpriteEditor.palletSize);
            const clickedPalletY = Math.floor(mouse.y / SpriteEditor.palletSize);
            const clickedPallet = clickedPalletX + clickedPalletY * SpriteEditor.palletAcrossCnt;

            if (clickedPallet > SpriteEditor.palletColors.length - 1) {
                return; // don't allow invalid color index
            }

            SpriteEditor.selectedColorIndex = clickedPallet;
            SpriteEditor.palletSelectedX = clickedPalletX;
            SpriteEditor.palletSelectedY = clickedPalletY;
        }

        SpriteEditor.drawAll();
    };

}