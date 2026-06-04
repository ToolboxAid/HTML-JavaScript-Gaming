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
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Coordinate Build, Play, and Share readiness for one game project.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Game Design",
                    subgroup: "Design Contract",
                    href: "../toolbox/game-design/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Design gameplay, systems, rules, and player experience.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Game Configuration",
                    subgroup: "Playable Gate",
                    href: "../toolbox/game-configuration/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
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
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Manage connected storage, sync, and publishing support.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Localization",
                    href: "../toolbox/localization/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan game translation, language coverage, and contributor review workflows.",
                    role: "Community / Media",
                    mascot: "localization",
                    theme: "bot"
                },
                {
                    title: "Publish",
                    href: "../toolbox/publish/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Prepare publishing workflows and release-ready game packages.",
                    role: "ForgeBot",
                    mascot: "forgebot",
                    theme: "forge"
                },
                {
                    title: "Storage",
                    href: "../toolbox/storage/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Inspect local storage, saved state, and tool data.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Media & Audio",
            tools: [
                {
                    title: "MIDI",
                    href: "../toolbox/midi/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Build MIDI-driven audio and music interaction flows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Audio",
                    href: "../toolbox/sound/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Prepare audio and game sound workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Music Library",
                    href: "../toolbox/music-library/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan reusable music library and soundtrack workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Sound Effects",
                    href: "../toolbox/sound-effects/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan reusable game effect audio workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Speech to Text",
                    href: "../toolbox/speech-to-text/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan spoken input and transcription workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Text to Speech",
                    href: "../toolbox/text-to-speech/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan generated narration and spoken output workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Voice",
                    href: "../toolbox/voice/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan character voice, capture, and review workflows.",
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
                    title: "Palette / Colors",
                    href: "../toolbox/palette/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Craft and manage color palettes for your games.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                }
            ]
        },
        {
            group: "Input Mapping",
            tools: [
                {
                    title: "Input Mapping",
                    href: "../toolbox/input/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Map player controls and configure input workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                }
            ]
        },
        {
            group: "Support",
            tools: [
                {
                    title: "Fonts",
                    href: "../toolbox/fonts/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan game typography, font loading, and readable text choices.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Learn",
                    href: "../toolbox/learn/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan tutorials, guidance, and learning resources for creators.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Marketplace",
                    href: "../toolbox/marketplace/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan marketplace listing, asset, and discovery workflows.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Settings",
                    href: "../toolbox/settings/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Plan visible creator settings for future configurable tool behavior.",
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
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Create timing, animation states, and motion workflows.",
                    role: "Spark",
                    mascot: "spark",
                    theme: "pixel"
                },
                {
                    title: "Assets",
                    subgroup: "Sprite",
                    href: "../toolbox/assets/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Create sprites, animations, vectors and palettes.",
                    role: "Pixel Smith",
                    mascot: "pixel-smith",
                    theme: "pixel"
                },
                {
                    title: "Custom Extensions",
                    subgroup: "Custom Extensions",
                    href: "../toolbox/code/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Register approved Engine V2 extension hooks and creator-private custom logic.",
                    role: "Foundry Bot",
                    mascot: "foundry-bot",
                    theme: "bot"
                },
                {
                    title: "Object Vector",
                    subgroup: "Vector",
                    href: "../toolbox/object-vector/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
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
                    image: "../assets/theme-v2/images/image-missing.svg",
                    description: "Author visual effects, emitters, and particle looks.",
                    role: "Spark",
                    mascot: "spark",
                    theme: "pixel"
                },
                {
                    title: "World Vector",
                    subgroup: "Vector",
                    href: "../toolbox/world-vector/index.html",
                    image: "../assets/theme-v2/images/image-missing.svg",
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
        "Input Mapping": "tool-group-development-system",
        "Media & Audio": "tool-group-media-audio",
        "Objects": "tool-group-build-create",
        "Planning": "tool-group-development-system",
        "Support": "tool-group-ai-learning",
        "Tooling": "tool-group-development-system",
        "Worlds": "tool-group-content-assets"
    };
    const groupSwatchMap = {
        "AI": "swatch-purple",
        "Assets": "swatch-gold",
        "Audio": "swatch-red",
        "Colors": "swatch-blue",
        "Input": "swatch-gray",
        "Input Mapping": "swatch-gray",
        "Media & Audio": "swatch-red",
        "Objects": "swatch-pink",
        "Planning": "swatch-blue",
        "Support": "swatch-purple",
        "Tooling": "swatch-gray",
        "Worlds": "swatch-orange"
    };
    const badgeMap = {
        "AI Assistant": "ai-assistant"
    };
    const defaultProgress = {
        requiredForTestable: false,
        requiredForPublish: false,
        status: "ready",
        progressChecklist: ["Review readiness"]
    };
    const projectProgressSummary = {
        projectProgress: "Core path in-progress",
        publishingProgress: "Publish blocked until configuration and required assets are ready",
        currentFocus: "Complete Game Configuration",
        recommendedNextTool: "Game Configuration"
    };
    const progressModel = {
        "AI Assistant": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "ready",
            progressChecklist: ["Use for guidance", "Keep side/capability status"]
        },
        "Animation": {
            requiredForTestable: true,
            requiredForPublish: false,
            status: "in-progress",
            progressChecklist: ["Draft animation states", "Confirm playable timing"]
        },
        "Assets": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "in-progress",
            progressChecklist: ["Create required sprites", "Attach release-safe previews"]
        },
        "Cloud": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Side/capability tool", "Enable only when project sync is required"]
        },
        "Custom Extensions": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Side/capability tool", "Review extension contract before use"]
        },
        "Game Configuration": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "locked",
            progressChecklist: ["Choose release profile", "Disable public debug settings", "Confirm playable gate"]
        },
        "Game Design": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "in-progress",
            progressChecklist: ["Define win condition", "Document core loop", "List required content"]
        },
        "Input Mapping": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "ready",
            progressChecklist: ["Map controls", "Verify keyboard/gamepad path"]
        },
        "Localization": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Side/capability tool", "Use when translation is required"]
        },
        "MIDI": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "ready",
            progressChecklist: ["Optional audio path", "Attach music only if required"]
        },
        "Music Library": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned media tool", "Use when reusable music sourcing is required"]
        },
        "Object Vector": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "ready",
            progressChecklist: ["Create object geometry", "Confirm collision-ready export"]
        },
        "Palette / Colors": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "complete",
            progressChecklist: ["Choose palette", "Confirm accessible contrast"]
        },
        "Particles": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Optional effects path", "Use when visual effects are required"]
        },
        "Project Workspace": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "in-progress",
            progressChecklist: ["Create project", "Confirm current focus", "Pick next required tool"]
        },
        "Publish": {
            requiredForTestable: false,
            requiredForPublish: true,
            status: "locked",
            progressChecklist: ["Prepare release package", "Confirm share metadata", "Review public readiness"]
        },
        "Audio": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "ready",
            progressChecklist: ["Optional sound path", "Attach effects only if required"]
        },
        "Sound Effects": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned media tool", "Use when reusable sound effect sourcing is required"]
        },
        "Speech to Text": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned media tool", "Use when spoken input is required"]
        },
        "Storage": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "complete",
            progressChecklist: ["Side/capability tool", "Inspect saves without blocking build path"]
        },
        "Text to Speech": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned media tool", "Use when generated speech is required"]
        },
        "Voice": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned media tool", "Use when character voice planning is required"]
        },
        "World Vector": {
            requiredForTestable: true,
            requiredForPublish: true,
            status: "in-progress",
            progressChecklist: ["Draft world layout", "Confirm map bounds"]
        },
        "Fonts": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned support tool", "Use when custom typography is required"]
        },
        "Learn": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned support tool", "Use when creator guidance is required"]
        },
        "Marketplace": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned support tool", "Use when marketplace listing work is required"]
        },
        "Settings": {
            requiredForTestable: false,
            requiredForPublish: false,
            status: "locked",
            progressChecklist: ["Planned support tool", "Use when configurable settings are required"]
        }
    };
    const buildPathGroups = [
        {
            title: "Project Workspace",
            groupClass: "tool-group-ai-learning",
            note: "Start with the single project surface that coordinates current focus, readiness, and recommended next tool.",
            tools: ["Project Workspace"]
        },
        {
            title: "Game Design",
            groupClass: "tool-group-development-system",
            note: "Define gameplay, rules, player experience, and the requirements that shape the build path.",
            tools: ["Game Design"]
        },
        {
            title: "Game Configuration",
            groupClass: "tool-group-development-system",
            note: "Set the release profile, debug policy, and playable gate before the required tool path is treated as ready.",
            tools: ["Game Configuration"]
        },
        {
            title: "Required Tool Path",
            groupClass: "tool-group-build-create",
            note: "Use the registry fields requiredForTestable and requiredForPublish to identify blockers.",
            tools: ["Palette / Colors", "Input Mapping", "Assets", "Object Vector", "World Vector", "Animation"]
        },
        {
            title: "Build Game",
            groupClass: "tool-group-media-audio",
            note: "Build Game is a path milestone in this wireframe, not a separate Toolbox tool.",
            tools: []
        },
        {
            title: "Game Testing",
            groupClass: "tool-group-development-system",
            note: "Game Testing is a readiness milestone; Storage remains a side/capability tool unless a future registry rule requires it.",
            tools: []
        },
        {
            title: "Publish",
            groupClass: "tool-group-community-marketplace",
            note: "Publish is required for public release; Cloud, Marketplace, Learn, AI Assistant, Settings, and Storage remain side/capability surfaces by default.",
            tools: ["Publish"]
        }
    ];
    const progressOrder = ["complete", "in-progress", "ready", "locked"];
    const allTools = toolGroups.flatMap((group) => group.tools.map((tool) => ({
        ...tool,
        group: group.group,
        ...(progressModel[tool.title] || defaultProgress)
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
        return "index";
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
        return progressOrder.map((status) => ({
            title: status,
            tools: getOrderedTools("ascending").filter((tool) => tool.status === status),
            groupClass: "tool-group-development-system"
        })).filter((group) => group.tools.length > 0);
    }

    function getBuildPathGroups() {
        return buildPathGroups.map((group) => ({
            title: group.title,
            tools: group.tools.map((title) => allTools.find((tool) => tool.title === title)).filter(Boolean),
            groupClass: group.groupClass,
            note: group.note
        }));
    }

    function createProgressSummary() {
        const article = document.createElement("article");
        article.className = "callout";

        const title = document.createElement("h3");
        title.textContent = "Project Progress";

        const projectProgress = document.createElement("p");
        projectProgress.textContent = "Project Progress: " + projectProgressSummary.projectProgress;

        const publishingProgress = document.createElement("p");
        publishingProgress.textContent = "Publishing Progress: " + projectProgressSummary.publishingProgress;

        const currentFocus = document.createElement("p");
        currentFocus.textContent = "Current Focus: " + projectProgressSummary.currentFocus;

        const nextTool = document.createElement("p");
        nextTool.textContent = "Recommended Next Tool: " + projectProgressSummary.recommendedNextTool;

        article.append(title, projectProgress, publishingProgress, currentFocus, nextTool);
        return article;
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
        readiness.dataset.toolboxReadiness = tool.status;
        readiness.textContent = tool.status;

        const title = document.createElement("h3");
        title.textContent = tool.title;

        const description = document.createElement("p");
        description.textContent = tool.description;

        const link = document.createElement("a");
        link.className = "btn";
        link.href = tool.href;
        link.textContent = tool.href.indexOf("toolbox/") === 0 || tool.href.indexOf("../toolbox/") === 0 ? "Open Tool" : "Open Page";

        if (options.showReadiness) {
            const requirements = document.createElement("p");
            requirements.textContent = `requiredForTestable: ${tool.requiredForTestable ? "yes" : "no"} | requiredForPublish: ${tool.requiredForPublish ? "yes" : "no"}`;

            const checklist = document.createElement("ul");
            tool.progressChecklist.forEach((item) => {
                const entry = document.createElement("li");
                entry.textContent = item;
                checklist.append(entry);
            });

            body.append(badgeCluster, group, readiness, title, description, requirements, checklist, link);
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

        if (group.note) {
            const note = document.createElement("p");
            note.textContent = group.note;
            body.append(note);
        }

        const grid = document.createElement("div");
        grid.className = "card-grid";

        group.tools.forEach((tool) => {
            grid.append(createToolCard(tool, options));
        });

        if (group.tools.length) {
            body.append(grid);
        }
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
            list.replaceChildren(createProgressSummary(), ...accordions);
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
