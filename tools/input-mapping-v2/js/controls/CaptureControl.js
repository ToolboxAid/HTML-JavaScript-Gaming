export class CaptureControl {
  constructor({
    captureGamepadButtons,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    refreshGamepadsButton,
    selectedActionLabel
  }) {
    this.captureGamepadButtons = captureGamepadButtons;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.activeCaptureId = "";
    this.onCaptureGamepad = () => {};
    this.refreshGamepadsButton = refreshGamepadsButton;
    this.selectedActionLabel = selectedActionLabel;
  }

  mount({ onCaptureGamepad, onCaptureKeyboard, onCaptureMouse, onRefreshGamepads }) {
    this.onCaptureGamepad = onCaptureGamepad;
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
    this.refreshGamepadsButton.addEventListener("click", onRefreshGamepads);
  }

  render(actionLabel, gamepads = []) {
    this.selectedActionLabel.textContent = `Selected action: ${actionLabel}`;
    this.renderGamepadButtons(gamepads);
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
