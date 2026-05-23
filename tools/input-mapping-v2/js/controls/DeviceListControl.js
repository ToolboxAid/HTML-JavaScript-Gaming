export class DeviceListControl {
  constructor({
    container,
    hapticsSupportList,
    rumbleDurationInput,
    rumbleFeedbackCheckbox,
    rumbleStrengthInput,
    rumbleStrengthOutput
  }) {
    this.container = container;
    this.hapticsSupportList = hapticsSupportList;
    this.rumbleDurationInput = rumbleDurationInput;
    this.rumbleFeedbackCheckbox = rumbleFeedbackCheckbox;
    this.rumbleFeedbackField = rumbleFeedbackCheckbox.closest(".input-mapping-v2__haptics-panel");
    this.rumbleStrengthInput = rumbleStrengthInput;
    this.rumbleStrengthOutput = rumbleStrengthOutput;
    this.onDeviceEnabledChanged = () => {};
    this.onTestRumble = () => {};
  }

  mount({ onDeviceEnabledChanged, onRumbleFeedbackChanged, onRumbleSettingsChanged, onTestRumble }) {
    this.onDeviceEnabledChanged = onDeviceEnabledChanged;
    this.onTestRumble = onTestRumble;
    this.rumbleFeedbackCheckbox.addEventListener("change", () => {
      onRumbleFeedbackChanged(this.rumbleFeedbackCheckbox.checked);
    });
    this.rumbleStrengthInput.addEventListener("input", () => {
      this.updateStrengthOutput();
      onRumbleSettingsChanged(this.currentRumbleSettings());
    });
    this.rumbleDurationInput.addEventListener("change", () => {
      onRumbleSettingsChanged(this.currentRumbleSettings());
    });
  }

  render(devices, enabledDeviceIds, hapticsStatus = { gamepads: [] }, selectedRumbleSettings = defaultRumbleSettings()) {
    this.renderSelectedRumbleSettings(selectedRumbleSettings);
    this.renderHapticsSupport(hapticsStatus.gamepads ?? []);
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

  renderSelectedRumbleSettings(settings) {
    this.rumbleFeedbackCheckbox.checked = settings.enabled === true;
    this.rumbleStrengthInput.value = String(settings.strength);
    this.rumbleDurationInput.value = String(settings.durationMs);
    this.updateStrengthOutput();
  }

  renderHapticsSupport(gamepads) {
    if (!gamepads.length) {
      const empty = document.createElement("p");
      empty.className = "tool-starter__hint";
      empty.textContent = "No connected game controllers expose haptics yet.";
      this.hapticsSupportList.replaceChildren(empty);
      return;
    }

    this.hapticsSupportList.replaceChildren(...gamepads.map((gamepad) => {
      const row = document.createElement("div");
      row.className = `input-mapping-v2__haptics-device${gamepad.supported ? " is-supported" : " is-unsupported"}`;
      row.dataset.inputMappingHapticsIndex = String(gamepad.index);

      const label = document.createElement("span");
      label.textContent = gamepad.supported
        ? `${gamepad.label}: haptics supported via ${gamepad.actuatorType}`
        : `${gamepad.label}: haptics unavailable`;

      row.append(label);
      if (gamepad.supported) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.inputMappingTestRumbleIndex = String(gamepad.index);
        button.textContent = "Test Rumble";
        button.addEventListener("click", () => {
          this.onTestRumble(gamepad.index, this.currentRumbleSettings());
        });
        row.append(button);
      }
      return row;
    }));
  }

  currentRumbleSettings() {
    return {
      durationMs: Number(this.rumbleDurationInput.value) || 80,
      enabled: this.rumbleFeedbackCheckbox.checked,
      strength: Number(this.rumbleStrengthInput.value) || 0
    };
  }

  updateStrengthOutput() {
    this.rumbleStrengthOutput.textContent = `${Math.round((Number(this.rumbleStrengthInput.value) || 0) * 100)}%`;
  }
}

function defaultRumbleSettings() {
  return {
    durationMs: 80,
    enabled: false,
    strength: 0.25
  };
}
