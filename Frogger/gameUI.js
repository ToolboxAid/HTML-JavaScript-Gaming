// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// gameUI.js

import CanvasUtils from '../scripts/canvas.js';
import ObjectPNG from '../scripts/objectPNG.js';
import SystemUtils from '../scripts/utils/systemUtils.js';

class GameUI {

    // Debug mode enabled via URL parameter: game.html?gameUI
    static DEBUG = new URLSearchParams(window.location.search).has('gameUI');
    static DEBUG1 = new URLSearchParams(window.location.search).has('gameUI1');

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
    // - Road zone with gameObjects
    //   - 3 lanes of traffic
    // - Grass zone with player

    static GRID_SIZE = 16;        // Size of each cell
    static GRID_WIDTH = 13;       // Number of cells across
    static GRID_HEIGHT = 14; //s/b 14;// Number of cells down
    static MARGIN_X = 0;//32;          // Left/right margins
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
        [GameUI.ZONE.GOAL]: '#383',  // Dark green for goal area
        [GameUI.ZONE.WATER]: '#44F',  // Blue for water
        [GameUI.ZONE.SAFE]: '#494',   // Green for safe zones
        [GameUI.ZONE.ROAD]: '#444',   // Dark gray for road
        [GameUI.ZONE.HOME]: '#8F8',   // Light green for home spots
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
        GameUI.loadSprites().then(() => {
            GameUI.spritesLoaded = true;
            if (GameUI.DEBUG) {
                console.log('All sprites loaded');
                console.log("alphaNumWhiteSprite", GameUI.alphaNumWhiteSprite);
                console.log("alphaNumRedSprite", GameUI.alphaNumRedSprite);
                console.log("alphaNumYellowSprite", GameUI.alphaNumYellowSprite);
                console.log("timerLivesSprite", GameUI.timerLivesSprite);
                console.log("groundHomeSprite", GameUI.groundHomeSprite);
                console.log("groundSprite", GameUI.groundSprite);
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

            // Assign loaded sprites to static properties
            GameUI.alphaNumWhiteSprite = alphaNum;
            GameUI.alphaNumRedSprite = alphaNumRed;
            GameUI.alphaNumYellowSprite = alphaNumYellow;
            GameUI.timerLivesSprite = timerLives;
            GameUI.groundHomeSprite = groundHome;
            GameUI.groundSprite = ground;
            GameUI.spritesLoaded = true;

            if (GameUI.DEBUG) {
                console.log('Sprites loaded:', {
                    alphaNum: GameUI.alphaNumWhiteSprite,
                    alphaNumRed: GameUI.alphaNumRedSprite,
                    alphaNumYellow: GameUI.alphaNumYellowSprite,
                    timerLives: GameUI.timerLivesSprite,
                    groundHome: GameUI.groundHomeSprite,
                    ground: GameUI.groundSprite
                });
            }
        } catch (error) {
            console.error('Failed to load sprites:', error);
        }
    }

    static drawText(text, x, y, alphaNum, scale = 1, background = '#00000000') {
        // Draw text using the alpha/num sprite sheet
        if (!GameUI.spritesLoaded || !alphaNum) {
            if (GameUI.DEBUG) console.warn('Alpha/Num sprite not loaded');
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
                    GameUI.GRID_SIZE + 15,
                    GameUI.GRID_SIZE + 15);

                // Draw character
                CanvasUtils.ctx.drawImage(
                    alphaNum,
                    charIndex * CHAR_WIDTH, 0,     // Source x,y
                    CHAR_WIDTH - 1, CHAR_HEIGHT - 1,       // Source dimensions
                    x + (i * CHAR_WIDTH * scale),  // Destination x
                    y,                             // Destination y
                    CHAR_WIDTH * scale,            // Destination width
                    CHAR_HEIGHT * scale            // Destination height
                );
            } else if (char === ' ') {
                // Skip spaces
                continue;
            } else if (GameUI.DEBUG) {
                console.warn(`Character not found in sprite: ${char}`);
            }
        }
    }

    constructor() {
        this.type = 'gameUI';

        // Actual playfield starts at MARGIN_X, MARGIN_TOP
        this.playFieldX = GameUI.MARGIN_X;
        this.playFieldY = GameUI.MARGIN_TOP;
        this.playFieldHeightHalf = (((GameUI.GRID_HEIGHT) * GameUI.GRID_SIZE * 4) / 2);
        this.playFieldWidth = GameUI.GRID_WIDTH * GameUI.GRID_SIZE * 4 - GameUI.MARGIN_X + 32;
        this.playFieldTop = GameUI.GRID_HEIGHT * GameUI.GRID_SIZE;

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
            // Rows 7-11 - Road with gameObjects
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
        for (let row = 0; row < GameUI.GRID_HEIGHT; row++) {
            for (let col = 0; col < GameUI.GRID_WIDTH; col++) {
                const cellType = this.grid[row][col];
                const x = col * GameUI.GRID_SIZE * 4 + GameUI.MARGIN_X;
                const y = row * GameUI.GRID_SIZE * 4 + GameUI.MARGIN_TOP;

                const offset = GameUI.GRID_SIZE;
                // Fill cell with zone color
                CanvasUtils.ctx.fillStyle = GameUI.COLORS[cellType];
                CanvasUtils.ctx.fillRect(x + offset, y + offset, GameUI.GRID_SIZE, GameUI.GRID_SIZE);

                // Draw grid lines
                CanvasUtils.ctx.lineWidth = 1;
                CanvasUtils.ctx.strokeStyle = 'white';
                CanvasUtils.ctx.strokeRect(x + offset, y + offset, GameUI.GRID_SIZE, GameUI.GRID_SIZE);

                // Debug: show cell types
                CanvasUtils.ctx.fillStyle = '#FFF';
                CanvasUtils.ctx.font = '8px Arial';
                CanvasUtils.ctx.fillText(cellType, x + 4 + offset, y + 12 + offset);

                // Draw cell size indicator lines, actual cell size (16x16 scaled by 4)
                CanvasUtils.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';  // Semi-transparent
                CanvasUtils.ctx.strokeRect(x, y, GameUI.GRID_SIZE * 4, GameUI.GRID_SIZE * 4);

                // Draw crosshair at cell center
                const centerX = x + (GameUI.GRID_SIZE * 4) / 2;
                const centerY = y + (GameUI.GRID_SIZE * 4) / 2;
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
                CanvasUtils.ctx.fillText(`${GameUI.GRID_SIZE * 4}px`, x + 4, y + GameUI.GRID_SIZE * 4 - 4);

            }
        }
    }

    drawSaveZones(offsetY) {
        // Draw sprites for save zones only if sprites are loaded
        if (GameUI.spritesLoaded && GameUI.groundSprite) {
            for (let col = 0; col < GameUI.GRID_WIDTH; col++) {
                // ground_sprite_48w_48h_1f.png
                CanvasUtils.ctx.drawImage(
                    GameUI.groundSprite,
                    0, 0,                    // Source x,y (first frame)
                    48, 48,                  // Source width,height
                    col * GameUI.GRID_SIZE * 4 + GameUI.MARGIN_X,  // Destination x
                    offsetY,//row * GameUI.GRID_SIZE * 4 + GameUI.MARGIN_TOP, // Destination y
                    GameUI.GRID_SIZE * 4,     // Destination width
                    GameUI.GRID_SIZE * 4      // Destination height
                );
            }
        } else if (GameUI.DEBUG) {
            console.warn('Sprites not loaded yet');
        }
    }
    drawHomeSpots() {
        if (GameUI.spritesLoaded && GameUI.groundHomeSprite) {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 28; col++) {
                    CanvasUtils.ctx.drawImage(
                        GameUI.groundHomeSprite,
                        this.homeGrid[row][col] * 24, 0, // Source x,y (first frame)
                        24, 24,                          // Source width,height
                        col * GameUI.GRID_SIZE * 2 + GameUI.MARGIN_X,  // Destination x
                        GameUI.MARGIN_TOP + row * GameUI.GRID_SIZE * 2, // Destination y
                        GameUI.GRID_SIZE * 2,             // Destination width
                        GameUI.GRID_SIZE * 2              // Destination height
                    );
                }
            }
        }
    }
    drawTimerLives() {  //timer_lives_sprite_24w_24h_6f
        if (GameUI.spritesLoaded && GameUI.timerLivesSprite) {

            const size = 24;
            // ---------------------------------------
            // GameUI
            const row = 14;
            for (let gameUI = 0; gameUI < 15; gameUI++) {
                CanvasUtils.ctx.drawImage(
                    GameUI.timerLivesSprite,
                    0, 0, // Source x,y (first frame)
                    size, size,      // Source width,height
                    770 - gameUI * 24 + GameUI.MARGIN_X + 12,  // Destination x
                    GameUI.MARGIN_TOP + row * GameUI.GRID_SIZE * 4 + 6, // Destination y
                    GameUI.GRID_SIZE * 2, // Destination width
                    GameUI.GRID_SIZE * 2  // Destination height
                );
            }

            // ---------------------------------------
            // Lives
            for (let lives = 0; lives < 7; lives++) {
                CanvasUtils.ctx.drawImage(
                    GameUI.timerLivesSprite,
                    size, 0, // Source x,y (first frame)
                    size - 1, size,      // Source width,height
                    lives * 34 + GameUI.MARGIN_X+10,  // Destination x
                    GameUI.MARGIN_TOP + row * GameUI.GRID_SIZE * 4 + 6, // Destination y
                    GameUI.GRID_SIZE * 2, // Destination width
                    GameUI.GRID_SIZE * 2  // Destination height
                );
            }

            // ---------------------------------------
            // Time Bar
            if (GameUI.spritesLoaded && GameUI.timerLivesSprite) {
                // Frame data for timer sprites (frames 2-5)
                const divTimer = Math.floor(GameUI.timer / 4);
                const modTimer = Math.floor(GameUI.timer % 4); // 2,3,4,5

                const frame2pos = size * 2;
                const basedPosX = GameUI.MARGIN_X + 698;
                let lastPosX = basedPosX + (1 * size);
                const posY = GameUI.MARGIN_TOP + row * GameUI.GRID_SIZE * 4 + 44;
                for (let time = 0; time < divTimer; time++) {
                    const rightAlignedX = basedPosX - (time * size);  // Start from right side
                    lastPosX = rightAlignedX;
                    CanvasUtils.ctx.drawImage(
                        GameUI.timerLivesSprite,
                        frame2pos, 0,                    // Source x,y (frames 2-5)
                        size, size,                 // Source width (varies), height
                        rightAlignedX,      // Destination x (right-aligned)
                        posY,
                        size,                 // Destination width
                        size                   // Destination height
                    );
                }

                const modFrame = (5 - modTimer);
                if (GameUI.timer > 0) {
                    // Calculate which frame to use based on remaining time
                    CanvasUtils.ctx.drawImage(
                        GameUI.timerLivesSprite,
                        modFrame * size, 0, // Source x,y (frames 2-5)
                        size, size,         // Source width (varies), height
                        lastPosX - size,      // Destination x (right-aligned)
                        posY,
                        size,               // Destination width
                        size                // Destination height
                    );
                }

                // Draw debug timer values
                if (GameUI.DEBUG1) {
                    CanvasUtils.ctx.fillStyle = 'white';
                    CanvasUtils.ctx.font = '16px Arial';

                    const timerText = `DIV:${divTimer}   MOD:${modTimer}   Timer:${Math.floor(GameUI.timer)}    MAX:${GameUI.timerMax}`;
                    CanvasUtils.ctx.fillText(timerText, 400, 450);

                    // Draw frame indicators
                    const frameInfo = `modFrame: ${modFrame} Seconds: ${GameUI.seconds}`;
                    CanvasUtils.ctx.fillText(frameInfo, 400, 470);
                }
            }
        }
    }

    static timer = 91;
    static timerMax = 91;
    static timerSpeed = 0.03; //0.0325;// ~45 second
    static timerDirection = 1;
    static seconds = 0;
    timerUpdate() {
        GameUI.timer += GameUI.timerSpeed * GameUI.timerDirection;
        if (GameUI.timer >= GameUI.timerMax) {
            GameUI.timer = GameUI.timerMax;
            GameUI.timerDirection = -1;
        } else if (GameUI.timer <= -1) {
            GameUI.timer = 0;
            GameUI.timerDirection = 1;
        }
        GameUI.seconds = Math.floor(GameUI.timer / 2);
    }

    static score = 0;
    draw() {
        // Draw background water
        CanvasUtils.ctx.fillStyle = 'navy';
        CanvasUtils.ctx.fillRect(
            GameUI.MARGIN_X,
            0,
            this.playFieldWidth,
            this.playFieldHeightHalf + 32 + GameUI.MARGIN_TOP + 32);

        // Draw background road            
        CanvasUtils.ctx.fillStyle = 'black';
        CanvasUtils.ctx.fillRect(GameUI.MARGIN_X,
            GameUI.MARGIN_TOP + this.playFieldHeightHalf + 32,
            this.playFieldWidth,
            this.playFieldHeightHalf + GameUI.MARGIN_TOP - 16);

        // Draw players and High score
        // Draw score at top of screen
        GameUI.drawText('1-UP', 100, 16, GameUI.alphaNumWhiteSprite);
        GameUI.drawText('HIGH SCORE', 320, 16, GameUI.alphaNumWhiteSprite);
        GameUI.drawText('2-UP', 680, 16, GameUI.alphaNumWhiteSprite);

        // Draw scores
        const up_1 = SystemUtils.numberToString(GameUI.score++, 5, ' ');
        const high = SystemUtils.numberToString(999, 5, ' ');
        const up_2 = SystemUtils.numberToString(99999, 5, ' ');
        GameUI.drawText(up_1, 100 - 24, 16 + 32, GameUI.alphaNumRedSprite);
        GameUI.drawText(high, 320 + 24 * 2, 16 + 32, GameUI.alphaNumRedSprite);
        GameUI.drawText(up_2, 680 - 24, 16 + 32, GameUI.alphaNumRedSprite, 1);

        // Draw larger Game Over text
        GameUI.drawText('GAME OVER', 240, 300, GameUI.alphaNumWhiteSprite, 2);


        // Draw sprites for top row (home spots) only if sprites are loaded
        this.drawHomeSpots();

        // Draw sprites safe zones
        this.drawSaveZones(7 * GameUI.GRID_SIZE * 4 + GameUI.MARGIN_TOP);
        this.drawSaveZones(13 * GameUI.GRID_SIZE * 4 + GameUI.MARGIN_TOP);

        // Draw sprites for timer/lives
        this.drawTimerLives();

        // Draw text for start and time
        GameUI.drawText(' start ', 375, 542, GameUI.alphaNumRedSprite, 1, "black");
        GameUI.drawText('time', 765, 998, GameUI.alphaNumYellowSprite, 1, "black");

        if (GameUI.DEBUG) {
            // Draw grid cells
            this.drawGrid();

            // Draw grid outline
            CanvasUtils.ctx.strokeStyle = 'yellow';
            CanvasUtils.ctx.lineWidth = 2;
            CanvasUtils.ctx.strokeRect(
                GameUI.MARGIN_X,
                GameUI.MARGIN_TOP,
                GameUI.GRID_WIDTH * GameUI.GRID_SIZE * 4 - GameUI.MARGIN_X + 32,
                GameUI.GRID_HEIGHT * GameUI.GRID_SIZE * 4
            );
        }

    }
}

export default GameUI;