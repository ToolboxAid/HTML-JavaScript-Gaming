export class CaptureControl {
  constructor({
    captureGamepadButtons,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    refreshGamepadsButton,
    selectedActionLabel,
    usedInputHighlights
  }) {
    this.captureGamepadButtons = captureGamepadButtons;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.activeCaptureId = "";
    this.onCaptureGamepad = () => {};
    this.refreshGamepadsButton = refreshGamepadsButton;
    this.selectedActionLabel = selectedActionLabel;
    this.usedInputHighlights = usedInputHighlights;
  }

  mount({ onCaptureGamepad, onCaptureKeyboard, onCaptureMouse, onRefreshGamepads }) {
    this.onCaptureGamepad = onCaptureGamepad;
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
    this.refreshGamepadsButton.addEventListener("click", onRefreshGamepads);
  }

  render(actionLabel, gamepads = [], selectedInputs = [], captureMode = "") {
    this.selectedActionLabel.textContent = `Selected action: ${actionLabel}`;
    const canHighlightUsedInputs = !captureMode;
    this.captureKeyboardButton.classList.toggle("has-used-input", canHighlightUsedInputs && selectedInputs.some(usesKeyboard));
    this.captureMouseButton.classList.toggle("has-used-input", canHighlightUsedInputs && selectedInputs.some(usesMouse));
    this.renderGamepadButtons(gamepads, selectedInputs, canHighlightUsedInputs);
    this.renderUsedInputHighlights(selectedInputs, canHighlightUsedInputs);
  }

  renderGamepadButtons(gamepads, selectedInputs, canHighlightUsedInputs) {
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
      button.className = `input-mapping-v2__gamepad-capture-button${this.activeCaptureId === captureId ? " is-capturing" : ""}${isUsed ? " has-used-input" : ""}`;
      button.dataset.inputMappingGamepadIndex = String(gamepad.index);
      button.ariaPressed = this.activeCaptureId === captureId ? "true" : "false";
      button.textContent = gamepad.captureLines.join("\n");
      button.title = `Capture input from ${gamepad.label}`;
      button.addEventListener("click", () => {
        this.onCaptureGamepad(gamepad.index);
      });
      return button;
    }));
  }

  renderUsedInputHighlights(selectedInputs, canHighlightUsedInputs) {
    if (!canHighlightUsedInputs || !selectedInputs.length) {
      this.usedInputHighlights.hidden = true;
      this.usedInputHighlights.replaceChildren();
      return;
    }

    const groups = [
      { label: "Keyboard", inputs: selectedInputs.filter(usesKeyboard) },
      { label: "Mouse", inputs: selectedInputs.filter(usesMouse) },
      { label: "Game Controller", inputs: selectedInputs.filter(usesGamepad) }
    ].filter((group) => group.inputs.length);

    this.usedInputHighlights.hidden = !groups.length;
    this.usedInputHighlights.replaceChildren(...groups.map((group) => {
      const section = document.createElement("section");
      section.className = "input-mapping-v2__used-source";
      section.dataset.inputMappingUsedSource = group.label;

      const title = document.createElement("strong");
      title.textContent = group.label;

      const controls = document.createElement("div");
      controls.className = "input-mapping-v2__used-controls";
      controls.append(...group.inputs.map((input) => {
        const control = document.createElement("span");
        control.className = "input-mapping-v2__used-control";
        control.textContent = inputSummary(input);
        control.title = input.title || input.label;
        return control;
      }));

      section.append(title, controls);
      return section;
    }));
  }

  showMessage(message) {
    this.captureMessage.textContent = message;
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
  }

  clearActiveCapture() {
    this.setActiveCapture("");
  }

  gamepadCaptureId(index) {
    return `gamepad:${Number(index)}`;
  }
}

function usesKeyboard(input) {
  return input.source === "keyboard" || comboParts(input).some(isKeyboardBinding);
}

function usesMouse(input) {
  return input.source === "mouse" || comboParts(input).some((binding) => binding.startsWith("Mouse"));
}

function usesGamepad(input) {
  return input.source === "gamepad" || comboParts(input).some((binding) => binding.startsWith("Pad"));
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

function inputSummary(input) {
  if (Array.isArray(input.displayLabelLines) && input.displayLabelLines.length) {
    return input.displayLabelLines.map((line) => String(line || "").trim()).filter(Boolean).join(" ");
  }
  return input.label;
}
