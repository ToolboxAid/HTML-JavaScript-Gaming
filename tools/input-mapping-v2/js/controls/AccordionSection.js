export class AccordionSection {
  constructor(section) {
    this.section = section;
    this.header = section.querySelector(".accordion-v2__header");
    this.content = section.querySelector(".accordion-v2__content");
  }

  mount() {
    if (!this.header || !this.content) {
      return;
    }
    this.header.addEventListener("click", () => this.toggle());
    this.update(this.header.getAttribute("aria-expanded") !== "false");
  }

  toggle() {
    this.update(this.header.getAttribute("aria-expanded") === "false");
  }

  update(expanded) {
    this.header.setAttribute("aria-expanded", expanded ? "true" : "false");
    this.content.hidden = !expanded;
  }
}
