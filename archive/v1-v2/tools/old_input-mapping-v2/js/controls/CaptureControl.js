export class CaptureControl {
  constructor({
    captureGamepadButtons,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    disableContextCheckbox,
    refreshGamepadsButton,
    selectedActionLabel,
    suppressShortcutsCheckbox
  }) {
    this.captureGamepadButtons = captureGamepadButtons;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.disableContextCheckbox = disableContextCheckbox;
    this.activeCaptureId = "";
    this.captureState = "idle";
    this.selectedCaptureId = "";
    this.onCaptureGamepad = () => {};
    this.refreshGamepadsButton = refreshGamepadsButton;
    this.selectedActionLabel = selectedActionLabel;
    this.suppressShortcutsCheckbox = suppressShortcutsCheckbox;
  }

  mount({ onCaptureGamepad, onCaptureKeyboard, onCaptureMouse, onDisableContextChanged, onRefreshGamepads, onSuppressShortcutsChanged }) {
    this.onCaptureGamepad = onCaptureGamepad;
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
    stopHeaderToggle(this.disableContextCheckbox);
    stopHeaderToggle(this.suppressShortcutsCheckbox);
    this.disableContextCheckbox.addEventListener("change", () => {
      onDisableContextChanged(this.disableContextCheckbox.checked);
    });
    this.suppressShortcutsCheckbox.addEventListener("change", () => {
      onSuppressShortcutsChanged(this.suppressShortcutsCheckbox.checked);
    });
    this.refreshGamepadsButton.addEventListener("click", onRefreshGamepads);
  }

  render(actionLabel, gamepads = [], selectedInputs = [], captureMode = "", captureAvailability = allCaptureAvailable(), selectedCaptureId = "", canSelectInputDevice = true) {
    this.selectedCaptureId = selectedCaptureId;
    this.selectedActionLabel.textContent = `Selected action: ${actionLabel}`;
    const canHighlightUsedInputs = true;
    this.setSectionDisabled(!canSelectInputDevice);
    this.setCaptureButtonEnabled(this.captureKeyboardButton, canSelectInputDevice && captureAvailability.keyboard, "keyboard");
    this.setCaptureButtonEnabled(this.captureMouseButton, canSelectInputDevice && captureAvailability.mouse, "mouse");
    this.refreshGamepadsButton.disabled = !canSelectInputDevice;
    this.refreshGamepadsButton.ariaDisabled = this.refreshGamepadsButton.disabled ? "true" : "false";
    this.captureKeyboardButton.classList.toggle("has-used-input", canHighlightUsedInputs && selectedInputs.some(usesKeyboard));
    this.captureMouseButton.classList.toggle("has-used-input", canHighlightUsedInputs && selectedInputs.some(usesMouse));
    this.renderGamepadButtons(gamepads, selectedInputs, canHighlightUsedInputs, canSelectInputDevice && captureAvailability.gamepad);
    this.applySelectedCaptureState();
    this.applyCaptureState();
  }

  setCaptureButtonEnabled(button, isEnabled, captureId) {
    const isActive = this.activeCaptureId === captureId;
    button.disabled = !isEnabled && !isActive;
    button.ariaDisabled = button.disabled ? "true" : "false";
  }

  renderGamepadButtons(gamepads, selectedInputs, canHighlightUsedInputs, canCaptureGamepad = true) {
    if (!gamepads.length) {
      const empty = document.createElement("p");
      empty.className = "tool-starter__hint input-mapping-v2__gamepad-empty";
      empty.textContent = "No gamepads detected. Click inside this page and press a controller button to make the browser expose it.";
      this.captureGamepadButtons.replaceChildren(empty);
      return;
    }

    this.captureGamepadButtons.replaceChildren(...gamepads.map((gamepad) => {
      const button = document.createElement("button");
      button.type = "button";
      const captureId = this.gamepadCaptureId(gamepad.index);
      const isUsed = canHighlightUsedInputs && selectedInputs.some((input) => usesGamepadIndex(input, gamepad.index));
      const isSelected = this.selectedCaptureId === captureId;
      button.className = `input-mapping-v2__gamepad-capture-button${this.activeCaptureId === captureId ? " is-capturing" : ""}${isSelected ? " is-selected-capture-device" : ""}${isUsed ? " has-used-input" : ""}`;
      button.dataset.inputMappingGamepadIndex = String(gamepad.index);
      button.disabled = !canCaptureGamepad && this.activeCaptureId !== captureId;
      button.ariaDisabled = button.disabled ? "true" : "false";
      button.ariaPressed = this.activeCaptureId === captureId ? "true" : "false";
      button.textContent = gamepad.captureLines.join("\n");
      button.title = `Capture input from ${gamepad.label}`;
      button.addEventListener("click", () => {
        this.onCaptureGamepad(gamepad.index);
      });
      return button;
    }));
  }

  showMessage(message) {
    this.captureMessage.textContent = message;
  }

  setCaptureState(state) {
    this.captureState = state || "idle";
    this.applyCaptureState();
  }

  setActiveCapture(captureId) {
    this.activeCaptureId = captureId;
    this.captureKeyboardButton.classList.toggle("is-capturing", captureId === "keyboard");
    this.captureKeyboardButton.ariaPressed = captureId === "keyboard" ? "true" : "false";
    this.captureMouseButton.classList.toggle("is-capturing", captureId === "mouse");
    this.captureMouseButton.ariaPressed = captureId === "mouse" ? "true" : "false";
    this.captureGamepadButtons.querySelectorAll(".input-mapping-v2__gamepad-capture-button").forEach((button) => {
      const isActive = captureId === this.gamepadCaptureId(button.dataset.inputMappingGamepadIndex);
      button.classList.toggle("is-capturing", isActive);
      button.ariaPressed = isActive ? "true" : "false";
    });
    this.applyCaptureState();
  }

  setSelectedCapture(captureId) {
    this.selectedCaptureId = captureId;
    this.applySelectedCaptureState();
  }

  clearActiveCapture() {
    this.setActiveCapture("");
    this.setCaptureState("idle");
  }

  gamepadCaptureId(index) {
    return `gamepad:${Number(index)}`;
  }

  applyCaptureState() {
    const state = this.captureState || "idle";
    this.captureMessage.dataset.inputMappingCaptureState = state;
    this.allCaptureButtons().forEach((button) => {
      const isActive = this.captureIdForButton(button) === this.activeCaptureId;
      CAPTURE_STATE_CLASSES.forEach((className) => {
        button.classList.remove(className);
      });
      if (isActive && state !== "idle") {
        button.classList.add(`is-capture-${state}`);
        button.dataset.inputMappingCaptureState = state;
      } else {
        delete button.dataset.inputMappingCaptureState;
      }
    });
  }

  applySelectedCaptureState() {
    this.allCaptureButtons().forEach((button) => {
      const isSelected = this.captureIdForButton(button) === this.selectedCaptureId;
      button.classList.toggle("is-selected-capture-device", isSelected);
      if (isSelected) {
        button.dataset.inputMappingSelectedCaptureDevice = "true";
      } else {
        delete button.dataset.inputMappingSelectedCaptureDevice;
      }
    });
  }

  setSectionDisabled(isDisabled) {
    this.captureKeyboardButton
      .closest(".tool-starter__accordion")
      ?.classList.toggle("input-mapping-v2__section-disabled", isDisabled);
  }

  allCaptureButtons() {
    return [
      this.captureKeyboardButton,
      this.captureMouseButton,
      ...this.captureGamepadButtons.querySelectorAll(".input-mapping-v2__gamepad-capture-button")
    ];
  }

  captureIdForButton(button) {
    if (button === this.captureKeyboardButton) {
      return "keyboard";
    }
    if (button === this.captureMouseButton) {
      return "mouse";
    }
    return this.gamepadCaptureId(button.dataset.inputMappingGamepadIndex);
  }
}

const CAPTURE_STATE_CLASSES = [
  "is-capture-waiting",
  "is-capture-pending",
  "is-capture-complete",
  "is-capture-canceled",
  "is-capture-warning"
];

function usesKeyboard(input) {
  return input.source === "keyboard" || comboParts(input).some(isKeyboardBinding);
}

function usesMouse(input) {
  return input.source === "mouse" || comboParts(input).some((binding) => binding.startsWith("Mouse"));
}

function usesGamepadIndex(input, gamepadIndex) {
  const prefix = `Pad${Number(gamepadIndex)}:`;
  return input.binding?.startsWith(prefix) || comboParts(input).some((binding) => binding.startsWith(prefix));
}

function comboParts(input) {
  const binding = String(input.binding || "");
  return binding.startsWith("Combo:") ? binding.slice("Combo:".length).split("+") : [];
}

function isKeyboardBinding(binding) {
  return /^(?:Key[A-Z]|Digit[0-9]|Control|Shift|Alt|Meta|Space|Enter|Escape|Tab|Backspace|Delete)/.test(binding);
}

function stopHeaderToggle(checkbox) {
  checkbox.closest("label")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  checkbox.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

function allCaptureAvailable() {
  return {
    gamepad: true,
    keyboard: true,
    mouse: true
  };
}
