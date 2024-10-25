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
    backgroundColor: "#000000",   
    
    fullscreenText: 'Click game to enter fullscreen',
    fullscreenFont: '50px Arial',
    fullscreenColor: 'yellow',
    //fullscreenX: 100, // X position for fullscreen text
    fullscreenY: 600, // Y position for fullscreen text

};

export const spriteConfig = {
    pixelSize: 3.5,

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
window.fullscreenX = canvasConfig.fullscreenX; // This must match the property name in canvasConfig
window.fullscreenY = canvasConfig.fullscreenY; 


window.borderColor = "red";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = true;
window.fpsColor = "yellow";
window.fpsSize = "40px";
window.fpsX = 50;
window.fpsY = 165;