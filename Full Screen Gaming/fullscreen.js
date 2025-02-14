// ToolboxAid.com
// David Quesenberry
// fullscreen.js
// 10/16/2024

const gameFullScaleScreen = 1.0;
// Populated by global.js
const referenceResolution = { width: gameAreaWidth, height: gameAreaHeight, scale: gameScaleWindow };
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
            canvas.width = gameAreaWidth * gameFullScaleScreen;
            canvas.height = gameAreaHeight * gameFullScaleScreen;
            console.log("Fullscreen mode activated.");
        }
    } else {
        if (isFullScreen) {
            isFullScreen = false;
            canvas.width = gameAreaWidth * gameScaleWindow;
            canvas.height = gameAreaHeight * gameScaleWindow;
            console.log("Windowed mode activated.");
        }
    }

    // Set transformation after resizing
    ctx.setTransform(
        (isFullScreen ? gameFullScaleScreen : gameScaleWindow), 0, 0,
        (isFullScreen ? gameFullScaleScreen : gameScaleWindow),
        0, 0 // No offset for centering
    );

    // Optionally, clear the canvas and redraw shapes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape(); // Call your drawing function here

    // comment these to hide div updates
    setDivs();
}

// listeners below this line
window.addEventListener("resize", resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas, false);

document.addEventListener('DOMContentLoaded', (event) => {
    var canvas = document.getElementById('gameArea');
    var ctx = canvas.getContext('2d');

    // Set initial canvas size
    canvas.width = gameAreaWidth * gameScaleWindow;
    canvas.height = gameAreaHeight * gameScaleWindow;

    // Set the initial transformation
    ctx.setTransform(
        gameScaleWindow, 0, 0,
        gameScaleWindow,
        0, 0 // Center the drawing
    );

    // Bind click event to canvas for toggling fullscreen
    canvas.addEventListener('click', toggleFullscreen);

    // comment out to hide graphics
    drawShape();
    // comment out to hide div updates
    setDivs();
});
