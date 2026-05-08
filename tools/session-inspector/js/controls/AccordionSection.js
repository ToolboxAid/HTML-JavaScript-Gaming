export class AccordionSection {
  constructor(section) {
    this.section = section;
    this.header = section?.querySelector(".accordion-v2__header") || null;
    this.content = section?.querySelector(".accordion-v2__content") || null;
    this.icon = this.header?.querySelector(".accordion-v2__icon") || null;
  }

  mount() {
    if (!this.section || !this.header || !this.content || this.header.dataset.accordionV2Bound === "true") {
      return;
    }

    this.header.dataset.accordionV2Bound = "true";
    this.setOpen(this.section.dataset.accordionV2Open !== "false");
    this.header.addEventListener("click", (event) => {
      const clickedNestedButton = event.target instanceof Element
        && event.target.closest("button")
        && event.target !== this.header;
      if (clickedNestedButton) {
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
    }
  }
}
