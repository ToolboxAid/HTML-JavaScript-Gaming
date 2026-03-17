// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// game.js - Keyboard

import { canvasConfig, performanceConfig, fullscreenConfig } from './global.js'; // Import canvasConfig
import GameBase from '../../../engine/core/gameBase.js';

import KeyboardInput from '../../../engine/input/keyboard.js';
import CanvasText from '../../../engine/core/canvasText.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';

class Game extends GameBase{
    constructor() {
        super(canvasConfig, performanceConfig, fullscreenConfig);
    }

    async onInitialize() {
        // Create an instance of KeyboardInput
        this.keyboardInput = new KeyboardInput();
    }

    getKeyStates() {
        // Retrieve keys from the KeyboardInput instance
        const keysPressed = this.keyboardInput.getKeysPressed();
        const keysDown = this.keyboardInput.getKeysDown();
        const keysReleased = this.keyboardInput.getKeysReleased();
        return { keysPressed, keysDown, keysReleased };
    }

    drawRectangles(keysDown) {
        // outline where colors will be
        PrimitiveRenderer.drawRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 200, 100, '#888888');

        // Example: Change the rectangle color based on key presses
        if (keysDown.includes('KeyR')) {
            PrimitiveRenderer.drawRect((canvasConfig.width / 2) - 100, (canvasConfig.height / 2) - 50, 100, 100, 'red');
        }

        if (keysDown.includes('KeyG')) {
            PrimitiveRenderer.drawRect((canvasConfig.width / 2), (canvasConfig.height / 2) - 50, 100, 100, 'green');
        }
    }

    drawKeyStates(keysPressed, keysDown, keysReleased) {
        CanvasText.renderText('Keys Just Pressed: ' + (keysPressed.length > 0 ? keysPressed.join(', ') : 'None'), 10, 100, {
            fontSize: 40,
            color: 'white',
            useDpr: false
        });
        CanvasText.renderText('Keys Currently Pressed (' + keysDown.length + '):', 10, 140, {
            fontSize: 40,
            color: 'white',
            useDpr: false
        });
        CanvasText.renderText('Keys Just Released: ' + (keysReleased.length > 0 ? keysReleased.join(', ') : 'None'), 10, 220, {
            fontSize: 40,
            color: 'white',
            useDpr: false
        });
        CanvasText.renderText(keysDown.length > 0 ? keysDown.join(', ') : 'None', 10, 175, {
            fontSize: 20,
            color: 'white',
            useDpr: false
        });

        CanvasText.renderText('Press `r` for RED', 275, 390, {
            fontSize: 30,
            color: 'white',
            useDpr: false
        });
        CanvasText.renderText('Press `g` for GREEN', 275, 425, {
            fontSize: 30,
            color: 'white',
            useDpr: false
        });

        CanvasText.renderText('Caution, some keyboards scan and cannot', 105, 540, {
            fontSize: 30,
            color: 'orange',
            useDpr: false
        });
        CanvasText.renderText('display all keys pressed: test your player keys.', 85, 575, {
            fontSize: 30,
            color: 'orange',
            useDpr: false
        });
    }

    gameLoop() {
        // Call update to manage key states
        this.keyboardInput.update();

        // Retrieve key states
        const { keysPressed, keysDown, keysReleased } = this.getKeyStates();

        // Draw rectangles based on key presses
        this.drawRectangles(keysDown);

        // Draw key states on the canvas
        this.drawKeyStates(keysPressed, keysDown, keysReleased);
    }

    onDestroy() {
        this.keyboardInput = null;
    }
}

// Export the GameLoop class
export default Game;

const game = new Game();



