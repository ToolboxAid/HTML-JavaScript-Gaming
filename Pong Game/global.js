// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Configuration for paddles
export const paddleConfig = {
    offset: 20,
    width: 20,
    height: 130,
    speed: 5.0,
    leftColor: "red",
    rightColor: "green",
};

// Configuration for puck
export const puckConfig = {
    width: 20,  // Width of the puck
    height: 20, // Height of the puck
    color: "yellow", // Color of the puck
};


// Configuration for the canvas
export const canvasConfig = {
    width: 858, // Game area width
    height: 525, // Game area height
    scale: 0.75,
    backgroundColor: "#000000",
};

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.borderColor = "pink"; //borderConfig.color; // This should be color
window.borderSize = 15; //borderConfig.size; // This should be size

// Configuration for FPS display
window.fpsShow = false;
window.fpsColor = "yellow";
window.fpsSize = "30px";
window.fpsX = 30;
window.fpsY = 50;
