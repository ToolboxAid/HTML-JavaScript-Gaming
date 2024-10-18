// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Configuration for paddles
export const paddleConfig = {
    offset: 20,
    width: 20,
    height: 400,
    speed: 5.0,
    leftColor: "blue",
    rightColor: "green",
};

// Configuration for puck
export const puckConfig = {
    width: 20,
    height: 20,
    color: "yellow",
    speedDefault: 5.0,
    speedIncrease: 0.25,
    /*
    this.angle = (this.angle + 360) % 360;
    Left angles
        this.angle = 315;
        this.angle = 45;
    Right angles
        this.angle = 135;
        this.angle = 225
    */
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

window.borderColor = "red";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = false;
window.fpsColor = "yellow";
window.fpsSize = "30px";
window.fpsX = 30;
window.fpsY = 50;
