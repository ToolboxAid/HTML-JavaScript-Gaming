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
        doubleClickThresholdMs = 1000,
        livePointerDrag = null,
        pointerDrag = null
    } = {}) {
        this.doubleClickThresholdMs = Math.max(1, Number(doubleClickThresholdMs) || 1000);
        this.pointerDrag = pointerDrag ?? new PointerDragState();
        this.livePointerDrag = livePointerDrag ?? new PointerDragState();
        this.reset();
    }

    reset() {
        this.mode = '';
        this.activeCaptureId = '';
        this.activeGamepadIndex = null;
        this.pendingKeyboardReleaseInput = null;
        this.pendingDoubleClickInput = null;
        this.pendingPointerDragGesture = null;
        this.livePointerDragBinding = '';
        this.pointerDrag.reset();
        this.livePointerDrag.reset();
    }

    begin(captureId, { mode = '' } = {}) {
        this.reset();
        this.activeCaptureId = String(captureId || '');
        this.mode = mode || (this.activeCaptureId.startsWith('gamepad:') ? 'gamepad' : this.activeCaptureId);
        this.activeGamepadIndex = this.activeCaptureId.startsWith('gamepad:')
            ? Number(this.activeCaptureId.slice('gamepad:'.length))
            : null;
        return this.getState();
    }

    setVisualMode(mode) {
        this.mode = String(mode || '');
        this.clearPendingInputState();
        return this.getState();
    }

    clearPendingInputState() {
        this.pendingKeyboardReleaseInput = null;
        this.pendingDoubleClickInput = null;
        this.pendingPointerDragGesture = null;
        this.pointerDrag.reset();
    }

    getState() {
        return {
            activeCaptureId: this.activeCaptureId,
            activeGamepadIndex: this.activeGamepadIndex,
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

    startKeyboardRelease(input) {
        this.pendingKeyboardReleaseInput = input ? { ...input } : null;
        return {
            ok: Boolean(this.pendingKeyboardReleaseInput),
            waiting: Boolean(this.pendingKeyboardReleaseInput),
            message: this.pendingKeyboardReleaseInput
                ? `Keyboard Release recorded ${this.pendingKeyboardReleaseInput.displayLabelLines?.[1] || this.pendingKeyboardReleaseInput.binding}. Waiting for release.`
                : 'Keyboard Release capture requires a key down before release.',
            state: this.pendingKeyboardReleaseInput ? 'pending' : 'warning'
        };
    }

    commitKeyboardRelease(event = {}) {
        if (!this.pendingKeyboardReleaseInput) {
            return {
                ok: false,
                message: 'Keyboard Release capture needs a key down before release; press and release the key again.'
            };
        }
        const releasedBinding = event.code || event.key;
        const expectedBinding = baseBinding(this.pendingKeyboardReleaseInput.binding);
        if (expectedBinding !== releasedBinding) {
            return {
                ok: false,
                message: `Keyboard Release capture is waiting for ${expectedBinding}; ${releasedBinding} was ignored.`
            };
        }
        const input = this.pendingKeyboardReleaseInput;
        this.pendingKeyboardReleaseInput = null;
        return {
            ok: true,
            input
        };
    }

    recordDoubleClick(event, input, { now = Date.now(), thresholdMs = this.doubleClickThresholdMs } = {}) {
        const button = Number(event?.button ?? 0);
        const startedAt = Number(now) || Date.now();
        if (!this.pendingDoubleClickInput) {
            return this.startDoubleClickPending({ button, input, startedAt });
        }
        if (this.pendingDoubleClickInput.button !== button) {
            const result = this.startDoubleClickPending({ button, input, startedAt });
            return {
                ...result,
                warning: 'Mouse Double Click capture needs the second click on the same mouse button; starting over with the latest click.'
            };
        }
        if (startedAt - this.pendingDoubleClickInput.startedAt > thresholdMs) {
            const result = this.startDoubleClickPending({ button, input, startedAt });
            return {
                ...result,
                warning: 'Mouse Double Click capture needs two clicks within the double-click threshold; starting over with the latest click.'
            };
        }
        const completeInput = this.pendingDoubleClickInput.input;
        this.pendingDoubleClickInput = null;
        return {
            ok: true,
            complete: true,
            input: completeInput
        };
    }

    startDoubleClickPending(pendingInput) {
        this.pendingDoubleClickInput = {
            button: pendingInput.button,
            input: pendingInput.input,
            startedAt: pendingInput.startedAt
        };
        return {
            ok: true,
            waiting: true,
            message: `Mouse Double Click recorded first click on ${pendingInput.input.displayLabelLines?.[1] || pendingInput.input.label}. Waiting for second click.`,
            state: 'pending'
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
        return {
            ok: Boolean(this.pendingPointerDragGesture),
            waiting: true,
            message: this.pendingPointerDragGesture
                ? `${this.pendingPointerDragGesture.deviceLabel} ${this.pendingPointerDragGesture.label} started with ${mouseButtonLabel(snapshot.button)}. Move while holding the button.`
                : 'Mouse Drag capture requires a selected pointer drag gesture.',
            state: this.pendingPointerDragGesture ? 'pending' : 'warning'
        };
    }

    updatePointerDrag(event) {
        if (!this.pendingPointerDragGesture || !this.pointerDrag.getSnapshot().dragStart) {
            return {
                ok: false,
                message: 'Mouse Drag capture is waiting for a mouse button down before movement.'
            };
        }
        this.pointerDrag.pointerMove(event);
        const snapshot = this.pointerDrag.getSnapshot();
        if (!snapshot.isDragging) {
            return {
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
            ok: true,
            waiting: true,
            message: `${this.pendingPointerDragGesture.deviceLabel} ${this.pendingPointerDragGesture.label} tracking ${mouseButtonLabel(snapshot.button)}. Release to commit.`,
            state: 'pending'
        };
    }

    finishPointerDrag(event) {
        if (!this.pendingPointerDragGesture || !this.pointerDrag.getSnapshot().dragStart) {
            return {
                ok: false,
                message: 'Mouse Drag Release capture is waiting for a mouse button down before release.'
            };
        }
        this.pointerDrag.pointerUp(event);
        const snapshot = this.pointerDrag.getSnapshot();
        if (!snapshot.isDragging) {
            this.clearPendingPointerDrag();
            return {
                ok: false,
                message: 'Mouse Drag capture needs movement before release; press, drag, and release again.'
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
            ok: true,
            complete: true,
            gesture,
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
