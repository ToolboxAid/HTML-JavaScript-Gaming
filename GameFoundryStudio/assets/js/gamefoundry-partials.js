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
        "localization-studio": "tools/localization-studio/index.html",
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
        translations: "tools/localization-studio/index.html",
        docs: "docs/index.html",
        about: "about.html",
        faq: "faq.html",
        assets: "assets.html",
        publish: "publish/index.html",
        support: "support.html",
        reference: "reference.html",
        contact: "contact.html",
        vision: "vision.html",
        mission: "mission.html",
        roadmap: "roadmap.html",
        "release-notes": "release-notes.html",
        admin: "admin/site-settings.html",
        "admin-site-settings": "admin/site-settings.html",
        "admin-branding": "admin/branding.html",
        "admin-themes": "admin/themes.html",
        "admin-design-system": "admin/design-system.html",
        "admin-controls": "admin/controls.html",
        "admin-grouping-colors": "admin/grouping-colors.html",
        "admin-ratings": "admin/ratings.html",
        "admin-users": "admin/users.html",
        "admin-roles": "admin/roles.html",
        "admin-moderation": "admin/moderation.html",
        "admin-analytics": "admin/analytics.html",
        "cookie-policy": "cookie-policy.html",
        disclaimer: "disclaimer.html",
        "privacy-policy": "privacy-policy.html",
        "terms-legal": "terms.html",
        account: "account.html",
        "account-profile": "profile.html",
        "account-preferences": "preferences.html",
        "account-security": "security.html",
        branding: "admin/branding.html",
        controls: "admin/controls.html",
        "design-system": "admin/design-system.html",
        "grouping-colors": "admin/grouping-colors.html",
        rating: "admin/ratings.html"
    };

    const rootPageRoutes = new Set([
        "tools",
        "configuration-admin",
        "ai-assistant",
        "animation-studio", "asset-studio", "code-studio", "input-studio", "midi-studio",
        "object-vector-studio", "palette-manager", "particle-studio", "sound-studio", "storage-inspector",
        "about", "vision", "mission", "roadmap", "release-notes",
        "account", "account-profile", "account-preferences", "account-security",
        "admin", "admin-site-settings", "admin-branding", "admin-themes", "admin-design-system", "admin-controls",
        "admin-grouping-colors", "admin-ratings", "admin-users", "admin-roles", "admin-moderation", "admin-analytics",
        "branding", "controls", "design-system", "grouping-colors", "rating"
    ]);

    const partials = {
        "header-nav": "assets/partials/header-nav.html",
        footer: "assets/partials/footer.html"
    };

    function currentPagePath() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const studioIndex = parts.lastIndexOf("GameFoundryStudio");
        return studioIndex >= 0 ? parts.slice(studioIndex + 1).join("/") : (parts.join("/") || "index.html");
    }

    function rootPrefix() {
        if (window.location.pathname.split("/").filter(Boolean).lastIndexOf("GameFoundryStudio") < 0) return "";
        const pagePath = currentPagePath();
        if (!pagePath || pagePath === "index.html") return "";
        return "../".repeat(pagePath.split("/").length - 1);
    }

    function routeHref(routeName) {
        if (rootPageRoutes.has(routeName)) {
            const parts = window.location.pathname.split("/").filter(Boolean);
            const studioIndex = parts.lastIndexOf("GameFoundryStudio");
            if (studioIndex >= 0) {
                return "../".repeat(Math.max(1, parts.length - studioIndex - 1)) + routeMap[routeName];
            }
            return "../" + routeMap[routeName];
        }
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
            const isGameChild = pagePath.indexOf("arcade/") === 0 && link.dataset.route === "games";
            const isAccountChild = ["account.html", "profile.html", "preferences.html", "security.html"].includes(pagePath) && link.dataset.route === "account";
            const isAdminChild = pagePath.indexOf("admin/") === 0 && link.dataset.route === "admin";
            if (route === pagePath || isToolChild || isGameChild || isAccountChild || isAdminChild) {
                link.classList.add("active");
            }
        });
    }

    function wireReturnToTop(root) {
        const button = root.querySelector("[data-return-to-top]");
        if (!button) return;

        function updateVisibility() {
            button.classList.toggle("is-visible", window.scrollY > 280);
        }

        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", updateVisibility, { passive: true });
        updateVisibility();
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
        } else if (partialName === "footer") {
            wireReturnToTop(element);
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
