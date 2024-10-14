// fullscreen.js

const referenceResolution = { width: gameAreaWidth, height: gameAreaHeight }; 
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
            console.log("fullscreen: " + isFullScreen);
            var scale = gameFullScaleScreen;
            ctx.setTransform(
                scale, 0, 0, scale, 
                (canvas.width - referenceResolution.width * scale), 
                (canvas.height - referenceResolution.height * scale)
            );
        }
    } else {
        if (isFullScreen) {
            isFullScreen = false;
            console.log("fullscreen: " + isFullScreen);
            var scale = gameScaleWindow;
            ctx.setTransform(
                scale, 0, 0, scale, 
                (canvas.width - referenceResolution.width * scale), 
                (canvas.height - referenceResolution.height * scale)
            );
        }
    }
    setDivs();	
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas, false);
document.addEventListener('DOMContentLoaded', (event) => {
    var canvas = document.getElementById('gameArea');
    var ctx = canvas.getContext('2d');

    // Set gameArea canvas size in DIV.
    canvas.width = gameAreaWidth * gameScaleWindow;
    canvas.height = gameAreaHeight * gameScaleWindow;

    var scale = gameScaleWindow;
    ctx.setTransform(
        scale, 0, 0, scale, 
        (canvas.width - referenceResolution.width * scale), 
        (canvas.height - referenceResolution.height * scale)
    );

    // Bind click event to canvas for toggling fullscreen
    canvas.addEventListener('click', toggleFullscreen);

    // Uncomment these to initialize
    setDivs();  
    drawShape();
});
