(function () {
    const slot = document.querySelector("[data-tool-display-mode]");
    if (!slot) return;

    const displayMode = document.createElement("details");
    displayMode.className = "tool-display-mode";
    displayMode.id = "toolDisplayMode";
    displayMode.open = true;

    const publicAssetRoot = "/assets/theme/v2/images";
    const pageTitle = document.querySelector(".page-title h1");
    const toolName = pageTitle ? pageTitle.textContent.trim() : "Tool";
    const routeSlug = window.location.pathname.split("/").pop().replace(/\.html$/, "");
    const toolSlug = slot.dataset.toolSlug || (routeSlug === "publisher" ? "publish-studio" : routeSlug);

    function explicitPngName(source) {
        if (!source) return "";
        const cleanPath = source.split("#")[0].split("?")[0].replace(/\\/g, "/");
        const fileName = cleanPath.split("/").pop() || "";
        return fileName.toLowerCase().endsWith(".png") ? fileName : "";
    }

    function publicImageSource(source, folder) {
        const fileName = explicitPngName(source) || (source ? "index.png" : toolSlug + ".png");
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

    const fullscreenName = document.createElement("span");
    fullscreenName.className = "tool-display-mode__fullscreen-name";
    fullscreenName.textContent = toolName;
    summary.appendChild(fullscreenName);
    displayMode.appendChild(summary);

    const body = document.createElement("div");
    body.className = "tool-display-mode__body";

    const character = document.createElement("img");
    character.className = "tool-display-mode__character";
    character.src = publicImageSource(slot.dataset.toolCharacterSrc, "characters");
    character.alt = toolName + " character";
    body.appendChild(character);

    const description = document.createElement("span");
    description.className = "tool-display-mode__description";
    description.textContent = toolName;
    body.appendChild(description);
    displayMode.appendChild(body);
    slot.replaceWith(displayMode);


    async function enterToolMode() {
        document.body.classList.add("tool-focus-mode");
        displayMode.open = false;

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
        }
    });

    document.querySelectorAll(".tool-workspace").forEach(function (workspace) {
        const columns = workspace.querySelectorAll(":scope > .tool-column");
        if (columns.length < 2) return;

        const sideColumns = [
            { column: columns[0], side: "left", openIndicator: "<", closedIndicator: ">" },
            { column: columns[columns.length - 1], side: "right", openIndicator: ">", closedIndicator: "<" }
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
            button.textContent = entry.openIndicator;
            header.insertBefore(button, header.firstChild);

            button.addEventListener("click", function () {
                const collapsed = entry.column.classList.toggle("is-collapsed");
                workspace.classList.toggle("is-" + entry.side + "-collapsed", collapsed);
                button.textContent = collapsed ? entry.closedIndicator : entry.openIndicator;
                button.setAttribute("aria-expanded", collapsed ? "false" : "true");
                button.setAttribute("aria-label", (collapsed ? "Expand " : "Collapse ") + label);
            });
        });
    });
}());
