export class StudioTabsControl {
  constructor({ buttons = [], defaultTab = "studio", panels = [] } = {}) {
    this.buttons = buttons;
    this.defaultTab = defaultTab;
    this.panels = panels;
  }

  mount() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.selectTab(button.dataset.midiStudioTab || this.defaultTab));
    });
    this.selectTab(this.defaultTab);
  }

  selectTab(tabId) {
    const activeTab = String(tabId || this.defaultTab).trim() || this.defaultTab;
    this.buttons.forEach((button) => {
      const selected = button.dataset.midiStudioTab === activeTab;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });
    this.panels.forEach((panel) => {
      const tabs = String(panel.dataset.midiStudioTabPanel || "")
        .split(/\s+/)
        .filter(Boolean);
      panel.hidden = !tabs.includes(activeTab);
    });
  }
}
