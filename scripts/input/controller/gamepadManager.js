// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadManager.js

import GameControllerMap from "./gameControllerMap.js";

import Sender from '../../../scripts/messages/sender.js';
import EventBus from '../../../scripts/messages/eventBus.js';

export const GAMEPAD_EVENT = 'controllerChange';

class GamepadManager {
    constructor() {
        this.gameControllers = [];
        this.pollInterval = null;

        this.sender = EventBus.getInstance();  // Use shared EventBus
    }

    start() { // Add listeners and start polling
        window.addEventListener("gamepadconnected", this.handleGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.handleGamepadDisconnected.bind(this));
        this.pollInterval = setInterval(this.pollGameControllers.bind(this), 16);  // 0.016 seconds or 60 fps
    }

    handleGamepadConnected(event) {
        const gameController = event.gamepad;
        this.gameControllers[gameController.index] = gameController;

        // Look up the controller configuration using the gamepad's ID
        const controllerConfig = GameControllerMap.controllerConfigs[gameController.id] || GameControllerMap.controllerConfigs["default"];
        if (controllerConfig.shortName === "default") {
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

        console.warn(`GameController '${gameController.id}' disconnected from index '${gameController.index}' and event trigger args '${args}'`);
    }

    pollGameControllers() { // Stop polling gameControllers before the page unloads
        const gameControllers = navigator.getGamepads();
        if (!gameControllers) return;
        this.gameControllers = Array.from(gameControllers).map(gameController => gameController || null);
    }

    disconnect() {
        clearInterval(this.pollInterval);
    }
}

export default GamepadManager;