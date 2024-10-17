// ToolboxAid.com
// David Quesenberry
// fullscreen.js
// 10/16/2024

(() => {
    const gameFullScaleScreen = 1.0;
    const referenceResolution = { width: window.gameAreaWidth, height: window.gameAreaHeight };
    let isFullScreen = false;

    const canvas = document.getElementById("gameArea");
    const ctx = canvas.getContext('2d');

    function openFullscreen() {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
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
        isFullScreen ? closeFullscreen() : openFullscreen();
    }

    function resizeCanvas() {
        if (window.innerHeight === screen.height && !isFullScreen) {
            isFullScreen = true;
            setCanvasSize(gameFullScaleScreen);
            console.log("Fullscreen mode activated.");
        } else if (isFullScreen) {
            isFullScreen = false;
            setCanvasSize(window.gameScaleWindow);
            console.log("Windowed mode activated.");
        }

        updateCanvasTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setCanvasSize(scale) {
        // Set scale to 1 if it's undefined
        if (scale === undefined) {
            scale = 0.75;
        }
        canvas.width = window.gameAreaWidth * scale,
            canvas.height = window.gameAreaHeight * scale;

        console.log(`Scale = ${scale}`);
        console.log(`Canvas dimensions set: Width = ${canvas.width}, Height = ${canvas.height}`);
        console.log(`window.gameArea set: Width = ${window.gameAreaWidth}, Height = ${window.gameAreaHeight}`);
    }

    function updateCanvasTransform() {
        ctx.setTransform(
            (isFullScreen ? gameFullScaleScreen : window.gameScaleWindow), 0, 0,
            (isFullScreen ? gameFullScaleScreen : window.gameScaleWindow), 0, 0 // No offset for centering
        );
    }

    // Update fullscreen status on change
    document.addEventListener('fullscreenchange', () => {
        isFullScreen = !!document.fullscreenElement;
    });

    // Event listeners
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    document.addEventListener('DOMContentLoaded', () => {
        setCanvasSize(window.gameScaleWindow);
        updateCanvasTransform();
        canvas.addEventListener('click', toggleFullscreen);
    });
})();
