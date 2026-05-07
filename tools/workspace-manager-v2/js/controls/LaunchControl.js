export class LaunchControl {
  constructor(button) {
    this.button = button;
  }

  mount({ onLaunch }) {
    this.button.addEventListener("click", onLaunch);
  }

  setEnabled(isEnabled) {
    this.button.disabled = !isEnabled;
  }
}
