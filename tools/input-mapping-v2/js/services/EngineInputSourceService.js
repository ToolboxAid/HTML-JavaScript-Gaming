import GamepadInputAdapter from "/src/engine/input/GamepadInputAdapter.js";
import InputService from "/src/engine/input/InputService.js";

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
        name: "Pointer Drag",
        detail: this.pointerDragDescriptors().map((descriptor) => descriptor.label).join(", "),
        engine: "InputService + PointerDragState"
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
    const binding = event.code || event.key;
    return {
      source: "keyboard",
      binding,
      displayLabelLines: ["Keyboard", binding],
      label: `Keyboard ${binding}`,
      title: `Keyboard\n${binding}`,
      engine: "KeyboardState"
    };
  }

  captureMouse(event) {
    const button = Number(event.button ?? 0);
    return {
      source: "mouse",
      binding: `MouseButton${button}`,
      displayLabelLines: ["Mouse", `Button ${button}`],
      label: `Mouse Button ${button}`,
      title: `Mouse\nButton ${button}`,
      engine: "MouseState"
    };
  }

  pointerDragDescriptors() {
    return this.inputService.getPointerDragDescriptors();
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
        displayLabelLines: descriptor.displayLabelLines,
        label: descriptor.label,
        title: descriptor.title,
        engine: descriptor.engine
      }
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
          displayLabelLines: ["Game Controller", buttonLabel],
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
          displayLabelLines: ["Game Controller", axisLabel],
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
  return gamepadDeviceInfo(gamepad).statusLabel;
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
    captureLines: captureLines({ displayName, index, vendorProductLine }),
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

function captureLines({ displayName, index, vendorProductLine }) {
  const firstLine = isGenericGamepadName(displayName)
    ? `Capture (Gamepad ${index})`
    : `Capture ${displayName}`;
  return [firstLine, vendorProductLine, displayName].filter(Boolean);
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
