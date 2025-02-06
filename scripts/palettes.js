// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spritePalettes.js

import Colors from "./colors.js";
import Functions from "./functions.js";
import palettesList from "./palettesList.js";

class Palettes {

    // --------------------------------------------------------
    // Palette methods
    // --------------------------------------------------------
    static activeName = 'default';
    static transparent = "#00000000";
    static errorResult = { symbol: 'Ø', hex: '#00000000', name: 'Transparent' };
    static otherResult = { symbol: '1', hex: '#FF00FF', name: 'RED' };
    static sortByOrder = "hue";

    static palettes = palettesList;

    // Get the current palette
    static get() {
        return this.palettes[this.activeName];
    }

    // Set the active palette
    static set(name) {
        if (name && name === 'custom') {
            throw new Error("Custom palette is not supported in this context. Use 'setCustom(customPalette)' instead.");
        }
        if (!this.palettes[name]) {
            Functions.showStackTrace(`Palette '"${name}"' not found.`);
            return false;
        }
        this.activeName = name;
        return true;
    }

    static setCustom(theCustomPalette) {
        this.activeName = 'custom';
        this.palettes.custom = theCustomPalette;
        //TODO: need to validate valid palette format
    }

    // Get the length of the current palette
    static getLength() {
        const palette = this.get(); // Use current palette
        return palette.length;
    }

    // Method to display all details of the current palette in the textarea
    static getDetails() {

        // Clear the existing content
        let value = `${this.activeName}: [\n`;

        // Get the current palette
        const palette = this.get();

        // Iterate through the palette and add details to the textarea
        palette.forEach((color, index) => {
            value += `{ symbol: '${color.symbol}', hex: '${color.hex}', name: '${color.name}' },\n`;
        });
        value += '], \n';
        return value;
    }

    // Get random color
    static getRandomColor(){
        const randomColor = Colors.getRandomColor();
        let randomResult = { symbol: 'Ø', hex: randomColor, name: 'Transparent' };
        return randomResult;
    }

    // Get an item by its index
    static getByIndex(index) {
        const palette = this.get(); // Use current palette
        if (index < 0 || index >= palette.length) {
            alert(`Index out of bounds: ${index}`);
            return this.errorResult;
        }
        return palette[index];
    }

    // Get an item by its symbol
    static getBySymbol(symbol) {
        const palette = this.get(); // Use current palette

        let result = '';
        // Validate that symbol is a non-empty string and a single ASCII character
        if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
            console.warn("Invalid symbol provided:", symbol);
            result = this.errorResult;
        }

        // Search the palette for the symbol
        result = palette.find(item => item.symbol === symbol);

        if (!result) {
            //console.warn(`Symbol not found:'${symbol}'`);
            result = this.errorResult;
        }

        return result;
    }

    // Get an item by its hex value
    static getByHex(hex) {
        const palette = this.get(); // Use current palette
        const result = palette.find(item => item.hex.toLowerCase() === hex.toLowerCase());
        if (!result) {
            alert(`Hex not found: ${hex}`);
            return this.errorResult;
        }
        return result;
    }

    static setSortByOrder(arg) {
        if (arg !== 'hue' && arg !== 'saturation' & arg !== 'lightness') {
            console.log(`Invalid sort by '${arg}'. No change.`);
            return;
        }
        this.sortByOrder = arg;
    }

    static sortColors() {
        const colors = this.get();

        colors.sort((a, b) => {
            // Check for transparency
            if (Colors.isTransparent(a.hex)) {
                return 1; // Move transparent color 'a' to the bottom
            }
            if (Colors.isTransparent(b.hex)) {
                return -1; // Move transparent color 'b' to the bottom
            }

            // Convert hex to RGB
            let rgbA = Colors.hexToRgb(a.hex);
            let rgbB = Colors.hexToRgb(b.hex);

            // Convert RGB to HSL
            let hslA = Colors.rgbToHsl(rgbA.r, rgbA.g, rgbA.b);
            let hslB = Colors.rgbToHsl(rgbB.r, rgbB.g, rgbB.b);

            // Sort based on the selected criterion
            if (this.sortByOrder === 'hue') {
                return hslA.h - hslB.h; // Sort by hue
            } else if (this.sortByOrder === 'saturation') {
                return hslA.s - hslB.s; // Sort by saturation
            } else if (this.sortByOrder === 'lightness') {
                return hslA.l - hslB.l; // Sort by lightness
            } else {
                console.log('this.sortByOrder:', this.sortByOrder); // Debug log to check the value
                console.warn(` --- Invalid this.sortByOrder value:'${this.sortByOrder}'. Defaulting to 'hue'. ---`);
                return hslA.h - hslB.h; // Default to sorting by hue
            }
        });
        return colors;
    }

    // Dump the current palette to the console
    static dump() {
        try {
            const paletteName = this.activeName; // Use the current active palette name
            const palette = this.get(); // Retrieve the palette

            if (!Array.isArray(palette)) {
                throw new Error(`Palette '${paletteName}' does not exist or is not an array.`);
            }

            // Iterate through the palette and display all details
            console.log(`Details of "${paletteName}" palette:`);
            palette.forEach((item, index) => {
                console.log(`Index: ${index}, Symbol: ${item.symbol}, Hex: ${item.hex}, Name: ${item.name}`);
            });

        } catch (error) {
            alert(`Failed to retrieve details for palette '${this.activeName}':`, error);
        }
    }

}

export default Palettes;

//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------
// Sorted Color Palette 'x' by 'y'
if (false) {  // sort colors and put on editor screen.
    Palettes.set("default");
    var sortBy = "saturation"; // hue, saturation, lightness

    let value = `<h1>Sorted Color Palette '${Palettes.activeName}' by '${sortBy}'</h1>`;
    value += '<p>Options are: hue, saturation, & lightness</p>';
    value += '<textarea id="orderedColor" rows="35" cols="150" style="height: 35%;">';

    // colors to Sort 
    var sortedColors = Palettes.sortColors();

    let colorNumber = 0;
    let asciiINumber = 32;

    sortedColors.forEach(function (color) {
        colorNumber++;
        asciiINumber++;

        if (asciiINumber === 39 || asciiINumber === 92) {
            asciiINumber++;
        }
        if (asciiINumber === 127) {
            asciiINumber = 161;
        }

        var rgb = Colors.hexToRgb(color.hex);
        let hsl = Colors.rgbToHsl(rgb.r, rgb.g, rgb.b);

        if (false) {// show HSL and Color details}
            // Append formatted color object to .value as a string
            if (isNaN(hsl.h)) {
                console.error("Invalid hue value:", hsl.h);
                value += `Invalid hue value:`, '${hsl.h}';
            } else {
                let hue = Number(hsl.h);
                value += `/* {h: '${hue.toFixed(3).padStart(7, ' ')}', s: '${hsl.s}', l: '${hsl.l},'} `;
            }
            value += `- color # ${colorNumber.toFixed(0).padStart(3, '0')} ascii'${asciiINumber}'*/  `;
        }
        const symbol = String.fromCharCode(asciiINumber);
        value += `{symbol: '${symbol}', hex: '${color.hex}', name: '${color.name}'},\n`;
    });

    value += '</textarea>';

    // Output the sorted colors
    const orderedColorDiv = document.getElementById("orderedColorDiv");  // Ensure the div element exists
    if (!orderedColorDiv) {
        alert("orderedColorDiv not found.");
    } else {
        orderedColorDiv.innerHTML = value;
    }
}
//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------