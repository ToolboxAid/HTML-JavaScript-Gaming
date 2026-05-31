(function () {
    const partials = {
        "header-nav": "assets/partials/header-nav.html",
        footer: "assets/partials/footer.html"
    };

    function markActiveNavigation(root) {
        const pageName = window.location.pathname.split("/").pop() || "index.html";
        root.querySelectorAll("[data-nav-link]").forEach(function (link) {
            const linkName = link.getAttribute("href").split("/").pop();
            if (linkName === pageName || (pageName.indexOf("tool-") === 0 && linkName === "tools.html")) {
                link.classList.add("active");
            }
        });
    }

    async function loadPartial(slot) {
        const partialName = slot.dataset.partial;
        const partialPath = partials[partialName];
        if (!partialPath) return;

        const response = await fetch(partialPath);
        if (!response.ok) {
            throw new Error("Failed to load partial: " + partialPath);
        }

        slot.innerHTML = await response.text();
        if (partialName === "header-nav") {
            markActiveNavigation(slot);
        }
    }

    async function replaceExisting(partialName, selector) {
        const existing = document.querySelector(selector);
        const partialPath = partials[partialName];
        if (!existing || !partialPath) return;

        const response = await fetch(partialPath);
        if (!response.ok) {
            throw new Error("Failed to load partial: " + partialPath);
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = await response.text();
        const replacement = wrapper.firstElementChild;
        existing.replaceWith(replacement);
        if (partialName === "header-nav") {
            markActiveNavigation(replacement);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        const slots = Array.from(document.querySelectorAll("[data-partial]"));
        const tasks = slots.length ? slots.map(loadPartial) : [
            replaceExisting("header-nav", "header.site-header"),
            replaceExisting("footer", "footer.footer")
        ];

        Promise.all(tasks).catch(function (error) {
            console.error(error);
        });
    });
}());
