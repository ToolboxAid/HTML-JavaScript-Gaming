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
        login: "login.html",
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
    const mockDbSessionModeStorageKey = "gamefoundry.mockDb.sessionMode.v1";

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

    function readMockDbState() {
        try {
            const raw = window.localStorage.getItem(mockDbStorageKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function selectedLocalSessionKey() {
        try {
            return window.localStorage.getItem(mockDbSessionStorageKey) || "";
        } catch {
            return "";
        }
    }

    function selectedSessionModeId() {
        try {
            return window.localStorage.getItem(mockDbSessionModeStorageKey) || "local";
        } catch {
            return "local";
        }
    }

    function rolesForUser(state, userKey) {
        const rows = state?.tables?.user_roles || [];
        const roles = new Map((state?.tables?.roles || []).map(function (role) {
            return [role.key, role.roleSlug || role.name];
        }));
        return rows
            .filter(function (row) {
                return row.userKey === userKey && roles.has(row.roleKey);
            })
            .map(function (row) {
                return roles.get(row.roleKey);
            })
            .filter(Boolean);
    }

    function localDevLoginState() {
        if (selectedSessionModeId() === "dev") {
            return {
                authenticated: false,
                diagnostic: "DEV mode uses read-only/demo JSON access. Switch to Local to use persisted Memory DB sessions.",
                displayName: "Login",
                mode: "dev",
                roleSlugs: []
            };
        }

        const sessionUserKey = selectedLocalSessionKey();
        if (!sessionUserKey) {
            return {
                authenticated: false,
                diagnostic: "",
                displayName: "Login",
                mode: "local",
                roleSlugs: []
            };
        }

        const state = readMockDbState();
        if (!state) {
            return {
                authenticated: false,
                diagnostic: "Persisted Memory DB users and roles are not seeded. Open Login and choose Local to seed local users.",
                displayName: "Login",
                mode: "local",
                roleSlugs: []
            };
        }

        const user = (state?.tables?.users || []).find(function (record) {
            return record.key === sessionUserKey && record.isActive !== false;
        });
        if (!user) {
            return {
                authenticated: false,
                diagnostic: `Selected Local user key ${sessionUserKey} is missing from persisted Memory DB users.`,
                displayName: "Login",
                mode: "local",
                roleSlugs: []
            };
        }

        const roleSlugs = rolesForUser(state, sessionUserKey);
        if (!roleSlugs.length) {
            return {
                authenticated: false,
                diagnostic: `Selected Local user ${user.displayName || sessionUserKey} has no persisted Memory DB roles.`,
                displayName: "Login",
                mode: "local",
                roleSlugs: []
            };
        }

        return {
            authenticated: true,
            diagnostic: "",
            displayName: user.displayName || sessionUserKey,
            mode: "local",
            roleSlugs
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
            accountLink.setAttribute("href", canUseAccount ? routeHref("account") : routeHref("login"));
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

    function protectedPageRequirement(pagePath) {
        if (pagePath.indexOf("admin/") === 0) {
            return {
                role: "admin",
                title: "Admin role required",
                message: "Log in as Admin to open this Admin page."
            };
        }
        if (pagePath.indexOf("account/") === 0) {
            return {
                role: "user",
                title: "Login required",
                message: "Log in as a local user to open Account pages."
            };
        }
        return null;
    }

    function canUseProtectedPage(requirement, loginState) {
        if (!requirement) {
            return true;
        }
        if (requirement.role === "admin") {
            return loginState.authenticated && loginState.roleSlugs.includes("admin");
        }
        if (requirement.role === "user") {
            return loginState.authenticated && loginState.roleSlugs.includes("user");
        }
        return false;
    }

    function createAccessBlockedMain(requirement, pagePath, loginState) {
        const main = document.createElement("main");
        main.dataset.sessionAccessBlocked = requirement.role;

        const titleSection = document.createElement("section");
        titleSection.className = "page-title";
        const titleContainer = document.createElement("div");
        titleContainer.className = "container";
        const kicker = document.createElement("div");
        kicker.className = "kicker";
        kicker.textContent = "Access";
        const title = document.createElement("h1");
        title.textContent = requirement.title;
        const lede = document.createElement("p");
        lede.className = "lede";
        lede.textContent = requirement.message;
        titleContainer.append(kicker, title, lede);
        titleSection.append(titleContainer);

        const bodySection = document.createElement("section");
        bodySection.className = "section";
        const bodyContainer = document.createElement("div");
        bodyContainer.className = "container";
        const card = document.createElement("div");
        card.className = "card";
        const body = document.createElement("div");
        body.className = "card-body content-stack";
        const status = document.createElement("p");
        status.className = "status";
        status.setAttribute("role", "status");
        status.dataset.sessionAccessStatus = "";
        status.textContent = [
            `Blocked ${pagePath}. Current session: ${loginState.displayName}.`,
            loginState.diagnostic ? `Login/session diagnostic: ${loginState.diagnostic}` : ""
        ].filter(Boolean).join(" ");
        const link = document.createElement("a");
        link.className = "btn primary";
        link.href = routeHref("login") + "?returnTo=" + encodeURIComponent(pagePath);
        link.textContent = "Open Login";
        body.append(status, link);
        card.append(body);
        bodyContainer.append(card);
        bodySection.append(bodyContainer);

        main.append(titleSection, bodySection);
        return main;
    }

    function enforcePageProtection() {
        const pagePath = currentPagePath() || "index.html";
        const requirement = protectedPageRequirement(pagePath);
        const loginState = localDevLoginState();
        const allowed = canUseProtectedPage(requirement, loginState);
        window.GameFoundrySessionGuard = {
            blocked: !allowed,
            diagnostic: loginState.diagnostic || "",
            mode: loginState.mode,
            pagePath,
            requirement: requirement?.role || ""
        };
        if (!requirement || allowed) {
            return false;
        }

        const existingMain = document.querySelector("main");
        if (existingMain) {
            existingMain.replaceWith(createAccessBlockedMain(requirement, pagePath, loginState));
        }
        document.title = `${requirement.title} - GameFoundryStudio`;
        return true;
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

    function logoutCurrentSession(event) {
        event.preventDefault();
        try {
            window.localStorage.removeItem(mockDbSessionStorageKey);
            window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
                detail: {
                    authenticated: false,
                    id: "guest"
                }
            }));
        } catch {}
        refreshHeaderLoginState();
    }

    function wireAccountLogout(root) {
        root.querySelectorAll("[data-account-logout]").forEach(function (link) {
            link.addEventListener("click", logoutCurrentSession);
        });
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
            wireAccountLogout(element);
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
            enforcePageProtection();
            applyLocalDevLoginState(header);
            markActiveNavigation(header);
        }
    }

    function refreshHeaderOnly() {
        const header = document.querySelector("header.site-header");
        if (header) {
            applyLocalDevLoginState(header);
            markActiveNavigation(header);
        }
    }

    enforcePageProtection();
    document.addEventListener("DOMContentLoaded", function () {
        enforcePageProtection();
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
    window.addEventListener("gamefoundry:mock-db-session-mode-changed", refreshHeaderLoginState);
    window.addEventListener("gamefoundry:mock-db-changed", refreshHeaderOnly);
}());
