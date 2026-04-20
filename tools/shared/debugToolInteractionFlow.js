function isTextEntryElement(element) {
  return element instanceof HTMLInputElement
    || element instanceof HTMLTextAreaElement
    || (element instanceof HTMLElement && element.isContentEditable === true);
}

export function setupDebugToolInteractionFlow(options) {
  const {
    root = document,
    primaryButton = null,
    escapeAction = null,
    statusElement = null
  } = options || {};

  const keyboardRoot = root instanceof Document ? root : document;

  if (statusElement instanceof HTMLElement) {
    statusElement.classList.add("debug-tool-status");
    if (!statusElement.hasAttribute("role")) {
      statusElement.setAttribute("role", "status");
    }
    if (!statusElement.hasAttribute("aria-live")) {
      statusElement.setAttribute("aria-live", "polite");
    }
  }

  const buttons = Array.from(keyboardRoot.querySelectorAll("button"));
  for (const button of buttons) {
    if (!(button instanceof HTMLButtonElement)) {
      continue;
    }
    button.classList.add("debug-tool-control");
    if (!button.hasAttribute("type")) {
      button.type = "button";
    }
  }

  const fields = Array.from(keyboardRoot.querySelectorAll("input, textarea, select"));
  for (const field of fields) {
    if (field instanceof HTMLElement) {
      field.classList.add("debug-tool-field");
    }
  }

  const labels = Array.from(keyboardRoot.querySelectorAll("label"));
  for (const label of labels) {
    if (label instanceof HTMLLabelElement) {
      label.classList.add("debug-tool-label");
    }
  }

  function triggerPrimaryAction() {
    if (!(primaryButton instanceof HTMLButtonElement) || primaryButton.disabled) {
      return false;
    }
    primaryButton.click();
    return true;
  }

  function handleKeydown(event) {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === "Escape" && typeof escapeAction === "function") {
      event.preventDefault();
      escapeAction();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const target = event.target;
    if (target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement) {
      return;
    }
    if (isTextEntryElement(target)) {
      return;
    }

    if (triggerPrimaryAction()) {
      event.preventDefault();
    }
  }

  keyboardRoot.addEventListener("keydown", handleKeydown);

  if (primaryButton instanceof HTMLButtonElement) {
    window.requestAnimationFrame(() => {
      if (document.activeElement === document.body) {
        primaryButton.focus();
      }
    });
  }

  return () => {
    keyboardRoot.removeEventListener("keydown", handleKeydown);
  };
}
