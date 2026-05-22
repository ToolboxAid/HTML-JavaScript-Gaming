/*
Toolbox Aid
David Quesenberry
05/22/2026
InputCapabilityDescriptors.js
*/

const DEVICE_DEFINITIONS = Object.freeze([
    {
        id: 'keyboard',
        label: 'Keyboard',
        engine: 'InputService + KeyboardState',
        supported: true,
        defaultEnabled: true,
        detail: 'Keyboard key states are captured from browser keydown and keyup events.'
    },
    {
        id: 'mouse',
        label: 'Mouse',
        engine: 'InputService + MouseState + PointerDragState',
        supported: true,
        defaultEnabled: true,
        detail: 'Mouse buttons, movement, and drag state are captured from browser mouse and pointer events.'
    },
    {
        id: 'gameController',
        label: 'Game Controller',
        engine: 'InputService + GamepadState + GamepadInputAdapter',
        supported: true,
        defaultEnabled: true,
        detail: 'Browser Gamepad API devices are auto-polled while the tool is active.'
    },
    {
        id: 'touch',
        label: 'Touch',
        engine: 'PointerEvent capability descriptor',
        supported: true,
        defaultEnabled: false,
        detail: 'Touch support depends on browser PointerEvent input. This tool exposes capability status only until touch capture is testable here.'
    },
    {
        id: 'pen',
        label: 'Pen',
        engine: 'PointerEvent capability descriptor',
        supported: true,
        defaultEnabled: false,
        detail: 'Pen support depends on browser PointerEvent input. This tool exposes capability status only until pen capture is testable here.'
    },
    {
        id: 'wheel',
        label: 'Wheel',
        engine: 'InputService wheel descriptor',
        supported: true,
        defaultEnabled: true,
        detail: 'Mouse wheel directions can be captured directly or as combo inputs.'
    },
    {
        id: 'flightStick',
        label: 'Flight Stick',
        engine: 'GamepadInputAdapter capability descriptor',
        supported: true,
        defaultEnabled: false,
        detail: 'Flight sticks are represented through the Gamepad API when the browser exposes them.'
    },
    {
        id: 'vrController',
        label: 'VR Controller',
        engine: 'WebXR capability descriptor',
        supported: false,
        defaultEnabled: false,
        detail: 'VR controller capture requires WebXR input sources and is not available in this tool context.'
    }
]);

const GESTURE_DEFINITIONS = Object.freeze([
    keyboardGesture('KeyboardPress', 'Press', 'Keyboard key press', 'keyboard'),
    keyboardGesture('KeyboardRelease', 'Release', 'Keyboard key release', 'keyboard'),
    keyboardGesture('KeyboardHold', 'Hold', 'Keyboard key hold', 'keyboard'),
    comboGesture('KeyboardCombo', 'Keyboard', ['keyboard']),
    mouseGesture('MouseClick', 'Click', 'Mouse click', 'mouse'),
    mouseGesture('MouseDoubleClick', 'Double Click', 'Mouse double click', 'mouse'),
    pointerGesture('MousePrimaryDrag', 'Drag', 'Mouse drag', 'mouse'),
    pointerGesture('MousePrimaryDragRelease', 'Drag Release', 'Mouse drag release', 'mouse'),
    pointerGesture('MousePrimaryDragRectangle', 'Drag Rectangle', 'Mouse drag rectangle', 'mouse'),
    wheelGesture('MouseWheelUp', 'Wheel Up', 'Mouse wheel up', ['mouse', 'wheel']),
    wheelGesture('MouseWheelDown', 'Wheel Down', 'Mouse wheel down', ['mouse', 'wheel']),
    wheelGesture('MouseWheelLeft', 'Wheel Left', 'Mouse wheel left', ['mouse', 'wheel']),
    wheelGesture('MouseWheelRight', 'Wheel Right', 'Mouse wheel right', ['mouse', 'wheel']),
    comboGesture('MouseCombo', 'Mouse', ['mouse']),
    gameControllerGesture('GameControllerButton', 'Button', 'Game controller button', 'gameController'),
    gameControllerGesture('GameControllerTrigger', 'Trigger', 'Game controller trigger', 'gameController'),
    gameControllerGesture('GameControllerStick', 'Stick', 'Game controller stick', 'gameController'),
    gameControllerGesture('GameControllerDPad', 'DPad', 'Game controller DPad', 'gameController'),
    comboGesture('GameControllerCombo', 'Game Controller', ['gameController'])
]);

export function inputDeviceCapabilities({
    gamepadCount = 0,
    gamepadWarning = '',
    pointerEventsAvailable = false,
    touchAvailable = false,
    penAvailable = false,
    wheelAvailable = true,
    webXrAvailable = false
} = {}) {
    return DEVICE_DEFINITIONS.map((device) => {
        if (device.id === 'gameController') {
            return {
                ...device,
                available: !gamepadWarning,
                detail: gamepadWarning || `${gamepadCount} connected game controller${gamepadCount === 1 ? '' : 's'} detected.`,
                emptyState: gamepadCount
                    ? ''
                    : 'No game controllers are currently exposed. Click inside this page, press a controller button, and wait for auto-polling.'
            };
        }
        if (device.id === 'touch') {
            return {
                ...device,
                available: pointerEventsAvailable && touchAvailable,
                emptyState: pointerEventsAvailable
                    ? 'Touch capability is exposed only when the browser reports a touch pointer.'
                    : 'Touch capture requires browser PointerEvent support.'
            };
        }
        if (device.id === 'pen') {
            return {
                ...device,
                available: pointerEventsAvailable && penAvailable,
                emptyState: pointerEventsAvailable
                    ? 'Pen capability is exposed only when the browser reports a pen pointer.'
                    : 'Pen capture requires browser PointerEvent support.'
            };
        }
        if (device.id === 'wheel') {
            return {
                ...device,
                available: wheelAvailable,
                emptyState: wheelAvailable ? '' : 'Wheel input requires browser wheel event support.'
            };
        }
        if (device.id === 'flightStick') {
            return {
                ...device,
                available: !gamepadWarning,
                detail: gamepadWarning || device.detail,
                emptyState: gamepadCount
                    ? 'Use the game controller capture buttons for browser-exposed flight stick inputs.'
                    : 'No browser-exposed flight stick is currently visible through the Gamepad API.'
            };
        }
        if (device.id === 'vrController') {
            return {
                ...device,
                available: webXrAvailable,
                emptyState: webXrAvailable
                    ? 'WebXR is present, but this tool does not open an XR session for capture.'
                    : device.detail
            };
        }
        return {
            ...device,
            available: true,
            emptyState: ''
        };
    });
}

export function inputGestureDescriptors({ enabledDeviceIds = [] } = {}) {
    const enabled = new Set(enabledDeviceIds);
    return GESTURE_DEFINITIONS.filter((gesture) => (
        gesture.requiredDeviceIds.every((deviceId) => enabled.has(deviceId))
    )).map((gesture) => ({ ...gesture }));
}

export function getInputGestureDescriptor(binding, options = {}) {
    return inputGestureDescriptors(options).find((gesture) => gesture.binding === binding) ?? null;
}

export function mouseButtonLabel(button) {
    const buttonNumber = Number(button);
    if (buttonNumber === 0) {
        return 'Mouse Left Button';
    }
    if (buttonNumber === 1) {
        return 'Mouse Middle Button';
    }
    if (buttonNumber === 2) {
        return 'Mouse Right Button';
    }
    if (buttonNumber === 3) {
        return 'Mouse Button 4';
    }
    if (buttonNumber === 4) {
        return 'Mouse Button 5';
    }
    return `Mouse Button ${buttonNumber + 1}`;
}

export function wheelDescriptorFromEvent(event = {}) {
    const deltaX = Number(event.deltaX) || 0;
    const deltaY = Number(event.deltaY) || 0;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX < 0
            ? wheelInputDescriptor('MouseWheelLeft', 'Wheel Left')
            : wheelInputDescriptor('MouseWheelRight', 'Wheel Right');
    }
    return deltaY < 0
        ? wheelInputDescriptor('MouseWheelUp', 'Wheel Up')
        : wheelInputDescriptor('MouseWheelDown', 'Wheel Down');
}

export function wheelInputDescriptor(binding, detail) {
    return {
        source: 'mouse',
        binding,
        displayLabelLines: ['Mouse', detail],
        label: `Mouse ${detail}`,
        title: `Mouse\n${detail}`,
        engine: 'InputService Wheel'
    };
}

function keyboardGesture(binding, label, title, deviceId) {
    return patternGesture({ binding, deviceLabel: 'Keyboard', label, title, deviceId });
}

function mouseGesture(binding, label, title, deviceId) {
    return patternGesture({ binding, deviceLabel: 'Mouse', label, title, deviceId });
}

function gameControllerGesture(binding, label, title, deviceId) {
    return patternGesture({ binding, deviceLabel: 'Game Controller', label, title, deviceId });
}

function pointerGesture(binding, label, title, deviceId) {
    return {
        ...patternGesture({ binding, deviceLabel: 'Mouse', label, title, deviceId }),
        captureKind: 'pointer-drag',
        source: 'mouse'
    };
}

function wheelGesture(binding, label, title, requiredDeviceIds) {
    return {
        binding,
        captureKind: 'wheel',
        deviceLabel: 'Mouse',
        displayLabelLines: ['Mouse', label],
        engine: 'InputService Wheel',
        label,
        requiredDeviceIds,
        source: 'mouse',
        title
    };
}

function comboGesture(binding, deviceLabel, requiredDeviceIds) {
    return {
        binding,
        captureKind: 'combo',
        deviceLabel,
        displayLabelLines: [deviceLabel, 'Combo'],
        engine: 'InputService Combo',
        label: 'Combo',
        requiredDeviceIds,
        source: requiredDeviceIds[0] === 'gameController' ? 'gamepad' : requiredDeviceIds[0],
        title: `${deviceLabel} combo`
    };
}

function patternGesture({ binding, deviceLabel, label, title, deviceId }) {
    return {
        binding,
        captureKind: 'descriptor',
        deviceLabel,
        displayLabelLines: [deviceLabel, label],
        engine: 'InputService Capability',
        label,
        requiredDeviceIds: [deviceId],
        source: deviceId === 'gameController' ? 'gamepad' : deviceId,
        title
    };
}
