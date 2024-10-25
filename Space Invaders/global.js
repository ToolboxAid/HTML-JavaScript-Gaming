// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
    width: 800, // Game area width
    height: 800, // Game area height
    scale: 0.35,
    backgroundColor: "#000000",   
    
    fullscreenText: 'Click game to enter fullscreen',
    fullscreenFont: '50px Arial',
    fullscreenColor: 'yellow',
};

export const spriteConfig = {
    pixelSize: 3,

    shipColor: 'red',
    crabColor: 'orange',
    octopusColor: 'yellow',
    squidColor: '#ff6666',
    playerColor: 'pink',
    sheildColor: '#44FF44',
};

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

window.borderColor = "red";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = true;
window.fpsColor = "yellow";
window.fpsSize = "40px";
window.fpsX = 30;
window.fpsY = 50;