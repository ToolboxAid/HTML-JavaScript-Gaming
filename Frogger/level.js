// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// level.js

import CanvasUtils from '../scripts/canvas.js';
import ObjectPNG from '../scripts/objectPNG.js';
import SystemUtils from '../scripts/utils/systemUtils.js';
import { canvasConfig } from './global.js';

class Level {

    // Debug mode enabled via URL parameter: game.html?level
    static DEBUG = new URLSearchParams(window.location.search).has('level');

    // Frame Rate: 60 FPS
    // Canvas Size: 224x256 pixels (original arcade)
    // Grid Size: Each cell 16x16 pixels
    // 13x14 grid layout
    // 13 * 16 = 208
    // 14 * 16 = 224

    // Score display uses the top 32 pixels
    // Play field is centered with 8 pixel margins on sides
    // Grid aligns perfectly within the play area


    // 5 safe zones (start, 3 middle strips, goal area)
    // - 5 goal spots at top
    // - Water zone with logs/turtles
    //   -  3 lanes of logs/turtles
    // - Safe zone
    // - Road zone with vehicles
    //   - 3 lanes of traffic
    // - Grass zone with player

    static GRID_SIZE = 16;        // Size of each cell
    static GRID_WIDTH = 13;       // Number of cells across
    static GRID_HEIGHT = 14; //s/b 14;// Number of cells down
    static MARGIN_X = 32;          // Left/right margins
    static MARGIN_TOP = 32 * 2 - 8;       // Top margin is reserved for score
    static MARGIN_BOTTOM = 0;     // Bottom margin

    // Grid zone types
    static ZONE = {
        GOAL: 'G',      // Goal area at top
        WATER: 'W',     // Water lanes
        SAFE: 'S',      // Safe zones (grass)
        ROAD: 'R',      // Road lanes
        HOME: 'H'       // Home spots at top
    };
    static COLORS = {
        [Level.ZONE.GOAL]: '#383',  // Dark green for goal area
        [Level.ZONE.WATER]: '#44F',  // Blue for water
        [Level.ZONE.SAFE]: '#494',   // Green for safe zones
        [Level.ZONE.ROAD]: '#444',   // Dark gray for road
        [Level.ZONE.HOME]: '#8F8',   // Light green for home spots
    };

    static alphaNumWhiteSprite = null;
    static alphaNumRedSprite = null;
    static alphaNumYellowSprite = null;
    static timerLivesSprite = null;
    static groundHomeSprite = null;
    static groundSprite = null;
    static spritesLoaded = false;

    // Static initialization block
    static {
        Level.loadSprites().then(() => {
            Level.spritesLoaded = true;
            if (Level.DEBUG) {
                console.log('All sprites loaded');
                console.log("alphaNumWhiteSprite", Level.alphaNumWhiteSprite);
                console.log("alphaNumRedSprite", Level.alphaNumRedSprite);
                console.log("alphaNumYellowSprite", Level.alphaNumYellowSprite);
                console.log("timerLivesSprite", Level.timerLivesSprite);
                console.log("groundHomeSprite", Level.groundHomeSprite);
                console.log("groundSprite", Level.groundSprite);
            }
        });
    }

    static async loadSprites() {
        try {
            // Load both sprites in parallel
            const [alphaNum, alphaNumRed, alphaNumYellow, timerLives, groundHome, ground] = await Promise.all([
                ObjectPNG.loadSprite('./assets/images/alpha_num_white_sprite_24w_24h_40f.png', 'black'),
                ObjectPNG.loadSprite('./assets/images/alpha_num_red_sprite_24w_24h_40f.png', 'black'),
                ObjectPNG.loadSprite('./assets/images/alpha_num_yellow_sprite_24w_24h_40f.png', 'black'),
                ObjectPNG.loadSprite('./assets/images/timer_lives_sprite_24w_24h_6f.png', 'black'),
                ObjectPNG.loadSprite('./assets/images/ground_home_sprite_24w_24h_8f.png', 'black'),
                ObjectPNG.loadSprite('./assets/images/ground_sprite_48w_48h_1f.png', 'black')
            ]);
            //timer_lives_sprite_24w_24h_6f

            // Assign loaded sprites to static properties
            Level.alphaNumWhiteSprite = alphaNum;
            Level.alphaNumRedSprite = alphaNumRed;
            Level.alphaNumYellowSprite = alphaNumYellow;
            Level.timerLivesSprite = timerLives;
            Level.groundHomeSprite = groundHome;
            Level.groundSprite = ground;
            Level.spritesLoaded = true;

            if (Level.DEBUG) {
                console.log('Sprites loaded:', {
                    alphaNum: Level.alphaNumWhiteSprite,
                    alphaNumRed: Level.alphaNumRedSprite,
                    alphaNumYellow: Level.alphaNumYellowSprite,
                    timerLives: Level.timerLivesSprite,
                    groundHome: Level.groundHomeSprite,
                    ground: Level.groundSprite
                });
            }
        } catch (error) {
            console.error('Failed to load sprites:', error);
        }
    }

    static drawText(text, x, y, alphaNum, scale = 1, background = '#00000000') {
        // Draw text using the alpha/num sprite sheet
        if (!Level.spritesLoaded || !alphaNum) {
            if (Level.DEBUG) console.warn('Alpha/Num sprite not loaded');
            return;
        }

        const CHAR_WIDTH = 24;
        const CHAR_HEIGHT = 24;
        const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ- ©□';

        // Convert text to uppercase to match sprite sheet
        text = text.toUpperCase();

        // Draw each character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charIndex = CHARS.indexOf(char);

            if (charIndex !== -1) {

                // background fill
                CanvasUtils.ctx.fillStyle = background;
                CanvasUtils.ctx.fillRect(
                    x + (i * CHAR_WIDTH * scale) - 5,
                    y - 5,
                    Level.GRID_SIZE + 15,
                    Level.GRID_SIZE + 15);

                // Draw character
                CanvasUtils.ctx.drawImage(
                    alphaNum,
                    charIndex * CHAR_WIDTH, 0,     // Source x,y
                    CHAR_WIDTH-1, CHAR_HEIGHT-1,       // Source dimensions
                    x + (i * CHAR_WIDTH * scale),  // Destination x
                    y,                             // Destination y
                    CHAR_WIDTH * scale,            // Destination width
                    CHAR_HEIGHT * scale            // Destination height
                );
            } else if (char === ' ') {
                // Skip spaces
                continue;
            } else if (Level.DEBUG) {
                console.warn(`Character not found in sprite: ${char}`);
            }
        }
    }

    constructor() {
        this.type = 'level';

        // Actual playfield starts at MARGIN_X, MARGIN_TOP
        this.playFieldX = Level.MARGIN_X;
        this.playFieldY = Level.MARGIN_TOP;
        this.playFieldHeightHalf = (((Level.GRID_HEIGHT) * Level.GRID_SIZE * 4) / 2);
        this.playFieldWidth = Level.GRID_WIDTH * Level.GRID_SIZE * 4 - Level.MARGIN_X + 32;
        this.playFieldTop = Level.GRID_HEIGHT * Level.GRID_SIZE;

        // Initialize the grid layout
        this.initializeGrid();
    }
    initializeGrid() {
        // Initialize the 13x14 grid layout
        this.grid = [
            // Top row (0) - Goal area with 5 home spots
            //1    2    3    4    5    6   7    8    9    10   11   12   13
            ['G', 'G', 'H', 'G', 'H', 'G', 'H', 'G', 'H', 'G', 'H', 'G', 'G'],//0
            ['G', 'G', 'H', 'G', 'H', 'G', 'H', 'G', 'H', 'G', 'H', 'G', 'G'],//1
            // Rows 1-5 - Water with logs/turtles
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],//2
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],//3
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],//4
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],//5
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],//6
            // Row 6 - Safe zone (grass)
            ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],//7
            // Rows 7-11 - Road with vehicles
            ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],//8
            ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],//9
            ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],//10
            ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],//11
            ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],//12
            // Row 12 - Safe zone (grass)
            ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],//13
        ];

        this.homeGrid = [
            //[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,],
            [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
            [4, 4, 2, 2, 4, 4, 4, 2, 2, 4, 4, 4, 2, 2, 4, 4, 4, 2, 2, 4, 4, 4, 2, 2, 4, 4],
            [4, 5, 8, 8, 3, 4, 5, 8, 8, 3, 4, 5, 8, 8, 3, 4, 5, 8, 8, 3, 4, 5, 8, 8, 3, 4],
            [2, 7, 8, 8, 6, 2, 7, 8, 8, 6, 2, 7, 8, 8, 6, 2, 7, 8, 8, 6, 2, 7, 8, 8, 6, 2],
        ];
    }
    update() {
        this.timerUpdate();
    }

    drawGrid() {
        for (let row = 0; row < Level.GRID_HEIGHT; row++) {
            for (let col = 0; col < Level.GRID_WIDTH; col++) {
                const cellType = this.grid[row][col];
                const x = col * Level.GRID_SIZE * 4 + Level.MARGIN_X;
                const y = row * Level.GRID_SIZE * 4 + Level.MARGIN_TOP;

                const offset = Level.GRID_SIZE;
                // Fill cell with zone color
                CanvasUtils.ctx.fillStyle = Level.COLORS[cellType];
                CanvasUtils.ctx.fillRect(x + offset, y + offset, Level.GRID_SIZE, Level.GRID_SIZE);

                // Draw grid lines
                CanvasUtils.ctx.lineWidth = 1;
                CanvasUtils.ctx.strokeStyle = 'white';
                CanvasUtils.ctx.strokeRect(x + offset, y + offset, Level.GRID_SIZE, Level.GRID_SIZE);

                // Debug: show cell types
                CanvasUtils.ctx.fillStyle = '#FFF';
                CanvasUtils.ctx.font = '8px Arial';
                CanvasUtils.ctx.fillText(cellType, x + 4 + offset, y + 12 + offset);

                // Draw cell size indicator lines, actual cell size (16x16 scaled by 4)
                CanvasUtils.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';  // Semi-transparent
                CanvasUtils.ctx.strokeRect(x, y, Level.GRID_SIZE * 4, Level.GRID_SIZE * 4);

                // Draw crosshair at cell center
                const centerX = x + (Level.GRID_SIZE * 4) / 2;
                const centerY = y + (Level.GRID_SIZE * 4) / 2;
                CanvasUtils.ctx.beginPath();
                CanvasUtils.ctx.moveTo(centerX - 10, centerY);
                CanvasUtils.ctx.lineTo(centerX + 10, centerY);
                CanvasUtils.ctx.moveTo(centerX, centerY - 10);
                CanvasUtils.ctx.lineTo(centerX, centerY + 10);
                CanvasUtils.ctx.strokeStyle = 'yellow';
                CanvasUtils.ctx.stroke();

                // Draw cell type and dimensions
                CanvasUtils.ctx.fillStyle = '#FFF';
                CanvasUtils.ctx.font = '8px Arial';
                CanvasUtils.ctx.fillText(cellType, x + 4 + offset, y + 12 + offset);
                CanvasUtils.ctx.fillText(`${Level.GRID_SIZE * 4}px`, x + 4, y + Level.GRID_SIZE * 4 - 4);

            }
        }
    }

    drawSaveZones(offsetY) {
        // Draw sprites for save zones only if sprites are loaded
        if (Level.spritesLoaded && Level.groundSprite) {
            for (let col = 0; col < Level.GRID_WIDTH; col++) {
                // ground_sprite_48w_48h_1f.png
                CanvasUtils.ctx.drawImage(
                    Level.groundSprite,
                    0, 0,                    // Source x,y (first frame)
                    48, 48,                  // Source width,height
                    col * Level.GRID_SIZE * 4 + Level.MARGIN_X,  // Destination x
                    offsetY,//row * Level.GRID_SIZE * 4 + Level.MARGIN_TOP, // Destination y
                    Level.GRID_SIZE * 4,     // Destination width
                    Level.GRID_SIZE * 4      // Destination height
                );
            }
        } else if (Level.DEBUG) {
            console.warn('Sprites not loaded yet');
        }
    }
    drawHomeSpots() {
        if (Level.spritesLoaded && Level.groundHomeSprite) {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 28; col++) {
                    CanvasUtils.ctx.drawImage(
                        Level.groundHomeSprite,
                        this.homeGrid[row][col] * 24, 0, // Source x,y (first frame)
                        24, 24,                          // Source width,height
                        col * Level.GRID_SIZE * 2 + Level.MARGIN_X,  // Destination x
                        Level.MARGIN_TOP + row * Level.GRID_SIZE * 2, // Destination y
                        Level.GRID_SIZE * 2,             // Destination width
                        Level.GRID_SIZE * 2              // Destination height
                    );
                }
            }
        }
    }
    drawTimerLives() {  //timer_lives_sprite_24w_24h_6f
        if (Level.spritesLoaded && Level.timerLivesSprite) {

            // ---------------------------------------
            // Level
            const col = 12;
            const row = 14;
            for (let level = 0; level < 15; level++) {
                CanvasUtils.ctx.drawImage(
                    Level.timerLivesSprite,
                    0, 0, // Source x,y (first frame)
                    24 - 1, 24 - 1,      // Source width,height
                    770-level * 26 + Level.MARGIN_X + 12,  // Destination x
                    Level.MARGIN_TOP + row * Level.GRID_SIZE * 4 + 6, // Destination y
                    Level.GRID_SIZE * 2, // Destination width
                    Level.GRID_SIZE * 2  // Destination height
                );
            }
            // ---------------------------------------
            // Lives
            for (let lives = 0; lives < 7; lives++) {
                CanvasUtils.ctx.drawImage(
                    Level.timerLivesSprite,
                    24, 0, // Source x,y (first frame)
                    24 - 1, 24 - 1,      // Source width,height
                    lives * 34 + Level.MARGIN_X,  // Destination x
                    Level.MARGIN_TOP + row * Level.GRID_SIZE * 4 + 6, // Destination y
                    Level.GRID_SIZE * 2, // Destination width
                    Level.GRID_SIZE * 2  // Destination height
                );
            }

            // ---------------------------------------
            // Time Bar
            // for (let time = 0; time < Level.timer; time++) {
            //     const rightAlignedX = 685 - time * 26;  // Start from right side
            //     CanvasUtils.ctx.drawImage(
            //         Level.timerLivesSprite,
            //         24 * 2, 0,             //2-5        // Source x,y (first frame)
            //         24 - 1, 24 - 1,                     // Source width,height
            //         rightAlignedX + Level.MARGIN_X,     // Destination x (right-aligned)
            //         Level.MARGIN_TOP + row * Level.GRID_SIZE * 4 + 40, // Destination y
            //         Level.GRID_SIZE * 2,                // Destination width
            //         Level.GRID_SIZE * 2                 // Destination height
            //     );
            // }

// Time Bar section in drawTimerLives method
// ---------------------------------------
// Time Bar
if (Level.spritesLoaded && Level.timerLivesSprite) {
    // Frame data for timer sprites (frames 2-5)
    const timerFrames = [
        { sourceX: 24 * 2, width: 24 },  // Frame 2
        { sourceX: 24 * 3, width: 18 },  // Frame 3
        { sourceX: 24 * 4, width: 12 },  // Frame 4
        { sourceX: 24 * 5, width: 6 }    // Frame 5
    ];
    
    for (let time = 0; time < Level.timer; time++) {
        // Calculate which frame to use based on remaining time
        const frameIndex = Math.floor((time / Level.timerMax) * timerFrames.length);
        const frame = timerFrames[Math.min(frameIndex, timerFrames.length - 1)];
        
        const rightAlignedX = 685 - time * 26;  // Start from right side
        CanvasUtils.ctx.drawImage(
            Level.timerLivesSprite,
            frame.sourceX, 0,                    // Source x,y (frames 2-5)
            frame.width, 24 - 1,                 // Source width (varies), height
            rightAlignedX + Level.MARGIN_X,      // Destination x (right-aligned)
            Level.MARGIN_TOP + row * Level.GRID_SIZE * 4 + 40, // Destination y
            Level.GRID_SIZE * 2,                 // Destination width
            Level.GRID_SIZE * 2                  // Destination height
        );
    }
}           
        }
    }

    static timer = 0;
    static timerMax = 20;
    static timerSpeed = 0.05;
    static timerDirection = 1;
    timerUpdate() {
        Level.timer += Level.timerSpeed * Level.timerDirection;
        if (Level.timer >= Level.timerMax) {
            Level.timer = Level.timerMax;
            Level.timerDirection = -1;
        } else if (Level.timer <= 0) {
            Level.timer = 0;
            Level.timerDirection = 1;
        }
    }

    draw() {
        // Draw background water
        CanvasUtils.ctx.fillStyle = 'navy';
        CanvasUtils.ctx.fillRect(
            Level.MARGIN_X,
            0,
            //Level.MARGIN_TOP + 32,
            this.playFieldWidth,
            this.playFieldHeightHalf + 32 + Level.MARGIN_TOP + 32);

        // Draw background road            
        CanvasUtils.ctx.fillStyle = 'black';
        CanvasUtils.ctx.fillRect(Level.MARGIN_X,
            Level.MARGIN_TOP + this.playFieldHeightHalf + 32,
            this.playFieldWidth,
            this.playFieldHeightHalf - 32);

        // Draw players and High score
        // Draw score at top of screen
        Level.drawText('1-UP', 100, 16, Level.alphaNumWhiteSprite);
        Level.drawText('HIGH SCORE', 320, 16, Level.alphaNumWhiteSprite);
        Level.drawText('2-UP', 680, 16, Level.alphaNumWhiteSprite);

        // Draw scores
        const up_1 = SystemUtils.numberToString(0, 5, ' ');
        const high = SystemUtils.numberToString(999, 5, ' ');
        const up_2 = SystemUtils.numberToString(99999, 5, ' ');
        Level.drawText(up_1, 100 - 24, 16 + 32, Level.alphaNumRedSprite);
        Level.drawText(high, 320 + 24 * 2, 16 + 32, Level.alphaNumRedSprite);
        Level.drawText(up_2, 680 - 24, 16 + 32, Level.alphaNumRedSprite, 1);

        // Draw larger Game Over text
        Level.drawText('GAME OVER', 200, 300, Level.alphaNumWhiteSprite, 2);


        // Draw sprites for top row (home spots) only if sprites are loaded
        this.drawHomeSpots();

        // Draw sprites safe zones
        this.drawSaveZones(7 * Level.GRID_SIZE * 4 + Level.MARGIN_TOP);
        this.drawSaveZones(13 * Level.GRID_SIZE * 4 + Level.MARGIN_TOP);

        // Draw sprites for timer/lives
        this.drawTimerLives();

        // Draw text for start and time
        Level.drawText(' start ', 350, 542, Level.alphaNumRedSprite, 1, "black");
        Level.drawText('time', 765, 998, Level.alphaNumYellowSprite, 1, "black");

        if (Level.DEBUG) {
            // Draw grid cells
            this.drawGrid();

            // Draw grid outline
            CanvasUtils.ctx.strokeStyle = 'yellow';
            CanvasUtils.ctx.lineWidth = 2;
            CanvasUtils.ctx.strokeRect(
                Level.MARGIN_X,
                Level.MARGIN_TOP,
                Level.GRID_WIDTH * Level.GRID_SIZE * 4 - Level.MARGIN_X + 32,
                Level.GRID_HEIGHT * Level.GRID_SIZE * 4
            );
            // 48 128 736 832
            //console.log(Level.MARGIN_X, Level.MARGIN_TOP, 
            // Level.GRID_WIDTH * Level.GRID_SIZE * 4 - Level.MARGIN_X *2, Level.GRID_HEIGHT * Level.GRID_SIZE * 4); 

        }

    }
}

export default Level;