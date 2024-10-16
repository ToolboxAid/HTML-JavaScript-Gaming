// ToolboxAid.com
// David Quesenberry
// fullscreen.js
// 10/16/2024

const gameFullScaleScreen = 1.0; 
const referenceResolution = { width: window.gameAreaWidth, height: window.gameAreaHeight }; 
var isFullScreen = false;

function openFullscreen() {
    var elem = document.getElementById("gameArea");
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function toggleFullscreen() {
    if (!isFullScreen) {
        openFullscreen();
    } else {
        closeFullscreen();
    }
}

function resizeCanvas() {
    var canvas = document.getElementById('gameArea');
    var ctx = canvas.getContext('2d');

    if (window.innerHeight == screen.height) {
        if (!isFullScreen) {
            isFullScreen = true;
            canvas.width = window.gameAreaWidth * gameFullScaleScreen;
            canvas.height = window.gameAreaHeight * gameFullScaleScreen;
            console.log("Fullscreen mode activated.");
        }
    } else {
        if (isFullScreen) {
            isFullScreen = false;
            canvas.width = window.gameAreaWidth * window.gameScaleWindow;
            canvas.height = window.gameAreaHeight * window.gameScaleWindow;
            console.log("Windowed mode activated.");
        }
    }

    // Set transformation after resizing
    ctx.setTransform(
        (isFullScreen ? gameFullScaleScreen : window.gameScaleWindow), 0, 0, 
        (isFullScreen ? gameFullScaleScreen : window.gameScaleWindow), 
        0, 0 // No offset for centering
    );

    // Clear the canvas to redraw shapes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas, false);

document.addEventListener('DOMContentLoaded', (event) => {
    var canvas = document.getElementById('gameArea');
    var ctx = canvas.getContext('2d');

    // Set initial canvas size
    canvas.width = window.gameAreaWidth * window.gameScaleWindow;
    canvas.height = window.gameAreaHeight * window.gameScaleWindow;

    // Set the initial transformation
    ctx.setTransform(
        window.gameScaleWindow, 0, 0, 
        window.gameScaleWindow, 
        0, 0 // Center the drawing
    );

    // Bind click event to canvas for toggling fullscreen
    canvas.addEventListener('click', toggleFullscreen);
});
