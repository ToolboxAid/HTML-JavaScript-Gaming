// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadManager.js

import GameControllerMap from "./gameControllerMap.js";

import EventBus from '../../messages/eventBus.js';
import DebugFlag from "../../utils/debugFlag.js";

export const GAMEPAD_EVENT = 'controllerChange';

class GamepadManager {
    static DEBUG = DebugFlag.has('gamepadManager');

    constructor() {
        this.gameControllers = [];
        this.pollInterval = null;
        this.isRunning = false;

        this.sender = EventBus.getInstance();  // Use shared EventBus
        this.handleGamepadConnectedBound = this.handleGamepadConnected.bind(this);
        this.handleGamepadDisconnectedBound = this.handleGamepadDisconnected.bind(this);
        this.pollGameControllersBound = this.pollGameControllers.bind(this);
    }

    start() { // Add listeners and start polling
        if (this.isRunning) {
            return;
        }
        if (typeof window === 'undefined') {
            throw new Error('GamepadManager.start requires a browser window.');
        }

        window.addEventListener("gamepadconnected", this.handleGamepadConnectedBound);
        window.addEventListener("gamepaddisconnected", this.handleGamepadDisconnectedBound);
        this.pollInterval = setInterval(this.pollGameControllersBound, 16);  // 0.016 seconds or 60 fps
        this.isRunning = true;
    }

    handleGamepadConnected(event) {
        const gameController = event.gamepad;
        this.gameControllers[gameController.index] = gameController;

        // Look up the controller configuration using the gamepad's ID
        const controllerConfig = GameControllerMap.controllerConfigs[gameController.id] || GameControllerMap.controllerConfigs["default"];
        if (controllerConfig.shortName === "default" && GamepadManager.DEBUG) {
            console.warn(`Controller mapping not found for '${gameController.id}', using default mapping.`);
        }

        // Trigger the custom event with three arguments
        const args = ['connected', gameController.index, gameController.id];
        this.sender.triggerEvent(GAMEPAD_EVENT, args);
    }

    handleGamepadDisconnected(event) { // Disconnect
        const gameController = event.gamepad;
        delete this.gameControllers[gameController.index];

        // Notify GameControllers about the disconnected gamepad
        if (this.onGamepadDisconnected) {
            this.onGamepadDisconnected(gameController);
        }

        // Trigger the custom event with three arguments
        const args = ['disconnected', gameController.index, gameController.id];
        this.sender.triggerEvent(GAMEPAD_EVENT, args);

        if (GamepadManager.DEBUG) {
            console.warn(`GameController '${gameController.id}' disconnected from index '${gameController.index}' and event trigger args '${args}'`);
        }
    }

    pollGameControllers() { // Stop polling gameControllers before the page unloads
        if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
            return;
        }

        const gameControllers = navigator.getGamepads();
        if (!gameControllers) return;
        this.gameControllers = Array.from(gameControllers).map(gameController => gameController || null);
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        window.removeEventListener("gamepadconnected", this.handleGamepadConnectedBound);
        window.removeEventListener("gamepaddisconnected", this.handleGamepadDisconnectedBound);
        clearInterval(this.pollInterval);
        this.pollInterval = null;
        this.isRunning = false;
    }

    // Backward compatibility alias.
    disconnect() {
        this.stop();
    }
}

export default GamepadManager;
