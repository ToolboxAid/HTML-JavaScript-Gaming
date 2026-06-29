/*
Toolbox Aid
David Quesenberry
05/23/2026
InputCaptureService.js
*/
import { mouseButtonLabel } from './InputCapabilityDescriptors.js';

export default class InputCaptureService {
    constructor({ inputService }) {
        this.inputService = inputService;
    }

    captureKeyboard(event, gesture = null) {
        const binding = event.code || event.key;
        const detail = keyboardGestureDetail(gesture);
        const isDefaultGesture = !gesture || gesture.binding === 'KeyboardPress';
        return {
            source: 'keyboard',
            binding: gestureBinding(binding, gesture, 'KeyboardPress'),
            displayLabelLines: ['Keyboard', binding, detail],
            label: `Keyboard ${binding}${isDefaultGesture ? '' : ` ${detail}`}`,
            title: isDefaultGesture ? `Keyboard\n${binding}` : `Keyboard\n${binding}\n${detail}`,
            engine: 'KeyboardState'
        };
    }

    captureMouse(event, gesture = null) {
        const button = Number(event.button ?? 0);
        const buttonLabel = mouseButtonLabel(button);
        const detail = mouseGestureDetail(gesture);
        const isDefaultGesture = !gesture || gesture.binding === 'MouseClick';
        return {
            source: 'mouse',
            binding: gestureBinding(`MouseButton${button}`, gesture, 'MouseClick'),
            displayLabelLines: ['Mouse', buttonLabel.replace(/^Mouse\s+/, ''), detail],
            label: `${buttonLabel}${isDefaultGesture ? '' : ` ${detail}`}`,
            title: isDefaultGesture ? `Mouse\n${buttonLabel}` : `Mouse\n${buttonLabel}\n${detail}`,
            engine: 'MouseState'
        };
    }

    captureWheel(event) {
        return this.inputService.captureWheelDescriptor(event);
    }

    captureGesture(binding, gestureOptions) {
        const gesture = this.inputService.getInputGestureDescriptor(binding, gestureOptions);
        if (!gesture) {
            return {
                ok: false,
                message: `Gesture capture unavailable: ${binding} is not visible for the enabled devices.`
            };
        }
        if (gesture.captureKind === 'combo') {
            return {
                ok: true,
                combo: true,
                message: `${gesture.deviceLabel} combo capture armed.`
            };
        }
        if (gesture.captureKind === 'pointer-drag') {
            return this.capturePointerDrag(binding);
        }
        if (gesture.captureKind === 'wheel') {
            return this.captureWheelGesture(binding);
        }
        return {
            ok: false,
            message: `${gesture.deviceLabel} ${gesture.label} is a capability descriptor. Use live Capture controls when browser events are required.`
        };
    }

    capturePointerDrag(binding) {
        const descriptor = this.inputService.getPointerDragDescriptor(binding);
        if (!descriptor) {
            return {
                ok: false,
                message: `Pointer drag capture unavailable: ${binding} is not a known pointer drag gesture.`
            };
        }
        return {
            ok: true,
            input: {
                source: descriptor.source,
                binding: descriptor.binding,
                displayLabelLines: pointerDragLabelLines(descriptor),
                label: descriptor.label,
                title: pointerDragTitle(descriptor),
                engine: descriptor.engine,
                pointerDrag: descriptor.snapshot
            }
        };
    }

    capturePointerDragSnapshot(binding, snapshot) {
        const descriptor = this.inputService.getPointerDragDescriptor(binding);
        if (!descriptor) {
            return {
                ok: false,
                message: `Pointer drag capture unavailable: ${binding} is not a known pointer drag gesture.`
            };
        }
        const inputDescriptor = {
            ...descriptor,
            snapshot
        };
        const button = Number(snapshot?.button ?? 0);
        return {
            ok: true,
            input: {
                source: inputDescriptor.source,
                binding: `MouseButton${button}:${inputDescriptor.binding}`,
                displayLabelLines: pointerDragLabelLines(inputDescriptor),
                label: `${mouseButtonLabel(button)} ${inputDescriptor.displayLabelLines?.[1] || inputDescriptor.label}`,
                title: pointerDragTitle(inputDescriptor),
                engine: inputDescriptor.engine,
                pointerDrag: snapshot
            }
        };
    }

    captureWheelGesture(binding) {
        const descriptor = this.inputService.getWheelDescriptor(binding);
        if (!descriptor) {
            return {
                ok: false,
                message: `Wheel capture unavailable: ${binding} is not a known wheel gesture.`
            };
        }
        return {
            ok: true,
            input: descriptor
        };
    }
}

function pointerDragTitle(descriptor) {
    const bounds = descriptor.snapshot?.dragBounds;
    if (!bounds) {
        return descriptor.title;
    }
    return [
        descriptor.title,
        `Bounds: x ${bounds.x}, y ${bounds.y}, width ${bounds.width}, height ${bounds.height}`
    ].join('\n');
}

function pointerDragLabelLines(descriptor) {
    const gestureLabel = descriptor.displayLabelLines?.[1] || descriptor.label.replace(/^Mouse\s+/, '');
    return [mouseButtonLabel(descriptor.snapshot?.button ?? 0), gestureLabel];
}

function keyboardGestureDetail(gesture) {
    if (gesture?.binding === 'KeyboardRelease') {
        return 'Release';
    }
    if (gesture?.binding === 'KeyboardHold') {
        return 'Hold';
    }
    return 'Press';
}

function mouseGestureDetail(gesture) {
    if (gesture?.binding === 'MouseDoubleClick') {
        return 'Double Click';
    }
    return 'Click';
}

function gestureBinding(controlBinding, gesture, defaultGestureBinding) {
    if (!gesture || gesture.binding === defaultGestureBinding) {
        return controlBinding;
    }
    return `${controlBinding}:${gesture.binding}`;
}
