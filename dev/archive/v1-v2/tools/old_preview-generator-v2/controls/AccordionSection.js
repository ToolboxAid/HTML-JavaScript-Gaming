class AccordionSection {
  constructor({ section = null, header = null, content = null } = {}) {
    this.section = section || content?.closest(".accordion-v2") || header?.closest(".accordion-v2");
    this.header = header || this.section?.querySelector(".accordion-v2__header");
    this.content = content || this.section?.querySelector(".accordion-v2__content");
    this.icon = this.header?.querySelector(".accordion-v2__icon");
    this.handleHeaderClick = this.handleHeaderClick.bind(this);

    this.bind();
  }

  bind() {
    if (!this.section || !this.header || !this.content || this.header.dataset.accordionV2Bound === "true") {
      return;
    }

    this.header.dataset.accordionV2Bound = "true";
    this.setOpen(this.section.dataset.accordionV2Open !== "false");
    this.header.addEventListener("click", this.handleHeaderClick);
  }

  handleHeaderClick() {
    this.setOpen(!this.section.classList.contains("is-open"));
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

export { AccordionSection };
