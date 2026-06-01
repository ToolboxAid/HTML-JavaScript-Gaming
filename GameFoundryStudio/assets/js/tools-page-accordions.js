(function () {
    const list = document.querySelector("[data-tools-accordion-list]");
    if (!list) {
        return;
    }

    const orderButton = document.querySelector("[data-tools-order]");
    const groupedButton = document.querySelector("[data-tools-sort='grouped']");
    let currentMode = "ascending";
    const toolGroups = [
        {
            group: "Content & Assets",
            tools: [
                {
                    title: "Asset Studio",
                    href: "asset-studio.html",
                    image: "../assets/images/tools/asset-studio.png",
                    description: "Create sprites, animations, vectors and palettes.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Build & Create",
            tools: [
                {
                    title: "Object Vector Studio",
                    href: "object-vector-studio.html",
                    image: "../assets/images/tools/object-vector-studio.png",
                    description: "Create object-ready vector assets and reusable scene pieces.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                },
                {
                    title: "World Vector Studio",
                    href: "world-vector-studio.html",
                    image: "../assets/images/tools/world-vector-studio.png",
                    description: "Shape world layouts, maps, terrain, and scene geometry.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Content & Assets",
            tools: [
                {
                    title: "Palette Manager",
                    href: "palette-manager.html",
                    image: "../assets/images/tools/palette-manager.png",
                    description: "Craft and manage color palettes for your games.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Build & Create",
            tools: [
                {
                    title: "Game Builder",
                    href: "game-builder.html",
                    image: "../assets/images/tools/game-builder.png",
                    description: "Assemble components and build your game from scratch.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                }
            ]
        },
        {
            group: "Build & Create",
            tools: [
                {
                    title: "Game Design Studio",
                    href: "game-design-studio.html",
                    image: "../assets/images/tools/game-design-studio.png",
                    description: "Design gameplay, systems, rules, and player experience.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                }
            ]
        },
        {
            group: "Platform & Cloud",
            tools: [
                {
                    title: "Publish Studio",
                    href: "publisher.html",
                    image: "../assets/images/tools/publish-studio.png",
                    description: "Prepare publishing workflows and release-ready game packages.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                }
            ]
        },
        {
            group: "Build & Create",
            tools: [
                {
                    title: "Animation Studio",
                    href: "animation-studio.html",
                    image: "../assets/images/tools/animation-studio.png",
                    description: "Create timing, animation states, and motion workflows.",
                    role: "Spark",
                    mascot: "spark",
                    theme: "pixel"
                },
                {
                    title: "Particle Studio",
                    href: "particle-studio.html",
                    image: "../assets/images/tools/particle-studio.png",
                    description: "Author visual effects, emitters, and particle looks.",
                    role: "Spark",
                    mascot: "spark",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Media & Audio",
            tools: [
                {
                    title: "MIDI Studio",
                    href: "midi-studio.html",
                    image: "../assets/images/tools/midi-studio.png",
                    description: "Build MIDI-driven audio and music interaction flows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Sound Studio",
                    href: "sound-studio.html",
                    image: "../assets/images/tools/sound-studio.png",
                    description: "Prepare audio, sound effects, and game sound workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "AI & Learning",
            tools: [
                {
                    title: "AI Assistant",
                    href: "ai-assistant.html",
                    image: "../assets/images/tools/ai-assistant.png",
                    description: "Get guided technical help for game creation workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Development & System",
            tools: [
                {
                    title: "Code Studio",
                    href: "code-studio.html",
                    image: "../assets/images/tools/code-studio.png",
                    description: "Write code, extend systems and build custom logic.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Input Studio",
                    href: "input-studio.html",
                    image: "../assets/images/tools/input-studio.png",
                    description: "Map player controls and configure input workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Community & Marketplace",
            tools: [
                {
                    title: "Marketplace",
                    href: "../marketplace/index.html",
                    image: "../assets/images/tools/marketplace.png",
                    description: "Browse community-ready tools, assets, listings, and distribution surfaces.",
                    role: "Community",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Community / Media",
            tools: [
                {
                    title: "Localization Studio",
                    href: "localization-studio/index.html",
                    image: "../assets/images/tools/localization-studio.png",
                    description: "Plan game translation, language coverage, and contributor review workflows.",
                    role: "Community / Media",
                    mascot: "localization-studio",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Play",
            tools: [
                {
                    title: "Arcade",
                    href: "../arcade/index.html",
                    image: "../assets/images/tools/arcade.png",
                    description: "Play and review available games from the Game Foundry arcade.",
                    role: "Play",
                    mascot: "forgebot",
                    theme: "forge"
                }
            ]
        },
        {
            group: "Platform & Cloud",
            tools: [
                {
                    title: "Storage Inspector",
                    href: "storage-inspector.html",
                    image: "../assets/images/tools/storage-inspector.png",
                    description: "Inspect local storage, saved state, and tool data.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        }
    ];
    const groupClassMap = {
        "Build & Create": "tool-group-build-create",
        "Content & Assets": "tool-group-content-assets",
        "Media & Audio": "tool-group-media-audio",
        "AI & Learning": "tool-group-ai-learning",
        "Platform & Cloud": "tool-group-platform-cloud",
        "Development & System": "tool-group-development-system",
        "Community / Media": "tool-group-community-marketplace",
        "Community & Marketplace": "tool-group-community-marketplace",
        "Play": "tool-group-play"
    };
    const allTools = toolGroups.flatMap((group) => group.tools.map((tool) => ({
        ...tool,
        group: group.group
    })));

    function groupClass(groupName) {
        return groupClassMap[groupName] || "";
    }

    function setActiveButton(mode) {
        if (orderButton) {
            orderButton.setAttribute("aria-pressed", String(mode !== "grouped"));
            orderButton.textContent = `Order ${orderButton.dataset.toolsOrder === "ascending" ? "A-Z" : "Z-A"}`;
        }
        if (groupedButton) {
            groupedButton.setAttribute("aria-pressed", String(mode === "grouped"));
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

    function createGroupLabel(groupName) {
        const label = document.createElement("span");
        label.className = "tool-group-label";

        const swatch = document.createElement("span");
        swatch.className = "tool-group-swatch";
        swatch.setAttribute("role", "img");
        swatch.setAttribute("aria-label", groupName + " group color");
        swatch.title = groupName + " color";

        const text = document.createElement("span");
        text.textContent = groupName;

        label.append(swatch, text);
        return label;
    }

    function createToolCard(tool) {
        const article = document.createElement("article");
        article.className = `tool-card ${tool.theme} ${groupClass(tool.group)}`;
        article.dataset.mascot = tool.mascot;

        const link = document.createElement("a");
        link.href = tool.href;

        const image = document.createElement("img");
        image.src = tool.image;
        image.alt = tool.title;

        const body = document.createElement("div");
        body.className = "body";

        const title = document.createElement("h3");
        title.textContent = tool.title;

        const description = document.createElement("p");
        description.textContent = tool.description;

        const pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = "Open page";

        const group = document.createElement("span");
        group.className = "role";
        group.append(createGroupLabel(tool.group));

        body.append(title, description, pill, group);
        link.append(image, body);
        article.append(link);
        return article;
    }

    function createAccordion(group, isOpen) {
        const details = document.createElement("details");
        details.className = `vertical-accordion ${group.groupClass}`;
        details.dataset.toolsAccordion = group.title;
        details.open = isOpen;

        const summary = document.createElement("summary");
        summary.append(createGroupLabel(group.title));

        const body = document.createElement("div");
        body.className = "accordion-body";

        const grid = document.createElement("div");
        grid.className = "tool-grid";

        group.tools.forEach((tool) => {
            grid.append(createToolCard(tool));
        });

        body.append(grid);
        details.append(summary, body);
        return details;
    }

    function createToolGrid(tools) {
        const grid = document.createElement("div");
        grid.className = "tool-grid";
        tools.forEach((tool) => {
            grid.append(createToolCard(tool));
        });
        return grid;
    }

    function render(mode) {
        if (mode === "grouped") {
            const accordions = getGroupedTools().map((group, position) => createAccordion(group, position === 0));
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

    render("ascending");
}());
