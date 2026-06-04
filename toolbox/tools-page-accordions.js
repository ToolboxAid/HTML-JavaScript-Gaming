(function () {
    const list = document.querySelector("[data-tools-accordion-list]");
    if (!list) {
        return;
    }

    const orderButton = document.querySelector("[data-tools-order]");
    const groupedButton = document.querySelector("[data-tools-sort='grouped']");
    const progressButton = document.querySelector("[data-tools-view='progress']");
    const buildPathButton = document.querySelector("[data-tools-view='build-path']");
    let currentMode = "ascending";
    const toolGroups = [
        {
            group: "AI",
            tools: [
                {
                    title: "AI Assistant",
                    href: "../toolbox/ai-assistant/index.html",
                    image: "../assets/theme-v2/images/tools/ai-assistant.png",
                    description: "Get guided technical help for game creation workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Planning",
            tools: [
                {
                    title: "Project Workspace",
                    href: "../toolbox/project-workspace/index.html",
                    image: "../assets/theme-v2/images/tools/learn-studio.png",
                    description: "Coordinate Build, Play, and Share readiness for one game project.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Game Design",
                    subgroup: "Design Contract",
                    href: "../toolbox/game-design/index.html",
                    image: "../assets/theme-v2/images/tools/game-design-studio.png",
                    description: "Design gameplay, systems, rules, and player experience.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Game Configuration",
                    subgroup: "Playable Gate",
                    href: "../toolbox/game-configuration/index.html",
                    image: "../assets/theme-v2/images/tools/settings-studio.png",
                    description: "Plan release profile, debug visibility, and playable readiness gates.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                }
            ]
        },
        {
            group: "Assets",
            tools: [
                {
                    title: "Cloud",
                    href: "../toolbox/cloud/index.html",
                    image: "../assets/theme-v2/images/tools/cloud-studio.png",
                    description: "Manage connected storage, sync, and publishing support.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Localization",
                    href: "../toolbox/localization/index.html",
                    image: "../assets/theme-v2/images/tools/localization-studio.png",
                    description: "Plan game translation, language coverage, and contributor review workflows.",
                    role: "Community / Media",
                    mascot: "localization-studio",
                    theme: "bot"
                },
                {
                    title: "Publish",
                    href: "../toolbox/publish/index.html",
                    image: "../assets/theme-v2/images/tools/publish-studio.png",
                    description: "Prepare publishing workflows and release-ready game packages.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Storage Inspector",
                    href: "../toolbox/storage/index.html",
                    image: "../assets/theme-v2/images/tools/storage-inspector.png",
                    description: "Inspect local storage, saved state, and tool data.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Audio",
            tools: [
                {
                    title: "MIDI",
                    href: "../toolbox/midi/index.html",
                    image: "../assets/theme-v2/images/tools/midi-studio.png",
                    description: "Build MIDI-driven audio and music interaction flows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Sound",
                    href: "../toolbox/sound/index.html",
                    image: "../assets/theme-v2/images/tools/sound-studio.png",
                    description: "Prepare audio, sound effects, and game sound workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Colors",
            tools: [
                {
                    title: "Palette Manager",
                    href: "../toolbox/palette/index.html",
                    image: "../assets/theme-v2/images/tools/palette-manager.png",
                    description: "Craft and manage color palettes for your games.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Input",
            tools: [
                {
                    title: "Input",
                    href: "../toolbox/input/index.html",
                    image: "../assets/theme-v2/images/tools/input-studio.png",
                    description: "Map player controls and configure input workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Objects",
            tools: [
                {
                    title: "Animation",
                    subgroup: "Animated Sprite",
                    href: "../toolbox/animation/index.html",
                    image: "../assets/theme-v2/images/tools/animation-studio.png",
                    description: "Create timing, animation states, and motion workflows.",
                    role: "Spark",
                    mascot: "spark",
                    theme: "pixel"
                },
                {
                    title: "Assets",
                    subgroup: "Sprite",
                    href: "../toolbox/assets/index.html",
                    image: "../assets/theme-v2/images/tools/asset-studio.png",
                    description: "Create sprites, animations, vectors and palettes.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                },
                {
                    title: "Custom Extensions",
                    subgroup: "Custom Extensions",
                    href: "../toolbox/code/index.html",
                    image: "../assets/theme-v2/images/tools/code-studio.png",
                    description: "Register approved Engine V2 extension hooks and creator-private custom logic.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Object Vector",
                    subgroup: "Vector",
                    href: "../toolbox/object-vector/index.html",
                    image: "../assets/theme-v2/images/tools/object-vector-studio.png",
                    description: "Create object-ready vector assets and reusable scene pieces.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Worlds",
            tools: [
                {
                    title: "Particles",
                    subgroup: "Isometric",
                    href: "../toolbox/particles/index.html",
                    image: "../assets/theme-v2/images/tools/particle-studio.png",
                    description: "Author visual effects, emitters, and particle looks.",
                    role: "Spark",
                    mascot: "spark",
                    theme: "pixel"
                },
                {
                    title: "World Vector",
                    subgroup: "Vector",
                    href: "../toolbox/world-vector/index.html",
                    image: "../assets/theme-v2/images/tools/world-vector-studio.png",
                    description: "Shape world layouts, maps, terrain, and scene geometry.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        }
    ];
    const groupClassMap = {
        "AI": "tool-group-ai-learning",
        "Assets": "tool-group-community-marketplace",
        "Audio": "tool-group-media-audio",
        "Colors": "tool-group-platform-cloud",
        "Input": "tool-group-development-system",
        "Objects": "tool-group-build-create",
        "Planning": "tool-group-development-system",
        "Tooling": "tool-group-development-system",
        "Worlds": "tool-group-content-assets"
    };
    const groupSwatchMap = {
        "AI": "swatch-purple",
        "Assets": "swatch-gold",
        "Audio": "swatch-red",
        "Colors": "swatch-blue",
        "Input": "swatch-gray",
        "Objects": "swatch-pink",
        "Planning": "swatch-blue",
        "Tooling": "swatch-gray",
        "Worlds": "swatch-orange"
    };
    const badgeMap = {
        "Publish": "publish-studio"
    };
    const readinessMap = {
        "AI Assistant": "ready",
        "Animation": "in-progress",
        "Assets": "in-progress",
        "Cloud": "locked",
        "Custom Extensions": "locked",
        "Game Configuration": "locked",
        "Game Design": "in-progress",
        "Input": "ready",
        "Localization": "locked",
        "MIDI": "ready",
        "Object Vector": "ready",
        "Palette Manager": "complete",
        "Particles": "locked",
        "Project Workspace": "in-progress",
        "Publish": "locked",
        "Sound": "ready",
        "Storage Inspector": "complete",
        "World Vector": "in-progress"
    };
    const buildPathGroups = [
        {
            title: "Plan",
            groupClass: "tool-group-ai-learning",
            tools: ["Project Workspace", "AI Assistant", "Game Design", "Game Configuration", "Palette Manager", "Input"]
        },
        {
            title: "Create",
            groupClass: "tool-group-build-create",
            tools: ["Assets", "Object Vector", "World Vector", "Animation", "Particles"]
        },
        {
            title: "Audio",
            groupClass: "tool-group-media-audio",
            tools: ["MIDI", "Sound"]
        },
        {
            title: "Verify",
            groupClass: "tool-group-development-system",
            tools: ["Storage Inspector", "Custom Extensions"]
        },
        {
            title: "Release",
            groupClass: "tool-group-community-marketplace",
            tools: ["Cloud", "Localization", "Publish"]
        }
    ];
    const progressOrder = ["complete", "in-progress", "ready", "locked"];
    const allTools = toolGroups.flatMap((group) => group.tools.map((tool) => ({
        ...tool,
        group: group.group,
        readiness: readinessMap[tool.title] || "ready"
    })));

    function groupClass(groupName) {
        return groupClassMap[groupName] || "";
    }

    function groupSwatch(groupName) {
        return groupSwatchMap[groupName] || "swatch-orange";
    }

    function badgeName(tool) {
        if (badgeMap[tool.title]) {
            return badgeMap[tool.title];
        }
        return tool.image.split("/").pop().replace(".png", "");
    }

    function setActiveButton(mode) {
        if (orderButton) {
            orderButton.setAttribute("aria-pressed", String(mode === "ascending" || mode === "descending"));
            orderButton.textContent = `Order ${orderButton.dataset.toolsOrder === "ascending" ? "A-Z" : "Z-A"}`;
        }
        if (groupedButton) {
            groupedButton.setAttribute("aria-pressed", String(mode === "grouped"));
        }
        if (progressButton) {
            progressButton.setAttribute("aria-pressed", String(mode === "progress"));
        }
        if (buildPathButton) {
            buildPathButton.setAttribute("aria-pressed", String(mode === "build-path"));
        }
    }

    function getOrderedTools(mode) {
        const tools = allTools.slice();
        tools.sort((left, right) => left.title.localeCompare(right.title));
        if (mode === "descending") {
            tools.reverse();
        }
        return tools;
    }

    function getGroupedTools() {
        const groups = [];
        toolGroups.forEach((toolGroup) => {
            const group = groups.find((entry) => entry.title === toolGroup.group);
            const tools = toolGroup.tools.map((tool) => ({
                ...tool,
                group: toolGroup.group
            }));
            if (group) {
                group.tools.push(...tools);
                return;
            }
            groups.push({
                title: toolGroup.group,
                tools,
                groupClass: groupClass(toolGroup.group)
            });
        });
        return groups;
    }

    function getProgressGroups() {
        return progressOrder.map((readiness) => ({
            title: readiness,
            tools: getOrderedTools("ascending").filter((tool) => tool.readiness === readiness),
            groupClass: "tool-group-development-system"
        })).filter((group) => group.tools.length > 0);
    }

    function getBuildPathGroups() {
        return buildPathGroups.map((group) => ({
            title: group.title,
            tools: group.tools.map((title) => allTools.find((tool) => tool.title === title)).filter(Boolean),
            groupClass: group.groupClass
        })).filter((group) => group.tools.length > 0);
    }

    function createGroupLabel(groupName) {
        const label = document.createElement("span");
        label.className = "content-cluster";

        const swatch = document.createElement("span");
        swatch.className = "brand-color-swatch " + groupSwatch(groupName);
        swatch.setAttribute("role", "img");
        swatch.setAttribute("aria-label", groupName + " group color");
        swatch.title = groupName + " color";

        const text = document.createElement("span");
        text.textContent = groupName;

        label.append(swatch, text);
        return label;
    }

    function createToolCard(tool, options = {}) {
        const article = document.createElement("article");
        article.className = `control-card ${groupClass(tool.group)}`;
        article.dataset.mascot = tool.mascot;

        const media = document.createElement("div");
        media.className = "card-media";
        const image = document.createElement("img");
        image.src = tool.image;
        image.alt = tool.title + " preview";
        media.append(image);

        const body = document.createElement("div");
        body.className = "card-body";

        const badgeCluster = createGroupLabel(tool.group);
        const badge = document.createElement("object");
        badge.data = "../assets/theme-v2/images/badges/" + badgeName(tool) + ".png";
        badge.type = "image/png";
        badge.width = 48;
        badge.height = 48;
        badge.setAttribute("aria-label", tool.title + " badge");
        badge.textContent = tool.title + " badge";
        badgeCluster.append(badge);

        const group = document.createElement("div");
        group.className = "kicker";
        group.textContent = tool.subgroup ? `${tool.group} - ${tool.subgroup}` : tool.group;

        const readiness = document.createElement("span");
        readiness.className = "pill";
        readiness.dataset.toolboxReadiness = tool.readiness;
        readiness.textContent = tool.readiness;

        const title = document.createElement("h3");
        title.textContent = tool.title;

        const description = document.createElement("p");
        description.textContent = tool.description;

        const link = document.createElement("a");
        link.className = "btn";
        link.href = tool.href;
        link.textContent = tool.href.indexOf("toolbox/") === 0 || tool.href.indexOf("../toolbox/") === 0 ? "Open Tool" : "Open Page";

        if (options.showReadiness) {
            body.append(badgeCluster, group, readiness, title, description, link);
        } else {
            body.append(badgeCluster, group, title, description, link);
        }
        article.append(media, body);
        return article;
    }

    function createAccordion(group, isOpen, options = {}) {
        const details = document.createElement("details");
        details.className = `vertical-accordion ${group.groupClass}`;
        details.dataset.toolsAccordion = group.title;
        details.open = isOpen;

        const summary = document.createElement("summary");
        summary.append(createGroupLabel(group.title));

        const body = document.createElement("div");
        body.className = "accordion-body";

        const grid = document.createElement("div");
        grid.className = "card-grid";

        group.tools.forEach((tool) => {
            grid.append(createToolCard(tool, options));
        });

        body.append(grid);
        details.append(summary, body);
        return details;
    }

    function createToolGrid(tools) {
        const grid = document.createElement("div");
        grid.className = "card-grid";
        tools.forEach((tool) => {
            grid.append(createToolCard(tool));
        });
        return grid;
    }

    function render(mode) {
        if (mode === "grouped") {
            const accordions = getGroupedTools().map((group, position) => createAccordion(group, position === 0));
            list.replaceChildren(...accordions);
        } else if (mode === "progress") {
            const accordions = getProgressGroups().map((group) => createAccordion(group, true, { showReadiness: true }));
            list.replaceChildren(...accordions);
        } else if (mode === "build-path") {
            const accordions = getBuildPathGroups().map((group) => createAccordion(group, true));
            list.replaceChildren(...accordions);
        } else {
            list.replaceChildren(createToolGrid(getOrderedTools(mode)));
        }
        currentMode = mode;
        setActiveButton(mode);
    }

    if (orderButton) {
        orderButton.addEventListener("click", () => {
            const nextOrder = currentMode === "grouped"
                ? orderButton.dataset.toolsOrder
                : orderButton.dataset.toolsOrder === "ascending" ? "descending" : "ascending";
            orderButton.dataset.toolsOrder = nextOrder;
            render(nextOrder);
        });
    }

    if (groupedButton) {
        groupedButton.addEventListener("click", () => {
            render("grouped");
        });
    }

    if (progressButton) {
        progressButton.addEventListener("click", () => {
            render("progress");
        });
    }

    if (buildPathButton) {
        buildPathButton.addEventListener("click", () => {
            render("build-path");
        });
    }

    render("ascending");
}());
