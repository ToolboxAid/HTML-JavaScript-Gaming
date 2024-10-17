// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Configuration for the canvas
export const canvasConfig = {
    width: 858, // Game area width
    height: 525, // Game area height
    scale: 0.75,
    backgroundColor: "#000000",
    borderColor: "red",
    borderSize: 10,
};
// Set global canvas dimensions
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.scale = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;
window.borderColor = canvasConfig.borderColor;
window.borderSize = canvasConfig.borderSize;

// Configuration for borders
export const borderConfig = {
    size: 5,
    color: "#00ff00",
};

// Configuration for FPS display
export const fpsConfig = {
    show: false,
    color: "blue",
    size: '30px',
};

// Configuration for paddles
export const paddleConfig = {
    offset: 10,
    width: 10,
    height: 180,
    speed: 1,
    leftColor: "red",
    rightColor: "green",
};

// Configuration for puck
export const puckConfig = {
    width: 20,  // Width of the puck
    height: 20, // Height of the puck
    color: "green", // Color of the puck
};
