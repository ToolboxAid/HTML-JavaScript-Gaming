/*
Toolbox Aid
David Quesenberry
03/21/2026
GamepadState.js
*/
export default class GamepadState {
    constructor() {
        this.current = [];
        this.previous = [];
    }

    setSnapshot(gamepads = []) {
        this.previous = this.current.map((gamepad) => this.cloneGamepad(gamepad));
        this.current = gamepads.map((gamepad) => this.normalizeGamepad(gamepad));
    }

    reset() {
        this.current = [];
        this.previous = [];
    }

    getGamepad(index) {
        const current = this.current[index] ?? null;
        if (!current) {
            return null;
        }

        const previous = this.previous[index] ?? this.createEmptyPrevious();
        return this.createPublicSnapshot(current, previous);
    }

    getGamepads() {
        return this.current
            .map((_, index) => this.getGamepad(index))
            .filter((gamepad) => gamepad !== null);
    }

    createEmptyPrevious() {
        return {
            axes: [],
            buttonsDown: [],
            connected: false,
            id: '',
            index: -1,
            mapping: '',
            timestamp: 0,
        };
    }

    normalizeGamepad(gamepad) {
        if (!gamepad) {
            return this.createEmptyPrevious();
        }

        const axes = Array.isArray(gamepad.axes) ? [...gamepad.axes] : [];
        const buttonsDown = Array.isArray(gamepad.buttons)
            ? gamepad.buttons.map((button) => Boolean(button?.pressed))
            : [];

        return {
            index: gamepad.index ?? 0,
            id: gamepad.id ?? '',
            connected: gamepad.connected !== false,
            mapping: gamepad.mapping ?? '',
            timestamp: gamepad.timestamp ?? 0,
            axes,
            buttonsDown,
        };
    }

    cloneGamepad(gamepad) {
        return {
            ...gamepad,
            axes: [...gamepad.axes],
            buttonsDown: [...gamepad.buttonsDown],
        };
    }

    createPublicSnapshot(current, previous) {
        const buttonsPressed = current.buttonsDown.map((isDown, index) => {
            const wasDown = previous.buttonsDown[index] ?? false;
            return isDown && !wasDown;
        });

        const snapshot = {
            index: current.index,
            id: current.id,
            connected: current.connected,
            mapping: current.mapping,
            timestamp: current.timestamp,
            axes: [...current.axes],
            buttonsDown: [...current.buttonsDown],
            buttonsPressed,
            isDown(buttonIndex) {
                return Boolean(this.buttonsDown[buttonIndex]);
            },
            isPressed(buttonIndex) {
                return Boolean(this.buttonsPressed[buttonIndex]);
            },
        };

        return snapshot;
    }
}
