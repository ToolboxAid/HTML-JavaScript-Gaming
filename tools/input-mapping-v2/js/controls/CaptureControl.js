export class CaptureControl {
  constructor({
    captureGamepadButton,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    selectedActionLabel
  }) {
    this.captureGamepadButton = captureGamepadButton;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.selectedActionLabel = selectedActionLabel;
  }

  mount({ onCaptureGamepad, onCaptureKeyboard, onCaptureMouse }) {
    this.captureGamepadButton.addEventListener("click", onCaptureGamepad);
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
  }

  render(actionLabel) {
    this.selectedActionLabel.textContent = `Selected action: ${actionLabel}`;
  }

  showMessage(message) {
    this.captureMessage.textContent = message;
  }
}
