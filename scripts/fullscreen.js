// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// fullscreen.js

class Fullscreen {
    static gameFullScaleScreen = 1.0;
    static isFullScreen = false;

    static canvas = document.getElementById("gameArea");
    static ctx = Fullscreen.canvas.getContext('2d');

    static initialize() {
        Fullscreen.setCanvasSize(window.gameScaleWindow);
        Fullscreen.updateCanvasTransform();

        // Event listeners
        window.addEventListener("resize", Fullscreen.resizeCanvas);
        window.addEventListener('orientationchange', Fullscreen.resizeCanvas);
        document.addEventListener('DOMContentLoaded', () => {
            Fullscreen.canvas.addEventListener('click', Fullscreen.toggleFullscreen);
        });

        // Update fullscreen status on change
        document.addEventListener('fullscreenchange', () => {
            Fullscreen.isFullScreen = !!document.fullscreenElement;
        });
    }

    static openFullscreen() {
        if (Fullscreen.canvas.requestFullscreen) {
            Fullscreen.canvas.requestFullscreen();
        } else if (Fullscreen.canvas.webkitRequestFullscreen) {
            Fullscreen.canvas.webkitRequestFullscreen();
        } else if (Fullscreen.canvas.msRequestFullscreen) {
            Fullscreen.canvas.msRequestFullscreen();
        }
    }

    static closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    static toggleFullscreen() {
        Fullscreen.isFullScreen ? Fullscreen.closeFullscreen() : Fullscreen.openFullscreen();
    }

    static resizeCanvas() {
        if (window.innerHeight === screen.height && !Fullscreen.isFullScreen) {
            Fullscreen.isFullScreen = true;
            Fullscreen.setCanvasSize(Fullscreen.gameFullScaleScreen);
            console.log("Fullscreen mode activated.");
        } else if (Fullscreen.isFullScreen) {
            Fullscreen.isFullScreen = false;
            Fullscreen.setCanvasSize(window.gameScaleWindow);
        }

        Fullscreen.updateCanvasTransform();
        Fullscreen.ctx.clearRect(0, 0, Fullscreen.canvas.width, Fullscreen.canvas.height);
    }

    static setCanvasSize(scale) {
        Fullscreen.canvas.width = window.gameAreaWidth * scale;
        Fullscreen.canvas.height = window.gameAreaHeight * scale;

        // console.log("setCanvasSize: ", Fullscreen.canvas.width, Fullscreen.canvas.height);
    }

    static updateCanvasTransform() {
        Fullscreen.ctx.setTransform(
            (Fullscreen.isFullScreen ? Fullscreen.gameFullScaleScreen : window.gameScaleWindow), 0, 0,
            (Fullscreen.isFullScreen ? Fullscreen.gameFullScaleScreen : window.gameScaleWindow), 0, 0 // No offset for centering
        );
    }
}

// Export the Functions class
export default Fullscreen;

// Initialize the fullscreen functionality
Fullscreen.initialize();