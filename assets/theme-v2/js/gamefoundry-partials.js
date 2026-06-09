(function () {
    const localDevExpectedPort = "5501";
    const localDevHostnames = new Set(["127.0.0.1", "localhost", "::1"]);

    function shouldRedirectLocalDevPort() {
        return window.location.protocol === "http:" &&
            localDevHostnames.has(window.location.hostname) &&
            window.location.port !== localDevExpectedPort &&
            window.navigator?.webdriver !== true;
    }

    function redirectLocalDevPort() {
        if (!shouldRedirectLocalDevPort()) {
            return false;
        }
        const target = new URL(window.location.href);
        target.port = localDevExpectedPort;
        window.location.replace(target.href);
        return true;
    }

    if (redirectLocalDevPort()) {
        return;
    }

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
        "admin-tool-votes": "admin/tool-votes.html",
        "admin-moderation": "admin/moderation.html",
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

    const currentScript = document.currentScript || document.querySelector("script[src*='gamefoundry-partials.js']");
    const assetRoot = currentScript ? new URL("../", currentScript.src) : null;
    const apiBackedLoginDiagnostic = "Use the API-backed local server for login. Run npm run dev:local-api and open http://127.0.0.1:5501/login.html.";
    const adminMainItems = Object.freeze([
        Object.freeze({ label: "Analytics", route: "admin-analytics" }),
        Object.freeze({ label: "Branding", route: "admin-branding" }),
        Object.freeze({ label: "Controls", route: "admin-controls" }),
        Object.freeze({ label: "Moderation", route: "admin-moderation" }),
        Object.freeze({ label: "Platform Settings", route: "platform-settings" }),
        Object.freeze({ label: "Ratings", route: "admin-ratings" }),
        Object.freeze({ label: "Roles", route: "admin-roles" }),
        Object.freeze({ label: "Site Settings", route: "admin-site-settings" }),
        Object.freeze({ label: "Themes", route: "admin-themes" }),
        Object.freeze({ label: "Tool Votes", route: "admin-tool-votes" }),
        Object.freeze({ label: "Users", route: "admin-users" })
    ]);
    const localAdminMyStuffItems = Object.freeze([
        Object.freeze({ label: "DB Viewer", route: "admin-db-viewer" }),
        Object.freeze({ label: "Design System", route: "admin-design-system" }),
        Object.freeze({ label: "Environments", route: "environments" }),
        Object.freeze({ label: "Game Migration", route: "game-migration" }),
        Object.freeze({ label: "Grouping Colors", route: "admin-grouping-colors" }),
        Object.freeze({ label: "Notes", href: "/admin/admin-notes.html", localNotes: true }),
        Object.freeze({ label: "Tools Progress", route: "admin-tools-progress" })
    ]);

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

    function isLocalDevMode(loginState) {
        return String(loginState?.mode || "").indexOf("local-") === 0;
    }

    function createMenuLink(item) {
        const link = document.createElement("a");
        link.dataset.navLink = "";
        if (item.route) {
            link.dataset.route = item.route;
            link.href = routeHref(item.route);
        } else {
            link.href = item.href || "#";
        }
        if (item.localNotes) {
            link.dataset.adminNotesLocalMenu = "";
        }
        link.textContent = item.label;
        return link;
    }

    function createLocalAdminMyStuffMenu() {
        const item = document.createElement("div");
        item.className = "nav-item nav-popout-item";
        item.dataset.adminMyStuffMenu = "";

        const label = document.createElement("a");
        label.dataset.adminMyStuffLabel = "";
        label.href = "/admin/admin-notes.html";
        label.setAttribute("aria-haspopup", "true");
        label.textContent = "My Stuff \u25B8";

        const submenu = document.createElement("div");
        submenu.className = "sub-menu sub-menu--nested";
        submenu.dataset.adminMyStuffSubmenu = "";
        submenu.setAttribute("aria-label", "My Stuff");
        localAdminMyStuffItems.forEach(function (menuItem) {
            submenu.append(createMenuLink(menuItem));
        });

        item.append(label, submenu);
        return item;
    }

    function createAdminMenu(loginState) {
        const item = document.createElement("div");
        item.className = "nav-item";
        item.dataset.adminMenu = "";

        const link = document.createElement("a");
        link.dataset.navLink = "";
        link.dataset.route = "admin";
        link.href = routeHref("admin");
        link.textContent = "Admin \u25BE";

        const submenu = document.createElement("div");
        submenu.className = "sub-menu";
        if (isLocalDevMode(loginState)) {
            const separator = document.createElement("hr");
            separator.dataset.adminMyStuffSeparator = "";
            separator.setAttribute("role", "separator");
            separator.setAttribute("aria-disabled", "true");
            separator.tabIndex = -1;
            submenu.append(createLocalAdminMyStuffMenu(), separator);
        }
        adminMainItems.forEach(function (menuItem) {
            submenu.append(createMenuLink(menuItem));
        });

        item.append(link, submenu);
        return item;
    }

    function renderAdminMenu(root, loginState, canUseAdmin) {
        root.querySelectorAll("[data-admin-menu]").forEach(function (item) {
            item.remove();
        });
        if (!canUseAdmin) {
            return;
        }
        const nav = root.querySelector("nav.nav-links");
        if (nav) {
            nav.append(createAdminMenu(loginState));
        }
    }

    function localRouteUnavailableDiagnostic(method, url, status) {
        return "Local server API route unavailable for " + method + " " + url + " (" + status + "). Start the API-backed local server route instead of a static-only server.";
    }

    function isStaticLocalEntrypoint() {
        return ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
            window.location.port === "5500";
    }

    function missingSessionApiLoginState(diagnostic) {
        return {
            authenticated: false,
            diagnostic: diagnostic || "Server session API is unavailable. Start the local server API before using protected pages.",
            displayName: "Login",
            mode: "missing-api",
            roleSlugs: []
        };
    }

    function rewriteRootedPaths(root) {
        root.querySelectorAll("[data-route]").forEach(function (link) {
            link.setAttribute("href", routeHref(link.dataset.route));
        });

        root.querySelectorAll("img[src^='assets/']").forEach(function (image) {
            image.setAttribute("src", assetUrl(image.getAttribute("src")));
        });
    }

    function localDevLoginState() {
        if (isStaticLocalEntrypoint()) {
            return missingSessionApiLoginState(apiBackedLoginDiagnostic);
        }
        try {
            const request = new XMLHttpRequest();
            request.open("GET", "/api/session/current", false);
            request.setRequestHeader("Accept", "application/json");
            request.send(null);
            const payload = request.responseText ? JSON.parse(request.responseText) : null;
            if (request.status < 200 || request.status >= 300 || payload?.ok === false) {
                if (request.status === 404 || request.status === 405) {
                    throw new Error(localRouteUnavailableDiagnostic("GET", "/api/session/current", request.status));
                }
                throw new Error(payload?.error || "Session API did not return a valid current session.");
            }
            const session = payload?.data || {};
            return {
                authenticated: Boolean(session.authenticated),
                diagnostic: session.diagnostic || "",
                displayName: session.authenticated ? session.displayName || session.label || "Account" : "Login",
                mode: session.mode || "local-mem",
                roleSlugs: Array.isArray(session.roleSlugs) ? session.roleSlugs : []
            };
        } catch (error) {
            return missingSessionApiLoginState(error instanceof Error ? error.message : "");
        }
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

    function applyLocalDevLoginState(root) {
        const loginState = localDevLoginState();
        const accountItem = navItemForRoute(root, "account");
        const accountLink = accountItem?.querySelector(":scope > a[data-route='account']");
        const accountMenu = directSubMenu(accountItem);
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
        renderAdminMenu(root, loginState, canUseAdmin);
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
        if (!requirement) {
            window.GameFoundrySessionGuard = {
                blocked: false,
                diagnostic: "",
                mode: "",
                pagePath,
                requirement: ""
            };
            return false;
        }
        const loginState = localDevLoginState();
        const allowed = canUseProtectedPage(requirement, loginState);
        window.GameFoundrySessionGuard = {
            blocked: !allowed,
            diagnostic: loginState.diagnostic || "",
            mode: loginState.mode,
            pagePath,
            requirement: requirement?.role || ""
        };
        if (allowed) {
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
            const request = new XMLHttpRequest();
            request.open("POST", "/api/session/logout", false);
            request.setRequestHeader("Accept", "application/json");
            request.send(null);
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
