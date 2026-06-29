/*
Toolbox Aid
David Quesenberry
05/24/2026
InputMappingManifest.js
*/
import InputMap from './InputMap.js';

const GESTURE_SUFFIXES = new Set([
    'KeyboardHold',
    'KeyboardRelease',
    'MouseClick',
    'MouseDoubleClick',
    'MousePrimaryDrag',
    'MousePrimaryDragRelease',
    'MouseWheelUp',
    'MouseWheelDown',
    'MouseWheelLeft',
    'MouseWheelRight',
    'GameControllerButton',
    'GameControllerButtonPress',
    'GameControllerButtonHold',
    'GameControllerButtonRelease',
    'GameControllerDPad',
    'GameControllerStick',
    'GameControllerTrigger'
]);

export function mappedInputActionsFromPayload(payload) {
    if (!Array.isArray(payload?.actions)) {
        return [];
    }
    return payload.actions
        .filter((action) => (
            typeof action?.action === 'string'
            && action.action.trim()
            && Array.isArray(action.inputs)
            && action.inputs.some((input) => typeof input?.binding === 'string' && input.binding.trim())
        ))
        .map((action) => ({
            action: action.action.trim(),
            label: String(action.label || action.action).trim(),
            inputs: action.inputs
                .filter((input) => typeof input?.binding === 'string' && input.binding.trim())
                .map((input) => ({ ...input, binding: input.binding.trim() }))
        }));
}

export function mappedInputActionsFromManifest(manifest) {
    return mappedInputActionsFromPayload(manifest?.tools?.['input-mapping-v2']);
}

export function inputMappingGestureSuffix(binding) {
    const parts = String(binding || '').split(':');
    const suffix = parts.at(-1) || '';
    return GESTURE_SUFFIXES.has(suffix) ? suffix : '';
}

export function runtimeBindingFromInputMappingBinding(binding) {
    const value = String(binding || '').trim();
    const suffix = inputMappingGestureSuffix(value);
    if (!suffix) {
        return value;
    }
    return value.split(':').slice(0, -1).join(':');
}

export function actionBindingsFromInputMappingPayload(payload) {
    return Object.fromEntries(mappedInputActionsFromPayload(payload).map((action) => [
        action.action,
        action.inputs
            .map((input) => runtimeBindingFromInputMappingBinding(input.binding))
            .filter(Boolean)
    ]));
}

export function actionBindingsFromManifest(manifest) {
    return actionBindingsFromInputMappingPayload(manifest?.tools?.['input-mapping-v2']);
}

export function inputMapFromInputMappingPayload(payload, { InputMapClass = InputMap } = {}) {
    return new InputMapClass(actionBindingsFromInputMappingPayload(payload));
}

export function inputMapFromManifest(manifest, options = {}) {
    return inputMapFromInputMappingPayload(manifest?.tools?.['input-mapping-v2'], options);
}
