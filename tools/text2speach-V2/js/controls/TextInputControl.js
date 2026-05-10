export class TextInputControl {
  constructor({ input }) {
    this.input = input;
    this.onInput = () => {};
  }

  mount({ onInput }) {
    this.onInput = onInput;
    this.input.addEventListener("input", () => {
      this.onInput(this.text());
    });
  }

  setText(text) {
    this.input.value = String(text || "");
    this.onInput(this.text());
  }

  text() {
    return this.input.value.trim();
  }

  hasText() {
    return this.text().length > 0;
  }
}
