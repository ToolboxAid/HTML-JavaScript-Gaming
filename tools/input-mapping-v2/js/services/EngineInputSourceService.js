import GamepadInputAdapter from "/src/engine/input/GamepadInputAdapter.js";
import InputService from "/src/engine/input/InputService.js";
import { mouseButtonLabel } from "/src/engine/input/InputCapabilityDescriptors.js";

const GAMEPAD_AXIS_THRESHOLD = 0.35;
const GAMEPAD_CAPTURE_WAITING_MESSAGE = "No live button or axis value is active yet.";
const STANDARD_GAMEPAD_BUTTON_NAMES = Object.freeze([
  "A",
  "B",
  "X",
  "Y",
  "LB",
  "RB",
  "LT",
  "RT",
  "Back",
  "Start",
  "L3",
  "R3",
  "DPad Up",
  "DPad Down",
  "DPad Left",
  "DPad Right"
]);

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

  captureKeyboard(event) {
    const binding = event.code || event.key;
    return {
      source: "keyboard",
      binding,
      displayLabelLines: ["Keyboard", binding, "Press"],
      label: `Keyboard ${binding}`,
      title: `Keyboard\n${binding}`,
      engine: "KeyboardState"
    };
  }

  captureMouse(event) {
    const button = Number(event.button ?? 0);
    const buttonLabel = mouseButtonLabel(button);
    return {
      source: "mouse",
      binding: `MouseButton${button}`,
      displayLabelLines: ["Mouse", buttonLabel.replace(/^Mouse\s+/, ""), "Click"],
      label: buttonLabel,
      title: `Mouse\n${buttonLabel}`,
      engine: "MouseState"
    };
  }

  captureWheel(event) {
    return this.inputService.captureWheelDescriptor(event);
  }

  captureCombo(inputs) {
    const parts = Array.isArray(inputs) ? inputs.slice(0, 2) : [];
    if (parts.length !== 2) {
      return {
        ok: false,
        message: "Combo capture requires exactly two inputs."
      };
    }

    const comboLabel = parts.map(comboInputLabel).join(" + ");
    return {
      ok: true,
      input: {
        source: parts.every((input) => input.source === parts[0].source) ? parts[0].source : "keyboard",
        binding: `Combo:${parts.map((input) => input.binding).join("+")}`,
        displayLabelLines: ["Combo", comboLabel],
        label: `Combo ${comboLabel}`,
        title: parts.map((input) => input.title || input.label).join("\n+\n"),
        engine: "InputService Combo"
      }
    };
  }

  pointerDragDescriptors() {
    return this.inputService.getPointerDragDescriptors();
  }

  captureGesture(binding, enabledDeviceIds) {
    const gesture = this.inputService.getInputGestureDescriptor(binding, this.gestureOptions(enabledDeviceIds));
    if (!gesture) {
      return {
        ok: false,
        message: `Gesture capture unavailable: ${binding} is not visible for the enabled devices.`
      };
    }
    if (gesture.captureKind === "combo") {
      return {
        ok: true,
        combo: true,
        message: `${gesture.deviceLabel} combo capture armed.`
      };
    }
    if (gesture.captureKind === "pointer-drag") {
      return this.capturePointerDrag(binding);
    }
    if (gesture.captureKind === "wheel") {
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
    const deviceInfo = gamepadDeviceInfo(pad);
    if (!pad.connected) {
      return {
        ok: false,
        message: `Gamepad capture unavailable: ${deviceInfo.statusLabel} is no longer visible to the browser. Click inside this page, press a controller button, and try again.`
      };
    }
    const buttonIndex = pad.buttonsDown.findIndex(Boolean);
    if (buttonIndex >= 0) {
      const buttonLabel = gamepadButtonLabel(deviceInfo, buttonIndex);
      return {
        ok: true,
        input: {
          source: "gamepad",
          binding: `Pad${selectedIndex}:Button${buttonIndex}`,
          displayLabelLines: ["Game Controller", buttonLabel, "Button"],
          label: `Game Controller ${buttonLabel}`,
          title: gamepadInputTitle(deviceInfo, buttonLabel),
          engine: "GamepadInputAdapter"
        }
      };
    }
    const axisIndex = pad.axes.findIndex((axis) => Math.abs(Number(axis) || 0) >= GAMEPAD_AXIS_THRESHOLD);
    if (axisIndex >= 0) {
      const direction = pad.axes[axisIndex] < 0 ? "-" : "+";
      const axisLabel = `Axis ${axisIndex} ${direction}`;
      return {
        ok: true,
        input: {
          source: "gamepad",
          binding: `Pad${selectedIndex}:Axis${axisIndex}${direction}`,
          displayLabelLines: ["Game Controller", axisLabel, "Stick"],
          label: `Game Controller ${axisLabel}`,
          title: gamepadInputTitle(deviceInfo, axisLabel),
          engine: "GamepadInputAdapter"
        }
      };
    }
    return {
      ok: false,
      message: `${GAMEPAD_CAPTURE_WAITING_MESSAGE} Hold a button or move a stick on ${deviceInfo.statusLabel}.`,
      waiting: true
    };
  }

  captureFirstActiveGamepad() {
    const gamepads = this.inputService.getGamepads();
    for (const gamepad of gamepads) {
      const result = this.captureGamepad(gamepad.index);
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

  async requestGamepadRumblePreview() {
    if (typeof this.window.navigator?.getGamepads !== "function") {
      return {
        ok: false,
        message: "Gamepad rumble unavailable: browser Gamepad API is not available. Use a focused browser tab with a compatible controller."
      };
    }

    let gamepads = [];
    try {
      gamepads = Array.from(this.window.navigator.getGamepads() || []).filter(Boolean);
    } catch (error) {
      return {
        ok: false,
        message: `Gamepad rumble unavailable: navigator.getGamepads() failed (${error?.message || "unknown error"}). Click inside this page, reconnect the controller, and try again.`
      };
    }

    const actuator = findHapticActuator(gamepads);
    if (!actuator) {
      return {
        ok: false,
        message: "Gamepad rumble unavailable: no connected gamepad exposes GamepadHapticActuator or vibrationActuator. Connect a compatible controller, click inside this page, and try again."
      };
    }

    try {
      if (typeof actuator.playEffect === "function") {
        await actuator.playEffect("dual-rumble", {
          duration: 80,
          strongMagnitude: 0.25,
          weakMagnitude: 0.15
        });
      } else {
        await actuator.pulse(0.25, 80);
      }
      return {
        ok: true,
        message: "Gamepad rumble/haptic feedback enabled for this tool session."
      };
    } catch (error) {
      return {
        ok: false,
        message: `Gamepad rumble unavailable: haptic actuator request failed (${error?.message || "unknown error"}). Try a compatible controller with browser haptics support.`
      };
    }
  }

  refreshGamepadState() {
    this.inputService.update();
    return this.gamepadStatus();
  }

  gamepadStatus() {
    const gamepads = this.inputService.getGamepads();
    const devices = gamepads.map(gamepadDeviceInfo);
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

function formatGamepadDeviceLabel(gamepad) {
  return gamepadDeviceInfo(gamepad).statusLabel;
}

function pointerDragTitle(descriptor) {
  const bounds = descriptor.snapshot?.dragBounds;
  if (!bounds) {
    return descriptor.title;
  }
  return [
    descriptor.title,
    `Bounds: x ${bounds.x}, y ${bounds.y}, width ${bounds.width}, height ${bounds.height}`
  ].join("\n");
}

function pointerDragLabelLines(descriptor) {
  const gestureLabel = descriptor.displayLabelLines?.[1] || descriptor.label.replace(/^Mouse\s+/, "");
  return [mouseButtonLabel(descriptor.snapshot?.button ?? 0), gestureLabel];
}

function gamepadDeviceInfo(gamepad) {
  const index = Number.isInteger(Number(gamepad?.index)) ? Number(gamepad.index) : 0;
  const id = normalizeWhitespace(gamepad?.id || "");
  const mapping = normalizeWhitespace(gamepad?.mapping || "");
  const usbIds = parseUsbIds(id);
  const displayName = gamepadDisplayName(id, usbIds);
  const vendorProductLine = vendorProductText(usbIds);
  const detailName = detailDeviceName(displayName, id, usbIds);
  return {
    captureLines: captureLines({ vendorProductLine }),
    detailName,
    displayName,
    id,
    index,
    label: `${displayName} (Gamepad ${index})`,
    mapping,
    statusLabel: `${displayName} (Gamepad ${index})`,
    vendor: usbIds.vendor,
    vendorProductLine,
    product: usbIds.product
  };
}

function captureLines({ vendorProductLine }) {
  return ["Capture Game", vendorProductLine].filter(Boolean);
}

function detailDeviceName(displayName, id, usbIds) {
  if (!usbIds.vendor && !usbIds.product && !/\busb\b/i.test(id)) {
    return displayName;
  }
  return /\busb\b/i.test(displayName) ? displayName : `${displayName} USB`;
}

function gamepadDisplayName(id, usbIds) {
  const withoutUsbDetails = id
    .replace(/\(?\s*Vendor:\s*[0-9a-f]+\s+Product:\s*[0-9a-f]+\s*\)?/gi, " ")
    .replace(/\(?\s*Product:\s*[0-9a-f]+\s+Vendor:\s*[0-9a-f]+\s*\)?/gi, " ");
  const withoutNumericPrefix = usbIds.vendor && usbIds.product
    ? withoutUsbDetails.replace(new RegExp(`\\b${usbIds.vendor}\\b[-_\\s:]*\\b${usbIds.product}\\b[-_\\s:]*`, "i"), " ")
    : withoutUsbDetails;
  const withoutTransportSuffix = normalizeGamepadName(withoutNumericPrefix)
    .replace(/\s+USB$/i, "");
  if (!withoutTransportSuffix || isGenericGamepadName(withoutTransportSuffix)) {
    return "USB gamepad";
  }
  return withoutTransportSuffix;
}

function gamepadInputTitle(deviceInfo, inputLabel) {
  return [
    deviceInfo.detailName,
    deviceInfo.mapping ? `${deviceInfo.mapping.toUpperCase()} GAMEPAD` : "GAMEPAD",
    deviceInfo.vendorProductLine,
    inputLabel
  ].filter(Boolean).join("\n");
}

function gamepadButtonLabel(deviceInfo, buttonIndex) {
  if (deviceInfo.mapping === "standard" && STANDARD_GAMEPAD_BUTTON_NAMES[buttonIndex]) {
    return STANDARD_GAMEPAD_BUTTON_NAMES[buttonIndex];
  }
  return `Button ${buttonIndex}`;
}

function comboInputLabel(input) {
  if (input.source === "keyboard") {
    return keyboardComboLabel(input.binding);
  }
  if (input.source === "mouse") {
    return input.label.replace(/^Mouse\s+/, "Mouse ");
  }
  if (input.source === "gamepad") {
    return input.label.replace(/^Game Controller\s+/, "Game Controller ");
  }
  return input.label;
}

function keyboardComboLabel(binding) {
  const namedKeys = {
    AltLeft: "Alt",
    AltRight: "Alt",
    Backspace: "Backspace",
    ControlLeft: "Ctrl",
    ControlRight: "Ctrl",
    Delete: "Delete",
    Enter: "Enter",
    Escape: "Esc",
    MetaLeft: "Meta",
    MetaRight: "Meta",
    ShiftLeft: "Shift",
    ShiftRight: "Shift",
    Space: "Space",
    Tab: "Tab"
  };
  if (namedKeys[binding]) {
    return namedKeys[binding];
  }
  if (/^Key[A-Z]$/.test(binding)) {
    return binding.slice(3);
  }
  if (/^Digit[0-9]$/.test(binding)) {
    return binding.slice(5);
  }
  return binding;
}

function findHapticActuator(gamepads) {
  for (const gamepad of gamepads) {
    const vibrationActuator = gamepad?.vibrationActuator;
    if (vibrationActuator && typeof vibrationActuator.playEffect === "function") {
      return vibrationActuator;
    }
    const hapticActuator = Array.isArray(gamepad?.hapticActuators)
      ? gamepad.hapticActuators.find((actuator) => typeof actuator?.pulse === "function")
      : null;
    if (hapticActuator) {
      return hapticActuator;
    }
  }
  return null;
}

function parseUsbIds(id) {
  const vendor = id.match(/Vendor:\s*([0-9a-f]{4})/i)?.[1]
    ?? id.match(/\b([0-9a-f]{4})[-_:\s]+([0-9a-f]{4})\b/i)?.[1]
    ?? "";
  const product = id.match(/Product:\s*([0-9a-f]{4})/i)?.[1]
    ?? id.match(/\b([0-9a-f]{4})[-_:\s]+([0-9a-f]{4})\b/i)?.[2]
    ?? "";
  return {
    vendor: vendor.toLowerCase(),
    product: product.toLowerCase()
  };
}

function normalizeGamepadName(value) {
  return normalizeWhitespace(value)
    .replace(/^[\s:;,.()_-]+|[\s:;,.()_-]+$/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
    .trim();
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isGenericGamepadName(name) {
  return /^(?:generic\s+)?usb\s+gamepad$/i.test(name) || /^gamepad$/i.test(name);
}

function vendorProductText({ vendor, product }) {
  if (vendor && product) {
    return `Vendor: ${vendor} Product: ${product}`;
  }
  if (vendor) {
    return `Vendor: ${vendor}`;
  }
  if (product) {
    return `Product: ${product}`;
  }
  return "";
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
