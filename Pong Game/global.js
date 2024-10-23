// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for paddles
export const paddleConfig = {
    offset: 20,
    width: 40,
    height: 140,
    speed: 4.0,
    leftColor: "white",
    rightColor: "white",
    winnerScore: 21,
};

// Configuration for puck
export const puckConfig = {
    width: 20,
    height: 20,
    color: "white",
    speedDefault: 300.0,
    speedIncrease: 5.0,
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
