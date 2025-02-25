// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// fullscreen.js

import SystemUtils from "./utils/systemUtils.js";

class Fullscreen {

    // Enable debug mode: game.html?fullscreen
    static DEBUG = new URLSearchParams(window.location.search).has('fullscreen');

    /** Constructor for Fullscreen class.
     * @throws {Error} Always throws error as this is a utility class with only static methods.
     * @example
     * ❌ Don't do this:
     * const fullscreen = new Fullscreen(); // Throws Error
     * 
     * ✅ Do this:
     * Fullscreen.transformPoints(...); // Use static methods directly
     */
    constructor() {
        throw new Error('Fullscreen is a utility class with only static methods. Do not instantiate.');
    }

    static gameFullScaleScreen = 1.0;
    static isFullScreen = false;

    static canvas = document.getElementById("gameArea");
    static ctx = Fullscreen.canvas.getContext('2d');

    static canvasWidth = 0;  // window.gameAreaWidth = canvasConfig.width;        
    static canvasHeight = 0; // window.gameAreaHeight = canvasConfig.height;
    static scale = 0;        // window.gameScaleWindow = canvasConfig.scale;

    static config = {
        width: 1024,
        height: 768,
        color: 'red',
        font: '40px Arial',
        scale: 1,
        text: 'Click here to enter fullscreen, default',
        x: 300,
        y: 300
    };

    //static firstTime = true;
    static async init(config, canvasConfig) {
        if (!config) {
            console.error("No 'fullscreenConfig' provided");
        }
        const schema = {
            color: 'string',     // Text color
            font: 'string',      // Font style and size
            text: 'string',      // Display text
            x: 'number',         // X position
            y: 'number'          // Y position
        };
        const validation = SystemUtils.validateConfig("FullScreen", config, schema);
        if (validation) {
            this.config = config;
        }

        //if (!canvasConfig && !Fullscreen.firstTime) {
        if (!canvasConfig) {
            Fullscreen.firstTime = false;
            SystemUtils.showStackTrace("")
            console.error("'canvasConfig' not provided.");
        }
        const { width = 1024, height = 768, scale = 0.25 } = canvasConfig || {};
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.scale = scale;

        Fullscreen.setCanvasSize(Fullscreen.scale);
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

        console.log(`FullScreen.init complete.`);
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
            Fullscreen.setCanvasSize(Fullscreen.scale);
        }

        Fullscreen.updateCanvasTransform();
        Fullscreen.ctx.clearRect(0, 0, Fullscreen.canvas.width, Fullscreen.canvas.height);
    }

    static setCanvasSize(scale) {
        Fullscreen.canvas.width = Fullscreen.canvasWidth * scale;
        Fullscreen.canvas.height = Fullscreen.canvasHeight * scale;
    }

    static updateCanvasTransform() {
        Fullscreen.ctx.setTransform(
            (Fullscreen.isFullScreen ? Fullscreen.gameFullScaleScreen : Fullscreen.scale), 0, 0,
            (Fullscreen.isFullScreen ? Fullscreen.gameFullScaleScreen : Fullscreen.scale), 0, 0 // No offset for centering
        );
    }

    static draw(ctx) {
        if (!Fullscreen.isFullScreen) {
            ctx.fillStyle = this.config.color;
            ctx.font = this.config.font;
            ctx.textAlign = 'start';
            ctx.fillText(this.config.text, this.config.x, this.config.y);
        }
    }

}

// Export the class
export default Fullscreen;
