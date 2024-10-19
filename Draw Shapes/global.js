// global.js
// canvas variables

var gameScaleWindow = 0.5;
var gameAreaWidth = 800;
var gameAreaHeight = 600;

var backgroundColor = "#000000";

var boarderSize = 5;
var boarderColor = "#ff0000";

var showFPS = true;
var fpsColor = "white";


// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
    width: 858, // Game area width
    height: 525, // Game area height
    scale: 0.5,
    backgroundColor: "#333333",
};

export const font5x3 = {
    color: "white",
    pixelWidth: 15,
    pixelHeight: 20,    

}

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.borderColor = "red";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = false;
window.fpsColor = "yellow";
window.fpsSize = "30px";
window.fpsX = 30;
window.fpsY = 50;
