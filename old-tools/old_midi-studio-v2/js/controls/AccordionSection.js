export class AccordionSection {
  constructor(section) {
    this.section = section;
    this.header = section?.querySelector(".accordion-v2__header") || null;
    this.content = section?.querySelector(".accordion-v2__content") || null;
    this.icon = this.header?.querySelector(".accordion-v2__icon") || null;
    this.toggleButtons = Array.from(this.header?.querySelectorAll("[data-accordion-v2-toggle-button]") || []);
  }

  mount() {
    if (!this.section || !this.header || !this.content || this.header.dataset.accordionV2Bound === "true") {
      return;
    }
    this.header.dataset.accordionV2Bound = "true";
    if (this.header.tagName !== "BUTTON") {
      this.header.setAttribute("role", "button");
      this.header.tabIndex = 0;
    }
    this.setOpen(this.section.dataset.accordionV2Open !== "false");
    this.header.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactiveTarget = target?.closest("button, input, select, textarea, a");
      if (interactiveTarget && interactiveTarget !== this.header) {
        return;
      }
      this.setOpen(!this.section.classList.contains("is-open"));
    });
    this.header.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      this.setOpen(!this.section.classList.contains("is-open"));
    });
  }

  setOpen(isOpen) {
    this.section.classList.toggle("is-open", isOpen);
    this.section.dataset.accordionV2Open = String(isOpen);
    this.header.setAttribute("aria-expanded", String(isOpen));
    this.content.hidden = !isOpen;
    if (this.icon) {
      this.icon.dataset.accordionV2IconState = isOpen ? "open" : "closed";
      this.icon.textContent = isOpen ? "X" : "+";
    }
    this.toggleButtons.forEach((button) => {
      button.dataset.accordionV2IconState = isOpen ? "open" : "closed";
      button.textContent = isOpen ? "X" : "+";
      const label = button.dataset[isOpen ? "accordionV2OpenLabel" : "accordionV2ClosedLabel"];
      if (label) {
        button.setAttribute("aria-label", label);
        button.title = label;
      }
    });
  }
}
