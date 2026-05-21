export class DeviceListControl {
  constructor(container) {
    this.container = container;
  }

  render(devices) {
    if (!this.container) {
      return;
    }
    this.container.replaceChildren(...devices.map((device) => {
      const card = document.createElement("article");
      card.className = "input-mapping-v2__device-card";
      const name = document.createElement("strong");
      name.textContent = device.name;
      const detail = document.createElement("p");
      detail.className = "input-mapping-v2__readout";
      detail.textContent = device.detail;
      card.append(name, detail);
      return card;
    }));
  }
}
