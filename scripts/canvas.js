// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// canvas.js

import ObjectStatic from './objectStatic.js';
import Fullscreen from '../scripts/fullscreen.js'; // Import the Fullscreen class
import CanvasUtil from '../scripts/canvas.js'
import Font5x6 from './font5x6.js';

class CanvasUtils {

    /**
     * Draw FPS
     */
    static frameCount = 0;
    static lastFPSUpdateTime = performance.now(); // Used for FPS calculation
    static lastFrameTime = performance.now(); // Used for frame delta calculation
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
        CanvasUtil.ctx.globalAlpha = 1.0;
        CanvasUtil.ctx.fillStyle = window.fpsColor || 'white'; // Fallback color
        CanvasUtil.ctx.font = `${window.fpsSize || '16px'} Arial Bold`;
        CanvasUtil.ctx.fillText(`FPS: ${this.fps}`, window.fpsX || 10, window.fpsY || 20); // Default positions
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
                CanvasUtil.drawSprite(x + i * (charWidth * pixelSize + 5), y, frame, pixelSize, color);
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

    // Move the color map to be a static property of the class
    static colorMapSprite = {
        'R': 'red',
        'O': 'orange',
        'Y': 'yellow',
        'G': 'green',
        'B': 'blue',
        'I': 'indigo',
        'V': 'violet',
        '0': 'transparent', // '0' is transparent
        '': 'transparent', // empty is transparent
        '1': 'white', // default color for '1'
        'b': 'black',
        'w': 'white',
        'P': 'pink',
        'C': 'cyan',
        'M': 'magenta',
        'L': 'lightgray',
        'D': 'darkgray',
        'A': 'aqua',
        'S': 'silver',
        'N': 'navy',
        'K': 'khaki',
    };
    // Method to draw the current frame
    static drawSprite(x, y, frame, pixelSize, spriteColor = 'white', drawBounds = false) {
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                let color = CanvasUtils.colorMapSprite[pixel] || 'transparent';

                // Replace white with spriteColor if present
                if (pixel === '1' && spriteColor) {
                    color = spriteColor; // Use sprite color instead of white
                }
                CanvasUtil.ctx.fillStyle = color;
                let ceilX = Math.ceil((col * pixelSize) + x);
                let ceilY = Math.ceil((row * pixelSize) + y);
                let ceilPixelSize = Math.ceil(pixelSize);
                CanvasUtil.ctx.fillRect(ceilX, ceilY, ceilPixelSize, ceilPixelSize);
            }
        }

        if (drawBounds) {
            let dimensions = CanvasUtils.spriteWidthHeight(frame, pixelSize);
            CanvasUtils.drawBounds(x, y, dimensions.width, dimensions.height, spriteColor, 2);
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

    static spriteWidthHeight(object, pixelSize, debug = false) {
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
            console.error("Error occurred:", error.message);
            console.error("Stack trace:", error.stack);
            console.error("Invalid object format:", object);
            return { width: 0, height: 0 };
        }

        width = Math.round(width * pixelSize);
        height = Math.round(height * pixelSize);

        return { width: width, height: height };
    }

    /**
     *  Color validation
     */

    static colorMapNamed = {
        aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4",
        azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000",
        blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a",
        burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e",
        coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c",
        cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000",
        darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f",
        darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff",
        dimgray: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0",
        forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff",
        gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000",
        greenyellow: "#adff2f", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c",
        indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa",
        lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6",
        lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgreen: "#90ee90",
        lightgrey: "#d3d3d3", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa", lightslategray: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0",
        lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff",
        maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3",
        mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa",
        mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080",
        oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500",
        orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98",
        paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9",
        peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6",
        purple: "#800080", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1",
        saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57",
        seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb",
        slateblue: "#6a5acd", slategray: "#708090", snow: "#fffafa", springgreen: "#00ff7f",
        steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8",
        tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3",
        white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32"
    };

    static isValidColor(color) {
        if (typeof color !== 'string') return false;

        // Check if it's a valid named color
        if (CanvasUtils.colorMapNamed[color.toLowerCase()]) return true;

        // Check if it's a valid hexadecimal color code (6 or 8 characters)
        const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
        return hexRegex.test(color);
    }

    /**
     * Line methods
     */
    static drawLine(x1, y1, x2, y2, lineWidth = 5, strokeColor = 'white') {
        CanvasUtil.ctx.lineWidth = lineWidth;
        CanvasUtil.ctx.strokeStyle = strokeColor;

        CanvasUtil.ctx.beginPath();
        CanvasUtil.ctx.moveTo(x1, y1); // Start point
        CanvasUtil.ctx.lineTo(x2, y2); // End point
        CanvasUtil.ctx.stroke(); // Draw the line
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
        CanvasUtil.ctx.setLineDash(dashPattern);
        CanvasUtils.drawLine(x1, y1, x2, y2, lineWidth, strokeColor);
        CanvasUtil.ctx.setLineDash([]); // Reset to solid line
    }

    static drawBounds(x, y, w, h, color = 'red', lineSize = 1) {
        CanvasUtil.ctx.lineWidth = lineSize;
        CanvasUtil.ctx.strokeStyle = color;
        CanvasUtil.ctx.strokeRect(x, y, w, h);
    }

    static drawRect(x, y, width, height, color) {
        CanvasUtils.ctx.fillStyle = color;
        CanvasUtils.ctx.fillRect(x, y, width, height);
    }

    static drawBorder() {
        CanvasUtil.ctx.lineWidth = window.borderSize || 1; // Fallback if borderSize is not set
        CanvasUtil.ctx.strokeStyle = window.borderColor || 'black'; // Fallback if borderColor is not set
        CanvasUtil.ctx.strokeRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    /**
     * Circle methods
     */
    static drawCircle(point, color = 'red', size = 7, startAngle = 0, endAngle = Math.PI * 2) {
        CanvasUtil.ctx.beginPath();
        CanvasUtil.ctx.arc(point.x, point.y, size, startAngle, endAngle); // Draw a small circle
        CanvasUtil.ctx.fillStyle = color;
        CanvasUtil.ctx.fill();
    }

    static drawCircle2(x, y, radius, fillColor = 'white', borderColor = null, borderWidth = 0) {
        CanvasUtil.ctx.beginPath();
        CanvasUtil.ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw circle
        CanvasUtil.ctx.fillStyle = fillColor;
        CanvasUtil.ctx.fill();

        if (borderColor && borderWidth > 0) {
            CanvasUtil.ctx.strokeStyle = borderColor;
            CanvasUtil.ctx.lineWidth = borderWidth;
            CanvasUtil.ctx.stroke();
        }
    }

    /**
     *  Canvas Init Methods
     */

    static gameModule;
    static lastTimestamp = 0;
    static ctx = null;

    static canvasClear(ctx) {
        CanvasUtil.ctx.fillStyle = window.backgroundColor || 'white'; // Fallback if backgroundColor is not set
        CanvasUtil.ctx.fillRect(0, 0, window.gameAreaWidth, window.gameAreaHeight);
    }

    static clickFullscreen() {
        if (!Fullscreen.isFullScreen) {
            // Set up the text properties using global variables or default values
            CanvasUtil.ctx.fillStyle = window.fullscreenColor || 'white'; // Set text color
            CanvasUtil.ctx.font = window.fullscreenFont || '40px Arial'; // Set font size and family

            // Reset text alignment to default (start)
            CanvasUtil.ctx.textAlign = 'start';

            // Measure the width of the text "Click here to enter fullscreen"
            const text = window.fullscreenText || 'Click here to enter fullscreen';
            const textWidth = CanvasUtil.ctx.measureText(text).width; // Get the width of the text in pixels

            const textX = window.fullscreenX || (window.gameAreaWidth - textWidth) / 2;

            const textY = window.fullscreenY || window.gameAreaHeight * (4 / 5); // Position the text vertically


            // Draw the message on the canvas
            CanvasUtil.ctx.fillText(text, textX, textY); // Display the text at the calculated position
        }
    }

    // Animate function moved into the CanvasUtils class
    static async animate(time) {
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

                CanvasUtil.ctx = ctx;
            }

            // Initialize the canvas and game loop
            CanvasUtils.canvasClear(ctx);

            // Call the game loop method of the Game class
            this.gameInstance.gameLoop(deltaTime);

            // Draw click full screen
            this.clickFullscreen();

            // Draw border and FPS if necessary
            CanvasUtils.drawBorder();
            if (window.fpsShow) {
                CanvasUtils.drawFPS();
            }
        } else {
            alert('You need a modern browser to see this.');
        }

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
