export class DeviceListControl {
  constructor({ container, rumbleFeedbackCheckbox }) {
    this.container = container;
    this.rumbleFeedbackCheckbox = rumbleFeedbackCheckbox;
    this.rumbleFeedbackField = rumbleFeedbackCheckbox.closest(".input-mapping-v2__checkbox-field");
    this.onDeviceEnabledChanged = () => {};
  }

  mount({ onDeviceEnabledChanged, onRumbleFeedbackChanged }) {
    this.onDeviceEnabledChanged = onDeviceEnabledChanged;
    this.rumbleFeedbackCheckbox.addEventListener("change", () => {
      onRumbleFeedbackChanged(this.rumbleFeedbackCheckbox.checked);
    });
  }

  render(devices, enabledDeviceIds) {
    this.container.replaceChildren(...devices.map((device) => this.createDeviceCard(device, enabledDeviceIds)));
  }

  createDeviceCard(device, enabledDeviceIds) {
    const card = document.createElement("article");
    card.className = `input-mapping-v2__device-card${device.available ? "" : " is-unavailable"}`;
    card.dataset.inputMappingDeviceId = device.id;

    const label = document.createElement("label");
    label.className = "input-mapping-v2__device-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabledDeviceIds.has(device.id);
    checkbox.disabled = !device.available;
    checkbox.addEventListener("change", () => {
      this.onDeviceEnabledChanged(device.id, checkbox.checked);
    });

    const title = document.createElement("strong");
    title.textContent = device.label;

    label.append(checkbox, title);

    const detail = document.createElement("p");
    detail.textContent = device.detail;

    const engine = document.createElement("code");
    engine.textContent = device.engine;

    card.append(label, detail, engine);
    if (device.id === "gameController" && this.rumbleFeedbackField) {
      card.append(this.rumbleFeedbackField);
    }
    if (!device.available && device.emptyState) {
      const empty = document.createElement("p");
      empty.className = "tool-starter__hint";
      empty.textContent = device.emptyState;
      card.append(empty);
    }
    return card;
  }
}
