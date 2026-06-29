/*
Toolbox Aid
David Quesenberry
06/10/2026
NormalizedInputRegistry.js
*/

export const NORMALIZED_INPUT_REGISTRY = Object.freeze([
    Object.freeze({ id: 'move.x-', label: 'move.x-', kind: 'axis' }),
    Object.freeze({ id: 'move.x+', label: 'move.x+', kind: 'axis' }),
    Object.freeze({ id: 'move.y-', label: 'move.y-', kind: 'axis' }),
    Object.freeze({ id: 'move.y+', label: 'move.y+', kind: 'axis' }),
    Object.freeze({ id: 'aim.x-', label: 'aim.x-', kind: 'axis' }),
    Object.freeze({ id: 'aim.x+', label: 'aim.x+', kind: 'axis' }),
    Object.freeze({ id: 'aim.y-', label: 'aim.y-', kind: 'axis' }),
    Object.freeze({ id: 'aim.y+', label: 'aim.y+', kind: 'axis' }),
    Object.freeze({ id: 'action.primary', label: 'action.primary', kind: 'action' }),
    Object.freeze({ id: 'action.secondary', label: 'action.secondary', kind: 'action' }),
    Object.freeze({ id: 'action.tertiary', label: 'action.tertiary', kind: 'action' }),
    Object.freeze({ id: 'action.quaternary', label: 'action.quaternary', kind: 'action' }),
    Object.freeze({ id: 'action.confirm', label: 'action.confirm', kind: 'action' }),
    Object.freeze({ id: 'action.cancel', label: 'action.cancel', kind: 'action' }),
    Object.freeze({ id: 'action.menu', label: 'action.menu', kind: 'action' }),
    Object.freeze({ id: 'action.scrollUp', label: 'action.scrollUp', kind: 'action' }),
    Object.freeze({ id: 'action.scrollDown', label: 'action.scrollDown', kind: 'action' }),
    Object.freeze({ id: 'action.start', label: 'action.start', kind: 'action' }),
    Object.freeze({ id: 'action.select', label: 'action.select', kind: 'action' }),
    Object.freeze({ id: 'action.pause', label: 'action.pause', kind: 'action' }),
    Object.freeze({ id: 'dpad.up', label: 'dpad.up', kind: 'dpad' }),
    Object.freeze({ id: 'dpad.down', label: 'dpad.down', kind: 'dpad' }),
    Object.freeze({ id: 'dpad.left', label: 'dpad.left', kind: 'dpad' }),
    Object.freeze({ id: 'dpad.right', label: 'dpad.right', kind: 'dpad' }),
    Object.freeze({ id: 'trigger.left', label: 'trigger.left', kind: 'trigger' }),
    Object.freeze({ id: 'trigger.right', label: 'trigger.right', kind: 'trigger' }),
]);

const NORMALIZED_INPUT_IDS = new Set(NORMALIZED_INPUT_REGISTRY.map((input) => input.id));

const DEFAULT_PHYSICAL_INPUT_MAP = Object.freeze({
    ArrowDown: 'move.y+',
    ArrowLeft: 'move.x-',
    ArrowRight: 'move.x+',
    ArrowUp: 'move.y-',
    Axis0: 'move.x+',
    Axis1: 'move.y+',
    Axis2: 'aim.x+',
    Axis3: 'aim.y+',
    Button0: 'action.primary',
    Button1: 'action.secondary',
    Button2: 'action.tertiary',
    Button3: 'action.quaternary',
    Button8: 'action.select',
    Button9: 'action.start',
    Backspace: 'action.cancel',
    ControlLeft: 'action.tertiary',
    'DPad Down': 'move.y+',
    'DPad Left': 'move.x-',
    'DPad Right': 'move.x+',
    'DPad Up': 'move.y-',
    Enter: 'action.confirm',
    KeyA: 'move.x-',
    KeyD: 'move.x+',
    KeyP: 'action.pause',
    KeyS: 'move.y+',
    KeyW: 'move.y-',
    MouseButton0: 'action.primary',
    MouseButton1: 'action.tertiary',
    MouseButton2: 'action.secondary',
    MouseWheelDown: 'action.scrollDown',
    MouseWheelUp: 'action.scrollUp',
    'MouseX-': 'aim.x-',
    'MouseX+': 'aim.x+',
    'MouseY-': 'aim.y-',
    'MouseY+': 'aim.y+',
    ShiftLeft: 'action.secondary',
    Space: 'action.primary',
    'Trigger Left': 'trigger.left',
    'Trigger Right': 'trigger.right',
});

const DEFAULT_PHYSICAL_AXIS_DIRECTION_MAP = Object.freeze({
    Axis0: Object.freeze({ negative: 'move.x-', positive: 'move.x+' }),
    Axis1: Object.freeze({ negative: 'move.y-', positive: 'move.y+' }),
    Axis2: Object.freeze({ negative: 'aim.x-', positive: 'aim.x+' }),
    Axis3: Object.freeze({ negative: 'aim.y-', positive: 'aim.y+' }),
    MouseX: Object.freeze({ negative: 'aim.x-', positive: 'aim.x+' }),
    MouseY: Object.freeze({ negative: 'aim.y-', positive: 'aim.y+' }),
});

const SYSTEM_DEFAULT_GAMEPAD_INPUTS = Object.freeze([
    'Button0',
    'Button1',
    'Button2',
    'Button3',
    'Button4',
    'Button5',
    'Button8',
    'Button9',
    'Button10',
    'Button11',
    'DPad Up',
    'DPad Down',
    'DPad Left',
    'DPad Right',
    'Trigger Left',
    'Trigger Right',
    'Axis0',
    'Axis1',
    'Axis2',
    'Axis3',
]);

const SYSTEM_DEFAULT_KEYBOARD_MOUSE_INPUTS = Object.freeze([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'Space',
    'ShiftLeft',
    'ControlLeft',
    'Enter',
    'Backspace',
    'KeyP',
    'MouseButton0',
    'MouseButton2',
    'MouseButton1',
    'MouseWheelUp',
    'MouseWheelDown',
    'MouseX-',
    'MouseX+',
    'MouseY-',
    'MouseY+',
]);

const DEFAULT_SENSITIVITY = 100;
const SENSITIVITY_MIN = 10;
const SENSITIVITY_MAX = 200;
const SENSITIVITY_STEP = 5;

export const SYSTEM_DEFAULT_GAMEPAD_PROFILE_NAME = 'System Default Gamepad';
export const SYSTEM_DEFAULT_KEYBOARD_MOUSE_PROFILE_NAME = 'System Default Keyboard/Mouse';

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

export function defaultNormalizedInputDirectionsForPhysicalInput(physicalInput) {
    const directions = DEFAULT_PHYSICAL_AXIS_DIRECTION_MAP[normalizeInputName(physicalInput)];
    return {
        negative: directions?.negative || '',
        positive: directions?.positive || '',
    };
}

export function systemDefaultInputMappings(deviceType = '') {
    const inputs = normalizeDeviceType(deviceType) === 'gamepad'
        ? SYSTEM_DEFAULT_GAMEPAD_INPUTS
        : SYSTEM_DEFAULT_KEYBOARD_MOUSE_INPUTS;
    return normalizeProfileInputMappings(inputs);
}

export function systemDefaultProfileForDevice(deviceType = '') {
    const isGamepad = normalizeDeviceType(deviceType) === 'gamepad';
    const profileName = isGamepad
        ? SYSTEM_DEFAULT_GAMEPAD_PROFILE_NAME
        : SYSTEM_DEFAULT_KEYBOARD_MOUSE_PROFILE_NAME;
    const deviceLabel = isGamepad ? 'Gamepad' : 'Keyboard/Mouse';
    const controllerId = isGamepad ? 'system-default-gamepad' : 'system-default-keyboard-mouse';
    const inputMappings = systemDefaultInputMappings(deviceLabel);
    return {
        controllerId,
        controllerName: profileName,
        deviceType: deviceLabel,
        id: controllerId,
        inputMappings,
        inputs: inputMappings.map((mapping) => mapping.physicalInput),
        mappingProfile: profileName,
        systemDefault: true,
    };
}

export function resolveNormalizedInputProfile({ device = null, profiles = [] } = {}) {
    const normalizedProfiles = Array.isArray(profiles) ? profiles : [];
    const deviceType = normalizeDeviceType(device?.deviceType);
    const exactProfile = normalizedProfiles.find((profile) =>
        normalizeDeviceType(profile?.deviceType) === deviceType &&
            normalizeInputName(profile?.controllerId) === normalizeInputName(device?.controllerId),
    );
    if (exactProfile) {
        return {
            lookupStep: 1,
            profile: exactProfile,
            status: 'Exact saved profile',
            statusDetail: 'user/player controller profile exact match',
        };
    }

    const keyboardMouseProfile = normalizedProfiles.find((profile) =>
        normalizeDeviceType(profile?.deviceType) === 'keyboard-mouse',
    );
    if (keyboardMouseProfile) {
        return {
            lookupStep: 2,
            profile: keyboardMouseProfile,
            status: 'Using saved Keyboard/Mouse Mapping',
            statusDetail: 'user/player keyboard/mouse profile',
        };
    }

    if (deviceType === 'gamepad') {
        return {
            lookupStep: 3,
            profile: systemDefaultProfileForDevice('Gamepad'),
            status: 'Using Default Gamepad Mapping',
            statusDetail: 'system default gamepad profile',
        };
    }

    if (deviceType === 'keyboard-mouse') {
        return {
            lookupStep: 4,
            profile: systemDefaultProfileForDevice('Keyboard/Mouse'),
            status: 'Using Default Keyboard/Mouse Mapping',
            statusDetail: 'system default keyboard/mouse profile',
        };
    }

    return {
        lookupStep: 5,
        profile: null,
        status: 'Missing Controller Profile',
        statusDetail: 'missing mapping warning',
    };
}

export function physicalInputIsAnalog(physicalInput) {
    return /^Axis\d+$/i.test(normalizeInputName(physicalInput))
        || normalizeInputName(physicalInput) === 'MouseX'
        || normalizeInputName(physicalInput) === 'MouseY';
}

export function physicalInputSensitivityDescriptor(physicalInput) {
    const inputName = normalizeInputName(physicalInput);
    const lowerName = inputName.toLowerCase();
    let label = '';
    if (inputName === 'MouseX' || inputName === 'MouseY' || /^Mouse[XY][+-]$/i.test(inputName)) {
        label = 'Mouse movement sensitivity';
    } else if (lowerName.includes('wheel')) {
        label = 'Mouse wheel sensitivity';
    } else if (lowerName.includes('trigger') || inputName === 'LT' || inputName === 'RT') {
        label = 'Trigger sensitivity';
    } else if (lowerName.includes('knob') || lowerName.includes('potentiometer')) {
        label = 'Potentiometer/analog knob sensitivity';
    } else if (/^Axis\d+$/i.test(inputName)) {
        label = 'Joystick/gamepad axis sensitivity';
    }
    if (!label) {
        return null;
    }
    return {
        defaultValue: DEFAULT_SENSITIVITY,
        label,
        max: SENSITIVITY_MAX,
        min: SENSITIVITY_MIN,
        step: SENSITIVITY_STEP,
        unit: '%',
    };
}

export function normalizedInputIsAnalog(inputId) {
    const kind = normalizedInputById(inputId)?.kind || '';
    return kind === 'axis' || kind === 'trigger';
}

export function normalizeProfileInputMapping(inputName, source = {}) {
    const physicalInput = normalizeInputName(source.physicalInput || source.input || inputName);
    const fallbackNormalizedInput = defaultNormalizedInputForPhysicalInput(physicalInput);
    const fallbackDirections = defaultNormalizedInputDirectionsForPhysicalInput(physicalInput);
    const deadzone = Number(source.deadzone);
    const sensitivityDescriptor = physicalInputSensitivityDescriptor(physicalInput);
    const sensitivity = Number(source.sensitivity);
    const negativeNormalizedInput = normalizeNormalizedInput(source.negativeNormalizedInput, fallbackDirections.negative);
    const positiveNormalizedInput = normalizeNormalizedInput(source.positiveNormalizedInput, fallbackDirections.positive);
    const normalizedInput = normalizeNormalizedInput(
        source.normalizedInput,
        positiveNormalizedInput || fallbackNormalizedInput || negativeNormalizedInput,
    );
    return {
        deadzone: Number.isFinite(deadzone) ? Math.max(0, Math.min(1, deadzone)) : 0.2,
        invert: Boolean(source.invert),
        negativeNormalizedInput,
        normalizedInput,
        physicalInput,
        positiveNormalizedInput,
        sensitivity: sensitivityDescriptor && Number.isFinite(sensitivity)
            ? Math.max(sensitivityDescriptor.min, Math.min(sensitivityDescriptor.max, sensitivity))
            : sensitivityDescriptor?.defaultValue,
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

export function resolvePhysicalAxisNormalizedInput(inputMapping = {}, axisValue = 0) {
    const deadzone = Number.isFinite(Number(inputMapping.deadzone))
        ? Math.max(0, Math.min(1, Number(inputMapping.deadzone)))
        : 0.2;
    const value = Number(axisValue) || 0;
    if (Math.abs(value) < deadzone) {
        return '';
    }
    const resolvedValue = inputMapping.invert ? -value : value;
    const directionInput = resolvedValue < 0
        ? inputMapping.negativeNormalizedInput
        : inputMapping.positiveNormalizedInput;
    return normalizeNormalizedInput(directionInput);
}

function normalizeDeviceType(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (normalized === 'keyboard' || normalized === 'mouse' || normalized === 'keyboard-mouse') {
        return 'keyboard-mouse';
    }
    if (normalized === 'gamepad' || normalized === 'game-controller' || normalized === 'controller') {
        return 'gamepad';
    }
    return normalized;
}
