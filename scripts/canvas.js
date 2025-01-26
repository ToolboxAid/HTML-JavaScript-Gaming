// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import ObjectStatic from './objectStatic.js';
import Fullscreen from './fullscreen.js'; // Import the Fullscreen class
import Font5x6 from './font5x6.js';
import Palettes from './palettes.js';
import Functions from './functions.js';
import Colors from './colors.js';

class CanvasUtils {

    /**
     * Draw FPS
     */
    static frameCount = 0;
    static lastFPSUpdateTime = performance.now(); // Used for FPS calculation
    static fps = 0;
    static drawFPS() {
        this.frameCount++;

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.lastFPSUpdateTime; // Use the separate variable

        if (elapsedTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdateTime = currentTime; // Reset lastTime for the next second
        }
        if (false) {
            console.log("window.fpsShow", window.fpsShow);
            console.log("window.fpsColor", window.fpsColor);
            console.log("window.fpsSize", window.fpsSize);
            console.log("window.fpsX", window.fpsX);
            console.log("window.fpsY", window.fpsY);

            console.log("window.gameAreaWidth", window.gameAreaWidth);
            console.log("window.gameAreaHeight", window.gameAreaHeight);
            console.log("window.gameScaleWindow", window.gameScaleWindow);
            console.log("window.backgroundColor", window.backgroundColor);
            console.log("window.game", window.game);
            //console.log("",);
            window.game

        }
        CanvasUtils.ctx.globalAlpha = 1.0;
        CanvasUtils.ctx.fillStyle = window.fpsColor || 'white'; // Fallback color
        CanvasUtils.ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        CanvasUtils.ctx.fillText(`FPS: ${this.fps}`, window.fpsX || 10, window.fpsY || 20); // Default positions
    }


    /**
     * Animation CPU / percent for available time (16.67ms)
     */
    static availableTimeMs = 1000 / 60; // Time per frame in milliseconds (16.67ms)
    static timeSpentMs = 0.0; // Time spent in the current frame
    static totalTimeSpentMs = 0.0; // Sum of all time spent to be averaged into gfxPercentUsage
    static frameSampleCount = 0; // Number of samples taken
    static frameSampleSize = 60; // Number of samples before calculating gfxPercentUsage
    static gfxPercentUsage = 0.0; // CPU usage percentage

    static drawGraphicFrameExecution() {
        this.totalTimeSpentMs += this.timeSpentMs;
        if (this.frameSampleCount++ >= this.frameSampleSize) {
            const averageTimeMs = this.totalTimeSpentMs / this.frameSampleSize;
            this.gfxPercentUsage = (averageTimeMs / this.availableTimeMs) * 100;
            this.frameSampleCount = 0;
            this.totalTimeSpentMs = 0;
        }
        let color = 'green';
        if (this.gfxPercentUsage > 90) {
            color = 'red';
        } else if (this.gfxPercentUsage > 60) {
            color = 'yellow';
        }

        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = color;
        this.ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        this.ctx.fillText(`GFX: ${this.gfxPercentUsage.toFixed(1)}%`, window.fpsX || 10, window.fpsY + 25 || 45); // Default positions
    }

    /**
     * 
     * Draw text and numbers 
     */
    static drawNumber(x, y, number, pixelSize, color = 'white', leadingCount = 5, leadingChar = '0') {
        const numberStr = number.toString();
        const leadingLength = Math.max(0, leadingCount - numberStr.length); // Calculate number of leading characters needed
        const text = leadingChar.repeat(leadingLength) + numberStr; // Create text with leading characters

        // Ensure text length is exactly 5
        const formattedText = text.padStart(leadingCount, leadingChar).slice(-leadingCount);
        this.drawText(x, y, formattedText, pixelSize, color);
    }

    static drawText(x, y, text, pixelSize, color = 'white') {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char];

            if (frame) {
                // Assuming each character has a fixed width, you can adjust the space here
                const charWidth = frame[0].length; // Get the width from the frame
                CanvasUtils.drawSprite(x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
            }
        }
    }

    /**
     *  Sprite methods
     */
    static getSpriteText(text, space = 1) {
        // Initialize the sprite array
        const sprite = [];

        // Find the maximum height of characters (assuming all characters have the same height)
        const charHeight = Font5x6.font5x6['A']?.length || 7;

        // Prepare an empty row for spacing
        const emptyRow = '0'.repeat(space);

        // Initialize empty rows
        for (let i = 0; i < charHeight; i++) {
            sprite.push('');
        }

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.font5x6[char] || Font5x6.font5x6[' '];

            // Add each line of the character frame to the sprite
            for (let row = 0; row < charHeight; row++) {
                // Add character row + space for each line in the sprite
                sprite[row] += frame[row] + emptyRow;
            }
        }

        return sprite;
    }

    static getSpriteFromText(text, space = 1) {
        // Initialize the sprite array
        const sprite = [];

        // Find the maximum height of characters (assuming all characters have the same height)
        const sampleFrame = Font5x6.getLayerDataByKey('A');
        const charHeight = sampleFrame?.length || 7;

        // Prepare an empty row for spacing
        const emptyRow = '0'.repeat(space);

        // Initialize empty rows
        for (let i = 0; i < charHeight; i++) {
            sprite.push('');
        }

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frame = Font5x6.getLayerDataByKey(char) || Font5x6.getLayerDataByKey(' ');

            // Add each line of the character frame to the sprite
            for (let row = 0; row < charHeight; row++) {
                sprite[row] += frame[row] + emptyRow;
            }
        }

        // Create the JSON object in the specified format
        const jsonSprite = {
            "metadata": {
                "sprite": "Font5x6",
                "spriteGridSize": 1,
                "spritePixelSize": 3,
                "palette": "default",
                "framesPerSprite": 30

            },
            "layers": [
                {
                    "metadata": {
                        "spriteimage": "",
                        "imageX": 0,
                        "imageY": 0,
                        "imageScale": 1.0,
                    },
                    "data": sprite
                }
            ]
        };

        return jsonSprite;
    }

    static validateJsonSpriteFormat(jsonSprite) {
        const requiredMetadataFields = ["sprite", "spriteGridSize", "spritePixelSize", "palette", "framesPerSprite"];
        const requiredLayerFields = ["spriteimage", "imageX", "imageY", "imageScale"];

        if (!jsonSprite.metadata || !jsonSprite.layers) {
            return false;
        }

        for (const field of requiredMetadataFields) {
            if (!(field in jsonSprite.metadata)) {
                return false;
            }
        }

        for (const layer of jsonSprite.layers) {
            if (!layer.metadata || !layer.data) {
                return false;
            }

            for (const field of requiredLayerFields) {
                if (!(field in layer.metadata)) {
                    return false;
                }
            }
        }

        return true;
    }

    // static getHexFromSymbol(palette, symbol) {
    //     const color = palette.custom.find(color => color.symbol === symbol);
    //     return color ? color.hex : Palettes.transparent; // '#00000000';
    // }

    //     // Function to find a color from any palette
    // function findColor(paletteName, symbol) {
    //     return palette[paletteName].find(color => color.symbol === symbol);
    // }

    // // Example usage
    // const customColor = findColor('custom', symbol);
    // const specialColor = findColor('special', symbol);

    // // ...existing code...

    static getLayerData(jsonSprite, frameIndex) {
        if (jsonSprite && jsonSprite.layers && jsonSprite.layers[frameIndex] && jsonSprite.layers[frameIndex].data) {
            return jsonSprite.layers[frameIndex].data;
        } else {
            console.error("Invalid layer data or index:", jsonSprite);
            return null;
        }
    }
    static noSpamUpdate = 0;
    static updateLayerData(layerData) {
        for (let row = 0; row < layerData.length; row++) {
            // Convert the row string to an array for modification
            let rowArray = Array.from(layerData[row]);
            for (let col = 0; col < rowArray.length; col++) {
                const pixel = rowArray[col];
                const color = Palettes.getBySymbol(pixel);
                // if (CanvasUtils.noSpamUpdate++ < 20) {
                //     console.log(`${CanvasUtils.noSpamUpdate}) Pixel: ${pixel} "HEX: ${color.hex}`);
                // }
                rowArray[col] = color.hex;
            }
            // Assign the modified array back to the layerData
            layerData[row] = rowArray;
        }
    }
    static setLayerData(jsonSprite, layerData, frameIndex) {
        if (jsonSprite && jsonSprite.layers && jsonSprite.layers[frameIndex]) {
            jsonSprite.layers[frameIndex].data = layerData;
        } else {
            console.error("Invalid layer data or index:", jsonSprite, frameIndex);
        }
    }

    static spamSprit2HEX = 0;
    static convertSprite2HEX(jsonSprite, paletteArray = null) {
        const paletteName = jsonSprite.metadata.palette;

        if (paletteName === 'custom') {
            Palettes.setCustom(paletteArray);
        } else {
            Palettes.set(paletteName)
        }
        if (CanvasUtils.validateJsonSpriteFormat(jsonSprite)) { // everything is fine    
            // Iterate over jsonSprite.layers
            for (let i = 0; i < jsonSprite.layers.length; i++) {
                const layerData = CanvasUtils.getLayerData(jsonSprite, i);

                if (CanvasUtils.spamSprit2HEX++ < 20) {
                    console.log(`${CanvasUtils.spamSprit2HEX}-1) ${JSON.stringify(layerData)}`);
                    console.log(`${CanvasUtils.spamSprit2HEX}-2) ${paletteName}, ${JSON.stringify(Palettes.get())}`);
                }
    
                CanvasUtils.updateLayerData(layerData);
                
                if (CanvasUtils.spamSprit2HEX < 20) {
                    console.log(`${CanvasUtils.spamSprit2HEX}-3) ${JSON.stringify(jsonSprite)}`);
                }
    
                CanvasUtils.setLayerData(jsonSprite, layerData, i);
            }
            return jsonSprite;
        } else {
            console.error("Not sure what to do with this.")
            return null;
        }
    }

   
    // Method to draw the current frame
    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = Colors.symbolColorMap[pixel] || '#00000000'; // transparent';

                // Replace white with spriteColor if present
                if (pixel === '1' && spriteColor) {
                    color = spriteColor; // Use sprite color instead of white
                }
                CanvasUtils.ctx.fillStyle = color;
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                CanvasUtils.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            console.log(this.width, this.height);
            let dimensions = CanvasUtils.spriteWidthHeight(frame, pixelSize);
            CanvasUtils.drawBounds(x, y, dimensions.width, dimensions.height, spriteColor, 2);
        }
    }

        // Method to draw the current frame
        static drawSpriteRGB(x, y, frame, pixelSize, drawBounds = false) {
            for (let row = 0; row < frame.length; row++) {
                for (let col = 0; col < frame[row].length; col++) {
                    CanvasUtils.ctx.fillStyle = frame[row][col];
                    let ceilX = Math.ceil((col * pixelSize) + x);
                    let ceilY = Math.ceil((row * pixelSize) + y);
                    let ceilPixelSize = Math.ceil(pixelSize);
                    CanvasUtils.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
                }
            }
    
            if (drawBounds) {
                CanvasUtils.drawBounds(x, y, this.width, this.height, spriteColor, 2);
            }
        }

    // const frameWidth = Enemy.getFrameWidth(livingFrames);
    // static getFrameWidth(frames) {
    //     if (!frames || frames.length === 0 || frames[0].length === 0) {
    //         return 0; // Return 0 if the frames array is empty or malformed
    //     }
    //         // Assuming all rows have the same width
    //     return frames[0][0].length * spriteConfig.pixelSize; // Width of the first row of the first frame
    // }


    static spamLayerDimensions = 0;
    static getLayerDimensions(layer, pixelSize) {
        if (layer && Functions.getObjectType(layer) === 'Object' && pixelSize >= 1) {
            console.log(layer, Functions.getObjectType(layer));
            if (layer.data && layer.data[0]) {
                const height = layer.data.length * pixelSize;
                const width = layer.data[0].length * pixelSize;
                console.log(width, height);
                return { width: width, height: height };
            } else {
                if (CanvasUtils.spamLayerDimensions++ < 10) {
                    console.error(`${CanvasUtils.spamLayerDimensions}) Invalid layer data: ${JSON.stringify(layer)}`);
                }
                return { width: 10, height: 10 };
            }
        }
        return { width: 10, height: 10 };
    }

    /**
     * @deprecated Use drawCircle instead.
     */
    static spriteWidthHeight(object, pixelSize, debug = false) {
        if (CanvasUtils.doOnce) {
            CanvasUtils.doOnce = false;
            console.warn('spriteWidthHeight is deprecated. Use getLayerDimensions instead.');
        }
        let width, height;

        if (Array.isArray(object) && Array.isArray(object[0])) {
            // Multi-dimensional array (each element is an array, implying rows of frames)
            let frame = object.map(row => Array.from(row));
            height = frame.length; // Number of rows
            width = frame[0]?.length || 0; // Length of each row (assuming uniform row lengths)

            if (debug) {
                console.log(`Multi-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame); // Display the actual frame for verification
            }
        } else if (Array.isArray(object)) {
            // Single-dimensional array (likely one frame as an array of strings or characters)
            let frame = Array.from(object); // Create a copy for manipulation
            height = frame.length; // Number of elements (lines or rows)
            width = frame[0]?.length || 1; // Length of each line or character    
            if (debug) {
                console.log(`Single-dimensional array detected. Width: ${width}, Height: ${height}`);
                console.log(frame); // Display the actual frame for verification
            }
        } else {
            console.error("Invalid object format:", object);
            return { width: 0, height: 0 };
        }

        width = Math.round(width * pixelSize);
        height = Math.round(height * pixelSize);

        return { width: width, height: height };
    }

    /**
     * Line methods
     */
    static drawLine(x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        CanvasUtils.ctx.lineWidth = lineWidth;
        CanvasUtils.ctx.strokeStyle = strokeColor;

        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.moveTo(x1, y1); // Start point
        CanvasUtils.ctx.lineTo(x2, y2); // End point
        CanvasUtils.ctx.stroke(); // Draw the line
    }

    static drawLineFromPoints(start, end, lineWidth = 5, strokeColor = 'red') {
        //   const start1 = { x: 0, y: 0 };
        //   const end1   = { x: 500, y: 500 };
        CanvasUtils.drawLine(start.x, start.y, end.x, end.y, lineWidth, strokeColor);
    }

    static drawDashLine(x1, y1, x2, y2, lineWidth, strokeColor = 'white', dashPattern = [10, 10]) {
        /* ctx.setLineDash
             ([5, 15]);        - Short dashes with longer gaps
             ([15, 5]);        - Long dashes with short gaps
             ([15, 5, 5, 5]);  - Long dash, short gap, short dash, short gap
             ([20, 5, 10, 5]); - Alternating long and medium dashes
         */
        CanvasUtils.ctx.setLineDash(dashPattern);
        CanvasUtils.drawLine(x1, y1, x2, y2, lineWidth, strokeColor);
        CanvasUtils.ctx.setLineDash([]); // Reset to solid line
    }

    static drawBounds(x, y, w, h, color = 'red', lineSize = 1) {
        CanvasUtils.ctx.lineWidth = lineSize;
        CanvasUtils.ctx.strokeStyle = color;
        CanvasUtils.ctx.strokeRect(x, y, w, h);
    }

    static drawRect(x, y, width, height, color) {
        CanvasUtils.ctx.fillStyle = color;
        CanvasUtils.ctx.fillRect(x, y, width, height);
    }

    static drawBorder() {
        CanvasUtils.ctx.lineWidth = window.borderSize || 1; // Fallback if borderSize is not set
        CanvasUtils.ctx.strokeStyle = window.borderColor || 'black'; // Fallback if borderColor is not set
        CanvasUtils.ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    /**
     * Circle methods
     */
    static drawCircle(point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        CanvasUtils.ctx.fillStyle = color;
        CanvasUtils.ctx.fill();
    }

    static drawCircle2(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        CanvasUtils.ctx.beginPath();
        CanvasUtils.ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw circle
        CanvasUtils.ctx.fillStyle = fillColor;
        CanvasUtils.ctx.fill();

        if (borderColor && borderWidth > 0) {
            CanvasUtils.ctx.strokeStyle = borderColor;
            CanvasUtils.ctx.lineWidth = borderWidth;
            CanvasUtils.ctx.stroke();
        }
    }

    /**
     *  Canvas Init Methods
     */

    static gameModule;
    static lastTimestamp = 0;
    static ctx = null;

    static canvasClear(ctx) {
        CanvasUtils.ctx.fillStyle = window.backgroundColor || 'white'; // Fallback if backgroundColor is not set
        CanvasUtils.ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static clickFullscreen() {
        if (!Fullscreen.isFullScreen) {
            // Set up the text properties using global variables or default values
            CanvasUtils.ctx.fillStyle = window.fullscreenColor || 'white'; // Set text color
            CanvasUtils.ctx.font = window.fullscreenFont || '40px Arial'; // Set font size and family

            // Reset text alignment to default (start)
            CanvasUtils.ctx.textAlign = 'start';

            // Measure the width of the text "Click here to enter fullscreen"
            const text = window.fullscreenText || 'Click here to enter fullscreen';
            const textWidth = CanvasUtils.ctx.measureText(text).width; // Get the width of the text in pixels

            const textX = window.fullscreenX || (window.gameAreaWidth - textWidth) / 2;

            const textY = window.fullscreenY || window.gameAreaHeight * (4 / 5); // Position the text vertically


            // Draw the message on the canvas
            CanvasUtils.ctx.fillText(text, textX, textY); // Display the text at the calculated position
        }
    }

    // Animate function moved into the CanvasUtils class
    static async animate(time) {
        const timeStartMs = Date.now();
        const canvas = document.getElementById('gameArea');
        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');

            const deltaTime = (time - this.lastTimestamp) / 1000; // Convert milliseconds to seconds
            this.lastTimestamp = time;

            // Try loading the game module only once and instantiate the Game class
            if (!this.gameInstance) {
                // Dynamically import the game.js module and create an instance of the Game class
                // HACK - needs to be moved elseware
                const gameModule = await import(`${window.canvasPath}/game.js`);
                this.gameInstance = new gameModule.default();  // Use the default export from game.js

                CanvasUtils.ctx = ctx;
            }

            // Initialize the canvas and game loop
            CanvasUtils.canvasClear(ctx);

            // Call the game loop method of the Game class
            Colors.generateRandomColor();
            this.gameInstance.gameLoop(deltaTime);

            // Draw click full screen
            this.clickFullscreen();

            // Draw border and FPS if necessary
            CanvasUtils.drawBorder();
            if (window.fpsShow) {
                CanvasUtils.drawFPS();
                CanvasUtils.drawGraphicFrameExecution();
            }
        } else {
            alert('You need a modern browser to see this.');
        }

        this.timeSpentMs = Date.now() - timeStartMs;

        // Call animate recursively to continue the animation loop
        requestAnimationFrame(CanvasUtils.animate.bind(this)); // Use `bind(this)` to maintain context
    }

    // Add EventListener moved into the class
    static setupCanvas() {
        ObjectStatic.gameAreaWidth = window.gameAreaWidth;
        ObjectStatic.gameAreaHeight = window.gameAreaHeight;

        window.addEventListener('DOMContentLoaded', () => {
            console.log(`Canvas Path: ${window.canvasPath}`);
            requestAnimationFrame(CanvasUtils.animate.bind(this));
        });
    }
}

// Export the CanvasUtils class
export default CanvasUtils;

// Call the setupCanvas method to initialize the canvas and game loop
CanvasUtils.setupCanvas();
