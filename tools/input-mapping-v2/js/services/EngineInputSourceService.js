import GamepadInputAdapter from "/src/engine/input/GamepadInputAdapter.js";
import InputService from "/src/engine/input/InputService.js";

const GAMEPAD_AXIS_THRESHOLD = 0.35;

export class EngineInputSourceService {
  constructor({ windowRef = window } = {}) {
    this.window = windowRef;
    this.inputService = new InputService({
      target: windowRef,
      getGamepads: () => this.readNavigatorGamepads()
    });
    this.gamepadAdapter = new GamepadInputAdapter({ input: this.inputService });
  }

  attach() {
    this.inputService.attach();
  }

  sources() {
    const gamepads = this.inputService.getGamepads();
    const gamepadCount = gamepads.length;
    return [
      {
        name: "Keyboard",
        detail: "Keyboard codes captured through InputService and KeyboardState.",
        engine: "InputService + KeyboardState"
      },
      {
        name: "Mouse",
        detail: "Mouse buttons captured through InputService and MouseState.",
        engine: "InputService + MouseState"
      },
      {
        name: "Gamepad Buttons",
        detail: `${gamepadCount} connected gamepad${gamepadCount === 1 ? "" : "s"} detected for button capture.`,
        engine: "InputService + GamepadState + GamepadInputAdapter"
      },
      {
        name: "Gamepad Axes",
        detail: "Analog axes are reported when a connected gamepad axis crosses the capture threshold.",
        engine: "GamepadInputAdapter"
      }
    ];
  }

  captureKeyboard(event) {
    return {
      source: "keyboard",
      binding: event.code,
      label: `Keyboard ${event.code || event.key}`,
      engine: "KeyboardState"
    };
  }

  captureMouse(event) {
    const button = Number(event.button ?? 0);
    return {
      source: "mouse",
      binding: `MouseButton${button}`,
      label: `Mouse Button${button}`,
      engine: "MouseState"
    };
  }

  captureGamepad() {
    if (typeof this.window.navigator?.getGamepads !== "function") {
      return {
        ok: false,
        message: "Gamepad capture unavailable: browser Gamepad API is not available in this context."
      };
    }
    this.inputService.update();
    const connectedIndices = this.gamepadAdapter.listConnectedIndices();
    if (!connectedIndices.length) {
      return {
        ok: false,
        message: "Gamepad capture unavailable: connect a gamepad, press a button or move an axis, then capture again."
      };
    }
    for (const padIndex of connectedIndices) {
      const pad = this.gamepadAdapter.getPad(padIndex);
      const buttonIndex = pad.buttonsDown.findIndex(Boolean);
      if (buttonIndex >= 0) {
        return {
          ok: true,
          input: {
            source: "gamepad-button",
            binding: `Pad${padIndex}:Button${buttonIndex}`,
            label: `Gamepad ${padIndex} Button ${buttonIndex}`,
            engine: "GamepadInputAdapter"
          }
        };
      }
      const axisIndex = pad.axes.findIndex((axis) => Math.abs(Number(axis) || 0) >= GAMEPAD_AXIS_THRESHOLD);
      if (axisIndex >= 0) {
        const direction = pad.axes[axisIndex] < 0 ? "-" : "+";
        return {
          ok: true,
          input: {
            source: "gamepad-axis",
            binding: `Pad${padIndex}:Axis${axisIndex}${direction}`,
            label: `Gamepad ${padIndex} Axis ${axisIndex} ${direction}`,
            engine: "GamepadInputAdapter"
          }
        };
      }
    }
    return {
      ok: false,
      message: "Gamepad capture unavailable: no pressed button or moved axis was visible from the Gamepad API."
    };
  }

  readNavigatorGamepads() {
    if (typeof this.window.navigator?.getGamepads !== "function") {
      return [];
    }
    return Array.from(this.window.navigator.getGamepads() || []);
  }
}
