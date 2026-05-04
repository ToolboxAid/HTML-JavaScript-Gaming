function setAccordionV2Open(panel, isOpen) {
  const header = panel.querySelector(".accordion-v2__header");
  const content = panel.querySelector(".accordion-v2__content");
  if (!header || !content) {
    return;
  }

  panel.classList.toggle("is-open", isOpen);
  panel.dataset.accordionV2Open = String(isOpen);
  header.setAttribute("aria-expanded", String(isOpen));
  content.hidden = !isOpen;
}

function mountAccordionV2(root = document) {
  root.querySelectorAll(".accordion-v2").forEach((panel) => {
    const header = panel.querySelector(".accordion-v2__header");
    if (!header || header.dataset.accordionV2Bound === "true") {
      return;
    }

    header.dataset.accordionV2Bound = "true";
    setAccordionV2Open(panel, panel.dataset.accordionV2Open !== "false");
    header.addEventListener("click", () => {
      setAccordionV2Open(panel, !panel.classList.contains("is-open"));
    });
  });
}

mountAccordionV2();

export { mountAccordionV2, setAccordionV2Open };
