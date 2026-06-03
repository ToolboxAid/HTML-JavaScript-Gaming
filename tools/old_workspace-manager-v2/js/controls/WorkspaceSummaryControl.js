export class WorkspaceSummaryControl {
  constructor({
    contextOutput,
    copyButton,
    documentRef = document,
    navigatorRef = navigator
  }) {
    this.contextOutput = contextOutput;
    this.copyButton = copyButton;
    this.document = documentRef;
    this.navigator = navigatorRef;
  }

  mount({ onCopy } = {}) {
    if (!this.copyButton || this.copyButton.dataset.workspaceJsonCopyBound === "true") {
      return;
    }
    this.copyButton.dataset.workspaceJsonCopyBound = "true";
    const handleCopy = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof onCopy === "function") {
        void onCopy();
      }
    };
    this.copyButton.addEventListener("click", handleCopy);
  }

  clear() {
    this.setValue("{}");
  }

  render({ context }) {
    this.setValue(JSON.stringify(context, null, 2));
  }

  setValue(value) {
    if ("value" in this.contextOutput) {
      this.contextOutput.value = value;
      return;
    }
    this.contextOutput.textContent = value;
  }

  getValue() {
    return "value" in this.contextOutput
      ? this.contextOutput.value
      : this.contextOutput.textContent || "";
  }

  copyWithSelectionFallback(text) {
    if (typeof this.document?.execCommand !== "function" || !this.document.body) {
      return false;
    }
    const textarea = this.document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-10000px";
    textarea.style.top = "0";
    this.document.body.append(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = this.document.execCommand("copy");
    } finally {
      textarea.remove();
    }
    return copied;
  }

  async copyToClipboard() {
    const text = this.getValue();
    const clipboard = this.navigator?.clipboard;
    const clipboardErrorMessages = [];
    if (typeof clipboard?.writeText === "function") {
      try {
        await clipboard.writeText(text);
        return { ok: true, copiedLength: text.length, method: "clipboard" };
      } catch (error) {
        clipboardErrorMessages.push(error.message);
      }
    } else {
      clipboardErrorMessages.push("Clipboard API is unavailable.");
    }

    try {
      if (this.copyWithSelectionFallback(text)) {
        return { ok: true, copiedLength: text.length, method: "selection" };
      }
    } catch (error) {
      clipboardErrorMessages.push(error.message);
    }

    return {
      ok: false,
      message: clipboardErrorMessages.filter(Boolean).join(" ") || "Clipboard copy failed."
    };
  }
}
