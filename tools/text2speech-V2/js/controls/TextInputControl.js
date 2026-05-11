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

  setText(text, { emit = true } = {}) {
    this.input.value = String(text || "");
    if (emit) {
      this.onInput(this.text());
    }
  }

  text() {
    return this.input.value.trim();
  }

  hasText() {
    return this.text().length > 0;
  }
}
