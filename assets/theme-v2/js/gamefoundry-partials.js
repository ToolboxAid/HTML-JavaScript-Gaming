(function () {
    const routeMap = {
        home: "index.html",
        toolbox: "toolbox/index.html",
        "ai-assistant": "toolbox/ai-assistant/index.html",
        "game-hub": "toolbox/game-hub/index.html",
        "game-journey": "toolbox/game-journey/index.html",
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
        memberships: "memberships/index.html",
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
        "sign-in": "account/sign-in.html",
        "create-account": "account/create-account.html",
        "lost-password": "account/lost-password.html",
        "password-reset": "account/password-reset.html",
        contact: "company/contact.html",
        vision: "company/vision.html",
        mission: "company/mission.html",
        roadmap: "company/roadmap.html",
        "release-notes": "company/release-notes.html",
        admin: "admin/platform-settings.html",
        owner: "owner/memberships.html",
        "admin-operations": "admin/operations.html",
        "admin-controls": "admin/controls.html",
        "admin-db-viewer": "admin/db-viewer.html",
        "admin-platform-settings": "admin/platform-settings.html",
        "admin-ratings": "admin/ratings.html",
        "admin-users": "admin/users.html",
        "admin-roles": "admin/roles.html",
        "admin-system-health": "admin/system-health.html",
        "admin-tool-votes": "admin/tool-votes.html",
        "admin-moderation": "admin/moderation.html",
        "admin-analytics": "admin/analytics.html",
        "owner-ai-credits": "owner/ai-credits.html",
        "owner-branding": "owner/branding.html",
        "owner-design-system": "owner/design-system.html",
        "owner-grouping-colors": "owner/grouping-colors.html",
        "owner-memberships": "owner/memberships.html",
        "owner-notes": "owner/notes.html",
        "owner-site-settings": "owner/site-settings.html",
        "owner-themes": "owner/themes.html",
        "legal-overview": "legal/index.html",
        "terms-of-service": "legal/terms-of-service.html",
        "terms-legal": "legal/terms.html",
        "privacy-policy": "legal/privacy-policy.html",
        "cookie-policy": "legal/cookie-policy.html",
        "cookies-policy": "legal/cookies-policy.html",
        "community-guidelines": "legal/community-guidelines.html",
        "copyright-policy": "legal/copyright-policy.html",
        "dmca-policy": "legal/dmca-policy.html",
        account: "account/index.html",
        "account-achievements": "account/achievements.html",
        "account-ai-credits": "account/ai-credits.html",
        "account-preferences": "account/preferences.html",
        "account-profile": "account/profile.html",
        "account-security": "account/security.html",
        "account-user-controls": "account/user-controls.html",
        branding: "owner/branding.html",
        controls: "admin/controls.html",
        "design-system": "owner/design-system.html",
        "grouping-colors": "owner/grouping-colors.html",
        rating: "admin/ratings.html"
    };

    const partials = {
        "account-side-nav": "assets/partials/account-side-nav.html",
        "header-nav": "assets/partials/header-nav.html",
        footer: "assets/partials/footer.html"
    };

    const rootSegments = new Set([
        "account", "company", "community", "legal",
        "admin", "docs", "games", "learn", "marketplace", "memberships", "owner", "toolbox"
    ]);

    const currentScript = document.currentScript || document.querySelector("script[src*='gamefoundry-partials.js']");
    const assetRoot = currentScript ? new URL("../", currentScript.src) : null;
    let themeIconRegistry = window.ThemeV2Icons || null;
    let navigationAdminMenuCache = null;
    let publicConfigCache = null;
    let publicConfigDataCache = null;
    let publicConfigLoaded = false;
    let publicConfigSource = "";
    const publicConfigDiagnostics = [];
    const publicConfigRoute = "/api/public/config";

    function publishPublicConfigDiagnostics() {
        window.GameFoundryPublicConfigDiagnostics = {
            apiUrlConfigured: Boolean(publicConfigCache?.apiUrl),
            diagnostics: publicConfigDiagnostics.slice(),
            source: publicConfigSource
        };
    }

    function recordPublicConfigDiagnostic(message) {
        const normalizedMessage = String(message || "").trim();
        if (normalizedMessage && !publicConfigDiagnostics.includes(normalizedMessage)) {
            publicConfigDiagnostics.push(normalizedMessage);
        }
        publishPublicConfigDiagnostics();
        return normalizedMessage;
    }

    function normalizePublicConfig(value) {
        const config = value && typeof value === "object" ? value : {};
        return {
            apiUrl: typeof config.apiUrl === "string" ? config.apiUrl.trim() : "",
            environmentLabel: typeof config.environmentLabel === "string" ? config.environmentLabel.trim() : "",
            siteUrl: typeof config.siteUrl === "string" ? config.siteUrl.trim() : ""
        };
    }

    function publicConfigFromPayload(payload) {
        if (payload?.ok === false) {
            return null;
        }
        return normalizePublicConfig(payload?.data?.publicConfig || payload?.publicConfig || {});
    }

    function sameOriginConfigUrl() {
        return new URL(publicConfigRoute, window.location.origin).href;
    }

    function isLocalHostname(hostname) {
        return ["localhost", "127.0.0.1", "::1"].includes(String(hostname || "").toLowerCase());
    }

    function companionLocalConfigUrl() {
        if (!isLocalHostname(window.location.hostname)) {
            return "";
        }
        const port = Number(window.location.port || 0);
        if (!Number.isInteger(port) || port <= 0) {
            return "";
        }
        const url = new URL(publicConfigRoute, window.location.origin);
        url.port = String(port + 1);
        return url.href;
    }

    function publicConfigCandidateUrls() {
        const sameOriginUrl = sameOriginConfigUrl();
        const companionUrl = companionLocalConfigUrl();
        const urls = window.location.port === "5500"
            ? [companionUrl, sameOriginUrl]
            : [sameOriginUrl, companionUrl];
        return Array.from(new Set(urls.filter(Boolean)));
    }

    function missingApiUrlDiagnostic() {
        return "GAMEFOUNDRY_API_URL is missing from the server public config. Falling back to same-origin /api; static-only Live Server origins cannot serve API routes. Set GAMEFOUNDRY_API_URL in .env and restart the site API.";
    }

    function setLoadedPublicConfig(config, source, data) {
        publicConfigLoaded = true;
        publicConfigCache = normalizePublicConfig(config);
        publicConfigDataCache = data && typeof data === "object"
            ? data
            : { publicConfig: publicConfigCache };
        publicConfigSource = source;
        publishPublicConfigDiagnostics();
        return publicConfigCache;
    }

    function requestPublicConfigSync() {
        if (publicConfigLoaded) {
            return publicConfigCache;
        }
        if (window.GameFoundryPublicConfig && typeof window.GameFoundryPublicConfig === "object") {
            return setLoadedPublicConfig(window.GameFoundryPublicConfig, "browser-global");
        }
        for (const url of publicConfigCandidateUrls()) {
            try {
                const request = new XMLHttpRequest();
                request.open("GET", url, false);
                request.setRequestHeader("Accept", "application/json");
                request.send(null);
                if (request.status < 200 || request.status >= 300) {
                    continue;
                }
                const payload = request.responseText ? JSON.parse(request.responseText) : null;
                const config = publicConfigFromPayload(payload);
                if (config) {
                    return setLoadedPublicConfig(config, url, payload?.data || {});
                }
            } catch {
                // Try the next public config discovery URL.
            }
        }
        recordPublicConfigDiagnostic(missingApiUrlDiagnostic());
        return setLoadedPublicConfig({}, "same-origin-fallback");
    }

    async function requestPublicConfigAsync() {
        if (publicConfigLoaded) {
            return publicConfigCache;
        }
        if (window.GameFoundryPublicConfig && typeof window.GameFoundryPublicConfig === "object") {
            return setLoadedPublicConfig(window.GameFoundryPublicConfig, "browser-global");
        }
        for (const url of publicConfigCandidateUrls()) {
            const response = await fetch(url, {
                headers: { "Accept": "application/json" },
                method: "GET"
            }).catch(function () {
                return null;
            });
            if (!response?.ok) {
                continue;
            }
            const payload = await response.json().catch(function () {
                return null;
            });
            const config = publicConfigFromPayload(payload);
            if (config) {
                return setLoadedPublicConfig(config, url, payload?.data || {});
            }
        }
        recordPublicConfigDiagnostic(missingApiUrlDiagnostic());
        return setLoadedPublicConfig({}, "same-origin-fallback");
    }

    async function requestPublicConfigDataAsync() {
        await requestPublicConfigAsync();
        return publicConfigDataCache || { publicConfig: publicConfigCache || {} };
    }

    function normalizeApiPath(path) {
        const value = String(path || "/").trim() || "/";
        if (/^https?:\/\//i.test(value)) {
            return value;
        }
        const rootedPath = value.startsWith("/") ? value : "/" + value;
        return rootedPath.indexOf("/api/") === 0 || rootedPath === "/api"
            ? rootedPath.slice(4) || "/"
            : rootedPath;
    }

    function sameOriginApiUrl(path) {
        const normalizedPath = normalizeApiPath(path);
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }
        return "/api" + normalizedPath;
    }

    function configuredApiUrl(path, config) {
        const normalizedPath = normalizeApiPath(path);
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }
        const apiUrl = String(config?.apiUrl || "").trim().replace(/\/+$/, "");
        if (!apiUrl) {
            recordPublicConfigDiagnostic(missingApiUrlDiagnostic());
            return sameOriginApiUrl(normalizedPath);
        }
        return apiUrl + normalizedPath;
    }

    function resolveApiUrl(path) {
        return configuredApiUrl(path, requestPublicConfigSync());
    }

    async function resolveApiFetchUrl(path) {
        return configuredApiUrl(path, await requestPublicConfigAsync());
    }

    async function fetchApi(path, options) {
        return fetch(await resolveApiFetchUrl(path), options);
    }

    function assetUrl(path) {
        if (!assetRoot) return rootPrefix() + path;
        return new URL(path.replace(/^assets\//, ""), assetRoot).href;
    }

    function fallbackThemeIconFileName(name) {
        return "gfs-" + name + ".svg";
    }

    function createThemeIconNode(name, className) {
        if (themeIconRegistry && typeof themeIconRegistry.createThemeIcon === "function") {
            return themeIconRegistry.createThemeIcon(name, { className });
        }

        const icon = document.createElement("span");
        icon.className = ["theme-icon", "theme-icon--" + name, className].filter(Boolean).join(" ");
        icon.dataset.themeIcon = name;
        icon.dataset.themeIconFile = fallbackThemeIconFileName(name);
        icon.setAttribute("aria-hidden", "true");
        return icon;
    }

    function horizontalToggleIconName(button) {
        const expanded = button.getAttribute("aria-expanded") !== "false";
        const isLeft = button.classList.contains("horizontal-accordion-toggle--left");
        if (isLeft) {
            return expanded ? "chevron-left" : "chevron-right";
        }
        return expanded ? "chevron-right" : "chevron-left";
    }

    function updateHorizontalToggleIcon(button) {
        button.replaceChildren(createThemeIconNode(horizontalToggleIconName(button), "layout-icon horizontal-accordion-toggle__icon"));
    }

    function updateReturnToTopIcon(button) {
        button.replaceChildren(createThemeIconNode("chevron-up", "layout-icon return-to-top__icon"));
    }

    function refreshUtilityIcons(root) {
        (root || document).querySelectorAll(".horizontal-accordion-toggle").forEach(updateHorizontalToggleIcon);
        (root || document).querySelectorAll("[data-return-to-top]").forEach(updateReturnToTopIcon);
    }

    function loadThemeIcons() {
        import(assetUrl("js/theme-icons.js")).then(function (module) {
            themeIconRegistry = module;
            refreshUtilityIcons(document);
        }).catch(function () {
            themeIconRegistry = window.ThemeV2Icons || themeIconRegistry;
        });
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

    function pathHref(path) {
        const normalizedPath = String(path || "").replace(/^\/+/, "");
        return normalizedPath ? rootPrefix() + normalizedPath : "#";
    }

    function missingNavigationMenu(diagnostic) {
        return {
            adminMainItems: [],
            diagnostic: diagnostic || "Admin navigation API did not return menu data.",
            ownerMenuItems: [],
            source: "missing-api"
        };
    }

    function normalizeNavigationItems(items) {
        return Array.isArray(items)
            ? items.map(function (item) {
                return {
                    disabled: item.disabled === true,
                    href: typeof item.href === "string" ? item.href : "",
                    label: typeof item.label === "string" ? item.label : "",
                    localNotes: item.localNotes === true,
                    path: typeof item.path === "string" ? item.path : "",
                    planned: item.planned === true,
                    route: typeof item.route === "string" ? item.route : ""
                };
            }).filter(function (item) {
                return item.label && (item.disabled || item.route || item.path || item.href);
            })
            : [];
    }

    function readNavigationAdminMenu() {
        if (navigationAdminMenuCache) {
            return navigationAdminMenuCache;
        }
        try {
            const request = new XMLHttpRequest();
            const url = resolveApiUrl("/navigation/admin-menu");
            request.open("GET", url, false);
            request.setRequestHeader("Accept", "application/json");
            request.send(null);
            const payload = request.responseText ? JSON.parse(request.responseText) : null;
            if (request.status < 200 || request.status >= 300 || payload?.ok === false) {
                if (request.status === 404 || request.status === 405) {
                    throw new Error(serverRouteUnavailableDiagnostic("GET", url, request.status));
                }
                throw new Error(payload?.error || "Navigation API did not return Admin menu data.");
            }
            const data = payload?.data || {};
            navigationAdminMenuCache = {
                adminMainItems: normalizeNavigationItems(data.adminMainItems),
                diagnostic: "",
                ownerMenuItems: normalizeNavigationItems(data.ownerMenuItems),
                source: data.source || "server-api"
            };
            return navigationAdminMenuCache;
        } catch (error) {
            const diagnostic = error instanceof Error ? error.message : "";
            if (diagnostic) {
                console.warn("[navigation/operator] Admin navigation service unavailable:", diagnostic);
            }
            navigationAdminMenuCache = missingNavigationMenu(diagnostic);
            return navigationAdminMenuCache;
        }
    }

    function menuItemHref(item) {
        if (item.path) {
            return pathHref(item.path);
        }
        if (item.route) {
            return routeHref(item.route);
        }
        return item.href || "#";
    }

    function createMenuLink(item) {
        if (item.disabled) {
            const label = document.createElement("span");
            label.dataset.menuItemDisabled = "";
            label.setAttribute("aria-disabled", "true");
            label.textContent = item.planned ? item.label + " (planned)" : item.label;
            return label;
        }
        const link = document.createElement("a");
        link.dataset.navLink = "";
        if (item.route) {
            link.dataset.route = item.route;
        }
        link.href = menuItemHref(item);
        if (item.localNotes) {
            link.dataset.adminNotesLocalMenu = "";
        }
        link.textContent = item.label;
        return link;
    }

    function createOwnerMenu(items) {
        const item = document.createElement("div");
        item.className = "nav-item";
        item.dataset.ownerMenu = "";

        const label = document.createElement("a");
        label.dataset.navLink = "";
        label.dataset.route = "owner";
        label.dataset.ownerMenuLabel = "";
        label.href = routeHref("owner");
        label.textContent = "Owner \u25BE";

        const submenu = document.createElement("div");
        submenu.className = "sub-menu";
        submenu.dataset.ownerSubmenu = "";
        submenu.setAttribute("aria-label", "Owner");
        items.forEach(function (menuItem) {
            submenu.append(createMenuLink(menuItem));
        });

        item.append(label, submenu);
        return item;
    }

    function createAdminNavigationDiagnostic(message) {
        const diagnostic = document.createElement("p");
        diagnostic.className = "status";
        diagnostic.dataset.adminNavigationDiagnostic = "";
        diagnostic.setAttribute("role", "status");
        diagnostic.textContent = "Admin navigation is unavailable. Start the site API and refresh.";
        return diagnostic;
    }

    function createAdminMenu(loginState) {
        const navigationMenu = readNavigationAdminMenu();
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
        if (navigationMenu.diagnostic) {
            submenu.append(createAdminNavigationDiagnostic(navigationMenu.diagnostic));
        }
        navigationMenu.adminMainItems.forEach(function (menuItem) {
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

    function renderOwnerMenu(root, canUseOwner) {
        root.querySelectorAll("[data-owner-menu]").forEach(function (item) {
            item.remove();
        });
        if (!canUseOwner) {
            return;
        }
        const navigationMenu = readNavigationAdminMenu();
        const nav = root.querySelector("nav.nav-links");
        if (nav && navigationMenu.ownerMenuItems.length) {
            nav.append(createOwnerMenu(navigationMenu.ownerMenuItems));
        }
    }

    function serverRouteUnavailableDiagnostic(method, url, status) {
        return "Server API route unavailable for " + method + " " + url + " (" + status + "). Start the site API route instead of a static-only server.";
    }

    function missingSessionApiLoginState(diagnostic) {
        return {
            authenticated: false,
            diagnostic: diagnostic || "Account session service is unavailable. Sign in before using protected pages.",
            displayName: "Sign In",
            mode: "missing-api",
            roleSlugs: []
        };
    }

    function requestSessionApi(method, url, body) {
        const request = new XMLHttpRequest();
        const apiUrl = resolveApiUrl(url);
        request.open(method, apiUrl, false);
        request.setRequestHeader("Accept", "application/json");
        if (body !== undefined) {
            request.setRequestHeader("Content-Type", "application/json");
        }
        request.send(body === undefined ? null : JSON.stringify(body));
        const payload = request.responseText ? JSON.parse(request.responseText) : null;
        if (request.status < 200 || request.status >= 300 || payload?.ok === false) {
            if (request.status === 404 || request.status === 405) {
                throw new Error(serverRouteUnavailableDiagnostic(method, apiUrl, request.status));
            }
            throw new Error(payload?.error || "Session API did not return a valid auth response.");
        }
        if (!payload || !Object.prototype.hasOwnProperty.call(payload, "data")) {
            throw new Error("Session API response did not include account session data.");
        }
        return payload.data;
    }

    function authSessionFromApiData(session) {
        return {
            authenticated: Boolean(session?.authenticated),
            diagnostic: session?.diagnostic || "",
            displayName: session?.authenticated ? session.displayName || session.label || "Account" : "Sign In",
            mode: session?.mode || "",
            roleSlugs: Array.isArray(session?.roleSlugs) ? session.roleSlugs : [],
            userKey: session?.userKey || null
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

    function currentLoginState() {
        try {
            return authSessionFromApiData(requestSessionApi("GET", "/session/current"));
        } catch (error) {
            const diagnostic = error instanceof Error ? error.message : "";
            if (diagnostic) {
                console.warn("[session/operator] Account session service unavailable:", diagnostic);
            }
            return missingSessionApiLoginState(diagnostic);
        }
    }

    function normalizedPlatformBanner(data, fallbackSource) {
        const banner = data && typeof data === "object" ? data : {};
        const tone = ["info", "warning", "danger"].includes(banner.tone) ? banner.tone : "info";
        return {
            active: banner.active === true,
            message: typeof banner.message === "string" ? banner.message.trim() : "",
            source: typeof banner.source === "string" ? banner.source : fallbackSource || "platform-settings",
            sourceTable: typeof banner.sourceTable === "string" ? banner.sourceTable : "",
            sourceTableRowKey: typeof banner.sourceTableRowKey === "string" ? banner.sourceTableRowKey : "",
            tone
        };
    }

    async function requestPlatformBanner() {
        const response = await fetchApi("/platform-settings/banner", {
            headers: { "Accept": "application/json" },
            method: "GET"
        });
        const payload = await response.json().catch(function () {
            return null;
        });
        if (!response.ok || payload?.ok === false) {
            throw new Error(payload?.error || "Platform banner settings are unavailable.");
        }
        const data = payload?.data || {};
        return {
            banner: normalizedPlatformBanner({
                ...(data.banner || {}),
                sourceTable: data.banner?.sourceTable || data.sourceTable || "",
            }, "platform-settings"),
            diagnostics: data.diagnostics || data.banner || {}
        };
    }

    async function requestEnvironmentBanner() {
        const data = await requestPublicConfigDataAsync();
        return {
            banner: normalizedPlatformBanner(data.environmentBanner || {}, "environment-config"),
            diagnostics: data.diagnostics || {}
        };
    }

    function removePlatformBanner() {
        document.querySelectorAll("[data-platform-banner]").forEach(function (banner) {
            banner.remove();
        });
    }

    function createPlatformBanner(banner, placement) {
        const section = document.createElement("section");
        section.className = "platform-banner platform-banner--" + banner.tone;
        section.dataset.platformBanner = "";
        section.dataset.platformBannerPlacement = placement;
        section.dataset.platformBannerSource = banner.source || "platform-settings";
        section.setAttribute("aria-label", "Platform notice");
        const inner = document.createElement("div");
        inner.className = "platform-banner__inner";
        const message = document.createElement("p");
        message.className = "platform-banner__message";
        message.textContent = banner.message;
        inner.append(message);
        section.append(inner);
        return section;
    }

    function platformBannerDiagnostics(banner) {
        return {
            active: banner.active,
            message: banner.message,
            sourceTable: banner.sourceTable,
            sourceTableRowKey: banner.sourceTableRowKey
        };
    }

    function renderBannerPlacement(banners, placement) {
        const nodes = banners.map((banner) => createPlatformBanner(banner, placement));
        const header = document.querySelector("header.site-header");
        if (placement === "header" && header) {
            header.after(...nodes);
            return;
        }
        const footer = document.querySelector("footer.footer");
        if (placement === "footer" && footer?.parentNode) {
            footer.before(...nodes);
            return;
        }
        if (placement === "header") {
            const main = document.querySelector("main");
            if (main) {
                main.before(...nodes);
            }
        }
    }

    async function renderPlatformBanner() {
        const [environmentResponse, platformResponse] = await Promise.allSettled([
            requestEnvironmentBanner(),
            requestPlatformBanner()
        ]);
        const banners = [];
        removePlatformBanner();
        if (environmentResponse.status === "fulfilled") {
            const banner = environmentResponse.value.banner;
            window.GameFoundryEnvironmentBannerDiagnostics = environmentResponse.value.diagnostics || {};
            if (banner.active && banner.message) {
                banners.push(banner);
            }
        } else {
            window.GameFoundryEnvironmentBannerDiagnostics = {
                environmentBannerActive: false,
                environmentLabelConfigured: false,
                secretsExposed: false
            };
            console.warn("[platform-settings/operator] Public configuration unavailable:", environmentResponse.reason instanceof Error ? environmentResponse.reason.message : String(environmentResponse.reason || ""));
        }
        if (platformResponse.status === "fulfilled") {
            const banner = platformResponse.value.banner;
            window.GameFoundryPlatformBannerDiagnostics = platformResponse.value.diagnostics || platformBannerDiagnostics(banner);
            if (banner.active && banner.message) {
                banners.push(banner);
            }
        } else {
            window.GameFoundryPlatformBannerDiagnostics = {
                active: false,
                message: "",
                sourceTable: "",
                sourceTableRowKey: ""
            };
            console.warn("[platform-settings/operator] Platform banner unavailable:", platformResponse.reason instanceof Error ? platformResponse.reason.message : String(platformResponse.reason || ""));
        }
        if (banners.length) {
            renderBannerPlacement(banners, "header");
            renderBannerPlacement(banners, "footer");
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

    function applyCurrentLoginState(root) {
        const loginState = currentLoginState();
        const accountItem = navItemForRoute(root, "account");
        const accountLink = accountItem?.querySelector(":scope > a[data-route='account']");
        const accountMenu = directSubMenu(accountItem);
        const canUseAccount = loginState.authenticated;
        const canUseAdmin = loginState.authenticated && loginState.roleSlugs.includes("admin");
        const canUseOwner = loginState.authenticated && loginState.roleSlugs.includes("owner");

        if (accountLink) {
            accountLink.textContent = canUseAccount ? loginState.displayName + " \u25BE" : "Sign In";
            accountLink.setAttribute("aria-label", canUseAccount ? "Account menu for " + loginState.displayName : "Sign In");
            accountLink.setAttribute("href", canUseAccount ? routeHref("account") : routeHref("sign-in"));
        }
        if (accountMenu) {
            accountMenu.hidden = !canUseAccount;
            accountMenu.querySelectorAll("a").forEach(function (link) {
                link.tabIndex = canUseAccount ? 0 : -1;
                link.setAttribute("aria-hidden", String(!canUseAccount));
            });
        }
        renderOwnerMenu(root, canUseOwner);
        renderAdminMenu(root, loginState, canUseAdmin);
    }

    function protectedPageRequirement(pagePath) {
        if (pagePath.indexOf("owner/") === 0) {
            return {
                role: "owner",
                title: "Owner role required",
                message: "Sign in as Owner to open this Owner page."
            };
        }
        if (pagePath.indexOf("admin/") === 0) {
            return {
                role: "admin",
                title: "Admin role required",
                message: "Sign in as Admin to open this Admin page."
            };
        }
        if ([
            "account/sign-in.html",
            "account/create-account.html",
            "account/lost-password.html",
            "account/password-reset.html"
        ].includes(pagePath)) {
            return null;
        }
        if (pagePath.indexOf("account/") === 0) {
            return {
                role: "creator",
                title: "Sign-in required",
                message: "Sign in with your account to open Account pages."
            };
        }
        return null;
    }

    function canUseProtectedPage(requirement, loginState) {
        if (!requirement) {
            return true;
        }
        const roleSlugs = Array.isArray(loginState?.roleSlugs) ? loginState.roleSlugs : [];
        return Boolean(loginState?.authenticated && roleSlugs.includes(requirement.role));
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
            "Use an account with the required access and try again."
        ].filter(Boolean).join(" ");
        const link = document.createElement("a");
        link.className = "btn primary";
        link.href = routeHref("sign-in") + "?returnTo=" + encodeURIComponent(pagePath);
        link.textContent = "Open Sign In";
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
        const loginState = currentLoginState();
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

    function markActiveAccountSideNavigation(root) {
        const pagePath = currentPagePath() || "index.html";
        root.querySelectorAll("[data-account-side-nav-link]").forEach(function (link) {
            const route = routeMap[link.dataset.route] || "";
            if (route === pagePath) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            } else {
                link.classList.remove("active");
                link.removeAttribute("aria-current");
            }
        });
    }

    function wireAccountSideNavigationCollapse(root) {
        const header = root.querySelector(".tool-column-header");
        if (!header || header.querySelector(".horizontal-accordion-toggle")) return;

        const title = header.querySelector("h2, h3");
        const label = title ? title.textContent.trim() : "Account";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "horizontal-accordion-toggle horizontal-accordion-toggle--left";
        button.dataset.accountSideNavCollapse = "";
        button.setAttribute("aria-label", "Collapse " + label);
        button.setAttribute("aria-expanded", "true");
        updateHorizontalToggleIcon(button);
        header.insertBefore(button, header.firstChild);

        button.addEventListener("click", function () {
            const collapsed = root.classList.toggle("is-collapsed");
            const accountPanel = root.closest(".account-panel");
            if (accountPanel) {
                accountPanel.classList.toggle("is-left-collapsed", collapsed);
            }
            button.setAttribute("aria-expanded", collapsed ? "false" : "true");
            button.setAttribute("aria-label", (collapsed ? "Expand " : "Collapse ") + label);
            updateHorizontalToggleIcon(button);
        });
    }

    function wireReturnToTop(root) {
        const button = root.querySelector("[data-return-to-top]");
        if (!button) return;
        updateReturnToTopIcon(button);

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
        const session = (() => {
            try {
                return authSessionFromApiData(requestSessionApi("POST", "/session/logout"));
            } catch (error) {
                return missingSessionApiLoginState(error instanceof Error ? error.message : "");
            }
        })();
        window.dispatchEvent(new CustomEvent("gamefoundry:session-user-changed", {
            detail: session
        }));
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
            applyCurrentLoginState(element);
            markActiveNavigation(element);
            wireAccountLogout(element);
        } else if (partialName === "account-side-nav") {
            markActiveAccountSideNavigation(element);
            wireAccountSideNavigationCollapse(element);
        } else if (partialName === "footer") {
            wireReturnToTop(element);
        }
        return element;
    }

    async function loadPartial(slot) {
        const element = await partialElement(slot.dataset.partial);
        if (element) {
            if (slot.dataset.partialReplace !== undefined) {
                slot.replaceWith(element);
            } else {
                slot.replaceChildren(element);
            }
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
            applyCurrentLoginState(header);
            markActiveNavigation(header);
        }
    }

    function refreshHeaderOnly() {
        const header = document.querySelector("header.site-header");
        if (header) {
            applyCurrentLoginState(header);
            markActiveNavigation(header);
        }
    }

    async function renderToolboxStatusBar() {
        const pagePath = currentPagePath() || "";
        if (pagePath.indexOf("toolbox/") !== 0) {
            return;
        }
        try {
            const module = await import(assetUrl("js/toolbox-status-bar.js"));
            if (typeof module.mountToolboxStatusBar === "function") {
                module.mountToolboxStatusBar({
                    gameHubHref: routeHref("game-hub"),
                    pagePath
                });
            }
        } catch (error) {
            console.warn("[toolbox/status] Shared status bar could not be loaded.", error);
        }
    }

    function refreshSharedSurfaces() {
        renderPlatformBanner()
            .then(renderToolboxStatusBar)
            .catch(function (error) {
                console.error(error);
            });
    }

    enforcePageProtection();
    loadThemeIcons();
    document.addEventListener("DOMContentLoaded", function () {
        enforcePageProtection();
        const slots = Array.from(document.querySelectorAll("[data-partial]"));
        const tasks = slots.length ? slots.map(loadPartial) : [
            replaceExisting("header-nav", "header.site-header"),
            replaceExisting("footer", "footer.footer")
        ];
        Promise.all(tasks).then(refreshSharedSurfaces).catch(function (error) {
            console.error(error);
        });
    });
    window.addEventListener("gamefoundry:session-user-changed", refreshHeaderLoginState);
    window.addEventListener("gamefoundry:data-changed", refreshHeaderOnly);
    window.addEventListener("gamefoundry:platform-settings-changed", refreshSharedSurfaces);
}());
