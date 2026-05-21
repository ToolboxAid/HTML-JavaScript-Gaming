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
    this.lastGamepadReadError = "";
  }

  attach() {
    this.inputService.attach();
  }

  sources() {
    const status = this.refreshGamepadState();
    const gamepadCount = status.connectedCount;
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
        detail: status.warning || `${gamepadCount} connected gamepad${gamepadCount === 1 ? "" : "s"} detected for button capture${status.connectedLabels ? `: ${status.connectedLabels}` : "."}`,
        engine: "InputService + GamepadState + GamepadInputAdapter"
      },
      {
        name: "Gamepad Axes",
        detail: status.warning || "Analog axes are reported when a connected gamepad axis crosses the capture threshold.",
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
        message: "Gamepad capture unavailable: browser Gamepad API is not available in this context. Use a focused browser tab that supports navigator.getGamepads."
      };
    }
    const status = this.refreshGamepadState();
    if (status.warning) {
      return {
        ok: false,
        message: status.warning
      };
    }
    const connectedIndices = this.gamepadAdapter.listConnectedIndices();
    if (!connectedIndices.length) {
      return {
        ok: false,
        message: "Gamepad capture unavailable: no connected gamepad is visible. Click inside this page, press any gamepad button to wake or authorize the controller, check browser focus or permission prompts, then try again."
      };
    }
    for (const padIndex of connectedIndices) {
      const pad = this.gamepadAdapter.getPad(padIndex);
      const buttonIndex = pad.buttonsDown.findIndex(Boolean);
      if (buttonIndex >= 0) {
        return {
          ok: true,
          input: {
            source: "gamepad",
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
            source: "gamepad",
            binding: `Pad${padIndex}:Axis${axisIndex}${direction}`,
            label: `Gamepad ${padIndex} Axis ${axisIndex} ${direction}`,
            engine: "GamepadInputAdapter"
          }
        };
      }
    }
    return {
      ok: false,
      message: "Gamepad capture unavailable: a connected gamepad was detected, but no live button or axis value was active. Hold a button or move a stick while pressing Capture Gamepad."
    };
  }

  refreshGamepadState() {
    this.inputService.update();
    return this.gamepadStatus();
  }

  gamepadStatus() {
    const gamepads = this.inputService.getGamepads();
    const connectedLabels = gamepads
      .map((gamepad) => `Gamepad ${gamepad.index}${gamepad.id ? ` ${gamepad.id}` : ""}`.trim())
      .join(", ");
    if (this.lastGamepadReadError) {
      return {
        connectedCount: 0,
        connectedLabels: "",
        message: "Gamepad API access blocked.",
        warning: `Gamepad capture unavailable: browser focus, permission, or Gamepad API timing blocked live gamepad access (${this.lastGamepadReadError}). Click inside this page, press a gamepad button, allow browser permission if prompted, then try again.`
      };
    }
    return {
      connectedCount: gamepads.length,
      connectedLabels,
      message: `${gamepads.length} connected gamepad${gamepads.length === 1 ? "" : "s"} detected${connectedLabels ? `: ${connectedLabels}` : "."}`,
      warning: ""
    };
  }

  readNavigatorGamepads() {
    this.lastGamepadReadError = "";
    if (typeof this.window.navigator?.getGamepads !== "function") {
      return [];
    }
    try {
      return Array.from(this.window.navigator.getGamepads() || []);
    } catch (error) {
      this.lastGamepadReadError = error?.message || "unknown Gamepad API error";
      return [];
    }
  }
}
