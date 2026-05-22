export class CaptureControl {
  constructor({
    captureGamepadButtons,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    refreshGamepadsButton,
    selectedActionLabel,
    startGamepadPollingButton
  }) {
    this.captureGamepadButtons = captureGamepadButtons;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.onCaptureGamepad = () => {};
    this.refreshGamepadsButton = refreshGamepadsButton;
    this.selectedActionLabel = selectedActionLabel;
    this.startGamepadPollingButton = startGamepadPollingButton;
  }

  mount({ onCaptureGamepad, onCaptureKeyboard, onCaptureMouse, onRefreshGamepads, onStartGamepadPolling }) {
    this.onCaptureGamepad = onCaptureGamepad;
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
    this.refreshGamepadsButton.addEventListener("click", onRefreshGamepads);
    this.startGamepadPollingButton.addEventListener("click", onStartGamepadPolling);
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
      button.className = "input-mapping-v2__gamepad-capture-button";
      button.dataset.inputMappingGamepadIndex = String(gamepad.index);
      button.textContent = `Capture ${gamepad.label}`;
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
}
