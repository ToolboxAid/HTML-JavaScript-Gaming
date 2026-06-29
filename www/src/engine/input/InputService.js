/*
Toolbox Aid
David Quesenberry
03/21/2026
InputService.js
*/
import KeyboardState from './KeyboardState.js';
import MouseState from './MouseState.js';
import GamepadState from './GamepadState.js';
import PointerDragState from './PointerDragState.js';
import InputComboState from './InputComboState.js';
import InputMap from './InputMap.js';
import {
    inputMappingGestureSuffix,
    runtimeBindingFromInputMappingBinding
} from './InputMappingManifest.js';
import {
    getInputGestureDescriptor,
    inputDeviceCapabilities,
    inputGestureDescriptors,
    wheelDescriptorFromEvent,
    wheelInputDescriptor
} from './InputCapabilityDescriptors.js';
import {
    defaultNormalizedInputForPhysicalInput,
    normalizedInputLabel,
    normalizedInputOptions,
    physicalInputIsAnalog,
    resolveNormalizedInputProfile,
    systemDefaultProfileForDevice
} from './NormalizedInputRegistry.js';

export default class InputService {
    constructor({
        target = window,
        keyboard = null,
        mouse = null,
        gamepads = null,
        pointerDrag = null,
        comboState = null,
        inputMap = null,
        getGamepads = null,
    } = {}) {
        this.target = target;
        this.keyboard = keyboard ?? new KeyboardState();
        this.mouse = mouse ?? new MouseState();
        this.gamepads = gamepads ?? new GamepadState();
        this.pointerDrag = pointerDrag ?? new PointerDragState();
        this.comboState = comboState ?? new InputComboState();
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
        this.pointerEventsAvailable = typeof PointerEvent !== 'undefined';
        this.touchAvailable = false;
        this.penAvailable = false;
        this.activeInputBindings = new Set();

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
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
        this.target.addEventListener('pointerdown', this.onPointerDown);
        this.target.addEventListener('pointermove', this.onPointerMove);
        this.target.addEventListener('pointerup', this.onPointerUp);
        this.target.addEventListener('pointercancel', this.onPointerCancel);
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
        this.target.removeEventListener('pointerdown', this.onPointerDown);
        this.target.removeEventListener('pointermove', this.onPointerMove);
        this.target.removeEventListener('pointerup', this.onPointerUp);
        this.target.removeEventListener('pointercancel', this.onPointerCancel);
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
        this.pointerDrag.reset();
        this.comboState.reset();
        this.activeInputBindings.clear();
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
        return this.inputMap.isActionDown(action, (input) => this.isInputBindingDown(input));
    }

    isActionPressed(action) {
        return this.inputMap.isActionPressed(action, (input) => this.isInputBindingPressed(input));
    }

    isAction(action) {
        return this.isActionDown(action);
    }

    getActionSnapshot() {
        return this.inputMap.getSnapshot(
            (input) => this.isInputBindingDown(input),
            (input) => this.isInputBindingPressed(input),
        );
    }

    isInputBindingDown(binding) {
        const normalizedBinding = runtimeBindingFromInputMappingBinding(binding);
        if (normalizedBinding.startsWith('Pad')) {
            return this.isGamepadBindingDown(normalizedBinding);
        }
        if (normalizedBinding.startsWith('MouseButton')) {
            return this.isMouseDown(Number(normalizedBinding.replace(/^MouseButton/, '')));
        }
        return this.isDown(normalizedBinding);
    }

    isInputBindingPressed(binding) {
        const normalizedBinding = runtimeBindingFromInputMappingBinding(binding);
        const gesture = inputMappingGestureSuffix(binding);
        if (normalizedBinding.startsWith('Pad')) {
            if (gesture === 'GameControllerButtonRelease') {
                return this.isGamepadBindingReleased(normalizedBinding);
            }
            return this.isGamepadBindingPressed(normalizedBinding);
        }
        if (normalizedBinding.startsWith('MouseButton')) {
            return this.isMousePressed(Number(normalizedBinding.replace(/^MouseButton/, '')));
        }
        return this.isPressed(normalizedBinding);
    }

    getSnapshot() {
        return {
            keyboard: this.keyboard.getSnapshot(),
            mouse: this.mouse.getSnapshot(),
            pointerDrag: this.pointerDrag.getSnapshot(),
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

    getPointerDragSnapshot() {
        return this.pointerDrag.getSnapshot();
    }

    getPointerDragDescriptors() {
        return this.pointerDrag.getDescriptors();
    }

    getPointerDragDescriptor(binding) {
        return this.pointerDrag.getDescriptor(binding);
    }

    getInputDeviceCapabilities(options = {}) {
        return inputDeviceCapabilities({
            pointerEventsAvailable: this.pointerEventsAvailable,
            touchAvailable: this.touchAvailable,
            penAvailable: this.penAvailable,
            ...options,
        });
    }

    getInputGestureDescriptors(options = {}) {
        return inputGestureDescriptors(options);
    }

    getInputGestureDescriptor(binding, options = {}) {
        return getInputGestureDescriptor(binding, options);
    }

    getWheelDescriptor(binding) {
        const detailByBinding = {
            MouseWheelUp: 'Wheel Up',
            MouseWheelDown: 'Wheel Down',
            MouseWheelLeft: 'Wheel Left',
            MouseWheelRight: 'Wheel Right',
        };
        return detailByBinding[binding] ? wheelInputDescriptor(binding, detailByBinding[binding]) : null;
    }

    getNormalizedInputOptions() {
        return normalizedInputOptions();
    }

    getNormalizedInputLabel(inputId) {
        return normalizedInputLabel(inputId);
    }

    getDefaultNormalizedInputForPhysicalInput(physicalInput) {
        return defaultNormalizedInputForPhysicalInput(physicalInput);
    }

    getSystemDefaultProfileForDevice(deviceType) {
        return systemDefaultProfileForDevice(deviceType);
    }

    resolveNormalizedInputProfile(options = {}) {
        return resolveNormalizedInputProfile(options);
    }

    physicalInputIsAnalog(physicalInput) {
        return physicalInputIsAnalog(physicalInput);
    }

    captureWheelDescriptor(event) {
        return wheelDescriptorFromEvent(event);
    }

    beginComboCapture(options = {}) {
        return this.comboState.begin(options);
    }

    recordComboInput(input, options = {}) {
        return this.comboState.record(input, options);
    }

    resetComboCapture() {
        this.comboState.reset();
    }

    isInputBindingActive(binding, activeInputBindings) {
        return this.comboState.isBindingActive(binding, activeInputBindings);
    }

    activateInputBindings(bindings, { transient = false, durationMs = 260 } = {}) {
        let changed = false;
        bindings.filter(Boolean).forEach((binding) => {
            if (!this.activeInputBindings.has(binding)) {
                this.activeInputBindings.add(binding);
                changed = true;
            }
            if (transient && typeof this.target.setTimeout === 'function') {
                this.target.setTimeout(() => {
                    this.clearActiveInputBindings([binding]);
                }, durationMs);
            }
        });
        return changed;
    }

    clearActiveInputBindings(bindings) {
        let changed = false;
        bindings.filter(Boolean).forEach((binding) => {
            if (this.activeInputBindings.delete(binding)) {
                changed = true;
            }
        });
        return changed;
    }

    replaceActiveInputBindings(shouldReplace, nextBindings) {
        const previous = this.activeInputBindings;
        const next = new Set(nextBindings);
        this.activeInputBindings = new Set([
            ...[...previous].filter((binding) => !shouldReplace(binding)),
            ...next
        ]);
        return previous.size !== this.activeInputBindings.size
            || [...previous].some((binding) => !this.activeInputBindings.has(binding))
            || [...this.activeInputBindings].some((binding) => !previous.has(binding));
    }

    getActiveInputBindings() {
        return new Set(this.activeInputBindings);
    }

    decorateActionsWithInputState(actions = []) {
        return this.comboState.decorateActions(actions, this.activeInputBindings);
    }

    getGamepad(index) {
        return this.gamepads.getGamepad(index);
    }

    getGamepads() {
        return this.gamepads.getGamepads();
    }

    isGamepadBindingDown(binding) {
        const parsed = parseGamepadBinding(binding);
        if (!parsed) {
            return false;
        }
        const pad = this.getGamepad(parsed.padIndex);
        if (!pad) {
            return false;
        }
        if (parsed.kind === 'button') {
            return Boolean(pad.isDown(parsed.inputIndex));
        }
        return gamepadAxisDirectionIsActive(pad.axes?.[parsed.inputIndex], parsed.direction);
    }

    isGamepadBindingPressed(binding) {
        const parsed = parseGamepadBinding(binding);
        if (!parsed) {
            return false;
        }
        const pad = this.getGamepad(parsed.padIndex);
        if (!pad) {
            return false;
        }
        return parsed.kind === 'button' ? Boolean(pad.isPressed(parsed.inputIndex)) : false;
    }

    isGamepadBindingReleased(binding) {
        const parsed = parseGamepadBinding(binding);
        if (!parsed || parsed.kind !== 'button') {
            return false;
        }
        return Boolean(this.getGamepad(parsed.padIndex)?.isReleased(parsed.inputIndex));
    }

    onKeyDown(event) {
        this.liveKeysDown.add(event.code);
    }

    onKeyUp(event) {
        this.liveKeysDown.delete(event.code);
    }

    onMouseMove(event) {
        if (!this.pointerEventsAvailable) {
            this.pointerDrag.pointerMove(event);
        }
        const eventTarget = event?.target ?? null;
        const isCanvasTarget = typeof HTMLCanvasElement !== 'undefined'
            && eventTarget instanceof HTMLCanvasElement;
        if (!isCanvasTarget) {
            return;
        }

        const nextX = event.offsetX ?? event.clientX ?? 0;
        const nextY = event.offsetY ?? event.clientY ?? 0;
        this.mouseDelta.x += nextX - this.mousePosition.x;
        this.mouseDelta.y += nextY - this.mousePosition.y;
        this.mousePosition = { x: nextX, y: nextY };
    }

    onMouseDown(event) {
        this.liveMouseButtonsDown.add(event.button ?? 0);
        if (!this.pointerEventsAvailable) {
            this.pointerDrag.pointerDown(event);
        }
    }

    onMouseUp(event) {
        this.liveMouseButtonsDown.delete(event.button ?? 0);
        if (!this.pointerEventsAvailable) {
            this.pointerDrag.pointerUp(event);
        }
    }

    onPointerDown(event) {
        this.trackPointerCapability(event);
        this.pointerDrag.pointerDown(event);
    }

    onPointerMove(event) {
        this.trackPointerCapability(event);
        this.pointerDrag.pointerMove(event);
    }

    onPointerUp(event) {
        this.trackPointerCapability(event);
        this.pointerDrag.pointerUp(event);
    }

    onPointerCancel(event) {
        this.trackPointerCapability(event);
        this.pointerDrag.pointerCancel(event);
    }

    trackPointerCapability(event = {}) {
        if (event.pointerType === 'touch') {
            this.touchAvailable = true;
        }
        if (event.pointerType === 'pen') {
            this.penAvailable = true;
        }
    }

    onBlur() {
        this.liveKeysDown.clear();
        this.liveMouseButtonsDown.clear();
        this.mouseDelta = { x: 0, y: 0 };
        this.pointerDrag.reset();
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
                    ? gamepad.buttons.map((button) => ({
                        pressed: Boolean(button?.pressed) || Number(button?.value ?? 0) > 0.5,
                        value: Number(button?.value ?? 0)
                    }))
                    : [],
            }));
    }
}

function parseGamepadBinding(binding) {
    const match = /^Pad(\d+):(Button|Axis)(\d+)([+-]?)$/.exec(String(binding || ''));
    if (!match) {
        return null;
    }
    return {
        direction: match[4] || '',
        inputIndex: Number(match[3]),
        kind: match[2] === 'Axis' ? 'axis' : 'button',
        padIndex: Number(match[1])
    };
}

function gamepadAxisDirectionIsActive(value, direction) {
    const axis = Number(value) || 0;
    if (direction === '-') {
        return axis <= -0.35;
    }
    if (direction === '+') {
        return axis >= 0.35;
    }
    return Math.abs(axis) >= 0.35;
}
