/*
Toolbox Aid
David Quesenberry
06/10/2026
NormalizedInputRegistry.js
*/

export const NORMALIZED_INPUT_REGISTRY = Object.freeze([
    Object.freeze({ id: 'move.x', label: 'move.x', kind: 'axis' }),
    Object.freeze({ id: 'move.y', label: 'move.y', kind: 'axis' }),
    Object.freeze({ id: 'aim.x', label: 'aim.x', kind: 'axis' }),
    Object.freeze({ id: 'aim.y', label: 'aim.y', kind: 'axis' }),
    Object.freeze({ id: 'button.south', label: 'button.south', kind: 'button' }),
    Object.freeze({ id: 'button.east', label: 'button.east', kind: 'button' }),
    Object.freeze({ id: 'button.west', label: 'button.west', kind: 'button' }),
    Object.freeze({ id: 'button.north', label: 'button.north', kind: 'button' }),
    Object.freeze({ id: 'dpad.up', label: 'dpad.up', kind: 'dpad' }),
    Object.freeze({ id: 'dpad.down', label: 'dpad.down', kind: 'dpad' }),
    Object.freeze({ id: 'dpad.left', label: 'dpad.left', kind: 'dpad' }),
    Object.freeze({ id: 'dpad.right', label: 'dpad.right', kind: 'dpad' }),
    Object.freeze({ id: 'trigger.left', label: 'trigger.left', kind: 'trigger' }),
    Object.freeze({ id: 'trigger.right', label: 'trigger.right', kind: 'trigger' }),
    Object.freeze({ id: 'start', label: 'start', kind: 'system' }),
    Object.freeze({ id: 'select', label: 'select', kind: 'system' }),
]);

const NORMALIZED_INPUT_IDS = new Set(NORMALIZED_INPUT_REGISTRY.map((input) => input.id));

const DEFAULT_PHYSICAL_INPUT_MAP = Object.freeze({
    ArrowDown: 'move.y',
    ArrowLeft: 'move.x',
    ArrowRight: 'move.x',
    ArrowUp: 'move.y',
    Axis0: 'move.x',
    Axis1: 'move.y',
    Axis2: 'aim.x',
    Axis3: 'aim.y',
    Button0: 'button.south',
    Button1: 'button.east',
    Button2: 'button.west',
    Button3: 'button.north',
    Button8: 'select',
    Button9: 'start',
    'DPad Down': 'dpad.down',
    'DPad Left': 'dpad.left',
    'DPad Right': 'dpad.right',
    'DPad Up': 'dpad.up',
    Enter: 'start',
    Escape: 'select',
    KeyA: 'move.x',
    KeyD: 'move.x',
    KeyS: 'move.y',
    KeyW: 'move.y',
    MouseButton0: 'button.south',
    MouseButton2: 'button.east',
    MouseX: 'aim.x',
    MouseY: 'aim.y',
    Space: 'button.south',
    'Trigger Left': 'trigger.left',
    'Trigger Right': 'trigger.right',
});

export function normalizedInputOptions() {
    return NORMALIZED_INPUT_REGISTRY.map((input) => ({
        label: input.label,
        value: input.id,
    }));
}

export function normalizedInputLabel(inputId) {
    return normalizedInputById(inputId)?.label || normalizeInputId(inputId) || 'Unassigned';
}

export function normalizedInputById(inputId) {
    const normalizedId = normalizeInputId(inputId);
    return NORMALIZED_INPUT_REGISTRY.find((input) => input.id === normalizedId) || null;
}

export function normalizeNormalizedInput(inputId, fallback = '') {
    const normalizedId = normalizeInputId(inputId);
    if (NORMALIZED_INPUT_IDS.has(normalizedId)) {
        return normalizedId;
    }
    return NORMALIZED_INPUT_IDS.has(fallback) ? fallback : '';
}

export function defaultNormalizedInputForPhysicalInput(physicalInput) {
    const inputName = normalizeInputName(physicalInput);
    return DEFAULT_PHYSICAL_INPUT_MAP[inputName] || '';
}

export function physicalInputIsAnalog(physicalInput) {
    return /^Axis\d+$/i.test(normalizeInputName(physicalInput))
        || normalizeInputName(physicalInput) === 'MouseX'
        || normalizeInputName(physicalInput) === 'MouseY';
}

export function normalizedInputIsAnalog(inputId) {
    const kind = normalizedInputById(inputId)?.kind || '';
    return kind === 'axis' || kind === 'trigger';
}

export function normalizeProfileInputMapping(inputName, source = {}) {
    const physicalInput = normalizeInputName(source.physicalInput || source.input || inputName);
    const fallbackNormalizedInput = defaultNormalizedInputForPhysicalInput(physicalInput);
    const deadzone = Number(source.deadzone);
    return {
        deadzone: Number.isFinite(deadzone) ? Math.max(0, Math.min(1, deadzone)) : 0.2,
        invert: Boolean(source.invert),
        normalizedInput: normalizeNormalizedInput(source.normalizedInput, fallbackNormalizedInput),
        physicalInput,
    };
}

export function normalizeProfileInputMappings(inputs = [], mappings = []) {
    const byPhysicalInput = new Map(
        (Array.isArray(mappings) ? mappings : [])
            .map((mapping) => normalizeProfileInputMapping(mapping?.physicalInput, mapping))
            .filter((mapping) => mapping.physicalInput)
            .map((mapping) => [mapping.physicalInput, mapping]),
    );
    return (Array.isArray(inputs) ? inputs : [])
        .map(normalizeInputName)
        .filter(Boolean)
        .map((inputName) => normalizeProfileInputMapping(inputName, byPhysicalInput.get(inputName) || {}));
}

function normalizeInputId(value) {
    return String(value || '').trim();
}

function normalizeInputName(value) {
    return String(value || '').trim();
}
