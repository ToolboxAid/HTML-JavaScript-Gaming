// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spritePallets.js

class SpritePallets {

    static palettes = {
        default: [
            { symbol: '!', hex: '#FFC0CB', name: 'Pink' },
            { symbol: '^', hex: '#FFB6C1', name: 'LightPink' },
            { symbol: '#', hex: '#FF69B4', name: 'HotPink' },
            { symbol: '$', hex: '#FF1493', name: 'DeepPink' },
            { symbol: '%', hex: '#DB7093', name: 'PaleVioletRed' },
            { symbol: '&', hex: '#C71585', name: 'MediumVioletRed' },

            // Red Colors
            { symbol: ':', hex: '#FFA07A', name: 'LightSalmon' },
            { symbol: ';', hex: '#FA8072', name: 'Salmon' },
            { symbol: '<', hex: '#E9967A', name: 'DarkSalmon' },
            { symbol: '=', hex: '#F08080', name: 'LightCoral' },
            { symbol: '>', hex: '#CD5C5C', name: 'IndianRed' },
            { symbol: '?', hex: '#DC143C', name: 'Crimson' },
            { symbol: '@', hex: '#FF0000', name: 'Red' },
            { symbol: 'A', hex: '#B22222', name: 'FireBrick' },
            { symbol: 'B', hex: '#8B0000', name: 'DarkRed' },

            // Orange Colors
            { symbol: 'C', hex: '#FFA500', name: 'Orange' },
            { symbol: 'D', hex: '#FF8C00', name: 'DarkOrange' },
            { symbol: 'E', hex: '#FF7F50', name: 'Coral' },
            { symbol: 'F', hex: '#FF6347', name: 'Tomato' },
            { symbol: 'G', hex: '#FF4500', name: 'OrangeRed' },

            // Yellow Colors
            { symbol: 'H', hex: '#FFD700', name: 'Gold' },
            { symbol: 'I', hex: '#FFFF00', name: 'Yellow' },
            { symbol: 'J', hex: '#FFFFE0', name: 'LightYellow' },
            { symbol: 'K', hex: '#FFFACD', name: 'LemonChiffon' },
            { symbol: 'L', hex: '#FAFAD2', name: 'LightGoldenRodYellow' },
            { symbol: 'M', hex: '#FFEFD5', name: 'PapayaWhip' },
            { symbol: 'N', hex: '#FFE4B5', name: 'Moccasin' },
            { symbol: 'O', hex: '#FFDAB9', name: 'PeachPuff' },
            { symbol: 'P', hex: '#EEE8AA', name: 'PaleGoldenRod' },
            { symbol: 'Q', hex: '#F0E68C', name: 'Khaki' },
            { symbol: 'R', hex: '#BDB76B', name: 'DarkKhaki' },

            // Green Colors
            { symbol: 'S', hex: '#ADFF2F', name: 'GreenYellow' },
            { symbol: 'T', hex: '#7FFF00', name: 'Chartreuse' },
            { symbol: 'U', hex: '#7CFC00', name: 'LawnGreen' },
            { symbol: 'V', hex: '#00FF00', name: 'Lime' },
            { symbol: 'W', hex: '#32CD32', name: 'LimeGreen' },
            { symbol: 'X', hex: '#98FB98', name: 'PaleGreen' },
            { symbol: 'Y', hex: '#90EE90', name: 'LightGreen' },
            { symbol: 'Z', hex: '#00FA9A', name: 'MediumSpringGreen' },
            { symbol: '[', hex: '#00FF7F', name: 'SpringGreen' },
            { symbol: 'Ù', hex: '#3CB371', name: 'MediumSeaGreen' },
            { symbol: ']', hex: '#2E8B57', name: 'SeaGreen' },
            { symbol: '^', hex: '#228B22', name: 'ForestGreen' },
            { symbol: '_', hex: '#008000', name: 'Green' },
            { symbol: '`', hex: '#006400', name: 'DarkGreen' },
            { symbol: 'a', hex: '#9ACD32', name: 'YellowGreen' },
            { symbol: 'b', hex: '#6B8E23', name: 'OliveDrab' },
            { symbol: 'c', hex: '#556B2F', name: 'DarkOliveGreen' },
            { symbol: 'd', hex: '#66CDAA', name: 'MediumAquaMarine' },
            { symbol: 'e', hex: '#8FBC8F', name: 'DarkSeaGreen' },
            { symbol: 'f', hex: '#20B2AA', name: 'LightSeaGreen' },
            { symbol: 'g', hex: '#008B8B', name: 'DarkCyan' },
            { symbol: 'h', hex: '#008080', name: 'Teal' },

            // Cyan Colors
            { symbol: 'i', hex: '#00FFFF', name: 'Aqua' },
            { symbol: 'j', hex: '#00FFFF', name: 'Cyan' },
            { symbol: 'k', hex: '#E0FFFF', name: 'LightCyan' },
            { symbol: 'l', hex: '#AFEEEE', name: 'PaleTurquoise' },
            { symbol: 'm', hex: '#7FFFD4', name: 'Aquamarine' },
            { symbol: 'n', hex: '#40E0D0', name: 'Turquoise' },
            { symbol: 'o', hex: '#48D1CC', name: 'MediumTurquoise' },
            { symbol: 'p', hex: '#00CED1', name: 'DarkTurquoise' },

            // Blue Colors
            { symbol: 'q', hex: '#5F9EA0', name: 'CadetBlue' },
            { symbol: 'r', hex: '#4682B4', name: 'SteelBlue' },
            { symbol: 's', hex: '#B0C4DE', name: 'LightSteelBlue' },
            { symbol: 't', hex: '#ADD8E6', name: 'LightBlue' },
            { symbol: 'u', hex: '#B0E0E6', name: 'PowderBlue' },
            { symbol: 'v', hex: '#87CEFA', name: 'LightSkyBlue' },
            { symbol: 'w', hex: '#87CEEB', name: 'SkyBlue' },
            { symbol: 'x', hex: '#6495ED', name: 'CornflowerBlue' },
            { symbol: 'y', hex: '#00BFFF', name: 'DeepSkyBlue' },
            { symbol: 'z', hex: '#1E90FF', name: 'DodgerBlue' },
            { symbol: '{', hex: '#4169E1', name: 'RoyalBlue' },
            { symbol: '|', hex: '#0000FF', name: 'Blue' },
            { symbol: '}', hex: '#0000CD', name: 'MediumBlue' },
            { symbol: '~', hex: '#00008B', name: 'DarkBlue' },
            { symbol: '¡', hex: '#000080', name: 'Navy' },
            { symbol: '¢', hex: '#191970', name: 'MidnightBlue' },

            // Purple Colors
            { symbol: "'", hex: '#E6E6FA', name: 'Lavender' },
            { symbol: '(', hex: '#D8BFD8', name: 'Thistle' },
            { symbol: ')', hex: '#DDA0DD', name: 'Plum' },
            { symbol: '*', hex: '#DA70D6', name: 'Orchid' },
            { symbol: '+', hex: '#EE82EE', name: 'Violet' },
            { symbol: ',', hex: '#FF00F0', name: 'Fuchsia' },
            { symbol: '-', hex: '#FF00FF', name: 'Magenta' },
            { symbol: '.', hex: '#BA55D3', name: 'MediumOrchid' },
            { symbol: '/', hex: '#9932CC', name: 'DarkOrchid' },
            { symbol: '0', hex: '#9400D3', name: 'DarkViolet' },
            { symbol: '1', hex: '#8A2BE2', name: 'BlueViolet' },
            { symbol: '2', hex: '#8B008B', name: 'DarkMagenta' },
            { symbol: '3', hex: '#800080', name: 'Purple' },
            { symbol: '4', hex: '#9370DB', name: 'MediumPurple' },
            { symbol: '5', hex: '#7B68EE', name: 'MediumSlateBlue' },
            { symbol: '6', hex: '#6A5ACD', name: 'SlateBlue' },
            { symbol: '7', hex: '#483D8B', name: 'DarkSlateBlue' },
            { symbol: '8', hex: '#663399', name: 'RebeccaPurple' },
            { symbol: '9', hex: '#4B0082', name: 'Indigo' },

            // White Colors
            { symbol: 'µ', hex: '#FFFFFF', name: 'White' },
            { symbol: '¶', hex: '#FFFAFA', name: 'Snow' },
            { symbol: '·', hex: '#F0FFF0', name: 'HoneyDew' },
            { symbol: '¸', hex: '#F5FFFA', name: 'MintCream' },
            { symbol: '¹', hex: '#F0FFFF', name: 'Azure' },
            { symbol: 'º', hex: '#F0F8FF', name: 'AliceBlue' },
            { symbol: '»', hex: '#F8F8FF', name: 'GhostWhite' },
            { symbol: '¼', hex: '#F5F5F5', name: 'WhiteSmoke' },
            { symbol: '½', hex: '#FFF5EE', name: 'SeaShell' },
            { symbol: '¾', hex: '#F5F5DC', name: 'Beige' },
            { symbol: '¿', hex: '#FDF5E6', name: 'OldLace' },
            { symbol: 'À', hex: '#FFFAF0', name: 'FloralWhite' },
            { symbol: 'Á', hex: '#FFFFF0', name: 'Ivory' },
            { symbol: 'Â', hex: '#FAEBD7', name: 'AntiqueWhite' },
            { symbol: 'Ã', hex: '#FAF0E6', name: 'Linen' },
            { symbol: 'Ä', hex: '#FFF0F5', name: 'LavenderBlush' },
            { symbol: 'Å', hex: '#FFE4E1', name: 'MistyRose' },

            // Brown Colors
            { symbol: '£', hex: '#FFF8DC', name: 'Cornsilk' },
            { symbol: '¤', hex: '#FFEBCD', name: 'BlanchedAlmond' },
            { symbol: '¥', hex: '#FFE4C4', name: 'Bisque' },
            { symbol: '¦', hex: '#FFDEAD', name: 'NavajoWhite' },
            { symbol: '§', hex: '#F5DEB3', name: 'Wheat' },
            { symbol: '¨', hex: '#DEB887', name: 'BurlyWood' },
            { symbol: '©', hex: '#D2B48C', name: 'Tan' },
            { symbol: 'ª', hex: '#BC8F8F', name: 'RosyBrown' },
            { symbol: '«', hex: '#F4A460', name: 'SandyBrown' },
            { symbol: '¬', hex: '#DAA520', name: 'GoldenRod' },
            { symbol: '­', hex: '#B8860B', name: 'DarkGoldenRod' },
            { symbol: '®', hex: '#CD853F', name: 'Peru' },
            { symbol: '¯', hex: '#D2691E', name: 'Chocolate' },
            { symbol: '°', hex: '#808000', name: 'Olive' },
            { symbol: '±', hex: '#8B4513', name: 'SaddleBrown' },
            { symbol: '²', hex: '#A0522D', name: 'Sienna' },
            { symbol: '³', hex: '#A52A2A', name: 'Brown' },
            { symbol: '´', hex: '#800000', name: 'Maroon' },

            // Grey Colors
            { symbol: 'Æ', hex: '#DCDCDC', name: 'Gainsboro' },
            { symbol: 'Ç', hex: '#D3D3D3', name: 'LightGray' },
            { symbol: 'È', hex: '#C0C0C0', name: 'Silver' },
            { symbol: 'É', hex: '#A9A9A9', name: 'DarkGray' },
            { symbol: 'Ê', hex: '#696969', name: 'DimGray' },
            { symbol: 'Ë', hex: '#808080', name: 'Gray' },
            { symbol: 'Ì', hex: '#778899', name: 'LightSlateGray' },
            { symbol: 'Í', hex: '#708090', name: 'SlateGray' },
            { symbol: 'Î', hex: '#2F4F4F', name: 'DarkSlateGray' },
            { symbol: 'Ñ', hex: '#000000', name: 'Black' },

            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' },

        ],
        crayola008: [
            { symbol: 'A', hex: '#EE204D', name: 'Red' },
            { symbol: 'B', hex: '#1F75FE', name: 'Blue' },
            { symbol: 'C', hex: '#1CAC78', name: 'Green' },
            { symbol: 'D', hex: '#FCE883', name: 'Yellow' },
            { symbol: 'E', hex: '#232323', name: 'Black' },
            { symbol: 'F', hex: '#B4674D', name: 'Brown' },
            { symbol: 'G', hex: '#FF7538', name: 'Orange' },
            { symbol: 'H', hex: '#926EAE', name: 'Violet' },
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' },
        ],
    };

    static currentPaletteName = 'default';
    static errorResult = { symbol: 'Ø', hex: '#00000000', name: 'Transparent' };

    // Get the current palette
    static getPallet() {
        return this.palettes[this.currentPaletteName];
    }

    // Set the active palette
    static setPalette(name) {
        if (!this.palettes[name]) {
            console.error(`Palette "${name}" not found.`);
            return false;
        }
        this.currentPaletteName = name;
        return true;
    }

    // Get the length of the current palette
    static getLength() {
        const palette = this.getPallet(); // Use current palette
        return palette.length;
    }

    // Method to display all details of the current palette in the textarea
    static getPaletteDetails() {

        // Clear the existing content
        let value = '';

        // Get the current palette
        const palette = this.getPallet();

        // Iterate through the palette and add details to the textarea
        palette.forEach((pallet, index) => {
            value += `${index}   ${pallet.symbol}   ${pallet.hex}  ${pallet.name}\n`;
        });
        return value;
    }

    // Get an item by its index
    static getByIndex(index) {
        const palette = this.getPallet(); // Use current palette
        if (index < 0 || index >= palette.length) {
            console.error(`Index out of bounds: ${index}`);
            return SpritePallets.errorResult;
        }
        return palette[index];
    }

    // Get an item by its symbol
    static getBySymbol(symbol) {
        const palette = this.getPallet(); // Use current palette

        // Validate that symbol is a non-empty string and a single ASCII character
        if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
            console.error("Invalid symbol provided:", symbol);
            result = SpritePallets.errorResult;
        }


        // Search the palette for the symbol
        let result = palette.find(item => item.symbol === symbol);

        if (!result) {
            console.error(`Symbol not found:'${symbol}'`);
            result = SpritePallets.errorResult;
        }

        return result;
    }

    // Get an item by its hex value
    static getByHex(hex) {
        const palette = this.getPallet(); // Use current palette
        const result = palette.find(item => item.hex.toLowerCase() === hex.toLowerCase());
        if (!result) {
            console.error(`Hex not found: ${hex}`);
            return SpritePallets.errorResult;
        }
        return result;
    }

    // Dump the current palette to the console
    static dumpPallet() {
        try {
            const paletteName = this.currentPaletteName; // Use the current active palette name
            const palette = this.getPallet(); // Retrieve the palette

            if (!Array.isArray(palette)) {
                throw new Error(`Palette "${paletteName}" does not exist or is not an array.`);
            }

            // Iterate through the palette and display all details
            console.log(`Details of "${paletteName}" palette:`);
            palette.forEach((item, index) => {
                console.log(`Index: ${index}, Symbol: ${item.symbol}, Hex: ${item.hex}, Name: ${item.name}`);
            });

        } catch (error) {
            console.error(`Failed to retrieve details for palette "${this.currentPaletteName}":`, error);
        }
    }

}

export default SpritePallets;