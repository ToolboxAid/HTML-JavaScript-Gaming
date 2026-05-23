export class GestureListControl {
  constructor(container) {
    this.container = container;
    this.onGestureSelected = () => {};
  }

  mount({ onGestureSelected }) {
    this.onGestureSelected = onGestureSelected;
  }

  render(gestures, selectedGestureBinding = "", selectedCaptureSource = "", canCaptureGesture = true) {
    this.setSectionDisabled(!canCaptureGesture || !selectedCaptureSource);
    if (!gestures.length) {
      const empty = document.createElement("p");
      empty.className = "tool-starter__hint";
      empty.textContent = "Enable a supported device to show input gestures.";
      this.container.replaceChildren(empty);
      return;
    }

    const groups = groupGestures(gestures);
    this.container.replaceChildren(...groups.map((group) => this.createGestureGroup(group, selectedGestureBinding, selectedCaptureSource, canCaptureGesture)));
  }

  createGestureGroup(group, selectedGestureBinding, selectedCaptureSource, canCaptureGesture) {
    const section = document.createElement("article");
    const isDisabled = !canCaptureGesture || !selectedCaptureSource || group.source !== selectedCaptureSource;
    section.className = `input-mapping-v2__gesture-group${isDisabled ? " is-disabled" : ""}`;
    section.dataset.inputMappingGestureDevice = group.deviceLabel;
    section.dataset.inputMappingGestureSource = group.source;

    const title = document.createElement("strong");
    title.textContent = group.deviceLabel;

    const list = document.createElement("div");
    list.className = "input-mapping-v2__gesture-list";
    list.append(...group.gestures.map((gesture) => this.createGestureButton(gesture, selectedGestureBinding, selectedCaptureSource, canCaptureGesture)));

    section.append(title, list);
    return section;
  }

  createGestureButton(gesture, selectedGestureBinding, selectedCaptureSource, canCaptureGesture) {
    const button = document.createElement("button");
    button.type = "button";
    const isSelected = gesture.binding === selectedGestureBinding;
    const isDisabled = !canCaptureGesture || !selectedCaptureSource || gesture.source !== selectedCaptureSource;
    button.className = `input-mapping-v2__gesture-button${isSelected ? " is-selected" : ""}${isDisabled ? " is-disabled" : ""}`;
    button.dataset.inputMappingGestureBinding = gesture.binding;
    button.dataset.inputMappingGestureSource = gesture.source;
    button.disabled = isDisabled;
    button.ariaDisabled = isDisabled ? "true" : "false";
    button.ariaPressed = isSelected ? "true" : "false";
    button.textContent = gesture.label;
    button.title = gesture.title;
    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
      button.addEventListener(eventName, (event) => {
        event.stopPropagation();
      });
    });
    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }
      this.onGestureSelected(gesture);
    });
    return button;
  }

  setSectionDisabled(isDisabled) {
    this.container
      .closest(".tool-starter__accordion")
      ?.classList.toggle("input-mapping-v2__section-disabled", isDisabled);
  }
}

function groupGestures(gestures) {
  const groups = [];
  for (const gesture of gestures) {
    let group = groups.find((candidate) => candidate.deviceLabel === gesture.deviceLabel);
    if (!group) {
      group = { deviceLabel: gesture.deviceLabel, gestures: [], source: gesture.source };
      groups.push(group);
    }
    group.gestures.push(gesture);
  }
  return groups;
}
