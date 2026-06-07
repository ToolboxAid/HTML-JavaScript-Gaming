(function () {
    const routeMap = {
        home: "index.html",
        toolbox: "toolbox/index.html",
        "ai-assistant": "toolbox/ai-assistant/index.html",
        "project-workspace": "toolbox/project-workspace/index.html",
        "game-design": "toolbox/game-design/index.html",
        "game-configuration": "toolbox/game-configuration/index.html",
        "tool-assets": "toolbox/assets/index.html",
        "colors": "toolbox/colors/index.html",
        "fonts": "toolbox/fonts/index.html",
        "sprites": "toolbox/sprites/index.html",
        "characters": "toolbox/characters/index.html",
        "objects": "toolbox/objects/index.html",
        "worlds": "toolbox/worlds/index.html",
        "animations": "toolbox/animations/index.html",
        "audio": "toolbox/audio/index.html",
        "music": "toolbox/music/index.html",
        "voices": "toolbox/voices/index.html",
        "videos": "toolbox/videos/index.html",
        "build-game": "toolbox/build-game/index.html",
        "game-testing": "toolbox/game-testing/index.html",
        "tool-controls": "toolbox/controls/index.html",
        "hitboxes": "toolbox/hitboxes/index.html",
        "saved-data": "toolbox/saved-data/index.html",
        "debug": "toolbox/debug/index.html",
        "performance": "toolbox/performance/index.html",
        "events": "toolbox/events/index.html",
        "tool-publish": "toolbox/publish/index.html",
        "tool-marketplace": "toolbox/marketplace/index.html",
        "tool-community": "toolbox/community/index.html",
        "languages": "toolbox/languages/index.html",
        "achievements": "toolbox/achievements/index.html",
        "ratings": "toolbox/ratings/index.html",
        "cloud": "toolbox/cloud/index.html",
        "code": "toolbox/code/index.html",
        "midi": "toolbox/midi/index.html",
        "particles": "toolbox/particles/index.html",
        "audio-effects": "toolbox/audio-effects/index.html",
        "speech-to-text": "toolbox/speech-to-text/index.html",
        "text-to-speech": "toolbox/text-to-speech/index.html",
        "environments": "toolbox/environments/index.html",
        "game-migration": "toolbox/game-migration/index.html",
        "platform-settings": "toolbox/platform-settings/index.html",
        games: "games/index.html",
        arcade: "games/arcade/index.html",
        "game-action": "games/action/index.html",
        "game-adventure": "games/adventure/index.html",
        "game-puzzle": "games/puzzle/index.html",
        "game-racing": "games/racing/index.html",
        "game-retro": "games/retro/index.html",
        "game-strategy": "games/strategy/index.html",
        marketplace: "marketplace/index.html",
        learn: "learn/index.html",
        community: "community/index.html",
        translations: "toolbox/languages/index.html",
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
        "admin-db-viewer": "admin/db-viewer.html",
        "admin-grouping-colors": "admin/grouping-colors.html",
        "admin-ratings": "admin/ratings.html",
        "admin-users": "admin/users.html",
        "admin-roles": "admin/roles.html",
        "admin-moderation": "admin/moderation.html",
        "admin-notes": "admin/notes.html",
        "admin-analytics": "admin/analytics.html",
        "admin-tools-progress": "admin/tools-progress.html",
        "cookie-policy": "legal/cookie-policy.html",
        disclaimer: "legal/disclaimer.html",
        "privacy-policy": "legal/privacy-policy.html",
        "terms-legal": "legal/terms.html",
        account: "account/index.html",
        "account-profile": "account/profile.html",
        "account-preferences": "account/preferences.html",
        "account-security": "account/security.html",
        "account-achievements": "account/achievements.html",
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
        "admin", "docs", "games", "learn", "marketplace", "toolbox"
    ]);
    const mockDbStorageKey = "gamefoundry.mockDb.v1";
    const mockDbSessionStorageKey = "gamefoundry.mockDb.sessionUser.v1";

    const currentScript = document.currentScript || document.querySelector("script[src*='gamefoundry-partials.js']");
    const assetRoot = currentScript ? new URL("../", currentScript.src) : null;

    function makeMockUlid(sequence) {
        return "01K2GFSJ0Y" + String(sequence).padStart(16, "0");
    }

    const localSessionUsers = {
        user1: {
            displayName: "User 1",
            roleSlugs: ["user"],
            userKey: makeMockUlid(51)
        },
        user2: {
            displayName: "User 2",
            roleSlugs: ["user"],
            userKey: makeMockUlid(52)
        },
        user3: {
            displayName: "User 3",
            roleSlugs: ["user"],
            userKey: makeMockUlid(53)
        },
        admin: {
            displayName: "Admin",
            roleSlugs: ["user", "admin"],
            userKey: makeMockUlid(54)
        }
    };

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

    function readMockDbState() {
        try {
            const raw = window.localStorage.getItem(mockDbStorageKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function selectedLocalSessionId() {
        try {
            return window.localStorage.getItem(mockDbSessionStorageKey) || "guest";
        } catch {
            return "guest";
        }
    }

    function rolesForUser(state, userKey, fallbackRoleSlugs) {
        const rows = state?.tables?.user_roles || [];
        const roles = new Map((state?.tables?.roles || []).map(function (role) {
            return [role.key, role.roleSlug || role.name];
        }));
        const resolved = rows
            .filter(function (row) {
                return row.userKey === userKey && roles.has(row.roleKey);
            })
            .map(function (row) {
                return roles.get(row.roleKey);
            })
            .filter(Boolean);
        return resolved.length ? resolved : fallbackRoleSlugs;
    }

    function localDevLoginState() {
        const session = localSessionUsers[selectedLocalSessionId()];
        if (!session) {
            return {
                authenticated: false,
                displayName: "Login",
                roleSlugs: []
            };
        }

        const state = readMockDbState();
        const user = (state?.tables?.users || []).find(function (record) {
            return record.key === session.userKey && record.isActive !== false;
        });
        if (state && !user) {
            return {
                authenticated: false,
                displayName: "Login",
                roleSlugs: []
            };
        }

        return {
            authenticated: true,
            displayName: user?.displayName || session.displayName,
            roleSlugs: rolesForUser(state, session.userKey, session.roleSlugs)
        };
    }

    function directSubMenu(navItem) {
        return Array.from(navItem?.children || []).find(function (child) {
            return child.classList?.contains("sub-menu");
        }) || null;
    }

    function navItemForRoute(root, routeName) {
        const link = root.querySelector("nav.nav-links > .nav-item > a[data-route='" + routeName + "']");
        return link ? link.closest(".nav-item") : null;
    }

    function setMenuVisible(navItem, visible) {
        if (!navItem) {
            return;
        }
        navItem.hidden = !visible;
        navItem.querySelectorAll("a").forEach(function (link) {
            link.setAttribute("aria-hidden", String(!visible));
            link.tabIndex = visible ? 0 : -1;
        });
    }

    function applyLocalDevLoginState(root) {
        const loginState = localDevLoginState();
        const accountItem = navItemForRoute(root, "account");
        const accountLink = accountItem?.querySelector(":scope > a[data-route='account']");
        const accountMenu = directSubMenu(accountItem);
        const adminItem = navItemForRoute(root, "admin");
        const canUseAccount = loginState.authenticated && loginState.roleSlugs.includes("user");
        const canUseAdmin = loginState.authenticated && loginState.roleSlugs.includes("admin");

        if (accountLink) {
            accountLink.textContent = canUseAccount ? loginState.displayName + " \u25BE" : "Login";
            accountLink.setAttribute("aria-label", canUseAccount ? "Account menu for " + loginState.displayName : "Login");
        }
        if (accountMenu) {
            accountMenu.hidden = !canUseAccount;
            accountMenu.querySelectorAll("a").forEach(function (link) {
                link.tabIndex = canUseAccount ? 0 : -1;
                link.setAttribute("aria-hidden", String(!canUseAccount));
            });
        }
        setMenuVisible(adminItem, canUseAdmin);
    }

    function markActiveNavigation(root) {
        const pagePath = currentPagePath() || "index.html";
        root.querySelectorAll("[data-nav-link]").forEach(function (link) {
            const route = routeMap[link.dataset.route] || "";
            const isToolboxChild = pagePath.indexOf("toolbox/") === 0 && link.dataset.route === "toolbox";
            const isGameChild = pagePath.indexOf("games/") === 0 && link.dataset.route === "games";
            const isAccountChild = pagePath.indexOf("account/") === 0 && link.dataset.route === "account";
            const isAdminChild = pagePath.indexOf("admin/") === 0 && link.dataset.route === "admin";
            if (route === pagePath || isToolboxChild || isGameChild || isAccountChild || isAdminChild) {
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
            applyLocalDevLoginState(element);
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

    function refreshHeaderLoginState() {
        const header = document.querySelector("header.site-header");
        if (header) {
            applyLocalDevLoginState(header);
            markActiveNavigation(header);
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
    window.addEventListener("gamefoundry:mock-db-session-user-changed", refreshHeaderLoginState);
    window.addEventListener("gamefoundry:mock-db-changed", refreshHeaderLoginState);
}());
