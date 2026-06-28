(function () {
    const slot = document.querySelector("[data-tool-display-mode]");
    if (!slot) return;

    const displayMode = document.createElement("details");
    displayMode.className = "tool-display-mode";
    displayMode.id = "toolDisplayMode";
    displayMode.open = true;

    const publicAssetRoot = "/assets/theme-v2/images";
    const pageTitle = document.querySelector(".page-title h1");
    const toolName = pageTitle ? pageTitle.textContent.trim() : "Tool";
    const routeSlug = window.location.pathname.split("/").pop().replace(/\.html$/, "");
    const toolSlug = slot.dataset.toolSlug || routeSlug;
    let themeIconRegistry = window.ThemeV2Icons || null;

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

    function createChevronShell(name, shellClassName, iconClassName) {
        const shell = document.createElement("span");
        shell.className = shellClassName;
        shell.setAttribute("aria-hidden", "true");
        shell.appendChild(createThemeIconNode(name, iconClassName));
        return shell;
    }

    function replaceIconNode(parent, selector, icon) {
        const current = parent.querySelector(selector);
        if (current) {
            current.replaceWith(icon);
        } else {
            parent.appendChild(icon);
        }
    }

    function updateVerticalAccordionChevron(details) {
        const accordionSummary = details.querySelector(":scope > summary");
        if (!accordionSummary) return;
        const iconName = details.open ? "chevron-up" : "chevron-down";
        const shell = createChevronShell(iconName, "vertical-accordion__chevron", "vertical-accordion__chevron-icon");
        replaceIconNode(accordionSummary, ":scope > .vertical-accordion__chevron", shell);
    }

    function wireVerticalAccordionChevron(details) {
        if (details.dataset.themeV2ChevronWired === "true") {
            updateVerticalAccordionChevron(details);
            return;
        }

        details.dataset.themeV2ChevronWired = "true";
        details.addEventListener("toggle", function () {
            updateVerticalAccordionChevron(details);
        });
        updateVerticalAccordionChevron(details);
    }

    function refreshVerticalAccordionChevrons() {
        document.querySelectorAll("details.vertical-accordion").forEach(wireVerticalAccordionChevron);
    }

    function updateToolDisplayModeModeIcon() {
        const iconName = document.body.classList.contains("tool-focus-mode") || document.fullscreenElement
            ? "exit-fullscreen"
            : "fullscreen";
        const icon = createThemeIconNode(iconName, "layout-icon tool-display-mode__mode-icon");
        replaceIconNode(summary, ":scope > .tool-display-mode__mode-icon", icon);
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
        button.replaceChildren(createThemeIconNode(horizontalToggleIconName(button), "horizontal-accordion-toggle__icon"));
    }

    function refreshHorizontalToggleIcons() {
        document.querySelectorAll(".horizontal-accordion-toggle").forEach(updateHorizontalToggleIcon);
    }

    function refreshThemeIcons() {
        refreshVerticalAccordionChevrons();
        updateToolDisplayModeModeIcon();
        refreshHorizontalToggleIcons();
    }

    import("/assets/theme-v2/js/theme-icons.js").then(function (module) {
        themeIconRegistry = module;
        refreshThemeIcons();
    }).catch(function () {
        themeIconRegistry = window.ThemeV2Icons || themeIconRegistry;
    });

    function explicitPngName(source) {
        if (!source) return "";
        const cleanPath = source.split("#")[0].split("?")[0].replace(/\\/g, "/");
        const fileName = cleanPath.split("/").pop() || "";
        return fileName.toLowerCase().endsWith(".png") ? fileName : "";
    }

    function publicImageSource(source, folder) {
        const fileName = explicitPngName(source);
        if (!source || !fileName || fileName === "index.png") {
            return publicAssetRoot + "/image-missing.svg";
        }

        const cleanPath = source.split("#")[0].split("?")[0].replace(/\\/g, "/");
        const assetIndex = cleanPath.indexOf("/assets/theme-v2/images/");
        if (assetIndex >= 0) {
            return cleanPath.slice(assetIndex);
        }
        if (cleanPath.indexOf("assets/theme-v2/images/") === 0) {
            return "/" + cleanPath;
        }

        return publicAssetRoot + "/" + folder + "/" + fileName;
    }

    const summary = document.createElement("summary");
    summary.setAttribute("aria-label", "Tool Display Mode");
    summary.title = "Tool Display Mode";

    const badge = document.createElement("img");
    badge.className = "tool-display-mode__badge";
    badge.src = publicImageSource(slot.dataset.toolIconSrc, "badges");
    badge.alt = toolName + " badge";
    summary.appendChild(badge);

    const toolNameLabel = document.createElement("span");
    toolNameLabel.className = "tool-display-mode__tool-name";
    toolNameLabel.textContent = toolName;
    summary.appendChild(toolNameLabel);

    const character = document.createElement("img");
    character.className = "tool-display-mode__character";
    character.src = publicImageSource(slot.dataset.toolCharacterSrc, "characters");
    character.alt = toolName + " character";
    summary.appendChild(character);

    summary.appendChild(createThemeIconNode("fullscreen", "layout-icon tool-display-mode__mode-icon"));
    displayMode.appendChild(summary);
    slot.replaceWith(displayMode);

    function applyRegistryImages(registry) {
        const registryTool = registry.getToolBySlug(toolSlug);
        if (!registryTool) {
            return;
        }

        const registryName = registryTool.displayName || registryTool.name || toolName;
        const registryDescription = registryTool.description || registryTool.shortDescription || registryName;
        const pageKicker = document.querySelector(".page-title .kicker");
        const pageLede = document.querySelector(".page-title .lede");
        const metaDescription = document.querySelector("meta[name='description']");
        const leftColumnTitle = document.querySelector(".tool-workspace .tool-column .tool-column-header h2");

        document.title = registryName + " - GameFoundryStudio";
        if (pageTitle) {
            pageTitle.textContent = registryName;
        }
        if (pageKicker) {
            pageKicker.textContent = "Toolbox / " + registryName;
        }
        if (pageLede) {
            pageLede.textContent = registryDescription;
        }
        if (metaDescription) {
            metaDescription.setAttribute("content", registryDescription);
        }
        if (leftColumnTitle) {
            leftColumnTitle.textContent = registryName;
        }
        badge.alt = registryName + " badge";
        toolNameLabel.textContent = registryName;
        character.alt = registryName + " character";
        badge.src = registry.getToolImageSource(registryTool, "badge");
        character.src = registry.getToolImageSource(registryTool, "tool");
    }

    async function applyRegistryDisplayData() {
        try {
            const registry = await import("/toolbox/tool-registry-api-client.js");
            const registryDiagnostic = registry.getToolRegistryApiDiagnostic();
            if (registryDiagnostic) {
                throw new Error(registryDiagnostic);
            }
            applyRegistryImages(registry);
        } catch (error) {
            console.warn("Tool display mode registry metadata could not be loaded.", error);
        }
    }

    applyRegistryDisplayData();

    async function enterToolMode() {
        document.body.classList.add("tool-focus-mode");
        displayMode.open = false;
        updateToolDisplayModeModeIcon();

        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.warn("Fullscreen was blocked by the browser. CSS tool display mode is still active.", error);
        }
    }

    async function exitToolMode() {
        document.body.classList.remove("tool-focus-mode");
        displayMode.open = true;
        updateToolDisplayModeModeIcon();

        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.warn("Exit fullscreen failed.", error);
        }
    }

    summary.addEventListener("click", function (event) {
        event.preventDefault();

        if (document.body.classList.contains("tool-focus-mode") || document.fullscreenElement) {
            exitToolMode();
        } else {
            enterToolMode();
        }
    });

    document.addEventListener("fullscreenchange", function () {
        if (!document.fullscreenElement && document.body.classList.contains("tool-focus-mode")) {
            document.body.classList.remove("tool-focus-mode");
            displayMode.open = true;
            refreshThemeIcons();
        }
    });

    refreshVerticalAccordionChevrons();

    document.querySelectorAll(".tool-workspace").forEach(function (workspace) {
        const columns = workspace.querySelectorAll(":scope > .tool-column");
        if (columns.length < 2) return;

        const sideColumns = [
            { column: columns[0], side: "left" },
            { column: columns[columns.length - 1], side: "right" }
        ];

        sideColumns.forEach(function (entry) {
            const header = entry.column.querySelector(".tool-column-header");
            if (!header || header.querySelector(".horizontal-accordion-toggle")) return;

            const title = header.querySelector("h2, h3");
            const label = title ? title.textContent.trim() : "Tool column";
            const button = document.createElement("button");
            button.type = "button";
            button.className = "horizontal-accordion-toggle horizontal-accordion-toggle--" + entry.side;
            button.setAttribute("aria-label", "Collapse " + label);
            button.setAttribute("aria-expanded", "true");
            updateHorizontalToggleIcon(button);
            header.insertBefore(button, header.firstChild);

            button.addEventListener("click", function () {
                const collapsed = entry.column.classList.toggle("is-collapsed");
                workspace.classList.toggle("is-" + entry.side + "-collapsed", collapsed);
                button.setAttribute("aria-expanded", collapsed ? "false" : "true");
                button.setAttribute("aria-label", (collapsed ? "Expand " : "Collapse ") + label);
                updateHorizontalToggleIcon(button);
            });
        });
    });
}());
