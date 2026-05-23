export class CaptureControl {
  constructor({
    captureGamepadButtons,
    captureKeyboardButton,
    captureMessage,
    captureMouseButton,
    disableContextCheckbox,
    refreshGamepadsButton,
    selectedActionLabel,
    suppressShortcutsCheckbox,
    usedInputHighlights
  }) {
    this.captureGamepadButtons = captureGamepadButtons;
    this.captureKeyboardButton = captureKeyboardButton;
    this.captureMessage = captureMessage;
    this.captureMouseButton = captureMouseButton;
    this.disableContextCheckbox = disableContextCheckbox;
    this.activeCaptureId = "";
    this.onCaptureGamepad = () => {};
    this.refreshGamepadsButton = refreshGamepadsButton;
    this.selectedActionLabel = selectedActionLabel;
    this.suppressShortcutsCheckbox = suppressShortcutsCheckbox;
    this.usedInputHighlights = usedInputHighlights;
  }

  mount({ onCaptureGamepad, onCaptureKeyboard, onCaptureMouse, onDisableContextChanged, onRefreshGamepads, onSuppressShortcutsChanged }) {
    this.onCaptureGamepad = onCaptureGamepad;
    this.captureKeyboardButton.addEventListener("click", onCaptureKeyboard);
    this.captureMouseButton.addEventListener("click", onCaptureMouse);
    stopHeaderToggle(this.disableContextCheckbox);
    stopHeaderToggle(this.suppressShortcutsCheckbox);
    this.disableContextCheckbox.addEventListener("change", () => {
      onDisableContextChanged(this.disableContextCheckbox.checked);
    });
    this.suppressShortcutsCheckbox.addEventListener("change", () => {
      onSuppressShortcutsChanged(this.suppressShortcutsCheckbox.checked);
    });
    this.refreshGamepadsButton.addEventListener("click", onRefreshGamepads);
  }

  render(actionLabel, gamepads = [], selectedInputs = [], captureMode = "") {
    this.selectedActionLabel.textContent = `Selected action: ${actionLabel}`;
    const canHighlightUsedInputs = !captureMode;
    this.captureKeyboardButton.classList.toggle("has-used-input", canHighlightUsedInputs && selectedInputs.some(usesKeyboard));
    this.captureMouseButton.classList.toggle("has-used-input", canHighlightUsedInputs && selectedInputs.some(usesMouse));
    this.renderGamepadButtons(gamepads, selectedInputs, canHighlightUsedInputs);
    this.renderUsedInputHighlights(selectedInputs, canHighlightUsedInputs);
  }

  renderGamepadButtons(gamepads, selectedInputs, canHighlightUsedInputs) {
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
      const isUsed = canHighlightUsedInputs && selectedInputs.some((input) => usesGamepadIndex(input, gamepad.index));
      button.className = `input-mapping-v2__gamepad-capture-button${this.activeCaptureId === captureId ? " is-capturing" : ""}${isUsed ? " has-used-input" : ""}`;
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

  renderUsedInputHighlights(selectedInputs, canHighlightUsedInputs) {
    if (!canHighlightUsedInputs || !selectedInputs.length) {
      this.usedInputHighlights.hidden = true;
      this.usedInputHighlights.replaceChildren();
      return;
    }

    const groups = [
      { id: "keyboard", label: "Keyboard", inputs: selectedInputs.filter(usesKeyboard) },
      { id: "mouse", label: "Mouse", inputs: selectedInputs.filter(usesMouse) },
      { id: "gameController", label: "Game Controller", inputs: selectedInputs.filter(usesGamepad) }
    ].filter((group) => group.inputs.length);

    this.usedInputHighlights.hidden = !groups.length;
    this.usedInputHighlights.replaceChildren(...groups.map((group) => {
      const section = document.createElement("section");
      section.className = "input-mapping-v2__used-source is-selected-mapping-source";
      section.dataset.inputMappingUsedSource = group.label;
      section.dataset.inputMappingUsedSourceId = group.id;

      const title = document.createElement("strong");
      title.textContent = group.label;

      const controls = document.createElement("div");
      controls.className = "input-mapping-v2__used-controls";
      controls.append(...usedControlSummaries(group.inputs, group.id).map((summary) => {
        const control = document.createElement("span");
        control.className = "input-mapping-v2__used-control is-selected-mapping-input";
        control.dataset.inputMappingUsedBinding = summary.binding;
        control.dataset.inputMappingUsedControl = summary.control;
        control.dataset.inputMappingUsedGesture = summary.gesture;
        control.dataset.inputMappingUsedSourceId = group.id;
        control.ariaCurrent = "true";
        control.textContent = summary.label;
        control.title = summary.title;
        return control;
      }));

      section.append(title, controls);
      return section;
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

function usesKeyboard(input) {
  return input.source === "keyboard" || comboParts(input).some(isKeyboardBinding);
}

function usesMouse(input) {
  return input.source === "mouse" || comboParts(input).some((binding) => binding.startsWith("Mouse"));
}

function usesGamepad(input) {
  return input.source === "gamepad" || comboParts(input).some((binding) => binding.startsWith("Pad"));
}

function usesGamepadIndex(input, gamepadIndex) {
  const prefix = `Pad${Number(gamepadIndex)}:`;
  return input.binding?.startsWith(prefix) || comboParts(input).some((binding) => binding.startsWith(prefix));
}

function comboParts(input) {
  const binding = String(input.binding || "");
  return binding.startsWith("Combo:") ? binding.slice("Combo:".length).split("+") : [];
}

function isKeyboardBinding(binding) {
  return /^(?:Key[A-Z]|Digit[0-9]|Control|Shift|Alt|Meta|Space|Enter|Escape|Tab|Backspace|Delete)/.test(binding);
}

function inputSummary(input) {
  if (Array.isArray(input.displayLabelLines) && input.displayLabelLines.length) {
    return input.displayLabelLines.map((line) => String(line || "").trim()).filter(Boolean).join(" ");
  }
  return input.label;
}

function usedControlSummaries(inputs, sourceId) {
  return inputs.flatMap((input) => {
    const parts = comboPartSummaries(input).filter((part) => part.sourceId === sourceId);
    if (parts.length) {
      return parts;
    }
    return [inputControlSummary(input, sourceId)];
  });
}

function comboPartSummaries(input) {
  const parts = comboParts(input);
  if (!parts.length) {
    return [];
  }
  const labels = comboLabels(input, parts.length);
  return parts.map((binding, index) => {
    const sourceId = sourceIdForBinding(binding);
    const label = formatUsedControlLabel(sourceId, labels[index] || binding);
    return {
      binding,
      control: controlBinding(binding),
      gesture: "Combo",
      label,
      sourceId,
      title: input.title || label
    };
  });
}

function inputControlSummary(input, sourceId) {
  const lines = inputDisplayLines(input);
  const label = inputControlLabel(input, sourceId, lines);
  const gesture = inputGestureLabel(input, lines);
  return {
    binding: input.binding || "",
    control: controlBinding(input.binding || ""),
    gesture,
    label,
    sourceId,
    title: usedControlTitle(input, gesture)
  };
}

function inputDisplayLines(input) {
  return Array.isArray(input.displayLabelLines)
    ? input.displayLabelLines.map((line) => String(line || "").trim()).filter(Boolean)
    : [];
}

function inputControlLabel(input, sourceId, lines) {
  if (sourceId === "keyboard") {
    return formatUsedControlLabel(sourceId, lines[1] || controlBinding(input.binding || "") || input.label);
  }
  if (sourceId === "mouse") {
    return mouseControlLabel(input, lines);
  }
  if (sourceId === "gameController") {
    return formatUsedControlLabel(sourceId, lines[1] || controlBinding(input.binding || "") || input.label);
  }
  return inputSummary(input);
}

function mouseControlLabel(input, lines) {
  if (lines[0]?.startsWith("Mouse ")) {
    return lines[0];
  }
  return formatUsedControlLabel("mouse", lines[1] || controlBinding(input.binding || "") || input.label);
}

function inputGestureLabel(input, lines) {
  if (input.binding?.startsWith("Combo:")) {
    return "Combo";
  }
  if (lines[0]?.startsWith("Mouse ") && lines[1]) {
    return lines[1];
  }
  return lines[2] || "";
}

function usedControlTitle(input, gesture) {
  const title = input.title || inputSummary(input);
  if (!gesture || title.includes(gesture)) {
    return title;
  }
  return `${title}\n${gesture}`;
}

function comboLabels(input, expectedCount) {
  const comboLine = Array.isArray(input.displayLabelLines)
    ? String(input.displayLabelLines[1] || "")
    : "";
  const labels = comboLine.split(" + ").map((label) => label.trim()).filter(Boolean);
  return labels.length === expectedCount ? labels : [];
}

function sourceIdForBinding(binding) {
  if (binding.startsWith("Mouse")) {
    return "mouse";
  }
  if (binding.startsWith("Pad")) {
    return "gameController";
  }
  return "keyboard";
}

function formatUsedControlLabel(sourceId, label) {
  if (sourceId === "keyboard") {
    return label.startsWith("Keyboard ") ? label : `Keyboard ${label}`;
  }
  if (sourceId === "mouse") {
    return label.startsWith("Mouse ") ? label : `Mouse ${label}`;
  }
  if (sourceId === "gameController") {
    return label.startsWith("Game Controller ") ? label : `Game Controller ${label}`;
  }
  return label;
}

function controlBinding(binding) {
  const value = String(binding || "");
  if (/^Pad\d+:(?:Button|Axis)/.test(value)) {
    return value.replace(/:GameController[A-Za-z]+$/, "");
  }
  return value.split(":")[0];
}

function stopHeaderToggle(checkbox) {
  checkbox.closest("label")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  checkbox.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}
