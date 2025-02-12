// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spritePalettes.js

import RandomUtils from "./math/randomUtils.js";

/** Reference colors
 * Crayola Colors
 * https://www.crayola.com/explore-colors/
 * https://toolboxaid.com/programming/html/crayola-colors/
 * https://www.w3schools.com/colors/colors_crayola.asp
 * https://www.jennyscrayoncollection.com/2017/10/complete-list-of-current-crayola-crayon.html
 * 
 */

/* The hue range for each color in the visible spectrum (ROYGBIV) within the HSL
     (Hue, Saturation, Lightness) model is generally as follows: 
      const colorRanges = {
        Red:    ['#FF0000', '#FF6347'], // 0°–30° and 330°–360°    Red rgb(255, 0, 0)
        Orange: ['#FFA500', '#FF8C00'], // 30°–60°              Orange rgb(255, 127, 0)
        Yellow: ['#FFFF00', '#FFD700'], // 60°–90°              Yellow rgb(255, 255, 0)
        Green:  ['#00FF00', '#32CD32'], // 90°–150°              Green rgb(0, 255, 0)
        Blue:   ['#0000FF', '#1E90FF'], // 180°–240°              Blue rgb(0, 0, 255)
        Indigo: ['#4B0082', '#6A5ACD'], // 240°–270°            Indigo rgb(75, 0, 130)
        Violet: ['#EE82EE', '#9400D3'], // 270°–330°            Violet rgb(238, 130, 238)
                                        // 330°–360° see 0°–30°    Red rgb(255,0,0)
    }; */

export class Colors {

    static randomColor;

    // Method to validate #RRGGBB and #RRGGBBAA formats
    static isValidHexColor(testColor) {
        // Regular expression to match #RRGGBB or #RRGGBBAA format
        const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
        // Test if the testColor matches the regular expression
        return hexColorRegex.test(testColor);
    }

    static isValidSymbol(testColor) {
        return Object.values(Colors.symbolColorMap).some(color => color.toLowerCase() === testColor.toLowerCase());
    }

    static isValidNamedColor(color) {
        if (typeof color !== 'string') return false;

        // Check if it's a valid named color
        if (Colors.namedColorMap[color.toLowerCase()]) return true;

        return false;
    }

    // Helper function to return the transparency percentage as a decimal (0 to 1)
    static getTransparencyPercentage(hex) {
        // Assuming the color is in #RRGGBBAA format
        if (this.isValidHexColor(hex)) {
            // Extract the alpha channel (last 2 characters) and convert from hex to decimal (0 to 255)
            let alpha = parseInt(hex.slice(7, 9), 16) / 255;
            return alpha; // Returns a value between 0 (fully transparent) and 1 (fully opaque)
        }
        return 1; // If not in #RRGGBBAA format, assume fully opaque
    }

    // Helper function to check if a color is transparent (based on alpha)
    static isTransparent(hex) {
        // Get the transparency percentage (alpha value)
        const alpha = this.getTransparencyPercentage(hex);

        // If alpha is 0, it's fully transparent; otherwise, it's partially transparent
        return alpha === 0 || alpha < 1;
    }

    // Helper function to convert hex to RGB
    static hexToRgb(hex) {
        this.isValidHexColor(hex);
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return { r, g, b };
    }

    // Helper function to convert RGB to HSL
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { //h: h * 360, s, l }; // return hue in degrees
            h: (h * 360).toFixed(4), // Hue in degrees
            s: s.toFixed(4), // Saturation
            l: l.toFixed(4), // Lightness
        }
    }

    // Helper function to convert HSL (Hue, Saturation, Lightness) to RGB
    static hslToRgb(h, s, l) {
        // // Example Usage:
        // const rgb = hslToRgb(120, 100, 50); // Green with full saturation and medium lightness
        // console.log(rgb); // Outputs: { r: 0, g: 255, b: 0 }

        // Normalize saturation and lightness
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            // Achromatic case (gray)
            r = g = b = l; // All RGB values will be equal in this case
        } else {
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hueToRgb(p, q, h / 360 + 1 / 3);
            g = hueToRgb(p, q, h / 360);
            b = hueToRgb(p, q, h / 360 - 1 / 3);
        }

        // Convert the RGB values to a range of 0 to 255
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);

        return {
            r: r,
            g: g,
            b: b
        };
    }

    // Convert RGB (and optional Alpha) to Hex
    static rgbToHex(r, g, b, a = 1) {
        // Ensure RGB values are within the 0-255 range and round them
        r = Math.round(Math.min(255, Math.max(0, r)));
        g = Math.round(Math.min(255, Math.max(0, g)));
        b = Math.round(Math.min(255, Math.max(0, b)));

        // Convert RGB values to Hex
        let hex = "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();

        // If Alpha (a) is provided, convert it to Hex and append it to the result
        if (a < 1) {
            let alphaHex = Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase();
            hex += alphaHex;
        }

        return hex;
    }

    // Methods for generate a random color in format #RRGGBB
    static generateRandomColor() {

        const random = RandomUtils.randomRange(0,255);
        const randomHex = () => Math.floor(random).toString(16).padStart(2, '0');
        this.randomColor = `#${randomHex()}${randomHex()}${randomHex()}`;
        return this.randomColor;
    }

    // Get the random color
    static getRandomColor() {
        return this.randomColor;
    }

    // Move the color map / or remove

    static namedColorMap = {
        'aliceblue': '#f0f8ff',
        'antiquewhite': '#faebd7',
        'aqua': '#00ffff',
        'aquamarine': '#7fffd4',
        'azure': '#f0ffff',
        'beige': '#f5f5dc',
        'bisque': '#ffe4c4',
        'black': '#000000',
        'blanchedalmond': '#ffebcd',
        'blue': '#0000ff',
        'blueviolet': '#8a2be2',
        'brown': '#a52a2a',
        'burlywood': '#deb887',
        'cadetblue': '#5f9ea0',
        'chartreuse': '#7fff00',
        'chocolate': '#d2691e',
        'coral': '#ff7f50',
        'cornflowerblue': '#6495ed',
        'cornsilk': '#fff8dc',
        'crimson': '#dc143c',
        'cyan': '#00ffff',
        'darkblue': '#00008b',
        'darkcyan': '#008b8b',
        'darkgoldenrod': '#b8860b',
        'darkgray': '#a9a9a9',
        'darkgreen': '#006400',
        'darkkhaki': '#bdb76b',
        'darkmagenta': '#8b008b',
        'darkolivegreen': '#556b2f',
        'darkorange': '#ff8c00',
        'darkorchid': '#9932cc',
        'darkred': '#8b0000',
        'darksalmon': '#e9967a',
        'darkseagreen': '#8fbc8f',
        'darkslateblue': '#483d8b',
        'darkslategray': '#2f4f4f',
        'darkturquoise': '#00ced1',
        'darkviolet': '#9400d3',
        'deeppink': '#ff1493',
        'deepskyblue': '#00bfff',
        'dimgray': '#696969',
        'dodgerblue': '#1e90ff',
        'firebrick': '#b22222',
        'floralwhite': '#fffaf0',
        'forestgreen': '#228b22',
        'fuchsia': '#ff00ff',
        'gainsboro': '#dcdcdc',
        'ghostwhite': '#f8f8ff',
        'gold': '#ffd700',
        'goldenrod': '#daa520',
        'gray': '#808080',
        'green': '#008000',
        'greenyellow': '#adff2f',
        'honeydew': '#f0fff0',
        'hotpink': '#ff69b4',
        'indianred': '#cd5c5c',
        'indigo': '#4b0082',
        'ivory': '#fffff0',
        'khaki': '#f0e68c',
        'lavender': '#e6e6fa',
        'lavenderblush': '#fff0f5',
        'lawngreen': '#7cfc00',
        'lemonchiffon': '#fffacd',
        'lightblue': '#add8e6',
        'lightcoral': '#f08080',
        'lightcyan': '#e0ffff',
        'lightgoldenrodyellow': '#fafad2',
        'lightgreen': '#90ee90',
        'lightgrey': '#d3d3d3',
        'lightpink': '#ffb6c1',
        'lightsalmon': '#ffa07a',
        'lightseagreen': '#20b2aa',
        'lightskyblue': '#87cefa',
        'lightslategray': '#778899',
        'lightsteelblue': '#b0c4de',
        'lightyellow': '#ffffe0',
        'lime': '#00ff00',
        'limegreen': '#32cd32',
        'linen': '#faf0e6',
        'magenta': '#ff00ff',
        'maroon': '#800000',
        'mediumaquamarine': '#66cdaa',
        'mediumblue': '#0000cd',
        'mediumorchid': '#ba55d3',
        'mediumpurple': '#9370db',
        'mediumseagreen': '#3cb371',
        'mediumslateblue': '#7b68ee',
        'mediumspringgreen': '#00fa9a',
        'mediumturquoise': '#48d1cc',
        'mediumvioletred': '#c71585',
        'midnightblue': '#191970',
        'mintcream': '#f5fffa',
        'mistyrose': '#ffe4e1',
        'moccasin': '#ffe4b5',
        'navajowhite': '#ffdead',
        'navy': '#000080',
        'oldlace': '#fdf5e6',
        'olive': '#808000',
        'olivedrab': '#6b8e23',
        'orange': '#ffa500',
        'orangered': '#ff4500',
        'orchid': '#da70d6',
        'palegoldenrod': '#eee8aa',
        'palegreen': '#98fb98',
        'paleturquoise': '#afeeee',
        'palevioletred': '#db7093',
        'papayawhip': '#ffefd5',
        'peachpuff': '#ffdab9',
        'peru': '#cd853f',
        'pink': '#ffc0cb',
        'plum': '#dda0dd',
        'powderblue': '#b0e0e6',
        'purple': '#800080',
        'red': '#ff0000',
        'rosybrown': '#bc8f8f',
        'royalblue': '#4169e1',
        'saddlebrown': '#8b4513',
        'salmon': '#fa8072',
        'sandybrown': '#f4a460',
        'seagreen': '#2e8b57',
        'seashell': '#fff5ee',
        'sienna': '#a0522d',
        'silver': '#c0c0c0',
        'skyblue': '#87ceeb',
        'slateblue': '#6a5acd',
        'slategray': '#708090',
        'snow': '#fffafa',
        'springgreen': '#00ff7f',
        'steelblue': '#4682b4',
        'tan': '#d2b48c',
        'teal': '#008080',
        'thistle': '#d8bfd8',
        'tomato': '#ff6347',
        'turquoise': '#40e0d0',
        'violet': '#ee82ee',
        'wheat': '#f5deb3',
        'white': '#ffffff',
        'whitesmoke': '#f5f5f5',
        'yellow': '#ffff00',
        'yellowgreen': '#9acd32'
    };

    static symbolColorMap = {
        'R': 'Red',
        'O': 'Orange',
        'Y': 'Yellow',
        'G': 'Green',
        'B': 'Blue',
        'I': 'Indigo',
        'V': 'Violet',
        '0': 'transparent', // '0' is transparent
        '1': 'white', // default color for '1'
        'w': 'white',
        'b': 'black',
        'P': 'pink',
        'C': 'cyan',
        'M': 'magenta',
        'L': 'lightgray',
        'D': 'darkgray',
        'V': '#444444',// very dark gray
        'A': '#AAFFFF',
        'S': 'silver',
        'N': 'navy',
        'K': 'khaki',
    };

}
export default Colors;

Colors.generateRandomColor();
//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------
// Sorted Color Palette 'xxxx' by 'yyyy'
if (false) {  // sort colors and put on editor screen.

    function generateHSLColors() { // Step 30°
        const colors = [];
        for (let h = 0; h <= 360; h += 30) {
            // Create a color with full saturation and lightness at 50%
            const color = `hsl(${h}, 100%, 50%)`;
            colors.push(color);
        }
        return colors;
        /* [
        "hsl(0,   100%, 50%)",  // Red
        "hsl(30,  100%, 50%)",  // Orange
        "hsl(60,  100%, 50%)",  // Yellow
        "hsl(90,  100%, 50%)",  // Green
        "hsl(120, 100%, 50%)",  // Light Green
        "hsl(150, 100%, 50%)",  // Chartreuse
        "hsl(180, 100%, 50%)",  // Cyan
        "hsl(210, 100%, 50%)",  // Light Blue
        "hsl(240, 100%, 50%)",  // Blue
        "hsl(270, 100%, 50%)",  // Violet
        "hsl(300, 100%, 50%)",  // Purple
        "hsl(330, 100%, 50%)",  // Deep Red
        "hsl(360, 100%, 50%)"   // Red (Back to 0°)
        ] */
    }
    console.log(generateHSLColors());

}
//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------

