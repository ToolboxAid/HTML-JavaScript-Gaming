// ToolboxAid.com
// David Quesenberry
// 12/28/2024
// spritePallets.js

/** Reference colors
 * Crayola Colors
 * https://www.crayola.com/explore-colors/
 * https://toolboxaid.com/programming/html/crayola-colors/
 * https://www.w3schools.com/colors/colors_crayola.asp
 * https://www.jennyscrayoncollection.com/2017/10/complete-list-of-current-crayola-crayon.html
 * 
 */
class SpritePalettes {

    static currentPaletteName = 'default';
    static transparentColor = "#00000000";
    static errorResult = { symbol: 'Ø', hex: '#00000000', name: 'Transparent' };

    static palettes = {
        default: [
            { symbol: '!', hex: '#F08080', name: 'LightCoral' }, 		// color #'0' ascii'33'
            { symbol: '"', hex: '#CD5C5C', name: 'IndianRed' }, 		// color #'1' ascii'34'
            { symbol: '#', hex: '#FF0000', name: 'Red' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#B22222', name: 'FireBrick' }, 		// color #'3' ascii'36'
            { symbol: '%', hex: '#8B0000', name: 'DarkRed' }, 		// color #'4' ascii'37'
            { symbol: '&', hex: '#FFFFFF', name: 'White' }, 		    // color #'5' ascii'38'
            { symbol: '(', hex: '#FFFAFA', name: 'Snow' }, 		    // color #'6' ascii'40'
            { symbol: ')', hex: '#F5F5F5', name: 'WhiteSmoke' }, 		// color #'7' ascii'41'
            { symbol: '*', hex: '#BC8F8F', name: 'RosyBrown' }, 		// color #'8' ascii'42'
            { symbol: '+', hex: '#A52A2A', name: 'Brown' }, 		    // color #'9' ascii'43'
            { symbol: ',', hex: '#800000', name: 'Maroon' }, 		    // color #'10' ascii'44'
            { symbol: '-', hex: '#DCDCDC', name: 'Gainsboro' }, 		// color #'11' ascii'45'
            { symbol: '.', hex: '#D3D3D3', name: 'LightGray' }, 		// color #'12' ascii'46'
            { symbol: '/', hex: '#C0C0C0', name: 'Silver' }, 		    // color #'13' ascii'47'
            { symbol: '0', hex: '#A9A9A9', name: 'DarkGray' }, 		// color #'14' ascii'48'
            { symbol: '1', hex: '#696969', name: 'DimGray' }, 		// color #'15' ascii'49'
            { symbol: '2', hex: '#808080', name: 'Gray' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#000000', name: 'Black' }, 		    // color #'17' ascii'51'
            { symbol: '3', hex: '#FFE4E1', name: 'MistyRose' }, 		// color #'18' ascii'51'
            { symbol: '4', hex: '#FA8072', name: 'Salmon' }, 		    // color #'19' ascii'52'
            { symbol: '5', hex: '#FF6347', name: 'Tomato' }, 		    // color #'20' ascii'53'
            { symbol: '6', hex: '#E9967A', name: 'DarkSalmon' }, 		// color #'21' ascii'54'
            { symbol: '7', hex: '#FF7F50', name: 'Coral' }, 		    // color #'22' ascii'55'
            { symbol: '8', hex: '#FF4500', name: 'OrangeRed' }, 		// color #'23' ascii'56'
            { symbol: '9', hex: '#FFA07A', name: 'LightSalmon' }, 	// color #'24' ascii'57'
            { symbol: ':', hex: '#A0522D', name: 'Sienna' }, 		    // color #'25' ascii'58'
            { symbol: ';', hex: '#FFF5EE', name: 'SeaShell' }, 		// color #'26' ascii'59'
            { symbol: '<', hex: '#D2691E', name: 'Chocolate' }, 		// color #'27' ascii'60'
            { symbol: '=', hex: '#8B4513', name: 'SaddleBrown' }, 	// color #'28' ascii'61'
            { symbol: '>', hex: '#F4A460', name: 'SandyBrown' }, 		// color #'29' ascii'62'
            { symbol: '?', hex: '#FFDAB9', name: 'PeachPuff' }, 		// color #'30' ascii'63'
            { symbol: '@', hex: '#CD853F', name: 'Peru' }, 		    // color #'31' ascii'64'
            { symbol: 'A', hex: '#FAF0E6', name: 'Linen' }, 		    // color #'32' ascii'65'
            { symbol: 'B', hex: '#FFE4C4', name: 'Bisque' }, 		    // color #'33' ascii'66'
            { symbol: 'C', hex: '#FF8C00', name: 'DarkOrange' }, 		// color #'34' ascii'67'
            { symbol: 'D', hex: '#DEB887', name: 'BurlyWood' }, 		// color #'35' ascii'68'
            { symbol: 'E', hex: '#FAEBD7', name: 'AntiqueWhite' }, 	// color #'36' ascii'69'
            { symbol: 'F', hex: '#D2B48C', name: 'Tan' }, 		    // color #'37' ascii'70'
            { symbol: 'G', hex: '#FFDEAD', name: 'NavajoWhite' }, 	// color #'38' ascii'71'
            { symbol: 'H', hex: '#FFEBCD', name: 'BlanchedAlmond' }, 	// color #'39' ascii'72'
            { symbol: 'I', hex: '#FFEFD5', name: 'PapayaWhip' }, 		// color #'40' ascii'73'
            { symbol: 'J', hex: '#FFE4B5', name: 'Moccasin' }, 		// color #'41' ascii'74'
            { symbol: 'K', hex: '#FFA500', name: 'Orange' }, 		    // color #'42' ascii'75'
            { symbol: 'L', hex: '#F5DEB3', name: 'Wheat' }, 		    // color #'43' ascii'76'
            { symbol: 'M', hex: '#FDF5E6', name: 'OldLace' }, 		// color #'44' ascii'77'
            { symbol: 'N', hex: '#FFFAF0', name: 'FloralWhite' }, 	// color #'45' ascii'78'
            { symbol: 'O', hex: '#B8860B', name: 'DarkGoldenRod' }, 	// color #'46' ascii'79'
            { symbol: 'P', hex: '#DAA520', name: 'GoldenRod' }, 		// color #'47' ascii'80'
            { symbol: 'Q', hex: '#FFF8DC', name: 'Cornsilk' }, 		// color #'48' ascii'81'
            { symbol: 'R', hex: '#FFD700', name: 'Gold' }, 		    // color #'49' ascii'82'
            { symbol: 'S', hex: '#FFFACD', name: 'LemonChiffon' }, 	// color #'50' ascii'83'
            { symbol: 'T', hex: '#F0E68C', name: 'Khaki' }, 		    // color #'51' ascii'84'
            { symbol: 'U', hex: '#EEE8AA', name: 'PaleGoldenRod' }, 	// color #'52' ascii'85'
            { symbol: 'V', hex: '#BDB76B', name: 'DarkKhaki' }, 		// color #'53' ascii'86'
            { symbol: 'W', hex: '#FFFF00', name: 'Yellow' }, 		    // color #'54' ascii'87'
            { symbol: 'X', hex: '#FFFFE0', name: 'LightYellow' }, 	// color #'55' ascii'88'
            { symbol: 'Y', hex: '#FAFAD2', name: 'LightGoldenRodYellow' },// r #'56' ascii'89'
            { symbol: 'Z', hex: '#F5F5DC', name: 'Beige' }, 		    // color #'57' ascii'90'
            { symbol: '[', hex: '#FFFFF0', name: 'Ivory' }, 		    // color #'58' ascii'91'
            { symbol: ']', hex: '#808000', name: 'Olive' }, 		    // color #'59' ascii'93'
            { symbol: '^', hex: '#6B8E23', name: 'OliveDrab' }, 		// color #'60' ascii'94'
            { symbol: '_', hex: '#9ACD32', name: 'YellowGreen' }, 	// color #'61' ascii'95'
            { symbol: '`', hex: '#556B2F', name: 'DarkOliveGreen' }, 	// color #'62' ascii'96'
            { symbol: 'a', hex: '#ADFF2F', name: 'GreenYellow' }, 	// color #'63' ascii'97'
            { symbol: 'b', hex: '#7FFF00', name: 'Chartreuse' }, 		// color #'64' ascii'98'
            { symbol: 'c', hex: '#7CFC00', name: 'LawnGreen' }, 		// color #'65' ascii'99'
            { symbol: 'd', hex: '#00FF00', name: 'Lime' }, 		    // color #'66' ascii'100'
            { symbol: 'e', hex: '#32CD32', name: 'LimeGreen' }, 		// color #'67' ascii'101'
            { symbol: 'f', hex: '#98FB98', name: 'PaleGreen' }, 		// color #'68' ascii'102'
            { symbol: 'g', hex: '#90EE90', name: 'LightGreen' }, 		// color #'69' ascii'103'
            { symbol: 'h', hex: '#228B22', name: 'ForestGreen' }, 	// color #'70' ascii'104'
            { symbol: 'i', hex: '#008000', name: 'Green' }, 		    // color #'71' ascii'105'
            { symbol: 'j', hex: '#006400', name: 'DarkGreen' }, 		// color #'72' ascii'106'
            { symbol: 'k', hex: '#8FBC8F', name: 'DarkSeaGreen' }, 	// color #'73' ascii'107'
            { symbol: 'l', hex: '#F0FFF0', name: 'HoneyDew' }, 		// color #'74' ascii'108'
            { symbol: 'm', hex: '#2E8B57', name: 'SeaGreen' }, 		// color #'75' ascii'109'
            { symbol: 'n', hex: '#3CB371', name: 'MediumSeaGreen' }, 	// color #'76' ascii'110'
            { symbol: 'o', hex: '#00FF7F', name: 'SpringGreen' }, 	// color #'77' ascii'111'
            { symbol: 'p', hex: '#F5FFFA', name: 'MintCream' }, 		// color #'78' ascii'112'
            { symbol: 'q', hex: '#00FA9A', name: 'MediumSpringGreen' },//color #'79' ascii'113'
            { symbol: 'r', hex: '#66CDAA', name: 'MediumAquaMarine' },// color #'80' ascii'114'
            { symbol: 's', hex: '#7FFFD4', name: 'Aquamarine' }, 		// color #'81' ascii'115'
            { symbol: 't', hex: '#40E0D0', name: 'Turquoise' }, 		// color #'82' ascii'116'
            { symbol: 'u', hex: '#20B2AA', name: 'LightSeaGreen' }, 	// color #'83' ascii'117'
            { symbol: 'v', hex: '#48D1CC', name: 'MediumTurquoise' }, // color #'84' ascii'118'
            { symbol: 'w', hex: '#008B8B', name: 'DarkCyan' }, 		// color #'85' ascii'119'
            { symbol: 'x', hex: '#008080', name: 'Teal' }, 		    // color #'86' ascii'120'
            { symbol: 'y', hex: '#00FFFF', name: 'Aqua' }, 		    // color #'87' ascii'121'
            { symbol: 'z', hex: '#00FFFF', name: 'Cyan' }, 		    // color #'88' ascii'122'
            { symbol: '{', hex: '#E0FFFF', name: 'LightCyan' }, 		// color #'89' ascii'123'
            { symbol: '|', hex: '#AFEEEE', name: 'PaleTurquoise' }, 	// color #'90' ascii'124'
            { symbol: '}', hex: '#F0FFFF', name: 'Azure' }, 		    // color #'91' ascii'125'
            { symbol: '~', hex: '#2F4F4F', name: 'DarkSlateGray' }, 	// color #'92' ascii'126'
            { symbol: '¡', hex: '#00CED1', name: 'DarkTurquoise' }, 	// color #'93' ascii'161'
            { symbol: '¢', hex: '#5F9EA0', name: 'CadetBlue' }, 		// color #'94' ascii'162'
            { symbol: '£', hex: '#B0E0E6', name: 'PowderBlue' }, 		// color #'95' ascii'163'
            { symbol: '¤', hex: '#ADD8E6', name: 'LightBlue' }, 		// color #'96' ascii'164'
            { symbol: '¥', hex: '#00BFFF', name: 'DeepSkyBlue' }, 	// color #'97' ascii'165'
            { symbol: '¦', hex: '#87CEEB', name: 'SkyBlue' }, 		// color #'98' ascii'166'
            { symbol: '§', hex: '#87CEFA', name: 'LightSkyBlue' }, 	// color #'99' ascii'167'
            { symbol: '¨', hex: '#4682B4', name: 'SteelBlue' }, 		// color #'100' ascii'168'
            { symbol: '©', hex: '#F0F8FF', name: 'AliceBlue' }, 		// color #'101' ascii'169'
            { symbol: 'ª', hex: '#1E90FF', name: 'DodgerBlue' }, 		// color #'102' ascii'170'
            { symbol: '«', hex: '#778899', name: 'LightSlateGray' }, 	// color #'103' ascii'171'
            { symbol: '¬', hex: '#708090', name: 'SlateGray' }, 		// color #'104' ascii'172'
            { symbol: '­', hex: '#B0C4DE', name: 'LightSteelBlue' }, 	 // color #'105' ascii'173'
            { symbol: '®', hex: '#6495ED', name: 'CornflowerBlue' }, 	// color #'106' ascii'174'
            { symbol: '¯', hex: '#4169E1', name: 'RoyalBlue' }, 		// color #'107' ascii'175'
            { symbol: '°', hex: '#0000FF', name: 'Blue' }, 		    // color #'108' ascii'176'
            { symbol: '±', hex: '#0000CD', name: 'MediumBlue' }, 		// color #'109' ascii'177'
            { symbol: '²', hex: '#00008B', name: 'DarkBlue' }, 		// color #'110' ascii'178'
            { symbol: '³', hex: '#000080', name: 'Navy' }, 		    // color #'111' ascii'179'
            { symbol: '´', hex: '#191970', name: 'MidnightBlue' }, 	// color #'112' ascii'180'
            { symbol: 'µ', hex: '#E6E6FA', name: 'Lavender' }, 		// color #'113' ascii'181'
            { symbol: '¶', hex: '#F8F8FF', name: 'GhostWhite' }, 		// color #'114' ascii'182'
            { symbol: '·', hex: '#6A5ACD', name: 'SlateBlue' }, 		// color #'115' ascii'183'
            { symbol: '¸', hex: '#483D8B', name: 'DarkSlateBlue' }, 	// color #'116' ascii'184'
            { symbol: '¹', hex: '#7B68EE', name: 'MediumSlateBlue' }, // color #'117' ascii'185'
            { symbol: 'º', hex: '#9370DB', name: 'MediumPurple' }, 	// color #'118' ascii'186'
            { symbol: '»', hex: '#663399', name: 'RebeccaPurple' }, 	// color #'119' ascii'187'
            { symbol: '¼', hex: '#8A2BE2', name: 'BlueViolet' }, 		// color #'120' ascii'188'
            { symbol: '½', hex: '#4B0082', name: 'Indigo' }, 		    // color #'121' ascii'189'
            { symbol: '¾', hex: '#9932CC', name: 'DarkOrchid' }, 		// color #'122' ascii'190'
            { symbol: '¿', hex: '#9400D3', name: 'DarkViolet' }, 		// color #'123' ascii'191'
            { symbol: 'À', hex: '#BA55D3', name: 'MediumOrchid' }, 	// color #'124' ascii'192'
            { symbol: 'Á', hex: '#D8BFD8', name: 'Thistle' }, 		// color #'125' ascii'193'
            { symbol: 'Â', hex: '#DDA0DD', name: 'Plum' }, 		    // color #'126' ascii'194'
            { symbol: 'Ã', hex: '#EE82EE', name: 'Violet' }, 		    // color #'127' ascii'195'
            { symbol: 'Ä', hex: '#FF00FF', name: 'Magenta' }, 		// color #'128' ascii'196'
            { symbol: 'Å', hex: '#8B008B', name: 'DarkMagenta' }, 	// color #'129' ascii'197'
            { symbol: 'Æ', hex: '#800080', name: 'Purple' }, 		    // color #'130' ascii'198'
            { symbol: 'Ç', hex: '#DA70D6', name: 'Orchid' }, 		    // color #'131' ascii'199'
            { symbol: 'È', hex: '#FF00F0', name: 'Fuchsia' }, 		// color #'132' ascii'200'
            { symbol: 'É', hex: '#C71585', name: 'MediumVioletRed' }, // color #'133' ascii'201'
            { symbol: 'Ê', hex: '#FF1493', name: 'DeepPink' }, 		// color #'134' ascii'202'
            { symbol: 'Ë', hex: '#FF69B4', name: 'HotPink' }, 		// color #'135' ascii'203'
            { symbol: 'Ì', hex: '#FFF0F5', name: 'LavenderBlush' }, 	// color #'136' ascii'204'
            { symbol: 'Í', hex: '#DB7093', name: 'PaleVioletRed' }, 	// color #'137' ascii'205'
            { symbol: 'Î', hex: '#DC143C', name: 'Crimson' }, 		// color #'138' ascii'206'
            { symbol: 'Ï', hex: '#FFC0CB', name: 'Pink' }, 		    // color #'139' ascii'207'
            { symbol: 'Ð', hex: '#FFB6C1', name: 'LightPink' }, 		// color #'140' ascii'208'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 
        ],

        // Crayola Crayon colors by package
        crayola008: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		 // color #'0' ascii'33'
            { symbol: '#', hex: '#B4674D', name: 'Brown' }, 		 // color #'2' ascii'35'
            { symbol: '$', hex: '#FF7538', name: 'Orange' }, 		 // color #'3' ascii'36'
            { symbol: '%', hex: '#FCE883', name: 'Yellow' }, 		 // color #'4' ascii'37'
            { symbol: '&', hex: '#1CAC78', name: 'Green' }, 		 // color #'5' ascii'38'
            { symbol: '(', hex: '#1F75FE', name: 'Blue' }, 		 // color #'6' ascii'40'
            { symbol: ')', hex: '#926EAE', name: 'Violet' }, 		 // color #'7' ascii'41'
            { symbol: '*', hex: '#EE204D', name: 'Red' }, 		 // color #'8' ascii'42'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST -->            
        ],
        crayola016: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		    // color #'0' ascii'33'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#FF5349', name: 'Red Orange' }, 		// color #'3' ascii'36'
            { symbol: '%', hex: '#B4674D', name: 'Brown' }, 		    // color #'4' ascii'37'
            { symbol: '&', hex: '#FF7538', name: 'Orange' }, 		    // color #'5' ascii'38'
            { symbol: '(', hex: '#FFB653', name: 'Yellow Orange' }, 	// color #'6' ascii'40'
            { symbol: ')', hex: '#FCE883', name: 'Yellow' }, 		    // color #'7' ascii'41'
            { symbol: '*', hex: '#C5E384', name: 'Yellow Green' }, 	// color #'8' ascii'42'
            { symbol: '+', hex: '#1CAC78', name: 'Green' }, 		    // color #'9' ascii'43'
            { symbol: ',', hex: '#199EBD', name: 'Blue Green' }, 		// color #'10' ascii'44'
            { symbol: '-', hex: '#1F75FE', name: 'Blue' }, 		    // color #'11' ascii'45'
            { symbol: '.', hex: '#7366BD', name: 'Blue Violet' }, 	// color #'12' ascii'46'
            { symbol: '/', hex: '#926EAE', name: 'Violet' }, 		    // color #'13' ascii'47'
            { symbol: '0', hex: '#C0448F', name: 'Red Violet' }, 		// color #'14' ascii'48'
            { symbol: '1', hex: '#FFAACC', name: 'Carnation Pink' }, 	// color #'15' ascii'49'
            { symbol: '2', hex: '#EE204D', name: 'Red' }, 		    // color #'16' ascii'50'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 

        ],
        crayola024: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		    // color #'0' ascii'33'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#FF5349', name: 'Red Orange' }, 		// color #'3' ascii'36'
            { symbol: '%', hex: '#B4674D', name: 'Brown' }, 		    // color #'4' ascii'37'
            { symbol: '&', hex: '#FF7538', name: 'Orange' }, 		    // color #'5' ascii'38'
            { symbol: '(', hex: '#FDD9B5', name: 'Apricot' }, 		// color #'6' ascii'40'
            { symbol: ')', hex: '#95918C', name: 'Gray' }, 		    // color #'7' ascii'41'
            { symbol: '*', hex: '#FFB653', name: 'Yellow Orange' }, 	// color #'8' ascii'42'
            { symbol: '+', hex: '#FDDB6D', name: 'Dandelion' }, 		// color #'9' ascii'43'
            { symbol: ',', hex: '#FCE883', name: 'Yellow' }, 		    // color #'10' ascii'44'
            { symbol: '-', hex: '#F0E891', name: 'Green Yellow' }, 	// color #'11' ascii'45'
            { symbol: '.', hex: '#C5E384', name: 'Yellow Green' }, 	// color #'12' ascii'46'
            { symbol: '/', hex: '#1CAC78', name: 'Green' }, 		    // color #'13' ascii'47'
            { symbol: '0', hex: '#199EBD', name: 'Blue Green' }, 		// color #'14' ascii'48'
            { symbol: '1', hex: '#1DACD6', name: 'Cerulean' }, 		// color #'15' ascii'49'
            { symbol: '2', hex: '#1F75FE', name: 'Blue' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#5D76CB', name: 'Indigo' }, 		    // color #'17' ascii'51'
            { symbol: '4', hex: '#7366BD', name: 'Blue Violet' }, 	// color #'18' ascii'52'
            { symbol: '5', hex: '#926EAE', name: 'Violet' }, 		    // color #'19' ascii'53'
            { symbol: '6', hex: '#C0448F', name: 'Red Violet' }, 		// color #'20' ascii'54'
            { symbol: '7', hex: '#FFAACC', name: 'Carnation Pink' }, 	// color #'21' ascii'55'
            { symbol: '8', hex: '#F75394', name: 'Violet Red' }, 		// color #'22' ascii'56'
            { symbol: '9', hex: '#EE204D', name: 'Red' }, 		    // color #'23' ascii'57'
            { symbol: ':', hex: '#FC2847', name: 'Scarlet' }, 		// color #'24' ascii'58'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 
        ],
        crayola032: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		    // color #'0' ascii'33'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#BC5D58', name: 'Chestnut' }, 		    // color #'3' ascii'36'
            { symbol: '%', hex: '#FF5349', name: 'Red Orange' }, 		// color #'4' ascii'37'
            { symbol: '&', hex: '#FDBCB4', name: 'Melon' }, 		    // color #'5' ascii'38'
            { symbol: '(', hex: '#B4674D', name: 'Brown' }, 		    // color #'6' ascii'40'
            { symbol: ')', hex: '#FF7538', name: 'Orange' }, 		    // color #'7' ascii'41'
            { symbol: '*', hex: '#FAA76C', name: 'Tan' }, 		        // color #'8' ascii'42'
            { symbol: '+', hex: '#FFCFAB', name: 'Peach' }, 		    // color #'9' ascii'43'
            { symbol: ',', hex: '#FDD9B5', name: 'Apricot' }, 		    // color #'10' ascii'44'
            { symbol: '-', hex: '#95918C', name: 'Gray' }, 		        // color #'11' ascii'45'
            { symbol: '.', hex: '#DBD7D2', name: 'Timberwolf' }, 		// color #'12' ascii'46'
            { symbol: '/', hex: '#FFB653', name: 'Yellow Orange' }, 	// color #'13' ascii'47'
            { symbol: '0', hex: '#FDDB6D', name: 'Dandelion' }, 		// color #'14' ascii'48'
            { symbol: '1', hex: '#FCE883', name: 'Yellow' }, 		    // color #'15' ascii'49'
            { symbol: '2', hex: '#F0E891', name: 'Green Yellow' }, 	    // color #'16' ascii'50'
            { symbol: '3', hex: '#C5E384', name: 'Yellow Green' }, 	    // color #'17' ascii'51'
            { symbol: '4', hex: '#1CAC78', name: 'Green' }, 		    // color #'18' ascii'52'
            { symbol: '5', hex: '#80DAEB', name: 'Sky Blue' }, 		    // color #'19' ascii'53'
            { symbol: '6', hex: '#199EBD', name: 'Blue Green' }, 		// color #'20' ascii'54'
            { symbol: '7', hex: '#1DACD6', name: 'Cerulean' }, 		    // color #'21' ascii'55'
            { symbol: '8', hex: '#1F75FE', name: 'Blue' }, 		        // color #'22' ascii'56'
            { symbol: '9', hex: '#B0B7C6', name: 'Cadet Blue' }, 		// color #'23' ascii'57'
            { symbol: ':', hex: '#5D76CB', name: 'Indigo' }, 		    // color #'24' ascii'58'
            { symbol: ';', hex: '#7366BD', name: 'Blue Violet' }, 	    // color #'25' ascii'59'
            { symbol: '<', hex: '#926EAE', name: 'Violet' }, 		    // color #'26' ascii'60'
            { symbol: '=', hex: '#CDA4DE', name: 'Wisteria' }, 		    // color #'27' ascii'61'
            { symbol: '>', hex: '#C0448F', name: 'Red Violet' }, 		// color #'28' ascii'62'
            { symbol: '?', hex: '#FFAACC', name: 'Carnation Pink' }, 	// color #'29' ascii'63'
            { symbol: '@', hex: '#F75394', name: 'Violet Red' }, 		// color #'30' ascii'64'
            { symbol: 'A', hex: '#EE204D', name: 'Red' }, 		        // color #'31' ascii'65'
            { symbol: 'B', hex: '#FC2847', name: 'Scarlet' }, 		    // color #'32' ascii'66'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 

        ],
        crayola048: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		    // color #'0' ascii'33'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#CD4A4A', name: 'Mahogany' }, 		    // color #'3' ascii'36'
            { symbol: '%', hex: '#BC5D58', name: 'Chestnut' }, 		    // color #'4' ascii'37'
            { symbol: '&', hex: '#FF5349', name: 'Red Orange' }, 		// color #'5' ascii'38'
            { symbol: '(', hex: '#FDBCB4', name: 'Melon' }, 		    // color #'6' ascii'40'
            { symbol: ')', hex: '#EA7E5D', name: 'Burnt Sienna' }, 		// color #'7' ascii'41'
            { symbol: '*', hex: '#B4674D', name: 'Brown' }, 		    // color #'8' ascii'42'
            { symbol: '+', hex: '#A5694F', name: 'Sepia' }, 		    // color #'9' ascii'43'
            { symbol: ',', hex: '#FF7538', name: 'Orange' }, 		    // color #'10' ascii'44'
            { symbol: '-', hex: '#D68A59', name: 'Raw Sienna' }, 		// color #'11' ascii'45'
            { symbol: '.', hex: '#DEAA88', name: 'Tumbleweed' }, 		// color #'12' ascii'46'
            { symbol: '/', hex: '#FAA76C', name: 'Tan' }, 		        // color #'13' ascii'47'
            { symbol: '0', hex: '#FFCFAB', name: 'Peach' }, 		    // color #'14' ascii'48'
            { symbol: '1', hex: '#FFBD88', name: 'Mac & Cheese' }, 		// color #'15' ascii'49'
            { symbol: '2', hex: '#FDD9B5', name: 'Apricot' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#95918C', name: 'Gray' }, 		        // color #'17' ascii'51'
            { symbol: '4', hex: '#DBD7D2', name: 'Timberwolf' }, 		// color #'18' ascii'52'
            { symbol: '5', hex: '#FFB653', name: 'Yellow Orange' }, 	// color #'19' ascii'53'
            { symbol: '6', hex: '#FCD975', name: 'Goldenrod' }, 		// color #'20' ascii'54'
            { symbol: '7', hex: '#FDDB6D', name: 'Dandelion' }, 		// color #'21' ascii'55'
            { symbol: '8', hex: '#FCE883', name: 'Yellow' }, 		    // color #'22' ascii'56'
            { symbol: '9', hex: '#F0E891', name: 'Green Yellow' }, 		// color #'23' ascii'57'
            { symbol: ':', hex: '#ECEABE', name: 'Spring Green' }, 		// color #'24' ascii'58'
            { symbol: ';', hex: '#C5E384', name: 'Yellow Green' }, 		// color #'25' ascii'59'
            { symbol: '<', hex: '#A8E4A0', name: 'Granny Smith Apple' },// color #'26' ascii'60'
            { symbol: '=', hex: '#9FE2BF', name: 'Sea Green' }, 		// color #'27' ascii'61'
            { symbol: '>', hex: '#1CAC78', name: 'Green' }, 		    // color #'28' ascii'62'
            { symbol: '?', hex: '#80DAEB', name: 'Sky Blue' }, 		    // color #'29' ascii'63'
            { symbol: '@', hex: '#199EBD', name: 'Blue Green' }, 		// color #'30' ascii'64'
            { symbol: 'A', hex: '#1DACD6', name: 'Cerulean' }, 		    // color #'31' ascii'65'
            { symbol: 'B', hex: '#9ACEEB', name: 'Cornflower' }, 		// color #'32' ascii'66'
            { symbol: 'C', hex: '#1F75FE', name: 'Blue' }, 		        // color #'33' ascii'67'
            { symbol: 'D', hex: '#B0B7C6', name: 'Cadet Blue' }, 		// color #'34' ascii'68'
            { symbol: 'E', hex: '#5D76CB', name: 'Indigo' }, 		    // color #'35' ascii'69'
            { symbol: 'F', hex: '#BAB8C6', name: 'Olive Green' }, 		// color #'36' ascii'70'
            { symbol: 'G', hex: '#7366BD', name: 'Blue Violet' }, 		// color #'37' ascii'71'
            { symbol: 'H', hex: '#9D81BA', name: 'Purple Mauntains Mjesty' },// color #'38' ascii'72'
            { symbol: 'I', hex: '#926EAE', name: 'Violet' }, 		    // color #'39' ascii'73'
            { symbol: 'J', hex: '#CDA4DE', name: 'Wisteria' }, 		    // color #'40' ascii'74'
            { symbol: 'K', hex: '#C0448F', name: 'Red Violet' }, 		// color #'41' ascii'75'
            { symbol: 'L', hex: '#FCB4D5', name: 'Lavender' }, 		    // color #'42' ascii'76'
            { symbol: 'M', hex: '#FFAACC', name: 'Carnation Pink' }, 	// color #'43' ascii'77'
            { symbol: 'N', hex: '#F75394', name: 'Violet Red' }, 		// color #'44' ascii'78'
            { symbol: 'O', hex: '#EE204D', name: 'Red' }, 		        // color #'45' ascii'79'
            { symbol: 'P', hex: '#EF98AA', name: 'Mauvelous' }, 		// color #'46' ascii'80'
            { symbol: 'Q', hex: '#FF9BAA', name: 'Salmon' }, 		    // color #'47' ascii'81'
            { symbol: 'R', hex: '#FC2847', name: 'Scarlet' }, 		    // color #'48' ascii'82'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 

        ],
        crayola064: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		// color #'0' ascii'33'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		// color #'2' ascii'35'
            { symbol: '$', hex: '#CD4A4A', name: 'Mahogany' }, 		// color #'3' ascii'36'
            { symbol: '%', hex: '#BC5D58', name: 'Chestnut' }, 		// color #'4' ascii'37'
            { symbol: '&', hex: '#FF5349', name: 'Red Orange' }, 	// color #'5' ascii'38'
            { symbol: '(', hex: '#FD7C6E', name: 'Bittersweet' }, 	// color #'6' ascii'40'
            { symbol: ')', hex: '#FDBCB4', name: 'Melon' }, 		// color #'7' ascii'41'
            { symbol: '*', hex: '#EA7E5D', name: 'Burnt Sienna' }, 	// color #'8' ascii'42'
            { symbol: '+', hex: '#B4674D', name: 'Brown' }, 		// color #'9' ascii'43'
            { symbol: ',', hex: '#CDC5C2', name: 'Silver' }, 		// color #'10' ascii'44'
            { symbol: '-', hex: '#FF7F49', name: 'Burnt Orange' }, 	// color #'11' ascii'45'
            { symbol: '.', hex: '#A5694F', name: 'Sepia' }, 		// color #'12' ascii'46'
            { symbol: '/', hex: '#FF7538', name: 'Orange' }, 		// color #'13' ascii'47'
            { symbol: '0', hex: '#D68A59', name: 'Raw Sienna' }, 	// color #'14' ascii'48'
            { symbol: '1', hex: '#DEAA88', name: 'Tumbleweed' }, 	// color #'15' ascii'49'
            { symbol: '2', hex: '#FAA76C', name: 'Tan' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#FFCFAB', name: 'Peach' }, 		// color #'17' ascii'51'
            { symbol: '4', hex: '#FFBD88', name: 'Mac & Cheese' }, 	// color #'18' ascii'52'
            { symbol: '5', hex: '#FDD9B5', name: 'Apricot' }, 		// color #'19' ascii'53'
            { symbol: '6', hex: '#95918C', name: 'Gray' }, 		    // color #'20' ascii'54'
            { symbol: '7', hex: '#DBD7D2', name: 'Timberwolf' }, 	// color #'21' ascii'55'
            { symbol: '8', hex: '#FFB653', name: 'Yellow Orange' }, // color #'22' ascii'56'
            { symbol: '9', hex: '#E7C697', name: 'Gold' }, 		    // color #'23' ascii'57'
            { symbol: ':', hex: '#FCD975', name: 'Goldenrod' }, 	// color #'24' ascii'58'
            { symbol: ';', hex: '#FDDB6D', name: 'Dandelion' }, 	// color #'25' ascii'59'
            { symbol: '<', hex: '#FCE883', name: 'Yellow' }, 		// color #'26' ascii'60'
            { symbol: '=', hex: '#F0E891', name: 'Green Yellow' }, 	// color #'27' ascii'61'
            { symbol: '>', hex: '#ECEABE', name: 'Spring Green' }, 	// color #'28' ascii'62'
            { symbol: '?', hex: '#C5E384', name: 'Yellow Green' }, 	// color #'29' ascii'63'
            { symbol: '@', hex: '#87A96B', name: 'Asparagus' }, 	// color #'30' ascii'64'
            { symbol: 'A', hex: '#A8E4A0', name: 'Granny Smith Apple' },// color #'31' ascii'65'
            { symbol: 'B', hex: '#6DAE81', name: 'Forest Green' }, 	// color #'32' ascii'66'
            { symbol: 'C', hex: '#9FE2BF', name: 'Sea Green' }, 	// color #'33' ascii'67'
            { symbol: 'D', hex: '#1CAC78', name: 'Green' }, 		// color #'34' ascii'68'
            { symbol: 'E', hex: '#1FCECB', name: 'Robin Egg Blue' },// color #'35' ascii'69'
            { symbol: 'F', hex: '#77DDE7', name: 'Turquoise Blue' },// color #'36' ascii'70'
            { symbol: 'G', hex: '#80DAEB', name: 'Sky Blue' }, 		// color #'37' ascii'71'
            { symbol: 'H', hex: '#1CA9C9', name: 'Pacific Blue' }, 	// color #'38' ascii'72'
            { symbol: 'I', hex: '#199EBD', name: 'Blue Green' }, 	// color #'39' ascii'73'
            { symbol: 'J', hex: '#1DACD6', name: 'Cerulean' }, 		// color #'40' ascii'74'
            { symbol: 'K', hex: '#9ACEEB', name: 'Cornflower' }, 	// color #'41' ascii'75'
            { symbol: 'L', hex: '#1F75FE', name: 'Blue' }, 		    // color #'42' ascii'76'
            { symbol: 'M', hex: '#C5D0E6', name: 'Periwinkle' }, 	// color #'43' ascii'77'
            { symbol: 'N', hex: '#B0B7C6', name: 'Cadet Blue' }, 	// color #'44' ascii'78'
            { symbol: 'O', hex: '#5D76CB', name: 'Indigo' }, 		// color #'45' ascii'79'
            { symbol: 'P', hex: '#BAB8C6', name: 'Olive Green' }, 	// color #'46' ascii'80'
            { symbol: 'Q', hex: '#7366BD', name: 'Blue Violet' }, 	// color #'47' ascii'81'
            { symbol: 'R', hex: '#9D81BA', name: 'Purple Mauntains Mjesty' },// color #'48' ascii'82'
            { symbol: 'S', hex: '#926EAE', name: 'Violet' }, 		// color #'49' ascii'83'
            { symbol: 'T', hex: '#CDA4DE', name: 'Wisteria' }, 		// color #'50' ascii'84'
            { symbol: 'U', hex: '#8E4584', name: 'Plum' }, 		    // color #'51' ascii'85'
            { symbol: 'V', hex: '#C0448F', name: 'Red Violet' }, 	// color #'52' ascii'86'
            { symbol: 'W', hex: '#C0448F', name: 'Orchild' }, 		// color #'53' ascii'87'
            { symbol: 'X', hex: '#FF43A4', name: 'Wild Strawberry' },// color #'54' ascii'88'
            { symbol: 'Y', hex: '#F664AF', name: 'Magenta' }, 		// color #'55' ascii'89'
            { symbol: 'Z', hex: '#FCB4D5', name: 'Lavender' }, 		// color #'56' ascii'90'
            { symbol: '[', hex: '#FFAACC', name: 'Carnation Pink' },// color #'57' ascii'91'
            { symbol: ']', hex: '#F75394', name: 'Violet Red' }, 	// color #'58' ascii'93'
            { symbol: '^', hex: '#FC89AC', name: 'Tickle Me Pink' },// color #'59' ascii'94'
            { symbol: '_', hex: '#EE204D', name: 'Red' }, 		    // color #'60' ascii'95'
            { symbol: '`', hex: '#EF98AA', name: 'Mauvelous' }, 	// color #'61' ascii'96'
            { symbol: 'a', hex: '#FF9BAA', name: 'Salmon' }, 		// color #'62' ascii'97'
            { symbol: 'b', hex: '#FC2847', name: 'Scarlet' }, 		// color #'63' ascii'98'
            { symbol: 'c', hex: '#CB4154', name: 'Brick Red' }, 	// color #'64' ascii'99'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 

        ],
        crayola096: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		    // color #'0' ascii'33'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#CD4A4A', name: 'Mahogany' }, 	    // color #'3' ascii'36'
            { symbol: '%', hex: '#BC5D58', name: 'Chestnut' }, 	    // color #'4' ascii'37'
            { symbol: '&', hex: '#FF5349', name: 'Red Orange' }, 	    // color #'5' ascii'38'
            { symbol: '(', hex: '#FD7C6E', name: 'Bittersweet' },     // color #'6' ascii'40'
            { symbol: ')', hex: '#FDBCB4', name: 'Melon' }, 		    // color #'7' ascii'41'
            { symbol: '*', hex: '#FFA089', name: 'Vivid Tangerine' }, // color #'8' ascii'42'
            { symbol: '+', hex: '#FF6E4A', name: 'Outrageous Orange' },// color #'9' ascii'43'
            { symbol: ',', hex: '#EA7E5D', name: 'Burnt Sienna' },    // color #'10' ascii'44'
            { symbol: '-', hex: '#B4674D', name: 'Brown' }, 		    // color #'11' ascii'45'
            { symbol: '.', hex: '#CDC5C2', name: 'Silver' }, 		    // color #'12' ascii'46'
            { symbol: '/', hex: '#FF7F49', name: 'Burnt Orange' },    // color #'13' ascii'47'
            { symbol: '0', hex: '#DD9475', name: 'Copper' }, 		    // color #'14' ascii'48'
            { symbol: '1', hex: '#A5694F', name: 'Sepia' }, 		    // color #'15' ascii'49'
            { symbol: '2', hex: '#FF7538', name: 'Orange' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#FF8243', name: 'Mango Tango' },     // color #'17' ascii'51'
            { symbol: '4', hex: '#FFA474', name: 'Atomic Tangerine' },// color #'18' ascii'52'
            { symbol: '5', hex: '#D68A59', name: 'Raw Sienna' }, 	    // color #'19' ascii'53'
            { symbol: '6', hex: '#DEAA88', name: 'Tumbleweed' }, 	    // color #'20' ascii'54'
            { symbol: '7', hex: '#FAA76C', name: 'Tan' }, 		    // color #'21' ascii'55'
            { symbol: '8', hex: '#FFCFAB', name: 'Peach' }, 		    // color #'22' ascii'56'
            { symbol: '9', hex: '#FFBD88', name: 'Mac & Cheese' },    // color #'23' ascii'57'
            { symbol: ':', hex: '#FDD9B5', name: 'Apricot' }, 	    // color #'24' ascii'58'
            { symbol: ';', hex: '#FFA343', name: 'Neon Carrot' },     // color #'25' ascii'59'
            { symbol: '<', hex: '#95918C', name: 'Gray' }, 		    // color #'26' ascii'60'
            { symbol: '=', hex: '#DBD7D2', name: 'Timberwolf' }, 	    // color #'27' ascii'61'
            { symbol: '>', hex: '#FFB653', name: 'Yellow Orange' },   // color #'28' ascii'62'
            { symbol: '?', hex: '#E7C697', name: 'Gold' }, 		    // color #'29' ascii'63'
            { symbol: '@', hex: '#FFCF48', name: 'Sunglow' }, 	    // color #'30' ascii'64'
            { symbol: 'A', hex: '#FCD975', name: 'Goldenrod' }, 	    // color #'31' ascii'65'
            { symbol: 'B', hex: '#FDDB6D', name: 'Dandelion' }, 	    // color #'32' ascii'66'
            { symbol: 'C', hex: '#FCE883', name: 'Yellow' }, 		    // color #'33' ascii'67'
            { symbol: 'D', hex: '#F0E891', name: 'Green Yellow' },    // color #'34' ascii'68'
            { symbol: 'E', hex: '#ECEABE', name: 'Spring Green' },    // color #'35' ascii'69'
            { symbol: 'F', hex: '#FDFC74', name: 'Unmellow Yellow' }, // color #'36' ascii'70'
            { symbol: 'G', hex: '#FDFC73', name: 'Laser Lemon' },     // color #'37' ascii'71'
            { symbol: 'H', hex: '#C5E384', name: 'Yellow Green' },    // color #'38' ascii'72'
            { symbol: 'I', hex: '#B2EC5D', name: 'Inchworm' }, 	    // color #'39' ascii'73'
            { symbol: 'J', hex: '#87A96B', name: 'Asparagus' }, 	    // color #'40' ascii'74'
            { symbol: 'K', hex: '#A8E4A0', name: 'Granny Smith Apple' },// color #'41' ascii'75'
            { symbol: 'L', hex: '#1DF914', name: 'Electric Lime' },   // color #'42' ascii'76'
            { symbol: 'M', hex: '#76FF7A', name: 'Screamin Green' },  // color #'43' ascii'77'
            { symbol: 'N', hex: '#6DAE81', name: 'Forest Green' },    // color #'44' ascii'78'
            { symbol: 'O', hex: '#9FE2BF', name: 'Sea Green' }, 	    // color #'45' ascii'79'
            { symbol: 'P', hex: '#1CAC78', name: 'Green' }, 		    // color #'46' ascii'80'
            { symbol: 'Q', hex: '#45CEA2', name: 'Shamrock' }, 		// color #'47' ascii'81'
            { symbol: 'R', hex: '#3BB08F', name: 'Jungle Green' }, 	// color #'48' ascii'82'
            { symbol: 'S', hex: '#17806D', name: 'Tropical Rain Forest' },// color #'49' ascii'83'
            { symbol: 'T', hex: '#158078', name: 'Pine Green' }, 		// color #'50' ascii'84'
            { symbol: 'U', hex: '#1FCECB', name: 'Robin Egg Blue' }, 	// color #'51' ascii'85'
            { symbol: 'V', hex: '#77DDE7', name: 'Turquoise Blue' }, 	// color #'52' ascii'86'
            { symbol: 'W', hex: '#80DAEB', name: 'Sky Blue' }, 		// color #'53' ascii'87'
            { symbol: 'X', hex: '#1CA9C9', name: 'Pacific Blue' }, 	// color #'54' ascii'88'
            { symbol: 'Y', hex: '#199EBD', name: 'Blue Green' }, 		// color #'55' ascii'89'
            { symbol: 'Z', hex: '#1DACD6', name: 'Cerulean' }, 		// color #'56' ascii'90'
            { symbol: '[', hex: '#9ACEEB', name: 'Cornflower' }, 		// color #'57' ascii'91'
            { symbol: ']', hex: '#1A4876', name: 'Midnight Blue' }, 	// color #'58' ascii'93'
            { symbol: '^', hex: '#1974D2', name: 'Navy Blue' }, 		// color #'59' ascii'94'
            { symbol: '_', hex: '#2B6CC4', name: 'Denim' }, 		    // color #'60' ascii'95'
            { symbol: '`', hex: '#1F75FE', name: 'Blue' }, 		    // color #'61' ascii'96'
            { symbol: 'a', hex: '#C5D0E6', name: 'Periwinkle' }, 		// color #'62' ascii'97'
            { symbol: 'b', hex: '#B0B7C6', name: 'Cadet Blue' }, 		// color #'63' ascii'98'
            { symbol: 'c', hex: '#A2ADD0', name: 'Wild Blue Wonder' },// color #'64' ascii'99'
            { symbol: 'd', hex: '#5D76CB', name: 'Indigo' }, 		    // color #'65' ascii'100'
            { symbol: 'e', hex: '#BAB8C6', name: 'Olive Green' }, 	// color #'66' ascii'101'
            { symbol: 'f', hex: '#7366BD', name: 'Blue Violet' }, 	// color #'67' ascii'102'
            { symbol: 'g', hex: '#7851A9', name: 'Royal Purple' }, 	// color #'68' ascii'103'
            { symbol: 'h', hex: '#9D81BA', name: 'Purple Mauntains Mjesty' },// color #'69' ascii'104'
            { symbol: 'i', hex: '#926EAE', name: 'Violet' }, 		    // color #'70' ascii'105'
            { symbol: 'j', hex: '#CDA4DE', name: 'Wisteria' }, 		// color #'71' ascii'106'
            { symbol: 'k', hex: '#C364C5', name: 'Fuchsia' }, 		// color #'72' ascii'107'
            { symbol: 'l', hex: '#FB7EFD', name: 'Shocking Pink' }, 	// color #'73' ascii'108'
            { symbol: 'm', hex: '#8E4584', name: 'Plum' }, 		    // color #'74' ascii'109'
            { symbol: 'n', hex: '#FF1DCE', name: 'Hot Magenta' }, 	// color #'75' ascii'110'
            { symbol: 'o', hex: '#FF1DC6', name: 'Purple Pizzazz' }, 	// color #'76' ascii'111'
            { symbol: 'p', hex: '#FF48D0', name: 'Razzle Dazzle Rose' },// color #'77' ascii'112'
            { symbol: 'q', hex: '#C0448F', name: 'Red Violet' }, 		// color #'78' ascii'113'
            { symbol: 'r', hex: '#C0448F', name: 'Orchild' }, 		// color #'79' ascii'114'
            { symbol: 's', hex: '#FF43A4', name: 'Wild Strawberry' }, // color #'80' ascii'115'
            { symbol: 't', hex: '#FF43A4', name: 'Cerise' }, 		    // color #'81' ascii'116'
            { symbol: 'u', hex: '#F664AF', name: 'Magenta' }, 		// color #'82' ascii'117'
            { symbol: 'v', hex: '#FCB4D5', name: 'Lavender' }, 		// color #'83' ascii'118'
            { symbol: 'w', hex: '#FFAACC', name: 'Carnation Pink' }, 	// color #'84' ascii'119'
            { symbol: 'x', hex: '#F75394', name: 'Violet Red' }, 		// color #'85' ascii'120'
            { symbol: 'y', hex: '#E3256B', name: 'Razzmatazz' }, 		// color #'86' ascii'121'
            { symbol: 'z', hex: '#CA3767', name: 'Jazzberry Jam' }, 	// color #'87' ascii'122'
            { symbol: '{', hex: '#FC89AC', name: 'Tickle Me Pink' }, 	// color #'88' ascii'123'
            { symbol: '|', hex: '#C8385A', name: 'Maroon' }, 		    // color #'89' ascii'124'
            { symbol: '}', hex: '#EE204D', name: 'Red' }, 		    // color #'90' ascii'125'
            { symbol: '~', hex: '#EF98AA', name: 'Mauvelous' }, 		// color #'91' ascii'126'
            { symbol: '¡', hex: '#FF496C', name: 'Radical Red' }, 	// color #'92' ascii'161'
            { symbol: '¢', hex: '#FC6C85', name: 'Wild Watermelon' }, // color #'93' ascii'162'
            { symbol: '£', hex: '#FF9BAA', name: 'Salmon' }, 		    // color #'94' ascii'163'
            { symbol: '¤', hex: '#FC2847', name: 'Scarlet' }, 		// color #'95' ascii'164'
            { symbol: '¥', hex: '#CB4154', name: 'Brick Red' }, 		// color #'96' ascii'165'
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 

        ],
        crayola120: [
            { symbol: '!', hex: '#232323', name: 'Black' }, 		    // color #'0' ascii'33'
            //{ symbol: '"', hex: '#00000000', name: 'Transparent' }, 	// color #'1' ascii'34'
            { symbol: '#', hex: '#EDEDED', name: 'White' }, 		    // color #'2' ascii'35'
            { symbol: '$', hex: '#CD4A4A', name: 'Mahogany' }, 		// color #'3' ascii'36'
            { symbol: '%', hex: '#CC6666', name: 'Fuzzy Wuzzy' }, 	// color #'4' ascii'37'
            { symbol: '&', hex: '#BC5D58', name: 'Chestnut' }, 		// color #'5' ascii'38'
            { symbol: '(', hex: '#FF5349', name: 'Red Orange' }, 		// color #'6' ascii'40'
            { symbol: ')', hex: '#FD5E53', name: 'SunsetOrange' }, 	// color #'7' ascii'41'
            { symbol: '*', hex: '#FD7C6E', name: 'Bittersweet' }, 	// color #'8' ascii'42'
            { symbol: '+', hex: '#FDBCB4', name: 'Melon' }, 		    // color #'9' ascii'43'
            { symbol: ',', hex: '#FFA089', name: 'Vivid Tangerine' }, // color #'10' ascii'44'
            { symbol: '-', hex: '#FF6E4A', name: 'Outrageous Orange' },//color #'11' ascii'45'
            { symbol: '.', hex: '#EA7E5D', name: 'Burnt Sienna' }, 	// color #'12' ascii'46'
            { symbol: '/', hex: '#B4674D', name: 'Brown' }, 		    // color #'13' ascii'47'
            { symbol: '0', hex: '#CDC5C2', name: 'Silver' }, 		    // color #'14' ascii'48'
            { symbol: '1', hex: '#FF7F49', name: 'Burnt Orange' }, 	// color #'15' ascii'49'
            { symbol: '2', hex: '#DD9475', name: 'Copper' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#A5694F', name: 'Sepia' }, 		    // color #'17' ascii'51'
            { symbol: '4', hex: '#FF7538', name: 'Orange' }, 		    // color #'18' ascii'52'
            { symbol: '5', hex: '#FF8243', name: 'Mango Tango' }, 	// color #'19' ascii'53'
            { symbol: '6', hex: '#FFA474', name: 'Atomic Tangerine' },// color #'20' ascii'54'
            { symbol: '7', hex: '#9F8170', name: 'Beaver' }, 		    // color #'21' ascii'55'
            { symbol: '8', hex: '#CD9575', name: 'Antique Brass' }, 	// color #'22' ascii'56'
            { symbol: '9', hex: '#EFCDB8', name: 'Almond' }, 		    // color #'23' ascii'57'
            { symbol: ':', hex: '#D68A59', name: 'Raw Sienna' }, 		// color #'24' ascii'58'
            { symbol: ';', hex: '#DEAA88', name: 'Tumbleweed' }, 		// color #'25' ascii'59'
            { symbol: '<', hex: '#FAA76C', name: 'Tan' }, 		    // color #'26' ascii'60'
            { symbol: '=', hex: '#FFCFAB', name: 'Peach' }, 		    // color #'27' ascii'61'
            { symbol: '>', hex: '#FFBD88', name: 'Mac & Cheese' }, 	// color #'28' ascii'62'
            { symbol: '?', hex: '#FDD9B5', name: 'Apricot' }, 		// color #'29' ascii'63'
            { symbol: '@', hex: '#FFA343', name: 'Neon Carrot' }, 	// color #'30' ascii'64'
            { symbol: 'A', hex: '#95918C', name: 'Gray' }, 		    // color #'31' ascii'65'
            { symbol: 'B', hex: '#DBD7D2', name: 'Timberwolf' }, 		// color #'32' ascii'66'
            { symbol: 'C', hex: '#FFB653', name: 'Yellow Orange' }, 	// color #'33' ascii'67'
            { symbol: 'D', hex: '#E7C697', name: 'Gold' }, 		    // color #'34' ascii'68'
            { symbol: 'E', hex: '#8A795D', name: 'Shadow' }, 		    // color #'35' ascii'69'
            { symbol: 'F', hex: '#EFCD88', name: 'Desert Sand' }, 	// color #'36' ascii'70'
            { symbol: 'G', hex: '#FAE7B5', name: 'Banana Mania' }, 	// color #'37' ascii'71'
            { symbol: 'H', hex: '#FFCF48', name: 'Sunglow' }, 		// color #'38' ascii'72'
            { symbol: 'I', hex: '#FCD975', name: 'Goldenrod' }, 		// color #'39' ascii'73'
            { symbol: 'J', hex: '#FDDB6D', name: 'Dandelion' }, 		// color #'40' ascii'74'
            { symbol: 'K', hex: '#FCE883', name: 'Yellow' }, 		    // color #'41' ascii'75'
            { symbol: 'L', hex: '#F0E891', name: 'Green Yellow' }, 	// color #'42' ascii'76'
            { symbol: 'M', hex: '#ECEABE', name: 'Spring Green' }, 	// color #'43' ascii'77'
            { symbol: 'N', hex: '#FDFC74', name: 'Unmellow Yellow' }, // color #'44' ascii'78'
            { symbol: 'O', hex: '#FDFC73', name: 'Laser Lemon' }, 	// color #'45' ascii'79'
            { symbol: 'P', hex: '#FFFF99', name: 'Canary' }, 		    // color #'46' ascii'80'
            { symbol: 'Q', hex: '#C5E384', name: 'Yellow Green' }, 	// color #'47' ascii'81'
            { symbol: 'R', hex: '#B2EC5D', name: 'Inchworm' }, 		// color #'48' ascii'82'
            { symbol: 'S', hex: '#87A96B', name: 'Asparagus' }, 		// color #'49' ascii'83'
            { symbol: 'T', hex: '#A8E4A0', name: 'Granny Smith Apple' },//olor #'50' ascii'84'
            { symbol: 'U', hex: '#1DF914', name: 'Electric Lime' }, 	// color #'51' ascii'85'
            { symbol: 'V', hex: '#76FF7A', name: 'Screamin Green' }, 	// color #'52' ascii'86'
            { symbol: 'W', hex: '#71BC78', name: 'Fern' }, 		    // color #'53' ascii'87'
            { symbol: 'X', hex: '#6DAE81', name: 'Forest Green' }, 	// color #'54' ascii'88'
            { symbol: 'Y', hex: '#9FE2BF', name: 'Sea Green' }, 		// color #'55' ascii'89'
            { symbol: 'Z', hex: '#1CAC78', name: 'Green' }, 		    // color #'56' ascii'90'
            { symbol: '[', hex: '#45CEA2', name: 'Shamrock' }, 		// color #'57' ascii'91'
            { symbol: ']', hex: '#30BA8F', name: 'Mountain Meadow' }, // color #'58' ascii'93'
            { symbol: '^', hex: '#3BB08F', name: 'Jungle Green' }, 	// color #'59' ascii'94'
            { symbol: '_', hex: '#1CD3A2', name: 'Caribbean Green' }, // color #'60' ascii'95'
            { symbol: '`', hex: '#17806D', name: 'Tropical Rain Forest' },//or #'61' ascii'96'
            { symbol: 'a', hex: '#158078', name: 'Pine Green' }, 		// color #'62' ascii'97'
            { symbol: 'b', hex: '#1FCECB', name: 'Robin Egg Blue' }, 	// color #'63' ascii'98'
            { symbol: 'c', hex: '#78DBE2', name: 'Aquamarien' }, 		// color #'64' ascii'99'
            { symbol: 'd', hex: '#77DDE7', name: 'Turquoise Blue' }, 	// color #'65' ascii'100'
            { symbol: 'e', hex: '#80DAEB', name: 'Sky Blue' }, 		// color #'66' ascii'101'
            { symbol: 'f', hex: '#414A4C', name: 'Outer Space' }, 	// color #'67' ascii'102'
            { symbol: 'g', hex: '#1CA9C9', name: 'Pacific Blue' }, 	// color #'68' ascii'103'
            { symbol: 'h', hex: '#199EBD', name: 'Blue Green' }, 		// color #'69' ascii'104'
            { symbol: 'i', hex: '#1DACD6', name: 'Cerulean' }, 		// color #'70' ascii'105'
            { symbol: 'j', hex: '#9ACEEB', name: 'Cornflower' }, 		// color #'71' ascii'106'
            { symbol: 'k', hex: '#1A4876', name: 'Midnight Blue' }, 	// color #'72' ascii'107'
            { symbol: 'l', hex: '#1974D2', name: 'Navy Blue' }, 		// color #'73' ascii'108'
            { symbol: 'm', hex: '#2B6CC4', name: 'Denim' }, 		    // color #'74' ascii'109'
            { symbol: 'n', hex: '#1F75FE', name: 'Blue' }, 	    	// color #'75' ascii'110'
            { symbol: 'o', hex: '#C5D0E6', name: 'Periwinkle' }, 		// color #'76' ascii'111'
            { symbol: 'p', hex: '#B0B7C6', name: 'Cadet Blue' }, 		// color #'77' ascii'112'
            { symbol: 'q', hex: '#A2ADD0', name: 'Wild Blue Wonder' },// color #'78' ascii'113'
            { symbol: 'r', hex: '#5D76CB', name: 'Indigo' }, 		    // color #'79' ascii'114'
            { symbol: 's', hex: '#979AAA', name: 'Manatee' }, 		// color #'80' ascii'115'
            { symbol: 't', hex: '#ADADD6', name: 'Blue Bell' }, 		// color #'81' ascii'116'
            { symbol: 'u', hex: '#BAB8C6', name: 'Olive Green' }, 	// color #'82' ascii'117'
            { symbol: 'v', hex: '#7366BD', name: 'Blue Violet' }, 	// color #'83' ascii'118'
            { symbol: 'w', hex: '#7442CB', name: 'Purple Heart' }, 	// color #'84' ascii'119'
            { symbol: 'x', hex: '#7851A9', name: 'Royal Purple' }, 	// color #'85' ascii'120'
            { symbol: 'y', hex: '#9D81BA', name: 'Purple Mauntains Mjesty' },//#'86' ascii'121'
            { symbol: 'z', hex: '#926EAE', name: 'Violet' }, 		    // color #'87' ascii'122'
            { symbol: '{', hex: '#CDA4DE', name: 'Wisteria' }, 		// color #'88' ascii'123'
            { symbol: '|', hex: '#8F509D', name: 'Vivid Violet' }, 	// color #'89' ascii'124'
            { symbol: '}', hex: '#C364C5', name: 'Fuchsia' }, 		// color #'90' ascii'125'
            { symbol: '~', hex: '#FB7EFD', name: 'Shocking Pink' }, 	// color #'91' ascii'126'
            { symbol: '¡', hex: '#FC74FD', name: 'Pink Flamingo' }, 	// color #'92' ascii'161'
            { symbol: '¢', hex: '#8E4584', name: 'Plum' }, 		    // color #'93' ascii'162'
            { symbol: '£', hex: '#FF1DCE', name: 'Hot Magenta' }, 	// color #'94' ascii'163'
            { symbol: '¤', hex: '#FF1DC6', name: 'Purple Pizzazz' }, 	// color #'95' ascii'164'
            { symbol: '¥', hex: '#FF48D0', name: 'Razzle Dazzle Rose' },//olor #'96' ascii'165'
            { symbol: '¦', hex: '#C0448F', name: 'Red Violet' }, 		// color #'97' ascii'166'
            { symbol: '§', hex: '#C0448F', name: 'Orchild' }, 		// color #'98' ascii'167'
            { symbol: '¨', hex: '#6E5160', name: 'Eggplant' }, 		// color #'99' ascii'168'
            { symbol: '©', hex: '#FF43A4', name: 'Wild Strawberry' }, // color #'100' ascii'169'
            { symbol: 'ª', hex: '#FF43A4', name: 'Cerise' }, 		    // color #'101' ascii'170'
            { symbol: '«', hex: '#F664AF', name: 'Magenta' }, 		// color #'102' ascii'171'
            { symbol: '¬', hex: '#FCB4D5', name: 'Lavender' }, 		// color #'103' ascii'172'
            { symbol: '­', hex: '#FFBCD9', name: 'Cotton Candy' }, 	 // color #'104' ascii'173'
            { symbol: '®', hex: '#FFAACC', name: 'Carnation Pink' }, 	// color #'105' ascii'174'
            { symbol: '¯', hex: '#F75394', name: 'Violet Red' }, 		// color #'106' ascii'175'
            { symbol: '°', hex: '#E3256B', name: 'Razzmatazz' }, 		// color #'107' ascii'176'
            { symbol: '±', hex: '#FDD7E4', name: 'Piggy Pink' }, 		// color #'108' ascii'177'
            { symbol: '²', hex: '#CA3767', name: 'Jazzberry Jam' }, 	// color #'109' ascii'178'
            { symbol: '³', hex: '#FC89AC', name: 'Tickle Me Pink' }, 	// color #'110' ascii'179'
            { symbol: '´', hex: '#DE5D83', name: 'Blush' }, 		    // color #'111' ascii'180'
            { symbol: 'µ', hex: '#F780A1', name: 'Pink Sherbert' }, 	// color #'112' ascii'181'
            { symbol: '¶', hex: '#C8385A', name: 'Maroon' }, 		    // color #'113' ascii'182'
            { symbol: '·', hex: '#EE204D', name: 'Red' }, 		    // color #'114' ascii'183'
            { symbol: '¸', hex: '#EF98AA', name: 'Mauvelous' }, 		// color #'115' ascii'184'
            { symbol: '¹', hex: '#FF496C', name: 'Radical Red' }, 	// color #'116' ascii'185'
            { symbol: 'º', hex: '#FC6C85', name: 'Wild Watermelon' }, // color #'117' ascii'186'
            { symbol: '»', hex: '#FF9BAA', name: 'Salmon' }, 		    // color #'118' ascii'187'
            { symbol: '¼', hex: '#FC2847', name: 'Scarlet' }, 		// color #'119' ascii'188'
            { symbol: '½', hex: '#CB4154', name: 'Brick Red' }, 		// color #'120' ascii'189'

            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' },
        ],
        crayola150: [
            { symbol: '!', hex: '#000000', name: 'Black' }, 		    // color #'0' ascii'33'
            { symbol: '"', hex: '#F1C6C6', name: 'Blush' }, 		    // color #'1' ascii'34'
            { symbol: '#', hex: '#696969', name: 'Dim Gray' }, 		// color #'2' ascii'35'
            { symbol: '$', hex: '#F08080', name: 'Light Coral' }, 	// color #'3' ascii'36'
            { symbol: '%', hex: '#D3D3D3', name: 'Light Gray' }, 		// color #'4' ascii'37'
            { symbol: '&', hex: '#800000', name: 'Maroon' }, 		    // color #'5' ascii'38'
            { symbol: '(', hex: '#FF0000', name: 'Red' }, 		    // color #'6' ascii'40'
            { symbol: ')', hex: '#C0C0C0', name: 'Silver' }, 		    // color #'7' ascii'41'
            { symbol: '*', hex: '#FFFAFA', name: 'Snow' }, 		    // color #'8' ascii'42'
            { symbol: '+', hex: '#D8D8D8', name: 'Timberwolf' }, 		// color #'9' ascii'43'
            { symbol: ',', hex: '#FFFFFF', name: 'White' }, 		    // color #'10' ascii'44'
            { symbol: '-', hex: '#F5F5F5', name: 'White Smoke' }, 	// color #'11' ascii'45'
            { symbol: '.', hex: '#FF6A6A', name: 'Wild Watermelon' }, // color #'12' ascii'46'
            //            { symbol: '/', hex: '#00000000', name: 'Transparent' }, 	// color #'13' ascii'47'
            { symbol: '0', hex: '#C45655', name: 'Fuzzy Wuzzy Brown' },//color #'14' ascii'48'
            { symbol: '1', hex: '#FF5349', name: 'Red Orange' }, 		// color #'15' ascii'49'
            { symbol: '2', hex: '#FF6F61', name: 'Zinnia' }, 		    // color #'16' ascii'50'
            { symbol: '3', hex: '#FFE4E1', name: 'Misty Rose' }, 		// color #'17' ascii'51'
            { symbol: '4', hex: '#FA8072', name: 'Salmon' }, 		    // color #'18' ascii'52'
            { symbol: '5', hex: '#FE6F5E', name: 'Bittersweet' }, 	// color #'19' ascii'53'
            { symbol: '6', hex: '#F7A59A', name: 'Melon' }, 		    // color #'20' ascii'54'
            { symbol: '7', hex: '#FF2400', name: 'Scarlet' }, 		// color #'21' ascii'55'
            { symbol: '8', hex: '#3E2723', name: 'Dark Brown' }, 		// color #'22' ascii'56'
            { symbol: '9', hex: '#FF6347', name: 'Tomato' }, 		    // color #'23' ascii'57'
            { symbol: ':', hex: '#E97451', name: 'Burnt Sienna' }, 	// color #'24' ascii'58'
            { symbol: ';', hex: '#E9967A', name: 'Dark Salmon' }, 	// color #'25' ascii'59'
            { symbol: '<', hex: '#FF7F50', name: 'Coral' }, 		    // color #'26' ascii'60'
            { symbol: '=', hex: '#FF4500', name: 'Orange Red' }, 		// color #'27' ascii'61'
            { symbol: '>', hex: '#FFA07A', name: 'Light Salmon' }, 	// color #'28' ascii'62'
            { symbol: '?', hex: '#9E5B40', name: 'Raw Sienna' }, 		// color #'29' ascii'63'
            { symbol: '@', hex: '#A0522D', name: 'Sienna' }, 		    // color #'30' ascii'64'
            { symbol: 'A', hex: '#FF9966', name: 'Atomic Tangerine' },// color #'31' ascii'65'
            { symbol: 'B', hex: '#9F8170', name: 'Beaver' }, 		    // color #'32' ascii'66'
            { symbol: 'C', hex: '#DEAA88', name: 'Tumbleweed' }, 		// color #'33' ascii'67'
            { symbol: 'D', hex: '#FFF5EE', name: 'Sea Shell' }, 		// color #'34' ascii'68'
            { symbol: 'E', hex: '#CC5500', name: 'Burnt Orange' }, 	// color #'35' ascii'69'
            { symbol: 'F', hex: '#EDC9AF', name: 'Desert Sand' }, 	// color #'36' ascii'70'
            { symbol: 'G', hex: '#6F4F37', name: 'Mocha' }, 		    // color #'37' ascii'71'
            { symbol: 'H', hex: '#FFBD88', name: 'Macaroni and Cheese' },//lor #'38' ascii'72'
            { symbol: 'I', hex: '#FFDAB9', name: 'Peach' }, 		    // color #'39' ascii'73'
            { symbol: 'J', hex: '#FFDAB9', name: 'Peach Puff' }, 		// color #'40' ascii'74'
            { symbol: 'K', hex: '#B87333', name: 'Copper' }, 		    // color #'41' ascii'75'
            { symbol: 'L', hex: '#FAF0E6', name: 'Linen' }, 		    // color #'42' ascii'76'
            { symbol: 'M', hex: '#C19A6B', name: 'Wood Brown' }, 		// color #'43' ascii'77'
            { symbol: 'N', hex: '#D2B48C', name: 'Tan' }, 		    // color #'44' ascii'78'
            { symbol: 'O', hex: '#F1C27D', name: 'Apricot' }, 		// color #'45' ascii'79'
            { symbol: 'P', hex: '#FFDEAD', name: 'Navajo White' }, 	// color #'46' ascii'80'
            { symbol: 'Q', hex: '#6A4E23', name: 'Brown' }, 		    // color #'47' ascii'81'
            { symbol: 'R', hex: '#6A4E23', name: 'Chestnut' }, 		// color #'48' ascii'82'
            { symbol: 'S', hex: '#FFEFD5', name: 'Papaya Whip' }, 	// color #'49' ascii'83'
            { symbol: 'T', hex: '#FFA500', name: 'Orange' }, 		    // color #'50' ascii'84'
            { symbol: 'U', hex: '#F2C777', name: 'Maize' }, 		    // color #'51' ascii'85'
            { symbol: 'V', hex: '#F5DEB3', name: 'Wheat' }, 		    // color #'52' ascii'86'
            { symbol: 'W', hex: '#F4A300', name: 'Sandy Brown' }, 	// color #'53' ascii'87'
            { symbol: 'X', hex: '#FFB200', name: 'Yellow Orange' }, 	// color #'54' ascii'88'
            { symbol: 'Y', hex: '#F1E2B3', name: 'Banana Mania' }, 	// color #'55' ascii'89'
            { symbol: 'Z', hex: '#E2D8B7', name: 'Almond' }, 		    // color #'56' ascii'90'
            { symbol: '[', hex: '#F9E79F', name: 'Lemonade' }, 		// color #'57' ascii'91'
            { symbol: ']', hex: '#FFD700', name: 'Gold' }, 		    // color #'58' ascii'93'
            { symbol: '^', hex: '#FFDA03', name: 'Sunflower' }, 		// color #'59' ascii'94'
            { symbol: '_', hex: '#F9E400', name: 'Lemon Yellow' }, 	// color #'60' ascii'95'
            { symbol: '`', hex: '#F0E130', name: 'Daffodil' }, 		// color #'61' ascii'96'
            { symbol: 'a', hex: '#F0E130', name: 'Green Yellow' }, 	// color #'62' ascii'97'
            { symbol: 'b', hex: '#FFEF00', name: 'Canary Yellow' }, 	// color #'63' ascii'98'
            { symbol: 'c', hex: '#EAE8AA', name: 'Pale Goldenrod' }, 	// color #'64' ascii'99'
            { symbol: 'd', hex: '#FFFFF0', name: 'Ivory' }, 		    // color #'65' ascii'100'
            { symbol: 'e', hex: '#FAFAD2', name: 'Light Goldenrod Yellow' },// #'66' ascii'101'
            { symbol: 'f', hex: '#808000', name: 'Olive' }, 		    // color #'67' ascii'102'
            { symbol: 'g', hex: '#FFFF00', name: 'Yellow' }, 		    // color #'68' ascii'103'
            { symbol: 'h', hex: '#6B8E23', name: 'Olive Drab' }, 		// color #'69' ascii'104'
            { symbol: 'i', hex: '#9ACD32', name: 'Yellow Green' }, 	// color #'70' ascii'105'
            { symbol: 'j', hex: '#9ACD32', name: 'Yellow Green.' }, 	// color #'71' ascii'106'
            { symbol: 'k', hex: '#B4E197', name: 'Inchworm' }, 		// color #'72' ascii'107'
            { symbol: 'l', hex: '#00FF00', name: 'Electric Lime' }, 	// color #'73' ascii'108'
            { symbol: 'm', hex: '#90EE90', name: 'Light Green' }, 	// color #'74' ascii'109'
            { symbol: 'n', hex: '#00FF00', name: 'Lime' }, 		    // color #'75' ascii'110'
            { symbol: 'o', hex: '#32CD32', name: 'Lime Green' }, 		// color #'76' ascii'111'
            { symbol: 'p', hex: '#98FB98', name: 'Pale Green' }, 		// color #'77' ascii'112'
            { symbol: 'q', hex: '#4B8C4B', name: 'Up Forest Green' }, // color #'78' ascii'113'
            { symbol: 'r', hex: '#50C878', name: 'Emerald' }, 		// color #'79' ascii'114'
            { symbol: 's', hex: '#2E8B57', name: 'Sea Green' }, 		// color #'80' ascii'115'
            { symbol: 't', hex: '#00A550', name: 'Green' }, 		    // color #'81' ascii'116'
            { symbol: 'u', hex: '#00FF7F', name: 'Spring Green' }, 	// color #'82' ascii'117'
            { symbol: 'v', hex: '#F5FFFA', name: 'Mint Cream' }, 		// color #'83' ascii'118'
            { symbol: 'w', hex: '#AAF0D1', name: 'Magic Mint' }, 		// color #'84' ascii'119'
            { symbol: 'x', hex: '#7FFFD4', name: 'Aquamarine' }, 		// color #'85' ascii'120'
            { symbol: 'y', hex: '#115740', name: 'Tropical Rain Forest' },//or #'86' ascii'121'
            { symbol: 'z', hex: '#00CC99', name: 'Caribbean Green' }, // color #'87' ascii'122'
            { symbol: '{', hex: '#40E0D0', name: 'Turquoise' }, 		// color #'88' ascii'123'
            { symbol: '|', hex: '#01796F', name: 'Pine Green' }, 		// color #'89' ascii'124'
            { symbol: '}', hex: '#20B2AA', name: 'Light Sea Green' }, // color #'90' ascii'125'
            { symbol: '~', hex: '#E0FFFF', name: 'Light Cyan' }, 		// color #'91' ascii'126'
            { symbol: '¡', hex: '#30BFBF', name: 'Mountain Meadow' }, // color #'92' ascii'161'
            { symbol: '¢', hex: '#AFEEEE', name: 'Pale Turquoise' }, 	// color #'93' ascii'162'
            { symbol: '£', hex: '#008080', name: 'Teal' }, 		    // color #'94' ascii'163'
            { symbol: '¤', hex: '#00B5B8', name: 'Blue Green' }, 		// color #'95' ascii'164'
            { symbol: '¥', hex: '#B0E0E6', name: 'Powder Blue' }, 	// color #'96' ascii'165'
            { symbol: '¦', hex: '#0D98BA', name: 'Green Blue' }, 		// color #'97' ascii'166'
            { symbol: '§', hex: '#00B5E2', name: 'Turquoise Blue' }, 	// color #'98' ascii'167'
            { symbol: '¨', hex: '#1DACD6', name: 'Cerulean' }, 		// color #'99' ascii'168'
            { symbol: '©', hex: '#ADD8E6', name: 'Light Blue' }, 		// color #'100' ascii'169'
            { symbol: 'ª', hex: '#00BFFF', name: 'Deep Sky Blue' }, 	// color #'101' ascii'170'
            { symbol: '«', hex: '#87CEEB', name: 'Sky Blue' }, 		// color #'102' ascii'171'
            { symbol: '¬', hex: '#87CEFA', name: 'Light Sky Blue' }, 	// color #'103' ascii'172'
            { symbol: '­', hex: '#4682B4', name: 'Steel Blue' }, 		 // color #'104' ascii'173'
            { symbol: '®', hex: '#1E90FF', name: 'Dodger Blue' }, 	// color #'105' ascii'174'
            { symbol: '¯', hex: '#778899', name: 'Light Slate Gray' },// color #'106' ascii'175'
            { symbol: '°', hex: '#708090', name: 'Slate Gray' }, 		// color #'107' ascii'176'
            { symbol: '±', hex: '#708090', name: 'Slate Grey' }, 		// color #'108' ascii'177'
            { symbol: '²', hex: '#A2CFFE', name: 'Blizzard Blue' }, 	// color #'109' ascii'178'
            { symbol: '³', hex: '#B0C4DE', name: 'Light Steel Blue' },// color #'110' ascii'179'
            { symbol: '´', hex: '#1F75FE', name: 'Blue' }, 		    // color #'111' ascii'180'
            { symbol: 'µ', hex: '#414A59', name: 'Outer Space' }, 	// color #'112' ascii'181'
            { symbol: '¶', hex: '#4F86F7', name: 'Blueberry' }, 		// color #'113' ascii'182'
            { symbol: '·', hex: '#4169E1', name: 'Royal Blue' }, 		// color #'114' ascii'183'
            { symbol: '¸', hex: '#00008B', name: 'Dark Blue' }, 		// color #'115' ascii'184'
            { symbol: '¹', hex: '#191970', name: 'Midnight Blue' }, 	// color #'116' ascii'185'
            { symbol: 'º', hex: '#000080', name: 'Navy' }, 		    // color #'117' ascii'186'
            { symbol: '»', hex: '#CCCCFF', name: 'Periwinkle' }, 		// color #'118' ascii'187'
            { symbol: '¼', hex: '#6A5ACD', name: 'Slate Blue' }, 		// color #'119' ascii'188'
            { symbol: '½', hex: '#7366BD', name: 'Blue Violet' }, 	// color #'120' ascii'189'
            { symbol: '¾', hex: '#522D80', name: 'Rebecca Purple' }, 	// color #'121' ascii'190'
            { symbol: '¿', hex: '#310062', name: 'Dark Indigo' }, 	// color #'122' ascii'191'
            { symbol: 'À', hex: '#8A2BE2', name: 'Violet' }, 		    // color #'123' ascii'192'
            { symbol: 'Á', hex: '#4B0082', name: 'Indigo' }, 		    // color #'124' ascii'193'
            { symbol: 'Â', hex: '#6A0DAD', name: 'Purple' }, 		    // color #'125' ascii'194'
            { symbol: 'Ã', hex: '#6A0DAD', name: 'Royal Purple' }, 	// color #'126' ascii'195'
            { symbol: 'Ä', hex: '#C9A0DC', name: 'Wisteria' }, 		// color #'127' ascii'196'
            { symbol: 'Å', hex: '#FC74FD', name: 'Pink Flamingo' }, 	// color #'128' ascii'197'
            { symbol: 'Æ', hex: '#FF00FF', name: 'Magenta' }, 		// color #'129' ascii'198'
            { symbol: 'Ç', hex: '#D8BFD8', name: 'Thistle' }, 		// color #'130' ascii'199'
            { symbol: 'È', hex: '#DA70D6', name: 'Orchid' }, 		    // color #'131' ascii'200'
            { symbol: 'É', hex: '#C854C1', name: 'Mulberry' }, 		// color #'132' ascii'201'
            { symbol: 'Ê', hex: '#8E4585', name: 'Plum' }, 		    // color #'133' ascii'202'
            { symbol: 'Ë', hex: '#FF1DCE', name: 'Hot Magenta' }, 	// color #'134' ascii'203'
            { symbol: 'Ì', hex: '#E6A8D7', name: 'Lavender' }, 		// color #'135' ascii'204'
            { symbol: 'Í', hex: '#E10098', name: 'Razzmatazz' }, 		// color #'136' ascii'205'
            { symbol: 'Î', hex: '#C71585', name: 'Red Violet' }, 		// color #'137' ascii'206'
            { symbol: 'Ï', hex: '#FF43A4', name: 'Wild Strawberry' }, // color #'138' ascii'207'
            { symbol: 'Ð', hex: '#D5006D', name: 'Deep Pink' }, 		// color #'139' ascii'208'
            { symbol: 'Ñ', hex: '#FF69B4', name: 'Hot Pink' }, 		// color #'140' ascii'209'
            { symbol: 'Ò', hex: '#FFBCD9', name: 'Cotton Candy' }, 	// color #'141' ascii'210'
            { symbol: 'Ó', hex: '#FFA6C9', name: 'Carnation Pink' }, 	// color #'142' ascii'211'
            { symbol: 'Ô', hex: '#E30B5C', name: 'Raspberry' }, 		// color #'143' ascii'212'
            { symbol: 'Õ', hex: '#FFF0F5', name: 'Lavender Blush' }, 	// color #'144' ascii'213'
            { symbol: 'Ö', hex: '#DB7093', name: 'Pale Violet Red' }, // color #'145' ascii'214'
            { symbol: '×', hex: '#9E1B32', name: 'Garnet' }, 		    // color #'146' ascii'215'
            { symbol: '/', hex: '#FFC0CB', name: 'Pink' }, 		    // color #'147' ascii'216'
            { symbol: 'Ù', hex: '#F9A8B6', name: 'Fandango' }, 		// color #'148' ascii'217'
            { symbol: 'Ú', hex: '#9B1B30', name: 'Jazzberry Jam' }, 	// color #'149' ascii'218'
            { symbol: 'Û', hex: '#FFB6C1', name: 'Light Pink' }, 		// color #'150' ascii'219'
            { symbol: 'Ü', hex: '#9E2A2F', name: 'Brick Red' }, 		// color #'151' ascii'220'   

            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' },

        ],
        w3c: [
            { symbol: '!', hex: '#000000', name: 'Black' },
            { symbol: '"', hex: '#696969', name: 'DimGray or DimGrey' },
            { symbol: '#', hex: '#808080', name: 'Gray or Grey' },
            { symbol: '$', hex: '#A9A9A9', name: 'DarkGray or DarkGrey' },
            { symbol: '%', hex: '#C0C0C0', name: 'Silver' },
            { symbol: '&', hex: '#D3D3D3', name: 'LightGray or LightGrey' },
            { symbol: "'", hex: '#DCDCDC', name: 'Gainsboro' },
            { symbol: '(', hex: '#F5F5F5', name: 'WhiteSmoke' },
            { symbol: ')', hex: '#778899', name: 'LightSlateGray or LightSlateGrey' },
            { symbol: '*', hex: '#708090', name: 'SlateGray or SlateGrey' },
            { symbol: '+', hex: '#191970', name: 'MidnightBlue' },
            { symbol: ',', hex: '#000080', name: 'Navy' },
            { symbol: '-', hex: '#00008B', name: 'DarkBlue' },
            { symbol: '.', hex: '#0000CD', name: 'MediumBlue' },
            { symbol: '/', hex: '#0000FF', name: 'Blue' },
            { symbol: '0', hex: '#4169E1', name: 'RoyalBlue' },
            { symbol: '1', hex: '#1E90FF', name: 'DodgerBlue' },
            { symbol: '2', hex: '#4682B4', name: 'SteelBlue' },
            { symbol: '3', hex: '#6495ED', name: 'CornflowerBlue' },
            { symbol: '4', hex: '#00BFFF', name: 'DeepSkyBlue' },
            { symbol: '5', hex: '#87CEFA', name: 'LightSkyBlue' },
            { symbol: '6', hex: '#87CEEB', name: 'SkyBlue' },
            { symbol: '7', hex: '#B0E0E6', name: 'PowderBlue' },
            { symbol: '8', hex: '#ADD8E6', name: 'LightBlue' },
            { symbol: '9', hex: '#B0CFDE', name: 'LightSteelBlue' },
            { symbol: ':', hex: '#E6E6FA', name: 'Lavender' },
            { symbol: ';', hex: '#F0F8FF', name: 'AliceBlue' },
            { symbol: '<', hex: '#F8F8FF', name: 'GhostWhite' },
            { symbol: '=', hex: '#F0FFFF', name: 'Azure' },
            { symbol: '>', hex: '#E0FFFF', name: 'LightCyan' },
            { symbol: '?', hex: '#00FFFF', name: 'Cyan or Aqua' },
            { symbol: '@', hex: '#AFEEEE', name: 'PaleTurquoise' },
            { symbol: 'A', hex: '#66CDAA', name: 'MediumAquaMarine' },
            { symbol: 'B', hex: '#7FFFD4', name: 'Aquamarine' },
            { symbol: 'C', hex: '#40E0D0', name: 'Turquoise' },
            { symbol: 'D', hex: '#48D1CC', name: 'MediumTurquoise' },
            { symbol: 'E', hex: '#00CED1', name: 'DarkTurquoise' },
            { symbol: 'F', hex: '#20B2AA', name: 'LightSeaGreen' },
            { symbol: 'G', hex: '#5F9EA0', name: 'CadetBlue' },
            { symbol: 'H', hex: '#008B8B', name: 'DarkCyan' },
            { symbol: 'I', hex: '#008080', name: 'Teal' },
            { symbol: 'J', hex: '#25383C', name: 'DarkSlateGray or DarkSlateGrey' },
            { symbol: 'K', hex: '#2E8B57', name: 'SeaGreen' },
            { symbol: 'L', hex: '#3CB371', name: 'MediumSeaGreen' },
            { symbol: 'M', hex: '#6B8E23', name: 'OliveDrab' },
            { symbol: 'N', hex: '#808000', name: 'Olive' },
            { symbol: 'O', hex: '#556B2F', name: 'DarkOliveGreen' },
            { symbol: 'P', hex: '#228B22', name: 'ForestGreen' },
            { symbol: 'Q', hex: '#008000', name: 'Green' },
            { symbol: 'R', hex: '#006400', name: 'DarkGreen' },
            { symbol: 'S', hex: '#32CD32', name: 'LimeGreen' },
            { symbol: 'T', hex: '#8FBC8F', name: 'DarkSeaGreen' },
            { symbol: 'U', hex: '#9ACD32', name: 'YellowGreen' },
            { symbol: 'V', hex: '#00FF7F', name: 'SpringGreen' },
            { symbol: 'W', hex: '#00FA9A', name: 'MediumSpringGreen' },
            { symbol: 'X', hex: '#00FF00', name: 'Lime' },
            { symbol: 'Y', hex: '#7CFC00', name: 'LawnGreen' },
            { symbol: 'Z', hex: '#7FFF00', name: 'Chartreuse' },
            { symbol: 'a', hex: '#ADFF2F', name: 'GreenYellow' },
            { symbol: 'b', hex: '#90EE90', name: 'LightGreen' },
            { symbol: 'c', hex: '#98FB98', name: 'PaleGreen' },
            { symbol: 'd', hex: '#F0FFF0', name: 'HoneyDew' },
            { symbol: 'e', hex: '#F5FFFA', name: 'MintCream' },
            { symbol: 'f', hex: '#FFFACD', name: 'LemonChiffon' },
            { symbol: 'g', hex: '#FAFAD2', name: 'LightGoldenRodYellow' },
            { symbol: 'h', hex: '#FFFFE0', name: 'LightYellow' },
            { symbol: 'i', hex: '#F5F5DC', name: 'Beige' },
            { symbol: 'j', hex: '#FFF8DC', name: 'Cornsilk' },
            { symbol: 'k', hex: '#FAEBD7', name: 'AntiqueWhite' },
            { symbol: 'l', hex: '#FFEFD5', name: 'PapayaWhip' },
            { symbol: 'm', hex: '#FFEBCD', name: 'BlanchedAlmond' },
            { symbol: 'n', hex: '#FFE4C4', name: 'Bisque' },
            { symbol: 'o', hex: '#F5DEB3', name: 'Wheat' },
            { symbol: 'p', hex: '#FFE4B5', name: 'Moccasin' },
            { symbol: 'q', hex: '#FFDAB9', name: 'PeachPuff' },
            { symbol: 'r', hex: '#FFDEAD', name: 'NavajoWhite' },
            { symbol: 's', hex: '#EEE8AA', name: 'PaleGoldenRod' },
            { symbol: 't', hex: '#F0E68C', name: 'Khaki' },
            { symbol: 'u', hex: '#FFFF00', name: 'Yellow' },
            { symbol: 'v', hex: '#FFD700', name: 'Gold' },
            { symbol: 'w', hex: '#FFA500', name: 'Orange' },
            { symbol: 'x', hex: '#F4A460', name: 'SandyBrown' },
            { symbol: 'y', hex: '#DEB887', name: 'BurlyWood' },
            { symbol: 'z', hex: '#D2B48C', name: 'Tan' },
            { symbol: '{', hex: '#BDB76B', name: 'DarkKhaki' },
            { symbol: '|', hex: '#DAA520', name: 'GoldenRod' },
            { symbol: '}', hex: '#B8860B', name: 'DarkGoldenRod' },
            { symbol: 'ÿ', hex: '#CD853F', name: 'Peru' },
            { symbol: 'ý', hex: '#A0522D', name: 'Sienna' },
            { symbol: 'ü', hex: '#8B4513', name: 'SaddleBrown' },
            { symbol: 'û', hex: '#D2691E', name: 'Chocolate' },
            { symbol: 'ø', hex: '#FF8C00', name: 'DarkOrange' },
            { symbol: 'ö', hex: '#FF7F50', name: 'Coral' },
            { symbol: 'õ', hex: '#FFA07A', name: 'LightSalmon' },
            { symbol: 'ô', hex: '#E9967A', name: 'DarkSalmon' },
            { symbol: 'ñ', hex: '#FA8072', name: 'Salmon' },
            { symbol: 'í', hex: '#F08080', name: 'LightCoral' },
            { symbol: 'î', hex: '#CD5C5C', name: 'IndianRed' },
            { symbol: 'ï', hex: '#FF6347', name: 'Tomato' },
            { symbol: 'ì', hex: '#FF4500', name: 'OrangeRed' },
            { symbol: 'í', hex: '#FF0000', name: 'Red' },
            { symbol: 'è', hex: '#B22222', name: 'FireBrick' },
            { symbol: 'é', hex: '#A52A2A', name: 'Brown' },
            { symbol: 'è', hex: '#8B0000', name: 'DarkRed' },
            { symbol: 'é', hex: '#800000', name: 'Maroon' },
            { symbol: 'ê', hex: '#BC8F8F', name: 'RosyBrown' },
            { symbol: 'ë', hex: '#FFE4E1', name: 'MistyRose' },
            { symbol: 'ì', hex: '#FFC0CB', name: 'Pink' },
            { symbol: 'í', hex: '#FFB6C1', name: 'LightPink' },
            { symbol: 'î', hex: '#DB7093', name: 'PaleVioletRed' },
            { symbol: 'ï', hex: '#FF69B4', name: 'HotPink' },
            { symbol: 'ì', hex: '#FF1493', name: 'DeepPink' },
            { symbol: 'í', hex: '#DC143C', name: 'Crimson' },
            { symbol: 'ê', hex: '#C71585', name: 'MediumVioletRed' },
            { symbol: 'ë', hex: '#DA70D6', name: 'Orchid' },
            { symbol: 'í', hex: '#EE82EE', name: 'Violet' },
            { symbol: 'î', hex: '#FF00FF', name: 'Magenta or Fuchsia' },
            { symbol: 'ï', hex: '#BA55D3', name: 'MediumOrchid' },
            { symbol: 'ð', hex: '#6A5ACD', name: 'SlateBlue' },
            { symbol: 'ñ', hex: '#7B68EE', name: 'MediumSlateBlue' },
            { symbol: 'ó', hex: '#483D8B', name: 'DarkSlateBlue' },
            { symbol: 'ô', hex: '#4B0082', name: 'Indigo' },
            { symbol: 'ö', hex: '#663399', name: 'RebeccaPurple' },
            { symbol: 'ø', hex: '#8B008B', name: 'DarkMagenta' },
            { symbol: 'ù', hex: '#800080', name: 'Purple' },
            { symbol: 'ú', hex: '#9932CC', name: 'DarkOrchid' },
            { symbol: 'ü', hex: '#9400D3', name: 'DarkViolet' },
            { symbol: 'ý', hex: '#8A2BE2', name: 'BlueViolet' },
            { symbol: 'þ', hex: '#9370DB', name: 'MediumPurple' },
            { symbol: 'ÿ', hex: '#DDA0DD', name: 'Plum' },
            { symbol: 'à', hex: '#D8BFD8', name: 'Thistle' },
            { symbol: 'á', hex: '#FFF0F5', name: 'LavenderBlush' },
            { symbol: 'â', hex: '#FEF0E3', name: 'OldLace' },
            { symbol: 'ã', hex: '#FAF0E6', name: 'Linen' },
            { symbol: 'ä', hex: '#FFF5EE', name: 'SeaShell' },
            { symbol: 'å', hex: '#FFFAF0', name: 'FloralWhite' },
            { symbol: 'æ', hex: '#FFFFF0', name: 'Ivory' },
            { symbol: 'ç', hex: '#FFFAFA', name: 'Snow' },
            { symbol: 'è', hex: '#FFFFFF', name: 'White' },

            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' },
        ],

        // JavaScript named colors
        javascript: [
            { symbol: '!', hex: '#000000', name: 'Black' }, 		 // color #'0' ascii'33'
            { symbol: '"', hex: '#a52a2a', name: 'Brown' }, 		 // color #'1' ascii'34'
            { symbol: '#', hex: '#a9a9a9', name: 'DarkGray' }, 		 // color #'2' ascii'35'
            { symbol: '$', hex: '#8b0000', name: 'DarkRed' }, 		 // color #'3' ascii'36'
            { symbol: '%', hex: '#696969', name: 'DimGray' }, 		 // color #'4' ascii'37'
            { symbol: '&', hex: '#b22222', name: 'Firebrick' }, 		 // color #'5' ascii'38'
            { symbol: '(', hex: '#dcdcdc', name: 'Gainsboro' }, 		 // color #'6' ascii'40'
            { symbol: ')', hex: '#808080', name: 'Gray' }, 		 // color #'7' ascii'41'
            { symbol: '*', hex: '#cd5c5c', name: 'IndianRed' }, 		 // color #'8' ascii'42'
            { symbol: '+', hex: '#f08080', name: 'LightCoral' }, 		 // color #'9' ascii'43'
            { symbol: ',', hex: '#d3d3d3', name: 'LightGrey' }, 		 // color #'10' ascii'44'
            { symbol: '-', hex: '#800000', name: 'Maroon' }, 		 // color #'11' ascii'45'
            { symbol: '.', hex: '#ff0000', name: 'Red' }, 		 // color #'12' ascii'46'
            { symbol: '/', hex: '#bc8f8f', name: 'RosyBrown' }, 		 // color #'13' ascii'47'
            { symbol: '0', hex: '#c0c0c0', name: 'Silver' }, 		 // color #'14' ascii'48'
            { symbol: '1', hex: '#fffafa', name: 'Snow' }, 		 // color #'15' ascii'49'
            { symbol: '2', hex: '#ffffff', name: 'White' }, 		 // color #'16' ascii'50'
            { symbol: '3', hex: '#f5f5f5', name: 'WhiteSmoke' }, 		 // color #'17' ascii'51'
            { symbol: '4', hex: '#ffe4e1', name: 'MistyRose' }, 		 // color #'18' ascii'52'
            { symbol: '5', hex: '#fa8072', name: 'Salmon' }, 		 // color #'19' ascii'53'
            { symbol: '6', hex: '#ff6347', name: 'Tomato' }, 		 // color #'20' ascii'54'
            { symbol: '7', hex: '#e9967a', name: 'DarkSalmon' }, 		 // color #'21' ascii'55'
            { symbol: '8', hex: '#ff7f50', name: 'Coral' }, 		 // color #'22' ascii'56'
            { symbol: '9', hex: '#ff4500', name: 'OrangeRed' }, 		 // color #'23' ascii'57'
            { symbol: ':', hex: '#ffa07a', name: 'LightSalmon' }, 		 // color #'24' ascii'58'
            { symbol: ';', hex: '#a0522d', name: 'Sienna' }, 		 // color #'25' ascii'59'
            { symbol: '<', hex: '#fff5ee', name: 'Seashell' }, 		 // color #'26' ascii'60'
            { symbol: '=', hex: '#d2691e', name: 'Chocolate' }, 		 // color #'27' ascii'61'
            { symbol: '>', hex: '#8b4513', name: 'SaddleBrown' }, 		 // color #'28' ascii'62'
            { symbol: '?', hex: '#f4a460', name: 'SandyBrown' }, 		 // color #'29' ascii'63'
            { symbol: '@', hex: '#ffdab9', name: 'PeachPuff' }, 		 // color #'30' ascii'64'
            { symbol: 'A', hex: '#cd853f', name: 'Peru' }, 		 // color #'31' ascii'65'
            { symbol: 'B', hex: '#faf0e6', name: 'Linen' }, 		 // color #'32' ascii'66'
            { symbol: 'C', hex: '#ffe4c4', name: 'Bisque' }, 		 // color #'33' ascii'67'
            { symbol: 'D', hex: '#ff8c00', name: 'DarkOrange' }, 		 // color #'34' ascii'68'
            { symbol: 'E', hex: '#deb887', name: 'BurlyWood' }, 		 // color #'35' ascii'69'
            { symbol: 'F', hex: '#faebd7', name: 'AntiqueWhite' }, 		 // color #'36' ascii'70'
            { symbol: 'G', hex: '#d2b48c', name: 'Tan' }, 		 // color #'37' ascii'71'
            { symbol: 'H', hex: '#ffdead', name: 'NavajoWhite' }, 		 // color #'38' ascii'72'
            { symbol: 'I', hex: '#ffebcd', name: 'BlanchedAlmond' }, 		 // color #'39' ascii'73'
            { symbol: 'J', hex: '#ffefd5', name: 'PapayaWhip' }, 		 // color #'40' ascii'74'
            { symbol: 'K', hex: '#ffe4b5', name: 'Moccasin' }, 		 // color #'41' ascii'75'
            { symbol: 'L', hex: '#ffa500', name: 'Orange' }, 		 // color #'42' ascii'76'
            { symbol: 'M', hex: '#f5deb3', name: 'Wheat' }, 		 // color #'43' ascii'77'
            { symbol: 'N', hex: '#fdf5e6', name: 'OldLace' }, 		 // color #'44' ascii'78'
            { symbol: 'O', hex: '#fffaf0', name: 'FloralWhite' }, 		 // color #'45' ascii'79'
            { symbol: 'P', hex: '#b8860b', name: 'DarkGoldenrod' }, 		 // color #'46' ascii'80'
            { symbol: 'Q', hex: '#daa520', name: 'Goldenrod' }, 		 // color #'47' ascii'81'
            { symbol: 'R', hex: '#fff8dc', name: 'Cornsilk' }, 		 // color #'48' ascii'82'
            { symbol: 'S', hex: '#ffd700', name: 'Gold' }, 		 // color #'49' ascii'83'
            { symbol: 'T', hex: '#fffacd', name: 'LemonChiffon' }, 		 // color #'50' ascii'84'
            { symbol: 'U', hex: '#f0e68c', name: 'Khaki' }, 		 // color #'51' ascii'85'
            { symbol: 'V', hex: '#eee8aa', name: 'PaleGoldenrod' }, 		 // color #'52' ascii'86'
            { symbol: 'W', hex: '#bdb76b', name: 'DarkKhaki' }, 		 // color #'53' ascii'87'
            { symbol: 'X', hex: '#f5f5dc', name: 'Beige' }, 		 // color #'54' ascii'88'
            { symbol: 'Y', hex: '#fffff0', name: 'Ivory' }, 		 // color #'55' ascii'89'
            { symbol: 'Z', hex: '#fafad2', name: 'LightGoldenrodYellow' }, 		 // color #'56' ascii'90'
            { symbol: '[', hex: '#ffffe0', name: 'LightYellow' }, 		 // color #'57' ascii'91'
            { symbol: ']', hex: '#808000', name: 'Olive' }, 		 // color #'58' ascii'93'
            { symbol: '^', hex: '#ffff00', name: 'Yellow' }, 		 // color #'59' ascii'94'
            { symbol: '_', hex: '#6b8e23', name: 'OliveDrab' }, 		 // color #'60' ascii'95'
            { symbol: '`', hex: '#9acd32', name: 'YellowGreen' }, 		 // color #'61' ascii'96'
            { symbol: 'a', hex: '#556b2f', name: 'DarkOliveGreen' }, 		 // color #'62' ascii'97'
            { symbol: 'b', hex: '#adff2f', name: 'GreenYellow' }, 		 // color #'63' ascii'98'
            { symbol: 'c', hex: '#7fff00', name: 'Chartreuse' }, 		 // color #'64' ascii'99'
            { symbol: 'd', hex: '#7cfc00', name: 'LawnGreen' }, 		 // color #'65' ascii'100'
            { symbol: 'e', hex: '#006400', name: 'DarkGreen' }, 		 // color #'66' ascii'101'
            { symbol: 'f', hex: '#8fbc8f', name: 'DarkSeaGreen' }, 		 // color #'67' ascii'102'
            { symbol: 'g', hex: '#228b22', name: 'ForestGreen' }, 		 // color #'68' ascii'103'
            { symbol: 'h', hex: '#008000', name: 'Green' }, 		 // color #'69' ascii'104'
            { symbol: 'i', hex: '#f0fff0', name: 'Honeydew' }, 		 // color #'70' ascii'105'
            { symbol: 'j', hex: '#90ee90', name: 'LightGreen' }, 		 // color #'71' ascii'106'
            { symbol: 'k', hex: '#00ff00', name: 'Lime' }, 		 // color #'72' ascii'107'
            { symbol: 'l', hex: '#32cd32', name: 'LimeGreen' }, 		 // color #'73' ascii'108'
            { symbol: 'm', hex: '#98fb98', name: 'PaleGreen' }, 		 // color #'74' ascii'109'
            { symbol: 'n', hex: '#2e8b57', name: 'SeaGreen' }, 		 // color #'75' ascii'110'
            { symbol: 'o', hex: '#3cb371', name: 'MediumSeaGreen' }, 		 // color #'76' ascii'111'
            { symbol: 'p', hex: '#00ff7f', name: 'SpringGreen' }, 		 // color #'77' ascii'112'
            { symbol: 'q', hex: '#f5fffa', name: 'MintCream' }, 		 // color #'78' ascii'113'
            { symbol: 'r', hex: '#00fa9a', name: 'MediumSpringGreen' }, 		 // color #'79' ascii'114'
            { symbol: 's', hex: '#66cdaa', name: 'MediumAquamarine' }, 		 // color #'80' ascii'115'
            { symbol: 't', hex: '#7fffd4', name: 'Aquamarine' }, 		 // color #'81' ascii'116'
            { symbol: 'u', hex: '#40e0d0', name: 'Turquoise' }, 		 // color #'82' ascii'117'
            { symbol: 'v', hex: '#20b2aa', name: 'LightSeaGreen' }, 		 // color #'83' ascii'118'
            { symbol: 'w', hex: '#48d1cc', name: 'MediumTurquoise' }, 		 // color #'84' ascii'119'
            { symbol: 'x', hex: '#00ffff', name: 'Aqua' }, 		 // color #'85' ascii'120'
            { symbol: 'y', hex: '#f0ffff', name: 'Azure' }, 		 // color #'86' ascii'121'
            { symbol: 'z', hex: '#00ffff', name: 'Cyan' }, 		 // color #'87' ascii'122'
            { symbol: '{', hex: '#008b8b', name: 'DarkCyan' }, 		 // color #'88' ascii'123'
            { symbol: '|', hex: '#2f4f4f', name: 'DarkSlateGray' }, 		 // color #'89' ascii'124'
            { symbol: '}', hex: '#e0ffff', name: 'LightCyan' }, 		 // color #'90' ascii'125'
            { symbol: '~', hex: '#afeeee', name: 'PaleTurquoise' }, 		 // color #'91' ascii'126'
            { symbol: '¡', hex: '#008080', name: 'Teal' }, 		 // color #'92' ascii'161'
            { symbol: '¢', hex: '#00ced1', name: 'DarkTurquoise' }, 		 // color #'93' ascii'162'
            { symbol: '£', hex: '#5f9ea0', name: 'CadetBlue' }, 		 // color #'94' ascii'163'
            { symbol: '¤', hex: '#b0e0e6', name: 'PowderBlue' }, 		 // color #'95' ascii'164'
            { symbol: '¥', hex: '#add8e6', name: 'LightBlue' }, 		 // color #'96' ascii'165'
            { symbol: '¦', hex: '#00bfff', name: 'DeepSkyBlue' }, 		 // color #'97' ascii'166'
            { symbol: '§', hex: '#87ceeb', name: 'SkyBlue' }, 		 // color #'98' ascii'167'
            { symbol: '¨', hex: '#87cefa', name: 'LightSkyBlue' }, 		 // color #'99' ascii'168'
            { symbol: '©', hex: '#4682b4', name: 'SteelBlue' }, 		 // color #'100' ascii'169'
            { symbol: 'ª', hex: '#f0f8ff', name: 'AliceBlue' }, 		 // color #'101' ascii'170'
            { symbol: '«', hex: '#1e90ff', name: 'DodgerBlue' }, 		 // color #'102' ascii'171'
            { symbol: '¬', hex: '#778899', name: 'LightSlateGray' }, 		 // color #'103' ascii'172'
            { symbol: '­', hex: '#708090', name: 'SlateGray' }, 		 // color #'104' ascii'173'
            { symbol: '®', hex: '#b0c4de', name: 'LightSteelBlue' }, 		 // color #'105' ascii'174'
            { symbol: '¯', hex: '#6495ed', name: 'CornflowerBlue' }, 		 // color #'106' ascii'175'
            { symbol: '°', hex: '#4169e1', name: 'RoyalBlue' }, 		 // color #'107' ascii'176'
            { symbol: '±', hex: '#0000ff', name: 'Blue' }, 		 // color #'108' ascii'177'
            { symbol: '²', hex: '#00008b', name: 'DarkBlue' }, 		 // color #'109' ascii'178'
            { symbol: '³', hex: '#f8f8ff', name: 'GhostWhite' }, 		 // color #'110' ascii'179'
            { symbol: '´', hex: '#e6e6fa', name: 'Lavender' }, 		 // color #'111' ascii'180'
            { symbol: 'µ', hex: '#0000cd', name: 'MediumBlue' }, 		 // color #'112' ascii'181'
            { symbol: '¶', hex: '#191970', name: 'MidnightBlue' }, 		 // color #'113' ascii'182'
            { symbol: '·', hex: '#000080', name: 'Navy' }, 		 // color #'114' ascii'183'
            { symbol: '¸', hex: '#6a5acd', name: 'SlateBlue' }, 		 // color #'115' ascii'184'
            { symbol: '¹', hex: '#483d8b', name: 'DarkSlateBlue' }, 		 // color #'116' ascii'185'
            { symbol: 'º', hex: '#7b68ee', name: 'MediumSlateBlue' }, 		 // color #'117' ascii'186'
            { symbol: '»', hex: '#9370db', name: 'MediumPurple' }, 		 // color #'118' ascii'187'
            { symbol: '¼', hex: '#8a2be2', name: 'BlueViolet' }, 		 // color #'119' ascii'188'
            { symbol: '½', hex: '#4b0082', name: 'Indigo' }, 		 // color #'120' ascii'189'
            { symbol: '¾', hex: '#9932cc', name: 'DarkOrchid' }, 		 // color #'121' ascii'190'
            { symbol: '¿', hex: '#9400d3', name: 'DarkViolet' }, 		 // color #'122' ascii'191'
            { symbol: 'À', hex: '#ba55d3', name: 'MediumOrchid' }, 		 // color #'123' ascii'192'
            { symbol: 'Á', hex: '#8b008b', name: 'DarkMagenta' }, 		 // color #'124' ascii'193'
            { symbol: 'Â', hex: '#ff00ff', name: 'Fuchsia' }, 		 // color #'125' ascii'194'
            { symbol: 'Ã', hex: '#ff00ff', name: 'Magenta' }, 		 // color #'126' ascii'195'
            { symbol: 'Ä', hex: '#dda0dd', name: 'Plum' }, 		 // color #'127' ascii'196'
            { symbol: 'Å', hex: '#800080', name: 'Purple' }, 		 // color #'128' ascii'197'
            { symbol: 'Æ', hex: '#d8bfd8', name: 'Thistle' }, 		 // color #'129' ascii'198'
            { symbol: 'Ç', hex: '#ee82ee', name: 'Violet' }, 		 // color #'130' ascii'199'
            { symbol: 'È', hex: '#da70d6', name: 'Orchid' }, 		 // color #'131' ascii'200'
            { symbol: 'É', hex: '#c71585', name: 'MediumVioletRed' }, 		 // color #'132' ascii'201'
            { symbol: 'Ê', hex: '#ff1493', name: 'DeepPink' }, 		 // color #'133' ascii'202'
            { symbol: 'Ë', hex: '#ff69b4', name: 'HotPink' }, 		 // color #'134' ascii'203'
            { symbol: 'Ì', hex: '#fff0f5', name: 'LavenderBlush' }, 		 // color #'135' ascii'204'
            { symbol: 'Í', hex: '#db7093', name: 'PaleVioletRed' }, 		 // color #'136' ascii'205'
            { symbol: 'Î', hex: '#dc143c', name: 'Crimson' }, 		 // color #'137' ascii'206'
            { symbol: 'Ï', hex: '#ffc0cb', name: 'Pink' }, 		 // color #'138' ascii'207'
            { symbol: 'Ð', hex: '#ffb6c1', name: 'LightPink' }, 		 // color #'139' ascii'208'

            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 
        ],

        // 
        test: [
            { symbol: '!', hex: '#843530', name: 'Color-132-53-48' }, 		 // color #'0' ascii'33'
            { symbol: '"', hex: '#8b3d32', name: 'Color-139-61-50' }, 		 // color #'1' ascii'34'
            { symbol: '#', hex: '#b36b5a', name: 'Color-179-107-90' }, 		 // color #'2' ascii'35'
            { symbol: '$', hex: '#d7a28b', name: 'Color-215-162-139' }, 		 // color #'3' ascii'36'
            { symbol: '%', hex: '#f67614', name: 'Color-246-118-20' }, 		 // color #'4' ascii'37'
            { symbol: '&', hex: '#f9ad25', name: 'Color-249-173-37' }, 		 // color #'5' ascii'38'
            { symbol: '(', hex: '#a59b88', name: 'Color-165-155-136' }, 		 // color #'6' ascii'40'
            { symbol: ')', hex: '#826e32', name: 'Color-130-110-50' }, 		 // color #'7' ascii'41'
            { symbol: '*', hex: '#cbc8b4', name: 'Color-203-200-180' }, 		 // color #'8' ascii'42'
            { symbol: '+', hex: '#dbd28f', name: 'Color-219-210-143' }, 		 // color #'9' ascii'43'
            { symbol: ',', hex: '#928f76', name: 'Color-146-143-118' }, 		 // color #'10' ascii'44'
            { symbol: '-', hex: '#e5d866', name: 'Color-229-216-102' }, 		 // color #'11' ascii'45'
            { symbol: '.', hex: '#b3b270', name: 'Color-179-178-112' }, 		 // color #'12' ascii'46'
            { symbol: '/', hex: '#7da932', name: 'Color-125-169-50' }, 		 // color #'13' ascii'47'
            { symbol: '0', hex: '#8efe20', name: 'Color-142-254-32' }, 		 // color #'14' ascii'48'
            { symbol: '1', hex: '#5cab22', name: 'Color-92-171-34' }, 		 // color #'15' ascii'49'
            { symbol: '2', hex: '#86e44e', name: 'Color-134-228-78' }, 		 // color #'16' ascii'50'
            { symbol: '3', hex: '#64cb2f', name: 'Color-100-203-47' }, 		 // color #'17' ascii'51'
            { symbol: '4', hex: '#72d63f', name: 'Color-114-214-63' }, 		 // color #'18' ascii'52'
            { symbol: '5', hex: '#57f517', name: 'Color-87-245-23' }, 		 // color #'19' ascii'53'
            { symbol: '6', hex: '#4ce315', name: 'Color-76-227-21' }, 		 // color #'20' ascii'54'
            { symbol: '7', hex: '#3f6e37', name: 'Color-63-110-55' }, 		 // color #'21' ascii'55'
            { symbol: '8', hex: '#68fa56', name: 'Color-104-250-86' }, 		 // color #'22' ascii'56'
            { symbol: '9', hex: '#32e02d', name: 'Color-50-224-45' }, 		 // color #'23' ascii'57'
            { symbol: ':', hex: '#486048', name: 'Color-72-96-72' }, 		 // color #'24' ascii'58'
            { symbol: ';', hex: '#23e628', name: 'Color-35-230-40' }, 		 // color #'25' ascii'59'
            { symbol: '<', hex: '#629f66', name: 'Color-98-159-102' }, 		 // color #'26' ascii'60'
            { symbol: '=', hex: '#78f086', name: 'Color-120-240-134' }, 		 // color #'27' ascii'61'
            { symbol: '>', hex: '#0bc334', name: 'Color-11-195-52' }, 		 // color #'28' ascii'62'
            { symbol: '?', hex: '#8cca9c', name: 'Color-140-202-156' }, 		 // color #'29' ascii'63'
            { symbol: '@', hex: '#1cc251', name: 'Color-28-194-81' }, 		 // color #'30' ascii'64'
            { symbol: 'A', hex: '#22fc76', name: 'Color-34-252-118' }, 		 // color #'31' ascii'65'
            { symbol: 'B', hex: '#12fa77', name: 'Color-18-250-119' }, 		 // color #'32' ascii'66'
            { symbol: 'C', hex: '#7dab94', name: 'Color-125-171-148' }, 		 // color #'33' ascii'67'
            { symbol: 'D', hex: '#14d87a', name: 'Color-20-216-122' }, 		 // color #'34' ascii'68'
            { symbol: 'E', hex: '#81998e', name: 'Color-129-153-142' }, 		 // color #'35' ascii'69'
            { symbol: 'F', hex: '#7ff1bd', name: 'Color-127-241-189' }, 		 // color #'36' ascii'70'
            { symbol: 'G', hex: '#41c289', name: 'Color-65-194-137' }, 		 // color #'37' ascii'71'
            { symbol: 'H', hex: '#85e8bd', name: 'Color-133-232-189' }, 		 // color #'38' ascii'72'
            { symbol: 'I', hex: '#dbe5e1', name: 'Color-219-229-225' }, 		 // color #'39' ascii'73'
            { symbol: 'J', hex: '#27b987', name: 'Color-39-185-135' }, 		 // color #'40' ascii'74'
            { symbol: 'K', hex: '#19d89d', name: 'Color-25-216-157' }, 		 // color #'41' ascii'75'
            { symbol: 'L', hex: '#24be91', name: 'Color-36-190-145' }, 		 // color #'42' ascii'76'
            { symbol: 'M', hex: '#13b78b', name: 'Color-19-183-139' }, 		 // color #'43' ascii'77'
            { symbol: 'N', hex: '#99e5d9', name: 'Color-153-229-217' }, 		 // color #'44' ascii'78'
            { symbol: 'O', hex: '#59d3c7', name: 'Color-89-211-199' }, 		 // color #'45' ascii'79'
            { symbol: 'P', hex: '#144d48', name: 'Color-20-77-72' }, 		 // color #'46' ascii'80'
            { symbol: 'Q', hex: '#2accd4', name: 'Color-42-204-212' }, 		 // color #'47' ascii'81'
            { symbol: 'R', hex: '#2ac1d5', name: 'Color-42-193-213' }, 		 // color #'48' ascii'82'
            { symbol: 'S', hex: '#1dcaf9', name: 'Color-29-202-249' }, 		 // color #'49' ascii'83'
            { symbol: 'T', hex: '#627d8c', name: 'Color-98-125-140' }, 		 // color #'50' ascii'84'
            { symbol: 'U', hex: '#176796', name: 'Color-23-103-150' }, 		 // color #'51' ascii'85'
            { symbol: 'V', hex: '#2c92d4', name: 'Color-44-146-212' }, 		 // color #'52' ascii'86'
            { symbol: 'W', hex: '#045bb3', name: 'Color-4-91-179' }, 		 // color #'53' ascii'87'
            { symbol: 'X', hex: '#afcff3', name: 'Color-175-207-243' }, 		 // color #'54' ascii'88'
            { symbol: 'Y', hex: '#345b8d', name: 'Color-52-91-141' }, 		 // color #'55' ascii'89'
            { symbol: 'Z', hex: '#a1c6ff', name: 'Color-161-198-255' }, 		 // color #'56' ascii'90'
            { symbol: '[', hex: '#276eed', name: 'Color-39-110-237' }, 		 // color #'57' ascii'91'
            { symbol: ']', hex: '#0f41cf', name: 'Color-15-65-207' }, 		 // color #'58' ascii'93'
            { symbol: '^', hex: '#4e5467', name: 'Color-78-84-103' }, 		 // color #'59' ascii'94'
            { symbol: '_', hex: '#2448d6', name: 'Color-36-72-214' }, 		 // color #'60' ascii'95'
            { symbol: '`', hex: '#3252e7', name: 'Color-50-82-231' }, 		 // color #'61' ascii'96'
            { symbol: 'a', hex: '#0317d8', name: 'Color-3-23-216' }, 		 // color #'62' ascii'97'
            { symbol: 'b', hex: '#232bef', name: 'Color-35-43-239' }, 		 // color #'63' ascii'98'
            { symbol: 'c', hex: '#1e1492', name: 'Color-30-20-146' }, 		 // color #'64' ascii'99'
            { symbol: 'd', hex: '#8177e3', name: 'Color-129-119-227' }, 		 // color #'65' ascii'100'
            { symbol: 'e', hex: '#aaa8b9', name: 'Color-170-168-185' }, 		 // color #'66' ascii'101'
            { symbol: 'f', hex: '#9685fb', name: 'Color-150-133-251' }, 		 // color #'67' ascii'102'
            { symbol: 'g', hex: '#54498b', name: 'Color-84-73-139' }, 		 // color #'68' ascii'103'
            { symbol: 'h', hex: '#360cb2', name: 'Color-54-12-178' }, 		 // color #'69' ascii'104'
            { symbol: 'i', hex: '#4008c7', name: 'Color-64-8-199' }, 		 // color #'70' ascii'105'
            { symbol: 'j', hex: '#792df9', name: 'Color-121-45-249' }, 		 // color #'71' ascii'106'
            { symbol: 'k', hex: '#441888', name: 'Color-68-24-136' }, 		 // color #'72' ascii'107'
            { symbol: 'l', hex: '#6907e9', name: 'Color-105-7-233' }, 		 // color #'73' ascii'108'
            { symbol: 'm', hex: '#855fb0', name: 'Color-133-95-176' }, 		 // color #'74' ascii'109'
            { symbol: 'n', hex: '#7124c3', name: 'Color-113-36-195' }, 		 // color #'75' ascii'110'
            { symbol: 'o', hex: '#9a2ffc', name: 'Color-154-47-252' }, 		 // color #'76' ascii'111'
            { symbol: 'p', hex: '#a30ffe', name: 'Color-163-15-254' }, 		 // color #'77' ascii'112'
            { symbol: 'q', hex: '#59057e', name: 'Color-89-5-126' }, 		 // color #'78' ascii'113'
            { symbol: 'r', hex: '#561071', name: 'Color-86-16-113' }, 		 // color #'79' ascii'114'
            { symbol: 's', hex: '#c36be4', name: 'Color-195-107-228' }, 		 // color #'80' ascii'115'
            { symbol: 't', hex: '#da90f1', name: 'Color-218-144-241' }, 		 // color #'81' ascii'116'
            { symbol: 'u', hex: '#894998', name: 'Color-137-73-152' }, 		 // color #'82' ascii'117'
            { symbol: 'v', hex: '#c317d2', name: 'Color-195-23-210' }, 		 // color #'83' ascii'118'
            { symbol: 'w', hex: '#b20eb7', name: 'Color-178-14-183' }, 		 // color #'84' ascii'119'
            { symbol: 'x', hex: '#cb50cd', name: 'Color-203-80-205' }, 		 // color #'85' ascii'120'
            { symbol: 'y', hex: '#9f729f', name: 'Color-159-114-159' }, 		 // color #'86' ascii'121'
            { symbol: 'z', hex: '#d64bcf', name: 'Color-214-75-207' }, 		 // color #'87' ascii'122'
            { symbol: '{', hex: '#511f4b', name: 'Color-81-31-75' }, 		 // color #'88' ascii'123'
            { symbol: '|', hex: '#9d388c', name: 'Color-157-56-140' }, 		 // color #'89' ascii'124'
            { symbol: '}', hex: '#fd2fc1', name: 'Color-253-47-193' }, 		 // color #'90' ascii'125'
            { symbol: '~', hex: '#5c2b40', name: 'Color-92-43-64' }, 		 // color #'91' ascii'126'
            { symbol: '¡', hex: '#da9cb5', name: 'Color-218-156-181' }, 		 // color #'92' ascii'161'
            { symbol: '¢', hex: '#e292ad', name: 'Color-226-146-173' }, 		 // color #'93' ascii'162'
            { symbol: '£', hex: '#cb0a43', name: 'Color-203-10-67' }, 		 // color #'94' ascii'163'
            { symbol: '¤', hex: '#fc7194', name: 'Color-252-113-148' }, 		 // color #'95' ascii'164'
            { symbol: '¥', hex: '#fe0a26', name: 'Color-254-10-38' }, 		 // color #'96' ascii'165'
            { symbol: '¦', hex: '#873d3f', name: 'Color-135-61-63' }, 		 // color #'97' ascii'166'
            { symbol: '§', hex: '#9e383a', name: 'Color-158-56-58' }, 		 // color #'98' ascii'167'
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' },

        ],

        //
        spaceInvaders: [
            { symbol: 'R', hex: '#FF0000', name: 'Red' },
            { symbol: 'O', hex: '#FFA500', name: 'Orange' },
            { symbol: 'Y', hex: '#FFFF00', name: 'Yellow' },
            { symbol: 'G', hex: '#008000', name: 'Green' },
            { symbol: 'B', hex: '#0000FF', name: 'Blue' },
            { symbol: 'I', hex: '#4B0082', name: 'Indigo' },
            { symbol: 'V', hex: '#EE82EE', name: 'Violet' },
            { symbol: '1', hex: '#FFFFFe', name: 'white' },
            { symbol: 'w', hex: '#FFFFFF', name: 'white' },
            { symbol: 'b', hex: '#000000', name: 'black' },
            { symbol: 'P', hex: '#FFC0CB', name: 'pink' },
            { symbol: 'C', hex: '#00FFFF', name: 'cyan' },
            { symbol: 'M', hex: '#FF00FF', name: 'magenta' },
            { symbol: 'L', hex: '#D3D3D3', name: 'lightgray' },
            { symbol: 'D', hex: '#A9A9A9', name: 'darkgray' },
            { symbol: 'V', hex: '#444444', name: 'very dark gray' },
            { symbol: 'A', hex: '#AAFFFF', name: 'light cyan' },
            { symbol: 'S', hex: '#C0C0C0', name: 'silver' },
            { symbol: 'N', hex: '#000080', name: 'navy' },
            { symbol: 'K', hex: '#F0E68C', name: 'khaki' },
            // Transparent
            { symbol: 'Ø', hex: '#00000000', name: 'Transparent' }, 	//<!--  LAST --> 
        ]
    };

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
        palette.forEach((color, index) => {
            value += `${index}   ${color.symbol}   ${color.hex}  ${color.name}\n`;
        });
        return value;
    }

    // Get an item by its index
    static getByIndex(index) {
        const palette = this.getPallet(); // Use current palette
        if (index < 0 || index >= palette.length) {
            console.error(`Index out of bounds: ${index}`);
            return SpritePalettes.errorResult;
        }
        return palette[index];
    }

    // Get an item by its symbol
    static getBySymbol(symbol) {
        const palette = this.getPallet(); // Use current palette

        let result = '';
        // Validate that symbol is a non-empty string and a single ASCII character
        if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
            console.error("Invalid symbol provided:", symbol);
            result = SpritePalettes.errorResult;
        }

        // Search the palette for the symbol
        result = palette.find(item => item.symbol === symbol);

        if (!result) {
            console.error(`Symbol not found:'${symbol}'`);
            result = SpritePalettes.errorResult;
        }

        return result;
    }

    // Get an item by its hex value
    static getByHex(hex) {
        const palette = this.getPallet(); // Use current palette
        const result = palette.find(item => item.hex.toLowerCase() === hex.toLowerCase());
        if (!result) {
            console.error(`Hex not found: ${hex}`);
            return SpritePalettes.errorResult;
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

    // Helper function to convert hex to RGB
    static hexToRgb(hex) {
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

    // Helper function to check if a color is transparent (based on alpha)
    static isTransparent(hex) {
        // Assuming the color is in #RRGGBBAA format
        if (hex === SpritePalettes.transparentColor || hex.length === 9) {
            let alpha = parseInt(hex.slice(7, 9), 16) / 255;
            return alpha < 1;
        }
        // If it's not in #RRGGBBAA format, assume it's fully opaque
        return false;
    }

    /** sort options:
        // Sorting by Hue
        const sortedByHue = sortColors(colors, 'hue');
        // Sorting by Saturation
        const sortedBySaturation = sortColors(colors, 'saturation');
        // Sorting by Lightness
        const sortedByLightness = sortColors(colors, 'lightness');
     */
    static sortColors(colors, sortBy = 'hue') {
        colors.sort((a, b) => {
            // Check for transparency
            if (SpritePalettes.isTransparent(a.hex)) {
                return 1; // Move transparent color 'a' to the bottom
            }
            if (SpritePalettes.isTransparent(b.hex)) {
                return -1; // Move transparent color 'b' to the bottom
            }

            // Convert hex to RGB
            let rgbA = SpritePalettes.hexToRgb(a.hex);
            let rgbB = SpritePalettes.hexToRgb(b.hex);

            // Convert RGB to HSL
            let hslA = SpritePalettes.rgbToHsl(rgbA.r, rgbA.g, rgbA.b);
            let hslB = SpritePalettes.rgbToHsl(rgbB.r, rgbB.g, rgbB.b);

            // Sort based on the selected criterion
            if (sortBy === 'hue') {
                return hslA.h - hslB.h; // Sort by hue
            } else if (sortBy === 'saturation') {
                return hslA.s - hslB.s; // Sort by saturation
            } else if (sortBy === 'lightness') {
                return hslA.l - hslB.l; // Sort by lightness
            } else {
                console.log('sortBy:', sortBy); // Debug log to check the value
                console.warn(` --- Invalid sortBy value:'${sortBy}'. Defaulting to 'hue'. ---`);
                return hslA.h - hslB.h; // Default to sorting by hue
            }
        });
        return colors;
    }
    /* The hue range for each color in the visible spectrum (ROYGBIV) within the HSL (Hue, Saturation, Lightness) model is generally as follows: */
    // const colorRanges = {
    //     Red: ['#FF0000', '#FF6347'], // 0°–30° and 330°–360°    Red
    //     Orange: ['#FFA500', '#FF8C00'], // 30°–60°              Orange
    //     Yellow: ['#FFFF00', '#FFD700'], // 60°–90°              Yellow
    //     Green: ['#00FF00', '#32CD32'], // 90°–150°              Green
    //     Blue: ['#0000FF', '#1E90FF'], // 180°–240°              Blue
    //     Indigo: ['#4B0082', '#6A5ACD'], // 240°–270°            Indigo
    //     Violet: ['#EE82EE', '#9400D3'], // 270°–330°            Violet
    // };
}

export default SpritePalettes;

//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------
// Sorted Color pallette 'xxxx' by 'yyyy'
if (false) {  // sort colors and put on editor screen.
    SpritePalettes.setPalette("default");
    var sortBy = "saturation"; // hue, saturation, lightness

    let value = `<h1>Sorted Color pallette '${SpritePalettes.currentPaletteName}' by '${sortBy}'</h1>`;
    value += '<p>Options are: hue, saturation, & lightness</p>';
    value += '<textarea id="orderedColor" rows="35" cols="150" style="height: 35%;">';

    // colors to Sort 
    var sortedColors = SpritePalettes.sortColors(SpritePalettes.getPallet(), sortBy);

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

        var rgb = SpritePalettes.hexToRgb(color.hex);
        let hsl = SpritePalettes.rgbToHsl(rgb.r, rgb.g, rgb.b);

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
        console.error("orderedColorDiv not found.");
    } else {
        orderedColorDiv.innerHTML = value;
    }
}
//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------