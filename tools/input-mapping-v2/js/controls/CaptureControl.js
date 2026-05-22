export class CaptureControl {
  constructor({
    captureComboButton,
    captureGamepadButtons,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    capturePointerDragButtons,
    refreshGamepadsButton,
    selectedActionLabel
  }) {
    this.captureComboButton = captureComboButton;
    this.captureGamepadButtons = captureGamepadButtons;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.capturePointerDragButtons = capturePointerDragButtons;
    this.activeCaptureId = "";
    this.onCaptureGamepad = () => {};
    this.onCapturePointerDrag = () => {};
    this.refreshGamepadsButton = refreshGamepadsButton;
    this.selectedActionLabel = selectedActionLabel;
  }

  mount({ onCaptureCombo, onCaptureGamepad, onCaptureKeyboard, onCaptureMouse, onCapturePointerDrag, onRefreshGamepads }) {
    this.onCaptureGamepad = onCaptureGamepad;
    this.onCapturePointerDrag = onCapturePointerDrag;
    this.captureComboButton.addEventListener("click", onCaptureCombo);
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
    this.refreshGamepadsButton.addEventListener("click", onRefreshGamepads);
  }

  render(actionLabel, gamepads = [], pointerDragDescriptors = []) {
    this.selectedActionLabel.textContent = `Selected action: ${actionLabel}`;
    this.renderPointerDragButtons(pointerDragDescriptors);
    this.renderGamepadButtons(gamepads);
  }

  renderPointerDragButtons(pointerDragDescriptors) {
    this.capturePointerDragButtons.replaceChildren(...pointerDragDescriptors.map((descriptor) => {
      const button = document.createElement("button");
      button.type = "button";
      const captureId = this.pointerDragCaptureId(descriptor.binding);
      button.className = `input-mapping-v2__capture-button input-mapping-v2__pointer-drag-capture-button${this.activeCaptureId === captureId ? " is-capturing" : ""}`;
      button.dataset.inputMappingPointerDragBinding = descriptor.binding;
      button.ariaPressed = this.activeCaptureId === captureId ? "true" : "false";
      button.textContent = descriptor.label;
      button.title = descriptor.title || descriptor.label;
      button.addEventListener("click", () => {
        this.onCapturePointerDrag(descriptor.binding);
      });
      return button;
    }));
  }

  renderGamepadButtons(gamepads) {
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
      button.className = `input-mapping-v2__gamepad-capture-button${this.activeCaptureId === captureId ? " is-capturing" : ""}`;
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

  showMessage(message) {
    this.captureMessage.textContent = message;
  }

  setActiveCapture(captureId) {
    this.activeCaptureId = captureId;
    this.captureKeyboardButton.classList.toggle("is-capturing", captureId === "keyboard");
    this.captureKeyboardButton.ariaPressed = captureId === "keyboard" ? "true" : "false";
    this.captureMouseButton.classList.toggle("is-capturing", captureId === "mouse");
    this.captureMouseButton.ariaPressed = captureId === "mouse" ? "true" : "false";
    this.captureComboButton.classList.toggle("is-capturing", captureId === "combo");
    this.captureComboButton.ariaPressed = captureId === "combo" ? "true" : "false";
    this.capturePointerDragButtons.querySelectorAll(".input-mapping-v2__pointer-drag-capture-button").forEach((button) => {
      const isActive = captureId === this.pointerDragCaptureId(button.dataset.inputMappingPointerDragBinding);
      button.classList.toggle("is-capturing", isActive);
      button.ariaPressed = isActive ? "true" : "false";
    });
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

  pointerDragCaptureId(binding) {
    return `pointer-drag:${binding}`;
  }
}
