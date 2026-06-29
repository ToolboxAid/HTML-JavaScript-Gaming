/*
Toolbox Aid
David Quesenberry
05/22/2026
GamepadHapticsService.js
*/

const DEFAULT_DURATION_MS = 80;
const DEFAULT_STRONG_MAGNITUDE = 0.25;
const DEFAULT_WEAK_MAGNITUDE = 0.15;

export default class GamepadHapticsService {
    constructor({ getGamepads = defaultGetGamepads } = {}) {
        this.getGamepads = getGamepads;
    }

    getStatusReport() {
        const read = this.readGamepads();
        if (!read.ok) {
            return {
                apiAvailable: false,
                gamepads: [],
                warning: read.message,
            };
        }

        return {
            apiAvailable: true,
            gamepads: read.gamepads.map((gamepad) => this.createStatus(gamepad)),
            warning: '',
        };
    }

    async testRumble(gamepadIndex, options = {}) {
        const read = this.readGamepads();
        if (!read.ok) {
            return {
                ok: false,
                message: `Gamepad rumble unavailable: ${read.message}`,
            };
        }

        const selectedIndex = Number(gamepadIndex);
        const gamepad = read.gamepads.find((candidate) => Number(candidate?.index) === selectedIndex);
        if (!gamepad) {
            return {
                ok: false,
                message: `Gamepad rumble unavailable: Gamepad ${selectedIndex} is not connected. Click inside this page, press the controller, and try again.`,
            };
        }

        const actuator = findHapticActuator(gamepad);
        if (!actuator) {
            return {
                ok: false,
                message: `Gamepad rumble unavailable: ${gamepadLabel(gamepad)} does not expose GamepadHapticActuator, hapticActuators, or vibrationActuator. Use a browser and controller with haptics support.`,
            };
        }

        const settings = normalizeRumbleSettings(options);
        try {
            await playHaptics(actuator, settings);
            return {
                ok: true,
                message: `Test rumble sent to ${gamepadLabel(gamepad)}.`,
            };
        } catch (error) {
            return {
                ok: false,
                message: `Gamepad rumble unavailable: haptic actuator request failed for ${gamepadLabel(gamepad)} (${error?.message || 'unknown error'}). Try a compatible controller with browser haptics support.`,
            };
        }
    }

    readGamepads() {
        if (typeof this.getGamepads !== 'function') {
            return {
                ok: false,
                gamepads: [],
                message: 'Gamepad API service is not available.',
            };
        }

        try {
            return {
                ok: true,
                gamepads: Array.from(this.getGamepads() || []).filter((gamepad) => Boolean(gamepad && gamepad.connected !== false)),
                message: '',
            };
        } catch (error) {
            return {
                ok: false,
                gamepads: [],
                message: `navigator.getGamepads() failed (${error?.message || 'unknown error'}). Click inside this page, reconnect the controller, and try again.`,
            };
        }
    }

    createStatus(gamepad) {
        const actuator = findHapticActuator(gamepad);
        return {
            actuatorType: actuator?.type ?? '',
            id: String(gamepad?.id || ''),
            index: Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0,
            label: gamepadLabel(gamepad),
            supported: Boolean(actuator),
        };
    }
}

function defaultGetGamepads() {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
        return [];
    }
    return navigator.getGamepads() ?? [];
}

function findHapticActuator(gamepad) {
    const vibrationActuator = gamepad?.vibrationActuator;
    if (vibrationActuator && typeof vibrationActuator.playEffect === 'function') {
        return {
            actuator: vibrationActuator,
            mode: 'playEffect',
            type: 'vibrationActuator',
        };
    }

    const hapticActuator = Array.isArray(gamepad?.hapticActuators)
        ? gamepad.hapticActuators.find((actuator) => typeof actuator?.pulse === 'function' || typeof actuator?.playEffect === 'function')
        : null;
    if (!hapticActuator) {
        return null;
    }

    return {
        actuator: hapticActuator,
        mode: typeof hapticActuator.playEffect === 'function' ? 'playEffect' : 'pulse',
        type: 'hapticActuators',
    };
}

async function playHaptics(hapticActuator, settings) {
    if (hapticActuator.mode === 'playEffect') {
        await hapticActuator.actuator.playEffect('dual-rumble', {
            duration: settings.durationMs,
            strongMagnitude: settings.strongMagnitude,
            weakMagnitude: settings.weakMagnitude,
        });
        return;
    }

    await hapticActuator.actuator.pulse(Math.max(settings.strongMagnitude, settings.weakMagnitude), settings.durationMs);
}

function normalizeRumbleSettings(options) {
    const strength = clampNumber(options.strength, DEFAULT_STRONG_MAGNITUDE, 0, 1);
    return {
        durationMs: Math.round(clampNumber(options.durationMs, DEFAULT_DURATION_MS, 20, 2000)),
        strongMagnitude: strength,
        weakMagnitude: clampNumber(options.weakMagnitude, Math.min(strength, DEFAULT_WEAK_MAGNITUDE), 0, 1),
    };
}

function clampNumber(value, fallback, minimum, maximum) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return fallback;
    }
    return Math.max(minimum, Math.min(maximum, number));
}

function gamepadLabel(gamepad) {
    const index = Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0;
    const id = String(gamepad?.id || '').trim();
    return `${id || 'Gamepad'} (Gamepad ${index})`;
}
