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
    borderColor: "#bbbbbb",
    borderSize: 5,    
};

export const fullscreenConfig = {
    color: 'red',
    font: '40px Arial',
    text: 'Click here to enter fullscreen',
    x: 60,
    y: 450
};

export const performanceConfig = {
    // Configuration for FPS display
    show: true,
    size: 30,
    font: "monospace",
    colorLow: "green",
    colorMed: "yellow",
    colorHigh: "red",
    backgroundColor: "#AAAAAABB",
    x: 20,
    y: 40,
}

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
    winnerScore: 2,
};

export const font5x3 = {
    color: "white",
    pixelWidth: 7,
    pixelHeight: 12,    

}

