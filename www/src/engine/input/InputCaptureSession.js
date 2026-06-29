/*
Toolbox Aid
David Quesenberry
05/23/2026
InputCaptureSession.js
*/
import PointerDragState from './PointerDragState.js';
import { mouseButtonLabel } from './InputCapabilityDescriptors.js';

export default class InputCaptureSession {
    constructor({
        captureTimeoutMs = 8000,
        clearTimeout: clearTimeoutRef = null,
        doubleClickThresholdMs = 1000,
        livePointerDrag = null,
        onStateChange = null,
        pointerDrag = null,
        setTimeout: setTimeoutRef = null,
        visualStateMinimumMs = 300
    } = {}) {
        this.captureTimeoutMs = Math.max(1, Number(captureTimeoutMs) || 8000);
        this.clearTimeoutRef = typeof clearTimeoutRef === 'function'
            ? clearTimeoutRef
            : typeof globalThis.clearTimeout === 'function'
                ? globalThis.clearTimeout.bind(globalThis)
                : null;
        this.doubleClickThresholdMs = Math.max(1, Number(doubleClickThresholdMs) || 1000);
        this.pointerDrag = pointerDrag ?? new PointerDragState();
        this.livePointerDrag = livePointerDrag ?? new PointerDragState();
        this.setTimeoutRef = typeof setTimeoutRef === 'function'
            ? setTimeoutRef
            : typeof globalThis.setTimeout === 'function'
                ? globalThis.setTimeout.bind(globalThis)
                : null;
        this.visualStateMinimumMs = Math.max(0, Number(visualStateMinimumMs) || 0);
        this.listeners = new Set();
        if (typeof onStateChange === 'function') {
            this.listeners.add(onStateChange);
        }
        this.reset({ notify: false });
    }

    subscribe(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    reset({ notify = true } = {}) {
        this.clearTimers();
        this.mode = '';
        this.captureState = 'idle';
        this.activeCaptureId = '';
        this.activeGamepadIndex = null;
        this.actionLabel = 'selected action';
        this.pendingKeyboardReleaseInput = null;
        this.pendingDoubleClickInput = null;
        this.pendingPointerDragGesture = null;
        this.livePointerDragBinding = '';
        this.pointerDrag.reset();
        this.livePointerDrag.reset();
        if (notify) {
            this.emit({
                type: 'reset',
                state: this.captureState
            });
        }
    }

    begin(captureId, { actionLabel = 'selected action', mode = '', timeoutMs = this.captureTimeoutMs } = {}) {
        this.reset({ notify: false });
        this.activeCaptureId = String(captureId || '');
        this.mode = mode || (this.activeCaptureId.startsWith('gamepad:') ? 'gamepad' : this.activeCaptureId);
        this.activeGamepadIndex = this.activeCaptureId.startsWith('gamepad:')
            ? Number(this.activeCaptureId.slice('gamepad:'.length))
            : null;
        this.captureState = 'waiting';
        this.actionLabel = String(actionLabel || 'selected action');
        this.scheduleCaptureTimeout(timeoutMs);
        this.emit({
            type: 'begin',
            state: this.captureState
        });
        return this.getState();
    }

    setVisualMode(mode) {
        return this.enterVisualState(String(mode || ''), {
            message: '',
            severity: ''
        });
    }

    complete({ message = 'Capture complete.' } = {}) {
        return this.enterVisualState('complete', {
            message,
            severity: '',
            type: 'complete'
        });
    }

    cancel({ message = 'Capture canceled.' } = {}) {
        return this.enterVisualState('canceled', {
            message,
            severity: '',
            type: 'canceled'
        });
    }

    timeout(message = `${this.captureLabel()} capture timed out for ${this.actionLabel}.`) {
        return this.enterVisualState('canceled', {
            message,
            severity: 'warn',
            type: 'timeout'
        });
    }

    clearPendingInputState() {
        this.pendingKeyboardReleaseInput = null;
        this.pendingDoubleClickInput = null;
        this.pendingPointerDragGesture = null;
        this.clearPendingTimer();
        this.pointerDrag.reset();
    }

    getState() {
        return {
            activeCaptureId: this.activeCaptureId,
            activeGamepadIndex: this.activeGamepadIndex,
            captureState: this.captureState,
            mode: this.mode
        };
    }

    isCaptureActive(captureId) {
        return String(captureId || '') === this.activeCaptureId && !this.isVisualState();
    }

    isVisualState() {
        return this.mode === 'complete' || this.mode === 'canceled';
    }

    captureLabel() {
        if (this.mode === 'keyboard') {
            return 'Keyboard';
        }
        if (this.mode === 'mouse') {
            return 'Mouse';
        }
        if (this.mode === 'combo') {
            return 'Combo';
        }
        if (this.mode === 'gamepad') {
            return 'Gamepad';
        }
        return 'Input';
    }

    hasPendingPointerDrag() {
        return Boolean(this.pendingPointerDragGesture);
    }

    handleKeyboardDown({ event = {}, gesture = null, input = null } = {}) {
        if (this.mode !== 'keyboard') {
            return notHandled();
        }
        if (gesture?.binding === 'KeyboardRelease') {
            return this.startKeyboardRelease(input);
        }
        return commitInput(input);
    }

    handleKeyboardUp({ event = {}, gesture = null } = {}) {
        if (this.mode !== 'keyboard' || gesture?.binding !== 'KeyboardRelease') {
            return notHandled();
        }
        return this.commitKeyboardRelease(event);
    }

    handleMouseDown({ event = {}, gesture = null, input = null, now = Date.now() } = {}) {
        if (this.mode !== 'mouse') {
            return notHandled();
        }
        if (gesture?.captureKind === 'wheel') {
            return warning(`${gesture.deviceLabel} ${gesture.label} capture expects wheel input; mouse click ignored.`);
        }
        if (gesture?.captureKind === 'pointer-drag') {
            return this.startPointerDrag(event, gesture);
        }
        if (gesture?.binding === 'MouseDoubleClick') {
            return this.recordDoubleClick(event, input, {
                now,
                thresholdMs: this.doubleClickThresholdMs
            });
        }
        return commitInput(input);
    }

    handleMouseMove({ event = {}, gesture = null } = {}) {
        if (this.mode !== 'mouse' || (gesture?.captureKind !== 'pointer-drag' && !this.pendingPointerDragGesture)) {
            return notHandled();
        }
        return this.updatePointerDrag(event);
    }

    handleMouseUp({ event = {}, gesture = null } = {}) {
        if (this.mode !== 'mouse' || (gesture?.captureKind !== 'pointer-drag' && !this.pendingPointerDragGesture)) {
            return notHandled();
        }
        return this.finishPointerDrag(event);
    }

    handleWheel({ gesture = null, input = null } = {}) {
        if (this.mode !== 'mouse') {
            return notHandled();
        }
        if (gesture?.captureKind !== 'wheel') {
            return warning(`${gesture?.deviceLabel ?? 'Mouse'} ${gesture?.label ?? 'gesture'} capture expects mouse button input; wheel input ignored.`);
        }
        if (input?.binding !== gesture.binding) {
            return warning(`${gesture.deviceLabel} ${gesture.label} capture expects ${gesture.label}; ${input?.displayLabelLines?.[1] ?? 'wheel input'} was ignored.`);
        }
        return commitInput(input);
    }

    handleComboRecord(result) {
        if (!result?.ok) {
            return {
                ...warning(result?.message ?? 'Combo capture requires a valid input from the engine input service.'),
                silent: result?.silent === true
            };
        }
        if (result.waiting) {
            this.captureState = 'pending';
            return pending(result.message);
        }
        return commitInput(result.input);
    }

    handleGamepadCaptureResult(result) {
        if (result?.waiting) {
            return {
                handled: false,
                waiting: true
            };
        }
        if (!result?.ok) {
            if (result?.invalid === true) {
                this.scheduleCaptureTimeout();
            }
            return {
                ...warning(result?.message ?? 'Gamepad capture unavailable.'),
                cancel: result?.invalid !== true
            };
        }
        return commitInput(result.input);
    }

    startKeyboardRelease(input) {
        this.pendingKeyboardReleaseInput = input ? { ...input } : null;
        this.captureState = this.pendingKeyboardReleaseInput ? 'pending' : 'warning';
        return {
            handled: true,
            ok: Boolean(this.pendingKeyboardReleaseInput),
            waiting: Boolean(this.pendingKeyboardReleaseInput),
            message: this.pendingKeyboardReleaseInput
                ? `Keyboard Release recorded ${this.pendingKeyboardReleaseInput.displayLabelLines?.[1] || this.pendingKeyboardReleaseInput.binding}. Waiting for release.`
                : 'Keyboard Release capture requires a key down before release.',
            state: this.captureState
        };
    }

    commitKeyboardRelease(event = {}) {
        if (!this.pendingKeyboardReleaseInput) {
            return {
                handled: true,
                ok: false,
                message: 'Keyboard Release capture needs a key down before release; press and release the key again.',
                severity: 'warn',
                state: 'warning'
            };
        }
        const releasedBinding = event.code || event.key;
        const expectedBinding = baseBinding(this.pendingKeyboardReleaseInput.binding);
        if (expectedBinding !== releasedBinding) {
            return {
                handled: true,
                ok: false,
                message: `Keyboard Release capture is waiting for ${expectedBinding}; ${releasedBinding} was ignored.`,
                severity: 'warn',
                state: 'warning'
            };
        }
        const input = this.pendingKeyboardReleaseInput;
        this.pendingKeyboardReleaseInput = null;
        return commitInput(input);
    }

    recordDoubleClick(event, input, { now = Date.now(), thresholdMs = this.doubleClickThresholdMs } = {}) {
        const button = Number(event?.button ?? 0);
        const startedAt = Number(now) || Date.now();
        if (!this.pendingDoubleClickInput) {
            return this.startDoubleClickPending({ button, input, startedAt }, { thresholdMs });
        }
        if (this.pendingDoubleClickInput.button !== button) {
            const result = this.startDoubleClickPending({ button, input, startedAt }, { thresholdMs });
            return {
                ...result,
                warning: 'Mouse Double Click capture needs the second click on the same mouse button; starting over with the latest click.'
            };
        }
        if (startedAt - this.pendingDoubleClickInput.startedAt > thresholdMs) {
            const result = this.startDoubleClickPending({ button, input, startedAt }, { thresholdMs });
            return {
                ...result,
                warning: 'Mouse Double Click capture needs two clicks within the double-click threshold; starting over with the latest click.'
            };
        }
        const completeInput = this.pendingDoubleClickInput.input;
        this.pendingDoubleClickInput = null;
        this.clearPendingTimer();
        return commitInput(completeInput);
    }

    startDoubleClickPending(pendingInput, { thresholdMs = this.doubleClickThresholdMs } = {}) {
        this.pendingDoubleClickInput = {
            button: pendingInput.button,
            input: pendingInput.input,
            startedAt: pendingInput.startedAt
        };
        this.captureState = 'pending';
        this.schedulePendingTimeout(thresholdMs, {
            message: `Mouse Double Click capture timed out waiting for the second click for ${this.actionLabel}.`,
            onExpire: () => this.resetDoubleClick()
        });
        return {
            handled: true,
            ok: true,
            waiting: true,
            message: `Mouse Double Click recorded first click on ${pendingInput.input.displayLabelLines?.[1] || pendingInput.input.label}. Waiting for second click.`,
            state: this.captureState
        };
    }

    resetDoubleClick() {
        this.pendingDoubleClickInput = null;
    }

    startPointerDrag(event, gesture) {
        this.pendingPointerDragGesture = gesture ? { ...gesture } : null;
        this.pointerDrag.reset();
        this.pointerDrag.pointerDown(event);
        const snapshot = this.pointerDrag.getSnapshot();
        this.captureState = this.pendingPointerDragGesture ? 'pending' : 'warning';
        return {
            handled: true,
            ok: Boolean(this.pendingPointerDragGesture),
            waiting: true,
            message: this.pendingPointerDragGesture
                ? `${this.pendingPointerDragGesture.deviceLabel} ${this.pendingPointerDragGesture.label} started with ${mouseButtonLabel(snapshot.button)}. Move while holding the button.`
                : 'Mouse Drag capture requires a selected pointer drag gesture.',
            state: this.captureState
        };
    }

    updatePointerDrag(event) {
        if (!this.pendingPointerDragGesture || !this.pointerDrag.getSnapshot().dragStart) {
            return {
                handled: true,
                ok: false,
                message: 'Mouse Drag capture is waiting for a mouse button down before movement.',
                severity: 'warn',
                state: 'warning'
            };
        }
        this.pointerDrag.pointerMove(event);
        const snapshot = this.pointerDrag.getSnapshot();
        if (!snapshot.isDragging) {
            return {
                handled: true,
                ok: true,
                waiting: true,
                message: `${this.pendingPointerDragGesture.deviceLabel} ${this.pendingPointerDragGesture.label} is waiting for drag movement.`,
                state: 'pending'
            };
        }
        if (this.pendingPointerDragGesture.binding === 'MousePrimaryDrag') {
            return this.completePointerDrag({ released: false });
        }
        return {
            handled: true,
            ok: true,
            waiting: true,
            message: `${this.pendingPointerDragGesture.deviceLabel} ${this.pendingPointerDragGesture.label} tracking ${mouseButtonLabel(snapshot.button)}. Release to commit.`,
            state: 'pending'
        };
    }

    finishPointerDrag(event) {
        if (!this.pendingPointerDragGesture || !this.pointerDrag.getSnapshot().dragStart) {
            return {
                handled: true,
                ok: false,
                message: 'Mouse Drag Release capture is waiting for a mouse button down before release.',
                severity: 'warn',
                state: 'warning'
            };
        }
        this.pointerDrag.pointerUp(event);
        const snapshot = this.pointerDrag.getSnapshot();
        if (!snapshot.isDragging) {
            this.clearPendingPointerDrag();
            return {
                handled: true,
                ok: false,
                message: 'Mouse Drag capture needs movement before release; press, drag, and release again.',
                severity: 'warn',
                state: 'warning'
            };
        }
        return this.completePointerDrag({ released: true });
    }

    completePointerDrag({ released }) {
        const gesture = this.pendingPointerDragGesture;
        const snapshot = {
            ...this.pointerDrag.getSnapshot(),
            isDown: !released,
            lastEventType: released ? 'drag-release' : 'drag',
            wasReleased: released
        };
        this.clearPendingPointerDrag();
        return {
            handled: true,
            ok: true,
            complete: true,
            gesture,
            commitPointerDrag: {
                gesture,
                snapshot
            },
            released,
            snapshot
        };
    }

    clearPendingPointerDrag() {
        this.pendingPointerDragGesture = null;
        this.pointerDrag.reset();
    }

    startLivePointerDrag(event) {
        this.livePointerDrag.reset();
        this.livePointerDragBinding = mouseButtonBinding(event);
        this.livePointerDrag.pointerDown(event);
    }

    updateLivePointerDrag(event) {
        if (!this.livePointerDrag.getSnapshot().dragStart || !mouseButtonIsDown(event, this.livePointerDrag.getSnapshot().button)) {
            return {
                changed: false,
                activeBindings: []
            };
        }
        this.livePointerDrag.pointerMove(event);
        if (!this.livePointerDrag.getSnapshot().isDragging) {
            return {
                changed: false,
                activeBindings: []
            };
        }
        return {
            changed: true,
            activeBindings: [`${this.livePointerDragBinding}:MousePrimaryDrag`]
        };
    }

    finishLivePointerDrag(event) {
        const binding = this.livePointerDragBinding || mouseButtonBinding(event);
        const snapshotBeforeRelease = this.livePointerDrag.getSnapshot();
        this.livePointerDrag.pointerUp(event);
        const wasDragging = snapshotBeforeRelease.isDragging || this.livePointerDrag.getSnapshot().isDragging;
        this.livePointerDrag.reset();
        this.livePointerDragBinding = '';
        return {
            clearBindings: [binding, `${binding}:MousePrimaryDrag`],
            transientBindings: wasDragging ? [`${binding}:MousePrimaryDragRelease`] : []
        };
    }

    enterVisualState(mode, { message = '', severity = '', type = mode } = {}) {
        this.clearCaptureTimer();
        this.clearPendingInputState();
        this.mode = String(mode || '');
        this.captureState = this.mode || 'idle';
        this.emit({
            type,
            state: this.captureState,
            message,
            severity
        });
        this.scheduleVisualReset();
        return this.getState();
    }

    scheduleCaptureTimeout(timeoutMs = this.captureTimeoutMs) {
        this.clearCaptureTimer();
        if (!this.setTimeoutRef) {
            return;
        }
        const delayMs = Math.max(1, Number(timeoutMs) || this.captureTimeoutMs);
        this.captureTimeoutTimer = this.setTimeoutRef(() => {
            this.captureTimeoutTimer = null;
            this.timeout();
        }, delayMs);
    }

    schedulePendingTimeout(delayMs, { message, onExpire = null } = {}) {
        this.clearPendingTimer();
        if (!this.setTimeoutRef) {
            return;
        }
        const timeoutMs = Math.max(1, Number(delayMs) || this.doubleClickThresholdMs);
        this.pendingTimer = this.setTimeoutRef(() => {
            this.pendingTimer = null;
            if (typeof onExpire === 'function') {
                onExpire();
            }
            this.timeout(message);
        }, timeoutMs);
    }

    scheduleVisualReset() {
        this.clearVisualTimer();
        if (!this.setTimeoutRef) {
            return;
        }
        const delayMs = Math.max(0, Number(this.visualStateMinimumMs) || 0);
        this.visualTimer = this.setTimeoutRef(() => {
            this.visualTimer = null;
            this.reset({ notify: false });
            this.emit({
                type: 'visual-reset',
                state: this.captureState
            });
        }, delayMs);
    }

    clearTimers() {
        this.clearCaptureTimer();
        this.clearPendingTimer();
        this.clearVisualTimer();
    }

    clearCaptureTimer() {
        this.clearTimer('captureTimeoutTimer');
    }

    clearPendingTimer() {
        this.clearTimer('pendingTimer');
    }

    clearVisualTimer() {
        this.clearTimer('visualTimer');
    }

    clearTimer(fieldName) {
        if (this[fieldName] && this.clearTimeoutRef) {
            this.clearTimeoutRef(this[fieldName]);
        }
        this[fieldName] = null;
    }

    emit(event = {}) {
        const state = {
            ...this.getState(),
            ...event
        };
        this.listeners.forEach((listener) => {
            listener(state);
        });
    }
}

function notHandled() {
    return {
        handled: false
    };
}

function pending(message) {
    return {
        handled: true,
        ok: true,
        waiting: true,
        message,
        state: 'pending'
    };
}

function warning(message) {
    return {
        handled: true,
        ok: false,
        message,
        severity: 'warn',
        state: 'warning'
    };
}

function commitInput(input) {
    if (!input || !input.binding) {
        return warning('Capture requires a valid input from the engine input service.');
    }
    return {
        handled: true,
        ok: true,
        complete: true,
        commitInput: input,
        input
    };
}

export function keyboardDownBindings(code) {
    if (!code) {
        return [];
    }
    return [code, `${code}:KeyboardHold`];
}

export function keyboardReleaseBindings(code) {
    if (!code) {
        return [];
    }
    return [`${code}:KeyboardRelease`];
}

export function mouseButtonBinding(event) {
    return `MouseButton${Number(event?.button ?? 0)}`;
}

export function isMouseDoubleClickEvent(event) {
    return Number(event?.detail ?? 0) >= 2;
}

function baseBinding(binding) {
    return String(binding || '').split(':')[0];
}

function mouseButtonIsDown(event, button) {
    const buttons = Number(event?.buttons);
    if (!Number.isFinite(buttons) || buttons === 0) {
        return true;
    }
    return (buttons & mouseButtonMask(button)) !== 0;
}

function mouseButtonMask(button) {
    const buttonNumber = Number(button);
    if (buttonNumber === 0) {
        return 1;
    }
    if (buttonNumber === 1) {
        return 4;
    }
    if (buttonNumber === 2) {
        return 2;
    }
    if (buttonNumber === 3) {
        return 8;
    }
    if (buttonNumber === 4) {
        return 16;
    }
    return 0;
}
