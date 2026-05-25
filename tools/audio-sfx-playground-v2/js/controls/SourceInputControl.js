export class SourceInputControl {
  constructor({ input, validationMessage }) {
    this.input = input;
    this.validationMessage = validationMessage;
  }

  mount({ onChange }) {
    this.input.addEventListener("input", onChange);
  }

  clear() {
    this.input.value = "";
    this.showMessage("Input is required before Export can process.", false);
  }

  getValue() {
    return this.input.value.trim();
  }

  hasValue() {
    return this.getValue().length > 0;
  }

  validate() {
    const value = this.getValue();
    if (!value) {
      const message = "Source value is required.";
      this.showMessage(message, true);
      return { message, valid: false, value: "" };
    }

    this.showMessage("Source value is ready.", false);
    return { message: "Source value is ready.", valid: true, value };
  }

  showMessage(message, isError) {
    this.validationMessage.textContent = message;
    this.validationMessage.classList.toggle("is-error", isError);
  }
}
