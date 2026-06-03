import GamepadInputAdapter from "/src/engine/input/GamepadInputAdapter.js";
import GamepadHapticsService from "/src/engine/input/GamepadHapticsService.js";
import InputCaptureService from "/src/engine/input/InputCaptureService.js";
import InputService from "/src/engine/input/InputService.js";
import { inputDeviceGestureIsCompatible } from "/src/engine/input/InputCapabilityDescriptors.js";
import {
  activeGamepadBindings as engineActiveGamepadBindings,
  captureGamepadInput,
  formatGamepadDeviceLabel,
  gamepadDeviceInfo,
  GAMEPAD_CAPTURE_WAITING_MESSAGE
} from "/src/engine/input/GamepadInputClassifier.js";

export class EngineInputSourceService {
  constructor({ windowRef = window } = {}) {
    this.window = windowRef;
    this.inputService = new InputService({
      target: windowRef,
      getGamepads: () => this.readNavigatorGamepads()
    });
    this.captureService = new InputCaptureService({ inputService: this.inputService });
    this.gamepadAdapter = new GamepadInputAdapter({ input: this.inputService });
    this.gamepadHaptics = new GamepadHapticsService({
      getGamepads: () => this.readNavigatorGamepads()
    });
    this.lastApiAvailable = false;
    this.lastGamepadReadError = "";
    this.lastPollTimestamp = "";
    this.lastRawGamepads = [];
    this.lastWindowFocused = false;
  }

  attach() {
    this.inputService.attach();
  }

  devices(status = this.refreshGamepadState()) {
    return this.inputService.getInputDeviceCapabilities({
      gamepadCount: status.connectedCount,
      gamepadWarning: status.warning,
      webXrAvailable: typeof this.window.navigator?.xr !== "undefined"
    });
  }

  gestures(enabledDeviceIds) {
    return this.inputService.getInputGestureDescriptors(this.gestureOptions(enabledDeviceIds));
  }

  captureKeyboard(event, gesture = null) {
    return this.captureService.captureKeyboard(event, gesture);
  }

  captureMouse(event, gesture = null) {
    return this.captureService.captureMouse(event, gesture);
  }

  captureWheel(event) {
    return this.captureService.captureWheel(event);
  }

  beginComboCapture(options = {}) {
    return this.inputService.beginComboCapture(options);
  }

  recordComboInput(input, options = {}) {
    return this.inputService.recordComboInput(input, options);
  }

  resetComboCapture() {
    this.inputService.resetComboCapture();
  }

  activateInputBindings(bindings, options = {}) {
    return this.inputService.activateInputBindings(bindings, options);
  }

  clearActiveInputBindings(bindings) {
    return this.inputService.clearActiveInputBindings(bindings);
  }

  replaceActiveInputBindings(shouldReplace, nextBindings) {
    return this.inputService.replaceActiveInputBindings(shouldReplace, nextBindings);
  }

  actionsWithActiveInputState(actions) {
    return this.inputService.decorateActionsWithInputState(actions);
  }

  pointerDragDescriptors() {
    return this.inputService.getPointerDragDescriptors();
  }

  captureGesture(binding, enabledDeviceIds) {
    return this.captureService.captureGesture(binding, this.gestureOptions(enabledDeviceIds));
  }

  capturePointerDrag(binding) {
    return this.captureService.capturePointerDrag(binding);
  }

  capturePointerDragSnapshot(binding, snapshot) {
    return this.captureService.capturePointerDragSnapshot(binding, snapshot);
  }

  captureWheelGesture(binding) {
    return this.captureService.captureWheelGesture(binding);
  }

  captureGamepad(gamepadIndex, gesture = null, { refresh = true } = {}) {
    if (typeof this.window.navigator?.getGamepads !== "function") {
      return {
        ok: false,
        message: "Gamepad capture unavailable: browser Gamepad API is not available in this context. Use a focused browser tab that supports navigator.getGamepads."
      };
    }
    const status = refresh ? this.refreshGamepadState() : this.gamepadStatus();
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
    return captureGamepadInput({
      gamepadIndex: selectedIndex,
      gesture,
      pad: this.findAdapterPad(selectedIndex)
    });
  }

  captureFirstActiveGamepad(options = {}) {
    const gamepads = this.inputService.getGamepads();
    for (const gamepad of gamepads) {
      const result = this.captureGamepad(gamepad.index, null, options);
      if (result.ok) {
        return result;
      }
    }
    return {
      ok: false,
      waiting: true,
      message: GAMEPAD_CAPTURE_WAITING_MESSAGE
    };
  }

  activeGamepadBindings() {
    return this.inputService.getGamepads().flatMap(engineActiveGamepadBindings);
  }

  isGestureCompatibleWithCaptureSource(source, gesture) {
    return inputDeviceGestureIsCompatible(source, gesture);
  }

  async testGamepadRumble(gamepadIndex, settings) {
    return this.gamepadHaptics.testRumble(gamepadIndex, settings);
  }

  refreshGamepadState() {
    this.inputService.update();
    return this.gamepadStatus();
  }

  gamepadStatus() {
    const gamepads = this.inputService.getGamepads();
    const devices = gamepads.map(gamepadDeviceInfo);
    const haptics = this.gamepadHaptics.getStatusReport();
    const connectedLabels = gamepads
      .map((gamepad) => formatGamepadDeviceLabel(gamepad))
      .join(", ");
    if (this.lastGamepadReadError) {
      return {
        apiAvailable: this.lastApiAvailable,
        connectedCount: 0,
        connectedLabels: "",
        gamepads: [],
        haptics,
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
      haptics,
      lastPollTimestamp: this.lastPollTimestamp,
      message: `${gamepads.length} connected gamepad${gamepads.length === 1 ? "" : "s"} detected${connectedLabels ? `: ${connectedLabels}` : "."}`,
      rawCount: this.lastRawGamepads.length,
      warning: ""
    };
  }

  gamepadDiagnostics(status = this.gamepadStatus()) {
    const inputServiceGamepads = this.inputService.getGamepads().map(normalizeDiagnosticGamepad);
    return {
      apiAvailable: status.apiAvailable,
      rawCount: status.rawCount,
      windowFocused: this.lastWindowFocused,
      lastPollTimestamp: status.lastPollTimestamp,
      sources: [
        {
          name: "Engine input capabilities",
          path: "InputService.getInputDeviceCapabilities() + getInputGestureDescriptors()",
          count: this.devices(status).length,
          entries: this.devices(status).map((device) => ({
            name: device.label,
            detail: `${device.available ? "available" : "unavailable"} - ${device.engine}`
          }))
        },
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
          name: "Gamepad haptics",
          path: "GamepadHapticsService.getStatusReport()",
          count: status.haptics?.gamepads?.length ?? 0,
          entries: (status.haptics?.gamepads ?? []).map((gamepad) => ({
            name: gamepad.label,
            detail: gamepad.supported
              ? `haptics supported via ${gamepad.actuatorType}`
              : "haptics unavailable - no GamepadHapticActuator, hapticActuators, or vibrationActuator"
          }))
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

  wheelInputAvailable() {
    return typeof this.window.WheelEvent === "function" || "onwheel" in this.window;
  }

  gestureOptions(enabledDeviceIds) {
    return {
      advancedModeAvailable: Boolean(this.window.__inputMappingV2AdvancedInputMode),
      enabledDeviceIds,
      wheelAvailable: this.wheelInputAvailable()
    };
  }
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
