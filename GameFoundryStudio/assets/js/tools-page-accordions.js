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
            group: "Assets / Content",
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
            group: "Assets / Content",
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
            group: "Assets / Content",
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
            group: "Building / Creation",
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
            group: "Building / Creation",
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
            group: "Building / Creation",
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
            group: "Design / Animation",
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
            group: "Media / Audio / Community",
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
            group: "Technology / System",
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
            group: "Technology / System",
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
            group: "Settings and Admin",
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
    const allTools = toolGroups.flatMap((group) => group.tools);

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
            if (group) {
                group.tools.push(...toolGroup.tools);
                return;
            }
            groups.push({
                title: toolGroup.group,
                tools: toolGroup.tools.slice()
            });
        });
        return groups;
    }

    function createToolCard(tool) {
        const article = document.createElement("article");
        article.className = `tool-card ${tool.theme}`;
        article.dataset.mascot = tool.mascot;

        const link = document.createElement("a");
        link.href = tool.href;

        const image = document.createElement("img");
        image.src = tool.image;
        image.alt = tool.title;

        const body = document.createElement("div");
        body.className = "body";

        const role = document.createElement("span");
        role.className = "role";
        role.textContent = tool.role;

        const title = document.createElement("h3");
        title.textContent = tool.title;

        const description = document.createElement("p");
        description.textContent = tool.description;

        const pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = "Open page";

        body.append(role, title, description, pill);
        link.append(image, body);
        article.append(link);
        return article;
    }

    function createAccordion(title, tools, isOpen) {
        const details = document.createElement("details");
        details.className = "vertical-accordion";
        details.dataset.toolsAccordion = title;
        details.open = isOpen;

        const summary = document.createElement("summary");
        summary.textContent = title;

        const body = document.createElement("div");
        body.className = "accordion-body";

        const grid = document.createElement("div");
        grid.className = "tool-grid";

        tools.forEach((tool) => {
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
            const accordions = getGroupedTools().map((group, position) => createAccordion(group.title, group.tools, position === 0));
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
