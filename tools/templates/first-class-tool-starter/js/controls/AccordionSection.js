export class AccordionSection {
  constructor(section) {
    this.section = section;
    this.header = section?.querySelector(".accordion-v2__header") || null;
    this.content = section?.querySelector(".accordion-v2__content") || null;
  }

  mount() {
    if (!this.section || !this.header || !this.content || this.header.dataset.accordionBound === "true") {
      return;
    }

    this.header.dataset.accordionBound = "true";
    this.setOpen(this.section.dataset.accordionOpen !== "false");
    this.header.addEventListener("click", () => {
      this.setOpen(!this.section.classList.contains("is-open"));
    });
  }

  setOpen(isOpen) {
    this.section.classList.toggle("is-open", isOpen);
    this.section.dataset.accordionOpen = String(isOpen);
    this.header.setAttribute("aria-expanded", String(isOpen));
    this.content.hidden = !isOpen;
  }
}

