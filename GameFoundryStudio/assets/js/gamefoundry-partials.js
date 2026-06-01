(function () {
    const routeMap = {
        home: "index.html",
        tools: "tools/index.html",
        "ai-assistant": "tools/ai-assistant.html",
        "animation-studio": "tools/animation-studio.html",
        "asset-studio": "tools/asset-studio.html",
        "code-studio": "tools/code-studio.html",
        "game-builder": "tools/game-builder.html",
        "game-design-studio": "tools/game-design-studio.html",
        "input-studio": "tools/input-studio.html",
        "midi-studio": "tools/midi-studio.html",
        "object-vector-studio": "tools/object-vector-studio.html",
        "palette-manager": "tools/palette-manager.html",
        "particle-studio": "tools/particle-studio.html",
        publisher: "tools/publisher.html",
        "sound-studio": "tools/sound-studio.html",
        "storage-inspector": "tools/storage-inspector.html",
        "world-vector-studio": "tools/world-vector-studio.html",
        "configuration-admin": "tools/groups/configuration-admin.html",
        games: "arcade/index.html",
        arcade: "arcade/index.html",
        "game-action": "arcade/index.html#action",
        "game-adventure": "arcade/index.html#adventure",
        "game-puzzle": "arcade/index.html#puzzle",
        "game-racing": "arcade/index.html#racing",
        "game-retro": "arcade/index.html#retro",
        "game-strategy": "arcade/index.html#strategy",
        marketplace: "marketplace/index.html",
        learn: "learn/index.html",
        community: "community/index.html",
        docs: "docs/index.html",
        account: "account/index.html",
        branding: "account/branding.html",
        controls: "account/controls.html",
        "design-system": "account/design-system.html",
        "grouping-colors": "account/grouping-colors.html",
        rating: "account/rating.html"
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
            const isAccountUtilityPage = pagePath.indexOf("tools/groups/") === 0;
            const isAccountUtility = isAccountUtilityPage && link.dataset.route === "account";
            const isToolChild = pagePath.indexOf("tools/") === 0 && !isAccountUtilityPage && link.dataset.route === "tools";
            const isGameChild = pagePath.indexOf("arcade/") === 0 && link.dataset.route === "games";
            const isAccountChild = pagePath.indexOf("account/") === 0 && link.dataset.route === "account";
            if (route === pagePath || isToolChild || isGameChild || isAccountChild || isAccountUtility) {
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
