// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
    width: 960, //896, // Game area width (256 * 4)
    height: 896, //960, // Game area height (240 * 4)
    scale: 0.5,
    
    backgroundColor: "#222222",

    fullscreenText: 'Click game to enter fullscreen',
    fullscreenFont: '40px Arial',
    fullscreenColor: 'yellow',
    fullscreenX: 230,
    fullscreenY: 790,
};

export const playerSelect = {
    maxPlayers: 2,
    lives: 3,
    
    fillStyle: "yellow",
    font: "25px Arial",
    fillText: "Keyboard Select Player(s)",
    
    optionBaseX: 250,
    optionBaseY: 50,
    optionSpacing: 40
  }
  
export const spriteConfig = {
    pixelSize: 3.5,

    playerLives: 3,
    playerBonusScore: 1500,
    playerColor: 'white',
    playerX: 127,
    playerY: 700,

    livesX: 15,
    livesY: 780,
    livesColor: 'white',

    levelX: 825,
    levelY: 780,

    laserColor: 'white',
    laserVelocityY: 700,

    shipY: 145,
    shipVelX: 150,
    shipSpawnSec: 25,
    shipColor: 'red',

    crabColor: 'orange',
    octopusColor: 'yellow',
    squidColor: '#ff4444',

    bombYoffset: 30,
    bomb1Color: "#ff9999",
    bomb2Color: "#99ff99",
    bomb3Color: "#9999ff",
    bomb1VelocityX: 410,
    bomb2VelocityX: 380,
    bomb3VelocityX: 350,

    groundColor: "green",
    groundY: 740,
};

export const enemyConfig = {
    xPosition: 75,
    yPosition: 450,
    colSize: 11,
    rowSize: 5,
    xSpacing: 62,
    ySpacing: 62,
}

export const shieldConfig = {
    count: 4, // Number of shields
    yPosition: 580,
    color: '#44FF44',
}
window.shieldCount = shieldConfig.count;

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.pixelSize = spriteConfig.pixelSize

window.fullscreenText = canvasConfig.fullscreenText;
window.fullscreenFont = canvasConfig.fullscreenFont;
window.fullscreenColor = canvasConfig.fullscreenColor;
window.fullscreenX = canvasConfig.fullscreenX;
window.fullscreenY = canvasConfig.fullscreenY;

window.borderColor = "red";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = true;
window.fpsColor = "red";
window.fpsSize = "30px";
window.fpsX = 770;
window.fpsY = 140;