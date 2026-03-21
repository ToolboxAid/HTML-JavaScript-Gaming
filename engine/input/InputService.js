/*
Toolbox Aid
David Quesenberry
03/21/2026
InputService.js
*/
import KeyboardState from './KeyboardState.js';
import MouseState from './MouseState.js';
import GamepadState from './GamepadState.js';
import InputMap from './InputMap.js';

export default class InputService {
    constructor({
        target = window,
        keyboard = null,
        mouse = null,
        gamepads = null,
        inputMap = null,
        getGamepads = null,
    } = {}) {
        this.target = target;
        this.keyboard = keyboard ?? new KeyboardState();
        this.mouse = mouse ?? new MouseState();
        this.gamepads = gamepads ?? new GamepadState();
        this.inputMap = inputMap ?? new InputMap();
        this.getGamepadsFromNavigator = getGamepads ?? (() => {
            if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
                return [];
            }
            return navigator.getGamepads() ?? [];
        });

        this.liveKeysDown = new Set();
        this.liveMouseButtonsDown = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.isAttached = false;

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    attach() {
        if (this.isAttached) {
            return;
        }

        this.target.addEventListener('keydown', this.onKeyDown);
        this.target.addEventListener('keyup', this.onKeyUp);
        this.target.addEventListener('mousemove', this.onMouseMove);
        this.target.addEventListener('mousedown', this.onMouseDown);
        this.target.addEventListener('mouseup', this.onMouseUp);
        this.target.addEventListener('blur', this.onBlur);
        this.isAttached = true;
    }

    detach() {
        if (!this.isAttached) {
            return;
        }

        this.target.removeEventListener('keydown', this.onKeyDown);
        this.target.removeEventListener('keyup', this.onKeyUp);
        this.target.removeEventListener('mousemove', this.onMouseMove);
        this.target.removeEventListener('mousedown', this.onMouseDown);
        this.target.removeEventListener('mouseup', this.onMouseUp);
        this.target.removeEventListener('blur', this.onBlur);
        this.isAttached = false;
        this.reset();
    }

    update() {
        this.keyboard.setSnapshot(this.liveKeysDown);
        this.mouse.setSnapshot({
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            deltaX: this.mouseDelta.x,
            deltaY: this.mouseDelta.y,
            buttonsDown: this.liveMouseButtonsDown,
        });
        this.gamepads.setSnapshot(this.readConnectedGamepads());
        this.mouseDelta = { x: 0, y: 0 };
    }

    reset() {
        this.liveKeysDown.clear();
        this.liveMouseButtonsDown.clear();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.keyboard.reset();
        this.mouse.reset();
        this.gamepads.reset();
    }

    setInputMap(inputMap) {
        this.inputMap = inputMap ?? new InputMap();
    }

    isDown(key) {
        return this.keyboard.isDown(key);
    }

    isPressed(key) {
        return this.keyboard.isPressed(key);
    }

    isActionDown(action) {
        return this.inputMap.isActionDown(action, (input) => this.isDown(input));
    }

    isActionPressed(action) {
        return this.inputMap.isActionPressed(action, (input) => this.isPressed(input));
    }

    isAction(action) {
        return this.isActionDown(action);
    }

    getActionSnapshot() {
        return this.inputMap.getSnapshot(
            (input) => this.isDown(input),
            (input) => this.isPressed(input),
        );
    }

    getSnapshot() {
        return {
            keyboard: this.keyboard.getSnapshot(),
            mouse: this.mouse.getSnapshot(),
            gamepads: this.gamepads.getGamepads(),
            actions: this.getActionSnapshot(),
        };
    }

    getMousePosition() {
        return this.mouse.getPosition();
    }

    getMouseDelta() {
        return this.mouse.getDelta();
    }

    isMouseDown(button) {
        return this.mouse.isDown(button);
    }

    isMousePressed(button) {
        return this.mouse.isPressed(button);
    }

    getGamepad(index) {
        return this.gamepads.getGamepad(index);
    }

    getGamepads() {
        return this.gamepads.getGamepads();
    }

    onKeyDown(event) {
        this.liveKeysDown.add(event.code);
    }

    onKeyUp(event) {
        this.liveKeysDown.delete(event.code);
    }

    onMouseMove(event) {
        const nextX = event.offsetX ?? event.clientX ?? 0;
        const nextY = event.offsetY ?? event.clientY ?? 0;
        this.mouseDelta.x += nextX - this.mousePosition.x;
        this.mouseDelta.y += nextY - this.mousePosition.y;
        this.mousePosition = { x: nextX, y: nextY };
    }

    onMouseDown(event) {
        this.liveMouseButtonsDown.add(event.button ?? 0);
    }

    onMouseUp(event) {
        this.liveMouseButtonsDown.delete(event.button ?? 0);
    }

    onBlur() {
        this.liveKeysDown.clear();
        this.liveMouseButtonsDown.clear();
        this.mouseDelta = { x: 0, y: 0 };
    }

    readConnectedGamepads() {
        const source = this.getGamepadsFromNavigator() ?? [];
        return Array.from(source)
            .filter((gamepad) => Boolean(gamepad && gamepad.connected !== false))
            .map((gamepad) => ({
                index: gamepad.index ?? 0,
                id: gamepad.id ?? '',
                connected: gamepad.connected !== false,
                mapping: gamepad.mapping ?? '',
                timestamp: gamepad.timestamp ?? 0,
                axes: Array.isArray(gamepad.axes) ? [...gamepad.axes] : [],
                buttons: Array.isArray(gamepad.buttons)
                    ? gamepad.buttons.map((button) => ({ pressed: Boolean(button?.pressed) }))
                    : [],
            }));
    }
}
