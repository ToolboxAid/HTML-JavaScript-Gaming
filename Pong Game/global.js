// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// global.js

// Set global variables for local classes (same directory)

// Configuration for the canvas
// In the original Pong game, the screen resolution was typically set to:
// Resolution: 320x240 pixels
export const canvasConfig = {
    width: 640, // Game area width
    height: 480, // Game area height
    scale: 0.6,
    backgroundColor: "#333333",
};

// Configuration for puck
// In the original Pong game, the puck (or ball) had the following dimensions:
// Diameter: 8 pixels
export const puckConfig = {
    width: 16,
    height: 16,
    color: "white",
    speedDefault: 250.0,
    speedIncrease: 20.0,
};

// Configuration for paddles
// In the original Pong game, the dimensions of the paddles were as follows:
// Width: 8 pixels
// Height: 32 pixels

export const paddleConfig = {
    width: 16,
    height: 64,
    offset: 20,
    speed: 6.0,
    leftColor: "white",
    rightColor: "white",
    winnerScore: 21,
};

export const font5x3 = {
    color: "white",
    pixelWidth: 7,
    pixelHeight: 12,    

}

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.borderColor = "white";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = false;
window.fpsColor = "yellow";
window.fpsSize = "30px";
window.fpsX = 30;
window.fpsY = 50;
