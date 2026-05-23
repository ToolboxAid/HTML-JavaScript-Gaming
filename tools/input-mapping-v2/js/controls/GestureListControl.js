export class GestureListControl {
  constructor(container) {
    this.container = container;
    this.onGestureSelected = () => {};
  }

  mount({ onGestureSelected }) {
    this.onGestureSelected = onGestureSelected;
  }

  render(gestures, selectedGestureBinding = "") {
    if (!gestures.length) {
      const empty = document.createElement("p");
      empty.className = "tool-starter__hint";
      empty.textContent = "Enable a supported device to show input gestures.";
      this.container.replaceChildren(empty);
      return;
    }

    const groups = groupGestures(gestures);
    this.container.replaceChildren(...groups.map((group) => this.createGestureGroup(group, selectedGestureBinding)));
  }

  createGestureGroup(group, selectedGestureBinding) {
    const section = document.createElement("article");
    section.className = "input-mapping-v2__gesture-group";
    section.dataset.inputMappingGestureDevice = group.deviceLabel;

    const title = document.createElement("strong");
    title.textContent = group.deviceLabel;

    const list = document.createElement("div");
    list.className = "input-mapping-v2__gesture-list";
    list.append(...group.gestures.map((gesture) => this.createGestureButton(gesture, selectedGestureBinding)));

    section.append(title, list);
    return section;
  }

  createGestureButton(gesture, selectedGestureBinding) {
    const button = document.createElement("button");
    button.type = "button";
    const isSelected = gesture.binding === selectedGestureBinding;
    button.className = `input-mapping-v2__gesture-button${isSelected ? " is-selected" : ""}`;
    button.dataset.inputMappingGestureBinding = gesture.binding;
    button.ariaPressed = isSelected ? "true" : "false";
    button.textContent = gesture.label;
    button.title = gesture.title;
    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
      button.addEventListener(eventName, (event) => {
        event.stopPropagation();
      });
    });
    button.addEventListener("click", () => {
      this.onGestureSelected(gesture);
    });
    return button;
  }
}

function groupGestures(gestures) {
  const groups = [];
  for (const gesture of gestures) {
    let group = groups.find((candidate) => candidate.deviceLabel === gesture.deviceLabel);
    if (!group) {
      group = { deviceLabel: gesture.deviceLabel, gestures: [] };
      groups.push(group);
    }
    group.gestures.push(gesture);
  }
  return groups;
}
