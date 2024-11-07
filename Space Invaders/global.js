// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
    width: 896, // Game area width (256 * 4)
    height: 960, // Game area height (240 * 4)
    scale: 0.5,
    backgroundColor: "#222222",   
    
    fullscreenText: 'Click game to enter fullscreen',
    fullscreenFont: '40px Arial',
    fullscreenColor: 'yellow',
    fullscreenX: 180, // X position for fullscreen text
    fullscreenY: 930,//675, // Y position for fullscreen text

};

export const spriteConfig = {
    pixelSize: 3.5,

    shipY: 145,
    shipVelX: 150,
    shipSpawnSec: 25,
    shipColor: 'red',

    crabColor: 'orange',
    octopusColor: 'yellow',
    squidColor: '#ff6666',
    playerColor: 'pink',
};

export const shieldConfig = {
    count: 4, // Number of shields
    yPosition: 700,
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
window.fpsX = 404;
window.fpsY = 855;