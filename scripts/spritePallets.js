// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// spritePallets.js

/**
 * You can now access both the hex color and its name, like this:
 
console.log(SpritePallets.default['!'].hex); // Outputs: #FFC0CB
console.log(SpritePallets.default['!'].name); // Outputs: Pink

 */
class SpritePallets {
    static default = {
        // Pink Colors
        '!': { hex: '#FFC0CB', name: 'Pink' },
        '"': { hex: '#FFB6C1', name: 'LightPink' },
        '#': { hex: '#FF69B4', name: 'HotPink' },
        '$': { hex: '#FF1493', name: 'DeepPink' },
        '%': { hex: '#DB7093', name: 'PaleVioletRed' },
        '&': { hex: '#C71585', name: 'MediumVioletRed' },

        // Red Colors
        ':': { hex: '#FFA07A', name: 'LightSalmon' },
        ';': { hex: '#FA8072', name: 'Salmon' },
        '<': { hex: '#E9967A', name: 'DarkSalmon' },
        '=': { hex: '#F08080', name: 'LightCoral' },
        '>': { hex: '#CD5C5C', name: 'IndianRed' },
        '?': { hex: '#DC143C', name: 'Crimson' },
        '@': { hex: '#FF0000', name: 'Red' },
        'A': { hex: '#B22222', name: 'FireBrick' },
        'B': { hex: '#8B0000', name: 'DarkRed' },

        // Orange Colors
        'C': { hex: '#FFA500', name: 'Orange' },
        'D': { hex: '#FF8C00', name: 'DarkOrange' },
        'E': { hex: '#FF7F50', name: 'Coral' },
        'F': { hex: '#FF6347', name: 'Tomato' },
        'G': { hex: '#FF4500', name: 'OrangeRed' },

        // Yellow Colors
        'H': { hex: '#FFD700', name: 'Gold' },
        'I': { hex: '#FFFF00', name: 'Yellow' },
        'J': { hex: '#FFFFE0', name: 'LightYellow' },
        'K': { hex: '#FFFACD', name: 'LemonChiffon' },
        'L': { hex: '#FAFAD2', name: 'LightGoldenRodYellow' },
        'M': { hex: '#FFEFD5', name: 'PapayaWhip' },
        'N': { hex: '#FFE4B5', name: 'Moccasin' },
        'O': { hex: '#FFDAB9', name: 'PeachPuff' },
        'P': { hex: '#EEE8AA', name: 'PaleGoldenRod' },
        'Q': { hex: '#F0E68C', name: 'Khaki' },
        'R': { hex: '#BDB76B', name: 'DarkKhaki' },

        // Green Colors
        'S': { hex: '#ADFF2F', name: 'GreenYellow' },
        'T': { hex: '#7FFF00', name: 'Chartreuse' },
        'U': { hex: '#7CFC00', name: 'LawnGreen' },
        'V': { hex: '#00FF00', name: 'Lime' },
        'W': { hex: '#32CD32', name: 'LimeGreen' },
        'X': { hex: '#98FB98', name: 'PaleGreen' },
        'Y': { hex: '#90EE90', name: 'LightGreen' },
        'Z': { hex: '#00FA9A', name: 'MediumSpringGreen' },
        '[': { hex: '#00FF7F', name: 'SpringGreen' },
        'Ù': { hex: '#3CB371', name: 'MediumSeaGreen' },
        ']': { hex: '#2E8B57', name: 'SeaGreen' },
        '^': { hex: '#228B22', name: 'ForestGreen' },
        '_': { hex: '#008000', name: 'Green' },
        '`': { hex: '#006400', name: 'DarkGreen' },
        'a': { hex: '#9ACD32', name: 'YellowGreen' },
        'b': { hex: '#6B8E23', name: 'OliveDrab' },
        'c': { hex: '#556B2F', name: 'DarkOliveGreen' },
        'd': { hex: '#66CDAA', name: 'MediumAquaMarine' },
        'e': { hex: '#8FBC8F', name: 'DarkSeaGreen' },
        'f': { hex: '#20B2AA', name: 'LightSeaGreen' },
        'g': { hex: '#008B8B', name: 'DarkCyan' },
        'h': { hex: '#008080', name: 'Teal' },

        // Cyan Colors
        'i': { hex: '#00FFFF', name: 'Aqua' },
        'j': { hex: '#00FFFF', name: 'Cyan' },
        'k': { hex: '#E0FFFF', name: 'LightCyan' },
        'l': { hex: '#AFEEEE', name: 'PaleTurquoise' },
        'm': { hex: '#7FFFD4', name: 'Aquamarine' },
        'n': { hex: '#40E0D0', name: 'Turquoise' },
        'o': { hex: '#48D1CC', name: 'MediumTurquoise' },
        'p': { hex: '#00CED1', name: 'DarkTurquoise' },

        // Blue Colors
        'q': { hex: '#5F9EA0', name: 'CadetBlue' },
        'r': { hex: '#4682B4', name: 'SteelBlue' },
        's': { hex: '#B0C4DE', name: 'LightSteelBlue' },
        't': { hex: '#ADD8E6', name: 'LightBlue' },
        'u': { hex: '#B0E0E6', name: 'PowderBlue' },
        'v': { hex: '#87CEFA', name: 'LightSkyBlue' },
        'w': { hex: '#87CEEB', name: 'SkyBlue' },
        'x': { hex: '#6495ED', name: 'CornflowerBlue' },
        'y': { hex: '#00BFFF', name: 'DeepSkyBlue' },
        'z': { hex: '#1E90FF', name: 'DodgerBlue' },
        '{': { hex: '#4169E1', name: 'RoyalBlue' },
        '|': { hex: '#0000FF', name: 'Blue' },
        '}': { hex: '#0000CD', name: 'MediumBlue' },
        '~': { hex: '#00008B', name: 'DarkBlue' },
        '¡': { hex: '#000080', name: 'Navy' },
        '¢': { hex: '#191970', name: 'MidnightBlue' },

        // Purple Colors
        "'": { hex: '#E6E6FA', name: 'Lavender' },
        '(': { hex: '#D8BFD8', name: 'Thistle' },
        ')': { hex: '#DDA0DD', name: 'Plum' },
        '*': { hex: '#DA70D6', name: 'Orchid' },
        '+': { hex: '#EE82EE', name: 'Violet' },
        ',': { hex: '#FF00FF', name: 'Fuchsia' },
        '-': { hex: '#FF00FF', name: 'Magenta' },
        '.': { hex: '#BA55D3', name: 'MediumOrchid' },
        '/': { hex: '#9932CC', name: 'DarkOrchid' },
        '0': { hex: '#9400D3', name: 'DarkViolet' },
        '1': { hex: '#8A2BE2', name: 'BlueViolet' },
        '2': { hex: '#8B008B', name: 'DarkMagenta' },
        '3': { hex: '#800080', name: 'Purple' },
        '4': { hex: '#9370DB', name: 'MediumPurple' },
        '5': { hex: '#7B68EE', name: 'MediumSlateBlue' },
        '6': { hex: '#6A5ACD', name: 'SlateBlue' },
        '7': { hex: '#483D8B', name: 'DarkSlateBlue' },
        '8': { hex: '#663399', name: 'RebeccaPurple' },
        '9': { hex: '#4B0082', name: 'Indigo' },

        // White Colors
        'µ': { hex: '#FFFFFF', name: 'White' },
        '¶': { hex: '#FFFAFA', name: 'Snow' },
        '·': { hex: '#F0FFF0', name: 'HoneyDew' },
        '¸': { hex: '#F5FFFA', name: 'MintCream' },
        '¹': { hex: '#F0FFFF', name: 'Azure' },
        'º': { hex: '#F0F8FF', name: 'AliceBlue' },
        '»': { hex: '#F8F8FF', name: 'GhostWhite' },
        '¼': { hex: '#F5F5F5', name: 'WhiteSmoke' },
        '½': { hex: '#FFF5EE', name: 'SeaShell' },
        '¾': { hex: '#F5F5DC', name: 'Beige' },
        '¿': { hex: '#FDF5E6', name: 'OldLace' },
        'À': { hex: '#FFFAF0', name: 'FloralWhite' },
        'Á': { hex: '#FFFFF0', name: 'Ivory' },
        'Â': { hex: '#FAEBD7', name: 'AntiqueWhite' },
        'Ã': { hex: '#FAF0E6', name: 'Linen' },
        'Ä': { hex: '#FFF0F5', name: 'LavenderBlush' },
        'Å': { hex: '#FFE4E1', name: 'MistyRose' },

        // Brown Colors
        '£': { hex: '#FFF8DC', name: 'Cornsilk' },
        '¤': { hex: '#FFEBCD', name: 'BlanchedAlmond' },
        '¥': { hex: '#FFE4C4', name: 'Bisque' },
        '¦': { hex: '#FFDEAD', name: 'NavajoWhite' },
        '§': { hex: '#F5DEB3', name: 'Wheat' },
        '¨': { hex: '#DEB887', name: 'BurlyWood' },
        '©': { hex: '#D2B48C', name: 'Tan' },
        'ª': { hex: '#BC8F8F', name: 'RosyBrown' },
        '«': { hex: '#F4A460', name: 'SandyBrown' },
        '¬': { hex: '#DAA520', name: 'GoldenRod' },
        '­': { hex: '#B8860B', name: 'DarkGoldenRod' },
        '®': { hex: '#CD853F', name: 'Peru' },
        '¯': { hex: '#D2691E', name: 'Chocolate' },
        '°': { hex: '#808000', name: 'Olive' },
        '±': { hex: '#8B4513', name: 'SaddleBrown' },
        '²': { hex: '#A0522D', name: 'Sienna' },
        '³': { hex: '#A52A2A', name: 'Brown' },
        '´': { hex: '#800000', name: 'Maroon' },

        // Grey Colors
        'Æ': { hex: '#DCDCDC', name: 'Gainsboro' },
        'Ç': { hex: '#D3D3D3', name: 'LightGray' },
        'È': { hex: '#C0C0C0', name: 'Silver' },
        'É': { hex: '#A9A9A9', name: 'DarkGray' },
        'Ê': { hex: '#696969', name: 'DimGray' },
        'Ë': { hex: '#808080', name: 'Gray' },
        'Ì': { hex: '#778899', name: 'LightSlateGray' },
        'Í': { hex: '#708090', name: 'SlateGray' },
        'Î': { hex: '#2F4F4F', name: 'DarkSlateGray' },
        'Ñ': { hex: '#000000', name: 'Black' },

        // Transparent
        'Ø': { hex: '#00000000', name: 'Transparent' }
    };
    
}

export default SpritePallets;
