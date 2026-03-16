// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// gamepadMapperTest.js

import GamepadMapper from '../../../../engine/input/controller/gamepadMapper.js';
import { D_PAD_AXIS_NAMES, D_PAD_BUTTON_NAMES, DPadType, GAMEPAD_BUTTON_NAMES } from '../../../../engine/input/controller/gamepadEnums.js';

export function testGamepadMapper(assert) {
    const defaultMapper = new GamepadMapper(0, 'unknown controller');
    assert(defaultMapper.getButtonIndex(GAMEPAD_BUTTON_NAMES.primary) === 0, 'GamepadMapper should fall back to default button mapping');
    assert(defaultMapper.getAxisIndex('LeftStickX') === 0, 'GamepadMapper should fall back to default axis mapping');
    assert(defaultMapper.getDPadType() === DPadType.NONE, 'GamepadMapper default mapping should not report a d-pad');

    const axisMapper = new GamepadMapper(0, 'USB gamepad (Vendor: 081f Product: e401)');
    assert(axisMapper.getButtonIndex(GAMEPAD_BUTTON_NAMES.primary) === 1, 'GamepadMapper should use mapped A button index');
    assert(axisMapper.getButtonIndex(GAMEPAD_BUTTON_NAMES.start) === 9, 'GamepadMapper should use mapped Start button index');
    assert(axisMapper.getAxisIndex(D_PAD_AXIS_NAMES.x) === 0, 'GamepadMapper should use mapped DPadX axis index');
    assert(axisMapper.getDPadType() === DPadType.AXIS, 'GamepadMapper should detect axis d-pad mappings');

    const buttonMapper = new GamepadMapper(0, 'Logitech RumblePad 2 USB (STANDARD GAMEPAD Vendor: 046d Product: c218)');
    assert(buttonMapper.getButtonIndex(D_PAD_BUTTON_NAMES.left) === 14, 'GamepadMapper should use mapped DPadLEFT button index');
    assert(buttonMapper.getDPadType() === DPadType.BUTTON, 'GamepadMapper should detect button d-pad mappings');

    buttonMapper.mapButtonNames(['A', 'Start']);
    buttonMapper.mapAxisNames(['DPadX', 'DPadY']);
    assert(buttonMapper.getButtonIndex(GAMEPAD_BUTTON_NAMES.start) === 1, 'GamepadMapper should allow overriding button names');
    assert(buttonMapper.getAxisIndex(D_PAD_AXIS_NAMES.y) === 1, 'GamepadMapper should allow overriding axis names');
    assert(buttonMapper.getDPadType() === DPadType.AXIS, 'GamepadMapper should recompute d-pad type from overridden names');
}
