// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spritePalettes.js

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
    // Method to validate #RRGGBB and #RRGGBBAA formats
    static isValidHexColor(color) {
        //     // Example Usages:
        // console.log(isValidHexColor("#FF5733"));    // true (valid #RRGGBB format)
        // Regular expression to match #RRGGBB or #RRGGBBAA format
        const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

        // Test if the color matches the regular expression
        return hexColorRegex.test(color);
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

}

export default Colors;

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