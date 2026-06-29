/*
Toolbox Aid
David Quesenberry
05/22/2026
GamepadHapticsService.test.mjs
*/

import GamepadHapticsService from '../../../www/src/engine/input/GamepadHapticsService.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export async function run() {
    const calls = [];
    const service = new GamepadHapticsService({
        getGamepads: () => [
            {
                connected: true,
                id: 'Supported Vibration Controller',
                index: 0,
                vibrationActuator: {
                    playEffect: async (effect, parameters) => {
                        calls.push({ effect, parameters, type: 'vibrationActuator' });
                    },
                },
            },
            {
                connected: true,
                hapticActuators: [{
                    pulse: async (value, duration) => {
                        calls.push({ duration, type: 'hapticActuators', value });
                    },
                }],
                id: 'Supported Pulse Controller',
                index: 1,
            },
            {
                connected: true,
                id: 'No Haptics Controller',
                index: 2,
            },
        ],
    });

    const status = service.getStatusReport();
    assert(status.gamepads[0].supported === true, 'vibrationActuator gamepad should report haptics support.');
    assert(status.gamepads[0].actuatorType === 'vibrationActuator', 'vibrationActuator status should identify the actuator source.');
    assert(status.gamepads[1].supported === true, 'hapticActuators gamepad should report haptics support.');
    assert(status.gamepads[1].actuatorType === 'hapticActuators', 'hapticActuators status should identify the actuator source.');
    assert(status.gamepads[2].supported === false, 'Gamepad without haptic actuators should report unsupported haptics.');

    const vibrationResult = await service.testRumble(0, { durationMs: 120, strength: 0.7 });
    assert(vibrationResult.ok === true, 'vibrationActuator test rumble should succeed.');
    assert(calls[0].effect === 'dual-rumble', 'vibrationActuator should use dual-rumble.');
    assert(calls[0].parameters.duration === 120, 'vibrationActuator should receive duration.');
    assert(calls[0].parameters.strongMagnitude === 0.7, 'vibrationActuator should receive strong magnitude.');

    const pulseResult = await service.testRumble(1, { durationMs: 90, strength: 0.4 });
    assert(pulseResult.ok === true, 'hapticActuators pulse test rumble should succeed.');
    assert(calls[1].type === 'hapticActuators', 'hapticActuators should use pulse when playEffect is unavailable.');
    assert(calls[1].duration === 90, 'pulse actuator should receive duration.');
    assert(calls[1].value === 0.4, 'pulse actuator should receive strength.');

    const unsupportedResult = await service.testRumble(2);
    assert(unsupportedResult.ok === false, 'Unsupported haptics should not fake rumble.');
    assert(unsupportedResult.message.includes('does not expose'), 'Unsupported haptics should return an actionable message.');
}
