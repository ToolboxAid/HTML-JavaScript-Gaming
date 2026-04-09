/*
Toolbox Aid
David Quesenberry
03/24/2026
MultiBallChaosInputController.js
*/
import { GamepadInputAdapter } from '/src/engine/input/index.js';

const PRESET_CODES = {
  Digit1: 'three',
  Digit2: 'six',
  Digit3: 'ten',
  Digit4: 'fast',
};

const PRESET_SEQUENCE = ['three', 'six', 'ten', 'fast'];

export default class MultiBallChaosInputController {
  constructor(input) {
    this.input = input;
    this.gamepads = new GamepadInputAdapter({ input });
  }

  getFrameState(currentPresetId = PRESET_SEQUENCE[0]) {
    this.gamepads.setInput(this.input);
    const padIndex = this.gamepads.listConnectedIndices()[0] ?? 0;
    const pad = this.gamepads.getPad(padIndex);

    return {
      startPressed:
        this.wasPressed('Space') ||
        this.wasPressed('Enter') ||
        pad.confirmPressed,
      pausePressed:
        this.wasPressed('KeyP') ||
        pad.startPressed,
      resetPressed:
        this.wasPressed('KeyR') ||
        pad.cancelPressed,
      presetPressed:
        this.readKeyboardPreset() ??
        this.readPadPreset(pad, currentPresetId),
    };
  }

  readKeyboardPreset() {
    for (const [code, presetId] of Object.entries(PRESET_CODES)) {
      if (this.wasPressed(code)) {
        return presetId;
      }
    }
    return null;
  }

  readPadPreset(pad, currentPresetId) {
    const currentIndex = PRESET_SEQUENCE.indexOf(currentPresetId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    if (pad.leftShoulderPressed) {
      return PRESET_SEQUENCE[(safeIndex + PRESET_SEQUENCE.length - 1) % PRESET_SEQUENCE.length];
    }

    if (pad.rightShoulderPressed) {
      return PRESET_SEQUENCE[(safeIndex + 1) % PRESET_SEQUENCE.length];
    }

    return null;
  }

  wasPressed(code) {
    return Boolean(this.input?.isPressed?.(code));
  }
}
