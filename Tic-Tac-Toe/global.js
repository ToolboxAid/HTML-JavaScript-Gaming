// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
    width: 600, // Game area width
    height: 600, // Game area height
    scale: 0.5,
    backgroundColor: "#222222",   
    
    fullscreenText: 'Click game to enter fullscreen',
    fullscreenFont: '30px Arial',
    fullscreenColor: 'yellow',
};

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.fullscreenText = canvasConfig.fullscreenText; 
window.fullscreenFont = canvasConfig.fullscreenFont;
window.fullscreenColor = canvasConfig.fullscreenColor; 

window.borderColor = "#888888";
window.borderSize = 5;

window.fullscreenY=590;

// Configuration for FPS display
window.fpsShow = true;
window.fpsColor = "yellow";
window.fpsSize = "40px";
window.fpsX = 30;
window.fpsY = 50;