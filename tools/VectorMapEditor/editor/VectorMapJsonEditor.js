/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapJsonEditor.js
*/
export class VectorMapJsonEditor {
  constructor(textareaElement) {
    this.textareaElement = textareaElement;
    this.lastValidText = "";
  }

  setValue(text) {
    this.lastValidText = text;
    this.textareaElement.value = text;
  }

  getValue() {
    return this.textareaElement.value;
  }

  prettyPrint() {
    const parsed = JSON.parse(this.getValue());
    const text = JSON.stringify(parsed, null, 2);
    this.textareaElement.value = text;
    return text;
  }

  revert() {
    this.textareaElement.value = this.lastValidText;
  }

  validate() {
    const parsed = JSON.parse(this.getValue());
    return parsed;
  }
}
