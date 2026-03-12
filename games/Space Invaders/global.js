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
    borderColor: "red",
    borderSize: 15,
};

export const fullscreenConfig = {
    color: 'yellow',
    font: '40px Arial',
    text: 'Click here to enter fullscreen',
    x: 230,
    y: 790
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
    bomb1VelocityY: 410,
    bomb2VelocityY: 380,
    bomb3VelocityY: 350,

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
    y: 580,
    color: '#44FF44',
}

export const performanceConfig = {
    show: true,
    size: 10,
    font: "monospace",
    colorLow: "green",
    colorMed: "yellow",
    colorHigh: "red",
    backgroundColor: "#AAAAAABB",
    x: 845,
    y: 830,
}

// non type="module" in HTML
// Set global canvas variables for ../scripts
// No longer needed, passing configs via gameBase.js

// window.gameAreaWidth = canvasConfig.width;
// window.backgroundColor = canvasConfig.backgroundColor;