(function () {
    const routeMap = {
        home: "index.html",
        tools: "tools/index.html",
        builder: "tools/builder.html",
        creator: "tools/creator.html",
        publisher: "tools/publisher.html",
        "building-creation": "tools/groups/building-creation.html",
        "technology-system": "tools/groups/technology-system.html",
        "assets-content": "tools/groups/assets-content.html",
        "media-community": "tools/groups/media-community.html",
        "design-animation": "tools/groups/design-animation.html",
        "configuration-admin": "tools/groups/configuration-admin.html",
        arcade: "arcade/index.html",
        marketplace: "marketplace/index.html",
        learn: "learn/index.html",
        community: "community/index.html",
        docs: "docs/index.html",
        account: "account/index.html",
        branding: "account/branding.html",
        controls: "account/controls.html"
    };

    const partials = {
        "header-nav": "assets/partials/header-nav.html",
        footer: "assets/partials/footer.html"
    };

    function currentPagePath() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const studioIndex = parts.lastIndexOf("GameFoundryStudio");
        return studioIndex >= 0 ? parts.slice(studioIndex + 1).join("/") : (parts.pop() || "index.html");
    }

    function rootPrefix() {
        const pagePath = currentPagePath();
        if (!pagePath || pagePath === "index.html") return "";
        return "../".repeat(pagePath.split("/").length - 1);
    }

    function routeHref(routeName) {
        return rootPrefix() + (routeMap[routeName] || routeName || "index.html");
    }

    function rewriteRootedPaths(root) {
        root.querySelectorAll("[data-route]").forEach(function (link) {
            link.setAttribute("href", routeHref(link.dataset.route));
        });

        root.querySelectorAll("img[src^='assets/']").forEach(function (image) {
            image.setAttribute("src", rootPrefix() + image.getAttribute("src"));
        });
    }

    function markActiveNavigation(root) {
        const pagePath = currentPagePath() || "index.html";
        root.querySelectorAll("[data-nav-link]").forEach(function (link) {
            const route = routeMap[link.dataset.route] || "";
            const isToolChild = pagePath.indexOf("tools/") === 0 && link.dataset.route === "tools";
            const isAccountChild = pagePath.indexOf("account/") === 0 && link.dataset.route === "account";
            if (route === pagePath || isToolChild || isAccountChild) {
                link.classList.add("active");
            }
        });
    }

    async function partialElement(partialName) {
        const partialPath = partials[partialName];
        if (!partialPath) return null;

        const response = await fetch(rootPrefix() + partialPath);
        if (!response.ok) {
            throw new Error("Failed to load partial: " + partialPath);
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = await response.text();
        const element = wrapper.firstElementChild;
        rewriteRootedPaths(element);
        if (partialName === "header-nav") {
            markActiveNavigation(element);
        }
        return element;
    }

    async function loadPartial(slot) {
        const element = await partialElement(slot.dataset.partial);
        if (element) {
            slot.replaceChildren(element);
        }
    }

    async function replaceExisting(partialName, selector) {
        const existing = document.querySelector(selector);
        if (!existing) return;
        const element = await partialElement(partialName);
        if (element) {
            existing.replaceWith(element);
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
