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
    this.lastApiAvailable = false;
    this.lastGamepadReadError = "";
    this.lastPollTimestamp = "";
    this.lastRawGamepads = [];
    this.lastWindowFocused = false;
  }

  attach() {
    this.inputService.attach();
  }

  sources(status = this.refreshGamepadState()) {
    const gamepadCount = status.connectedCount;
    const gamepadSummary = status.connectedLabels
      ? `: ${status.connectedLabels}`
      : ".";
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
        detail: status.warning || `${gamepadCount} connected gamepad${gamepadCount === 1 ? "" : "s"} detected for button capture${gamepadSummary}`,
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

  captureGamepad(gamepadIndex) {
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
    const selectedIndex = Number(gamepadIndex);
    if (!Number.isInteger(selectedIndex)) {
      return {
        ok: false,
        message: "Gamepad capture unavailable: choose a detected gamepad device before capturing."
      };
    }
    const pad = this.findAdapterPad(selectedIndex);
    const deviceLabel = formatGamepadDeviceLabel(pad);
    if (!pad.connected) {
      return {
        ok: false,
        message: `Gamepad capture unavailable: ${deviceLabel} is no longer visible to the browser. Click inside this page, press a controller button, and try again.`
      };
    }
    const buttonIndex = pad.buttonsDown.findIndex(Boolean);
    if (buttonIndex >= 0) {
      return {
        ok: true,
        input: {
          source: "gamepad",
          binding: `Pad${selectedIndex}:Button${buttonIndex}`,
          label: `${deviceLabel} Button ${buttonIndex}`,
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
          binding: `Pad${selectedIndex}:Axis${axisIndex}${direction}`,
          label: `${deviceLabel} Axis ${axisIndex} ${direction}`,
          engine: "GamepadInputAdapter"
        }
      };
    }
    return {
      ok: false,
      message: `Gamepad capture unavailable: ${deviceLabel} is detected, but no live button or axis value is active. Hold a button or move a stick on that device while pressing its capture button.`
    };
  }

  refreshGamepadState() {
    this.inputService.update();
    return this.gamepadStatus();
  }

  gamepadStatus() {
    const gamepads = this.inputService.getGamepads();
    const devices = gamepads.map((gamepad) => ({
      index: Number(gamepad.index),
      id: gamepad.id ?? "",
      label: formatGamepadDeviceLabel(gamepad)
    }));
    const connectedLabels = gamepads
      .map((gamepad) => formatGamepadDeviceLabel(gamepad))
      .join(", ");
    if (this.lastGamepadReadError) {
      return {
        apiAvailable: this.lastApiAvailable,
        connectedCount: 0,
        connectedLabels: "",
        gamepads: [],
        lastPollTimestamp: this.lastPollTimestamp,
        message: "Gamepad API access blocked.",
        rawCount: this.lastRawGamepads.length,
        warning: `Gamepad capture unavailable: browser focus, permission, or Gamepad API timing blocked live gamepad access (${this.lastGamepadReadError}). Click inside this page, press a gamepad button, allow browser permission if prompted, then try again.`
      };
    }
    return {
      apiAvailable: this.lastApiAvailable,
      connectedCount: gamepads.length,
      connectedLabels,
      gamepads: devices,
      lastPollTimestamp: this.lastPollTimestamp,
      message: `${gamepads.length} connected gamepad${gamepads.length === 1 ? "" : "s"} detected${connectedLabels ? `: ${connectedLabels}` : "."}`,
      rawCount: this.lastRawGamepads.length,
      warning: ""
    };
  }

  gamepadDiagnostics(status = this.gamepadStatus()) {
    const inputServiceGamepads = this.inputService.getGamepads().map(normalizeDiagnosticGamepad);
    const sampleEngine = { input: this.inputService };
    const sampleGamepads = (sampleEngine.input.getGamepads?.() ?? []).map(normalizeDiagnosticGamepad);
    const gamepadZero = sampleEngine.input.getGamepad?.(0);
    const samplePath = gamepadZero
      ? "engine.input.getGamepads() + engine.input.getGamepad(0)"
      : "engine.input.getGamepads() + engine.input.getGamepad(0 disconnected)";

    return {
      apiAvailable: status.apiAvailable,
      rawCount: status.rawCount,
      windowFocused: this.lastWindowFocused,
      lastPollTimestamp: status.lastPollTimestamp,
      sources: [
        {
          name: "Raw navigator.getGamepads()",
          path: "navigator.getGamepads()",
          count: this.lastRawGamepads.length,
          gamepads: this.lastRawGamepads
        },
        {
          name: "InputService gamepad state",
          path: "InputService.update() -> inputService.getGamepads()",
          count: inputServiceGamepads.length,
          gamepads: inputServiceGamepads
        },
        {
          name: "Sample 0104 engine/input path",
          path: samplePath,
          count: sampleGamepads.length,
          gamepads: sampleGamepads
        }
      ]
    };
  }

  findAdapterPad(deviceIndex) {
    const adapterPad = this.gamepadAdapter.getPad(deviceIndex);
    if (adapterPad.connected) {
      return adapterPad;
    }

    const publicPad = this.inputService.getGamepads()
      .find((gamepad) => Number(gamepad.index) === deviceIndex);
    if (!publicPad) {
      return adapterPad;
    }

    const deviceInput = {
      getGamepad: (index) => (Number(index) === deviceIndex ? publicPad : null),
      getGamepads: () => [publicPad]
    };
    return new GamepadInputAdapter({ input: deviceInput }).getPad(deviceIndex);
  }

  readNavigatorGamepads() {
    this.lastGamepadReadError = "";
    this.lastPollTimestamp = new Date().toISOString();
    this.lastWindowFocused = typeof this.window.document?.hasFocus === "function"
      ? this.window.document.hasFocus()
      : false;
    this.lastApiAvailable = typeof this.window.navigator?.getGamepads === "function";
    if (!this.lastApiAvailable) {
      this.lastRawGamepads = [];
      return [];
    }
    try {
      const rawGamepads = Array.from(this.window.navigator.getGamepads() || []);
      this.lastRawGamepads = rawGamepads
        .filter(Boolean)
        .map(normalizeRawGamepadForDiagnostics);
      return rawGamepads;
    } catch (error) {
      this.lastGamepadReadError = error?.message || "unknown Gamepad API error";
      this.lastRawGamepads = [];
      return [];
    }
  }
}

function formatGamepadDeviceLabel(gamepad) {
  const index = Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0;
  const name = String(gamepad?.id || "").trim();
  return name ? `${name} (Gamepad ${index})` : `Gamepad ${index}`;
}

function normalizeRawGamepadForDiagnostics(gamepad) {
  return {
    index: Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0,
    id: String(gamepad?.id || ""),
    connected: gamepad?.connected !== false,
    buttonCount: Array.isArray(gamepad?.buttons) ? gamepad.buttons.length : 0,
    axisCount: Array.isArray(gamepad?.axes) ? gamepad.axes.length : 0
  };
}

function normalizeDiagnosticGamepad(gamepad) {
  return {
    index: Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0,
    id: String(gamepad?.id || ""),
    connected: gamepad?.connected !== false,
    buttonCount: Array.isArray(gamepad?.buttonsDown) ? gamepad.buttonsDown.length : 0,
    axisCount: Array.isArray(gamepad?.axes) ? gamepad.axes.length : 0
  };
}
