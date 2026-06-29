/*
Toolbox Aid
David Quesenberry
05/23/2026
InputComboState.js
*/

export default class InputComboState {
    constructor({ requiredInputCount = 2 } = {}) {
        this.requiredInputCount = Math.max(2, Number(requiredInputCount) || 2);
        this.reset();
    }

    begin({ actionLabel = 'selected action', deviceLabel = 'Combo' } = {}) {
        this.active = true;
        this.actionLabel = String(actionLabel || 'selected action');
        this.deviceLabel = String(deviceLabel || 'Combo');
        this.inputs = [];
        return {
            ok: true,
            waiting: true,
            message: `Combo capture: press any two keyboard, mouse, wheel, or game controller inputs for ${this.actionLabel}.`,
            engine: 'InputService ComboState'
        };
    }

    reset() {
        this.active = false;
        this.actionLabel = '';
        this.deviceLabel = 'Combo';
        this.inputs = [];
    }

    record(input, { silentDuplicate = false } = {}) {
        if (!input || !input.binding) {
            return {
                ok: false,
                message: 'Combo capture requires a valid input from the engine input service.'
            };
        }
        if (!this.active) {
            this.begin();
        }
        if (this.inputs.some((candidate) => candidate.binding === input.binding)) {
            return {
                ok: false,
                duplicate: true,
                silent: silentDuplicate === true,
                message: 'Combo capture needs two different inputs.'
            };
        }

        this.inputs.push({ ...input });
        if (this.inputs.length < this.requiredInputCount) {
            return {
                ok: true,
                waiting: true,
                count: this.inputs.length,
                message: `Combo capture recorded ${comboCaptureInputLabel(input)}. Waiting for second input.`
            };
        }

        const comboInput = this.createComboInput();
        this.active = false;
        return {
            ok: true,
            complete: true,
            count: this.inputs.length,
            input: comboInput,
            message: `${comboInput.label} captured.`
        };
    }

    createComboInput() {
        const parts = this.inputs.slice(0, this.requiredInputCount);
        const comboLabel = parts.map(comboInputLabel).join(' + ');
        return {
            source: parts.every((input) => input.source === parts[0].source) ? parts[0].source : 'keyboard',
            binding: `Combo:${parts.map((input) => input.binding).join('+')}`,
            displayLabelLines: ['Combo', comboLabel],
            label: `Combo ${comboLabel}`,
            title: parts.map((input) => input.title || input.label).join('\n+\n'),
            engine: 'InputService ComboState'
        };
    }

    isBindingActive(binding, activeInputBindings) {
        const activeBindings = toBindingSet(activeInputBindings);
        const bindingText = String(binding || '');
        if (activeBindings.has(bindingText)) {
            return true;
        }
        if (!bindingText.startsWith('Combo:')) {
            return false;
        }
        const parts = bindingText.slice('Combo:'.length).split('+').filter(Boolean);
        return parts.length > 0 && parts.every((part) => (
            liveBindingCandidates(part).some((candidate) => activeBindings.has(candidate))
        ));
    }

    decorateActions(actions = [], activeInputBindings = new Set()) {
        return actions.map((action) => ({
            ...action,
            inputs: (action.inputs || []).map((input) => ({
                ...input,
                isActionActive: this.isBindingActive(input.binding, activeInputBindings)
            }))
        }));
    }
}

function toBindingSet(activeInputBindings) {
    if (activeInputBindings instanceof Set) {
        return activeInputBindings;
    }
    if (Array.isArray(activeInputBindings)) {
        return new Set(activeInputBindings);
    }
    return new Set();
}

function liveBindingCandidates(binding) {
    const bindingText = String(binding || '');
    const candidates = [bindingText];
    if (bindingText.startsWith('Pad')) {
        const [pad, control] = bindingText.split(':');
        if (pad && control) {
            candidates.push(`${pad}:${control}`);
        }
        return candidates;
    }
    const baseBinding = bindingText.split(':')[0];
    if (baseBinding && baseBinding !== bindingText) {
        candidates.push(baseBinding);
    }
    return candidates;
}

function comboInputLabel(input) {
    if (input.source === 'keyboard') {
        return keyboardComboLabel(input.binding);
    }
    if (input.source === 'mouse') {
        return input.label.replace(/^Mouse\s+/, 'Mouse ');
    }
    if (input.source === 'gamepad') {
        return input.label.replace(/^Game Controller\s+/, 'Game Controller ');
    }
    return input.label;
}

function comboCaptureInputLabel(input) {
    if (input.source === 'keyboard') {
        return `Keyboard ${input.binding}`;
    }
    return comboInputLabel(input);
}

function keyboardComboLabel(binding) {
    const namedKeys = {
        AltLeft: 'Alt',
        AltRight: 'Alt',
        Backspace: 'Backspace',
        ControlLeft: 'Ctrl',
        ControlRight: 'Ctrl',
        Delete: 'Delete',
        Enter: 'Enter',
        Escape: 'Esc',
        MetaLeft: 'Meta',
        MetaRight: 'Meta',
        ShiftLeft: 'Shift',
        ShiftRight: 'Shift',
        Space: 'Space',
        Tab: 'Tab'
    };
    if (namedKeys[binding]) {
        return namedKeys[binding];
    }
    if (/^Key[A-Z]$/.test(binding)) {
        return binding.slice(3);
    }
    if (/^Digit[0-9]$/.test(binding)) {
        return binding.slice(5);
    }
    return binding;
}
