(function () {
    const routeMap = {
        home: "index.html",
        tools: "tools/index.html",
        "ai-assistant": "tools/ai-assistant/index.html",
        "animation-studio": "tools/animation/index.html",
        "asset-studio": "tools/assets/index.html",
        "code-studio": "tools/code/index.html",
        "game-builder": "tools/game-builder/index.html",
        "game-design-studio": "tools/game-design/index.html",
        "input-studio": "tools/input/index.html",
        "localization-studio": "tools/localization/index.html",
        "midi-studio": "tools/midi/index.html",
        "object-vector-studio": "tools/object-vector/index.html",
        "palette-manager": "tools/palette/index.html",
        "particle-studio": "tools/particles/index.html",
        publisher: "tools/publish/index.html",
        "sound-studio": "tools/sound/index.html",
        "storage-inspector": "tools/storage/index.html",
        "world-vector-studio": "tools/world-vector/index.html",
        "configuration-admin": "tools/configuration-admin/index.html",
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
        translations: "tools/localization/index.html",
        docs: "docs/index.html",
        about: "company/about.html",
        faq: "docs/faq.html",
        assets: "community/assets.html",
        publish: "community/publish.html",
        support: "docs/support.html",
        reference: "docs/reference.html",
        contact: "company/contact.html",
        vision: "company/vision.html",
        mission: "company/mission.html",
        roadmap: "company/roadmap.html",
        "release-notes": "company/release-notes.html",
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
        "cookie-policy": "legal/cookie-policy.html",
        disclaimer: "legal/disclaimer.html",
        "privacy-policy": "legal/privacy-policy.html",
        "terms-legal": "legal/terms.html",
        account: "account/index.html",
        "account-profile": "account/profile.html",
        "account-preferences": "account/preferences.html",
        "account-security": "account/security.html",
        branding: "admin/branding.html",
        controls: "admin/controls.html",
        "design-system": "admin/design-system.html",
        "grouping-colors": "admin/grouping-colors.html",
        rating: "admin/ratings.html"
    };

    const partials = {
        "header-nav": "assets/partials/header-nav.html",
        footer: "assets/partials/footer.html"
    };

    const rootSegments = new Set([
        "account", "company", "community", "legal",
        "admin", "arcade", "cloud", "docs", "learn", "marketplace", "tools"
    ]);

    const currentScript = document.currentScript || document.querySelector("script[src*='gamefoundry-partials.js']");
    const assetRoot = currentScript ? new URL("../", currentScript.src) : null;

    function assetUrl(path) {
        if (!assetRoot) return rootPrefix() + path;
        return new URL(path.replace(/^assets\//, ""), assetRoot).href;
    }

    function currentPagePath() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const rootIndex = parts.findIndex(function (part) {
            return rootSegments.has(part);
        });
        if (rootIndex >= 0) {
            return parts.slice(rootIndex).join("/");
        }
        const lastPart = parts[parts.length - 1] || "";
        return lastPart.endsWith(".html") ? lastPart : "index.html";
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
            image.setAttribute("src", assetUrl(image.getAttribute("src")));
        });
    }

    function markActiveNavigation(root) {
        const pagePath = currentPagePath() || "index.html";
        root.querySelectorAll("[data-nav-link]").forEach(function (link) {
            const route = routeMap[link.dataset.route] || "";
            const isToolChild = pagePath.indexOf("tools/") === 0 && link.dataset.route === "tools";
            const isGameChild = pagePath.indexOf("arcade/") === 0 && link.dataset.route === "games";
            const isAccountChild = pagePath.indexOf("account/") === 0 && link.dataset.route === "account";
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

        const response = await fetch(assetUrl(partialPath));
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
