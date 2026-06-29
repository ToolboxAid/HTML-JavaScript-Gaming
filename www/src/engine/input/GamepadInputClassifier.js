/*
Toolbox Aid
David Quesenberry
05/23/2026
GamepadInputClassifier.js
*/
const GAMEPAD_AXIS_THRESHOLD = 0.35;
export const GAMEPAD_CAPTURE_WAITING_MESSAGE = 'No live button or axis value is active yet.';

const STANDARD_GAMEPAD_BUTTON_NAMES = Object.freeze([
    'A',
    'B',
    'X',
    'Y',
    'LB',
    'RB',
    'LT',
    'RT',
    'Back',
    'Start',
    'L3',
    'R3',
    'DPad Up',
    'DPad Down',
    'DPad Left',
    'DPad Right'
]);

const GAMEPAD_BUTTON_STATE_GESTURES = new Set([
    'GameControllerButtonPress',
    'GameControllerButtonHold',
    'GameControllerButtonRelease'
]);

export function captureGamepadInput({ gamepadIndex, gesture = null, pad }) {
    const selectedIndex = Number(gamepadIndex);
    if (!Number.isInteger(selectedIndex)) {
        return {
            ok: false,
            message: 'Gamepad capture unavailable: choose a detected gamepad device before capturing.'
        };
    }
    const deviceInfo = gamepadDeviceInfo(pad);
    if (!pad?.connected) {
        return {
            ok: false,
            message: `Gamepad capture unavailable: ${deviceInfo.statusLabel} is no longer visible to the browser. Click inside this page, press a controller button, and try again.`
        };
    }
    const candidates = activeGamepadCandidates(pad, deviceInfo, gesture);
    const expectation = gamepadGestureExpectation(gesture);
    if (expectation.kind) {
        const match = candidates.find((candidate) => gamepadCandidateMatches(candidate, expectation));
        if (match) {
            return createGamepadCaptureResult(match, deviceInfo, gesture);
        }
        if (expectation.state && candidates.some((candidate) => candidate.kind === expectation.kind)) {
            return {
                ok: false,
                message: gamepadGestureWaitingMessage(gesture, deviceInfo),
                waiting: true
            };
        }
        if (candidates.length) {
            return {
                ok: false,
                invalid: true,
                message: gamepadGestureMismatchMessage(gesture, candidates[0])
            };
        }
    } else if (candidates.length) {
        return createGamepadCaptureResult(candidates[0], deviceInfo, gesture);
    }
    return {
        ok: false,
        message: `${GAMEPAD_CAPTURE_WAITING_MESSAGE} Hold a button or move a stick on ${deviceInfo.statusLabel}.`,
        waiting: true
    };
}

export function createGamepadCaptureResult(candidate, deviceInfo, gesture) {
    const detail = gamepadGestureDetail(gesture, candidate.defaultDetail);
    const isButtonStateGesture = GAMEPAD_BUTTON_STATE_GESTURES.has(gesture?.binding);
    const isDefaultGesture = !isButtonStateGesture && (!gesture || gesture.binding === candidate.defaultGestureBinding);
    return {
        ok: true,
        input: {
            source: 'gamepad',
            binding: isDefaultGesture ? candidate.binding : gestureBinding(candidate.binding, gesture, ''),
            displayLabelLines: ['Game Controller', candidate.label, detail],
            label: `Game Controller ${candidate.label}${isDefaultGesture ? '' : ` ${detail}`}`,
            title: gamepadInputTitle(deviceInfo, isDefaultGesture ? candidate.label : `${candidate.label}\n${detail}`),
            engine: 'GamepadInputAdapter'
        }
    };
}

export function formatGamepadDeviceLabel(gamepad) {
    return gamepadDeviceInfo(gamepad).statusLabel;
}

export function gamepadDeviceInfo(gamepad) {
    const index = Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0;
    const id = normalizeWhitespace(gamepad?.id || '');
    const mapping = normalizeWhitespace(gamepad?.mapping || '');
    const usbIds = parseUsbIds(id);
    const displayName = gamepadDisplayName(id, usbIds);
    const vendorProductLine = vendorProductText(usbIds);
    const detailName = detailDeviceName(displayName, id, usbIds);
    return {
        captureLines: captureLines({ vendorProductLine }),
        detailName,
        displayName,
        id,
        index,
        label: `${displayName} (Gamepad ${index})`,
        mapping,
        statusLabel: `${displayName} (Gamepad ${index})`,
        vendor: usbIds.vendor,
        vendorProductLine,
        product: usbIds.product
    };
}

export function activeGamepadBindings(gamepad) {
    const index = Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0;
    const buttonBindings = (gamepad?.buttonsDown ?? []).flatMap((isDown, buttonIndex) => (
        isDown ? gamepadButtonBindingVariants(index, buttonIndex) : []
    ));
    const buttonReleaseBindings = (gamepad?.buttonsReleased ?? []).flatMap((isReleased, buttonIndex) => (
        isReleased ? [`Pad${index}:Button${buttonIndex}:GameControllerButtonRelease`] : []
    ));
    const axisBindings = (gamepad?.axes ?? []).flatMap((axis, axisIndex) => {
        const value = Number(axis) || 0;
        if (Math.abs(value) < GAMEPAD_AXIS_THRESHOLD) {
            return [];
        }
        return gamepadAxisBindingVariants(index, axisIndex, value < 0 ? '-' : '+');
    });
    return [...buttonBindings, ...buttonReleaseBindings, ...axisBindings];
}

export function gamepadProfileInputNames(gamepad) {
    const deviceInfo = gamepadDeviceInfo(gamepad);
    const buttonCount = Math.max(
        gamepad?.buttonsDown?.length ?? 0,
        gamepad?.buttons?.length ?? 0
    );
    const buttonNames = Array.from({ length: buttonCount }).map((_, buttonIndex) =>
        gamepadProfileButtonLabel(deviceInfo, buttonIndex)
    );
    const axisNames = (gamepad?.axes ?? []).map((_, axisIndex) => `Axis${axisIndex}`);
    return [...buttonNames, ...axisNames];
}

export function activeGamepadProfileInputNames(gamepad) {
    return [...new Set(activeGamepadBindings(gamepad)
        .map((binding) => gamepadProfileInputNameFromBinding(binding, gamepad))
        .filter(Boolean))];
}

export function gamepadProfileInputNameFromBinding(binding, gamepad = {}) {
    const match = /^Pad\d+:(Button|Axis)(\d+)/.exec(String(binding || ''));
    if (!match) {
        return '';
    }
    if (match[1] === 'Axis') {
        return `Axis${Number(match[2])}`;
    }
    return gamepadProfileButtonLabel(gamepadDeviceInfo(gamepad), Number(match[2]));
}

function captureLines({ vendorProductLine }) {
    return ['Capture Game', vendorProductLine].filter(Boolean);
}

function detailDeviceName(displayName, id, usbIds) {
    if (!usbIds.vendor && !usbIds.product && !/\busb\b/i.test(id)) {
        return displayName;
    }
    return /\busb\b/i.test(displayName) ? displayName : `${displayName} USB`;
}

function gamepadDisplayName(id, usbIds) {
    const withoutUsbDetails = id
        .replace(/\(?\s*Vendor:\s*[0-9a-f]+\s+Product:\s*[0-9a-f]+\s*\)?/gi, ' ')
        .replace(/\(?\s*Product:\s*[0-9a-f]+\s+Vendor:\s*[0-9a-f]+\s*\)?/gi, ' ');
    const withoutNumericPrefix = usbIds.vendor && usbIds.product
        ? withoutUsbDetails.replace(new RegExp(`\\b${usbIds.vendor}\\b[-_\\s:]*\\b${usbIds.product}\\b[-_\\s:]*`, 'i'), ' ')
        : withoutUsbDetails;
    const withoutTransportSuffix = normalizeGamepadName(withoutNumericPrefix)
        .replace(/\s+USB$/i, '');
    if (!withoutTransportSuffix || isGenericGamepadName(withoutTransportSuffix)) {
        return 'USB gamepad';
    }
    return withoutTransportSuffix;
}

function gamepadInputTitle(deviceInfo, inputLabel) {
    return [
        deviceInfo.detailName,
        deviceInfo.mapping ? `${deviceInfo.mapping.toUpperCase()} GAMEPAD` : 'GAMEPAD',
        deviceInfo.vendorProductLine,
        inputLabel
    ].filter(Boolean).join('\n');
}

function activeGamepadCandidates(pad, deviceInfo, gesture) {
    const index = Number.isInteger(Number(pad?.index)) ? Number(pad.index) : 0;
    const buttonCount = Math.max(
        pad.buttonsDown?.length ?? 0,
        pad.buttonsPressed?.length ?? 0,
        pad.buttonsReleased?.length ?? 0
    );
    const buttonCandidates = Array.from({ length: buttonCount }).flatMap((_, buttonIndex) => {
        const buttonLabel = gamepadButtonLabel(deviceInfo, buttonIndex);
        const kind = gamepadButtonKind(deviceInfo, buttonIndex);
        const defaultDetail = kind === 'trigger' ? 'Trigger' : kind === 'dpad' ? 'DPad' : 'Button';
        const defaultGestureBinding = kind === 'trigger' ? 'GameControllerTrigger' : kind === 'dpad' ? 'GameControllerDPad' : 'GameControllerButton';
        const candidates = [];
        if (pad.buttonsDown?.[buttonIndex]) {
            candidates.push({
                binding: `Pad${index}:Button${buttonIndex}`,
                defaultDetail,
                defaultGestureBinding,
                kind,
                label: buttonLabel,
                state: 'hold'
            });
        }
        if (kind === 'button' && pad.buttonsPressed?.[buttonIndex]) {
            candidates.push({
                binding: `Pad${index}:Button${buttonIndex}`,
                defaultDetail: 'Btn Press',
                defaultGestureBinding: 'GameControllerButtonPress',
                kind,
                label: buttonLabel,
                state: 'press'
            });
        }
        if (kind === 'button' && pad.buttonsReleased?.[buttonIndex]) {
            candidates.push({
                binding: `Pad${index}:Button${buttonIndex}`,
                defaultDetail: 'Btn Release',
                defaultGestureBinding: 'GameControllerButtonRelease',
                kind,
                label: buttonLabel,
                state: 'release'
            });
        }
        if (kind === 'button' && pad.buttonsDown?.[buttonIndex]) {
            candidates.push({
                binding: `Pad${index}:Button${buttonIndex}`,
                defaultDetail: 'Btn Hold',
                defaultGestureBinding: 'GameControllerButtonHold',
                kind,
                label: buttonLabel,
                state: 'hold'
            });
        }
        return candidates;
    });
    const axisCandidates = (pad.axes ?? []).flatMap((axis, axisIndex) => {
        const value = Number(axis) || 0;
        if (Math.abs(value) < GAMEPAD_AXIS_THRESHOLD) {
            return [];
        }
        const direction = value < 0 ? '-' : '+';
        const kind = gesture?.binding === 'GameControllerTrigger' ? 'trigger' : 'stick';
        return [{
            binding: `Pad${index}:Axis${axisIndex}${direction}`,
            defaultDetail: kind === 'trigger' ? 'Trigger' : 'Stick',
            defaultGestureBinding: kind === 'trigger' ? 'GameControllerTrigger' : 'GameControllerStick',
            kind,
            label: `Axis ${axisIndex}${direction}`,
            state: 'hold'
        }];
    });
    return [...buttonCandidates, ...axisCandidates];
}

function gamepadGestureExpectation(gesture) {
    const expectations = {
        GameControllerButton: { kind: 'button' },
        GameControllerButtonPress: { kind: 'button', state: 'press' },
        GameControllerButtonHold: { kind: 'button', state: 'hold' },
        GameControllerButtonRelease: { kind: 'button', state: 'release' },
        GameControllerDPad: { kind: 'dpad' },
        GameControllerStick: { kind: 'stick' },
        GameControllerTrigger: { kind: 'trigger' }
    };
    return expectations[gesture?.binding] ?? { kind: '' };
}

function gamepadCandidateMatches(candidate, expectation) {
    return candidate.kind === expectation.kind
        && (!expectation.state || candidate.state === expectation.state);
}

function gamepadButtonKind(deviceInfo, buttonIndex) {
    if (deviceInfo.mapping === 'standard' && (buttonIndex === 6 || buttonIndex === 7)) {
        return 'trigger';
    }
    if (deviceInfo.mapping === 'standard' && buttonIndex >= 12 && buttonIndex <= 15) {
        return 'dpad';
    }
    return 'button';
}

function gamepadGestureMismatchMessage(gesture, candidate) {
    const expected = gamepadExpectationLabel(gamepadGestureExpectation(gesture));
    const actual = gamepadKindLabel(candidate.kind);
    return `Game Controller ${gesture.label} capture expects ${expected} input; ${candidate.label} is ${actual} input. Select the matching gesture or press a matching control.`;
}

function gamepadGestureWaitingMessage(gesture, deviceInfo) {
    return `Game Controller ${gesture.label} capture is waiting for ${gamepadExpectationLabel(gamepadGestureExpectation(gesture))} input on ${deviceInfo.statusLabel}.`;
}

function gamepadExpectationLabel(expectation) {
    if (expectation.state === 'press') {
        return 'button press';
    }
    if (expectation.state === 'hold') {
        return 'button hold';
    }
    if (expectation.state === 'release') {
        return 'button release';
    }
    return gamepadKindLabel(expectation.kind);
}

function gamepadKindLabel(kind) {
    const labels = {
        button: 'button',
        dpad: 'DPad',
        stick: 'stick/axis',
        trigger: 'trigger'
    };
    return labels[kind] ?? 'game controller';
}

function gamepadButtonBindingVariants(gamepadIndex, buttonIndex) {
    const binding = `Pad${gamepadIndex}:Button${buttonIndex}`;
    return [
        binding,
        `${binding}:GameControllerButton`,
        `${binding}:GameControllerButtonPress`,
        `${binding}:GameControllerButtonHold`,
        `${binding}:GameControllerDPad`,
        `${binding}:GameControllerTrigger`
    ];
}

function gamepadAxisBindingVariants(gamepadIndex, axisIndex, direction) {
    const binding = `Pad${gamepadIndex}:Axis${axisIndex}${direction}`;
    return [
        binding,
        `${binding}:GameControllerStick`,
        `${binding}:GameControllerTrigger`
    ];
}

function gamepadButtonLabel(deviceInfo, buttonIndex) {
    if (deviceInfo.mapping === 'standard' && STANDARD_GAMEPAD_BUTTON_NAMES[buttonIndex]) {
        return STANDARD_GAMEPAD_BUTTON_NAMES[buttonIndex];
    }
    return `Button ${buttonIndex}`;
}

function gamepadProfileButtonLabel(deviceInfo, buttonIndex) {
    if (buttonIndex === 6) {
        return 'Trigger Left';
    }
    if (buttonIndex === 7) {
        return 'Trigger Right';
    }
    if (buttonIndex >= 12 && buttonIndex <= 15) {
        return STANDARD_GAMEPAD_BUTTON_NAMES[buttonIndex];
    }
    return `Button${buttonIndex}`;
}

function gamepadGestureDetail(gesture, defaultDetail) {
    const details = {
        GameControllerButton: 'Button',
        GameControllerButtonPress: 'Btn Press',
        GameControllerButtonHold: 'Btn Hold',
        GameControllerButtonRelease: 'Btn Release',
        GameControllerDPad: 'DPad',
        GameControllerStick: 'Stick',
        GameControllerTrigger: 'Trigger'
    };
    return details[gesture?.binding] ?? defaultDetail;
}

function gestureBinding(controlBinding, gesture, defaultGestureBinding) {
    if (!gesture || gesture.binding === defaultGestureBinding) {
        return controlBinding;
    }
    return `${controlBinding}:${gesture.binding}`;
}

function parseUsbIds(id) {
    const vendor = id.match(/Vendor:\s*([0-9a-f]{4})/i)?.[1]
        ?? id.match(/\b([0-9a-f]{4})[-_:\s]+([0-9a-f]{4})\b/i)?.[1]
        ?? '';
    const product = id.match(/Product:\s*([0-9a-f]{4})/i)?.[1]
        ?? id.match(/\b([0-9a-f]{4})[-_:\s]+([0-9a-f]{4})\b/i)?.[2]
        ?? '';
    return {
        vendor: vendor.toLowerCase(),
        product: product.toLowerCase()
    };
}

function normalizeGamepadName(value) {
    return normalizeWhitespace(value)
        .replace(/^[\s:;,.()_-]+|[\s:;,.()_-]+$/g, '')
        .replace(/\(\s*\)/g, '')
        .replace(/\s+\)/g, ')')
        .replace(/\(\s+/g, '(')
        .trim();
}

function normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function isGenericGamepadName(name) {
    return /^(?:generic\s+)?usb\s+gamepad$/i.test(name) || /^gamepad$/i.test(name);
}

function vendorProductText({ vendor, product }) {
    if (vendor && product) {
        return `Vendor: ${vendor} Product: ${product}`;
    }
    if (vendor) {
        return `Vendor: ${vendor}`;
    }
    if (product) {
        return `Product: ${product}`;
    }
    return '';
}
