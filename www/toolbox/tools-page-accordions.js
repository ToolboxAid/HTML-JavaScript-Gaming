import {
    GAME_HUB_MEMBER_ROLES,
    createGameHubApiRepository
} from "./game-hub/game-hub-api-client.js";
import {
    readGameJourneyCompletionMetrics
} from "../../src/api/game-journey-completion-api-client.js";
import {
    castToolboxVote,
    readToolboxVoteSnapshot
} from "../../src/api/toolbox-votes-api-client.js";
import {
    TOOL_IMAGE_FALLBACK,
    getActiveToolRegistry,
    getToolRegistryApiDiagnostic,
    getToolImageDiagnostics,
    getToolImageSource,
    getToolRoute,
    getToolboxContract,
    toolRegistryMetadataDiagnostic
} from "./tool-registry-api-client.js";
import { getSessionCurrent } from "../../src/api/session-api-client.js";

(function () {
    const list = document.querySelector("[data-tools-accordion-list]");
    if (!list) {
        return;
    }

    const orderButton = document.querySelector("[data-tools-order]");
    const groupedButton = document.querySelector("[data-tools-sort='grouped']");
    const buildPathButton = document.querySelector("[data-tools-view='build-path']");
    const toolCount = document.querySelector("[data-tools-count]");
    const statusFilterList = document.querySelector("[data-toolbox-status-filters]");
    const launchStatus = document.querySelector("[data-toolbox-launch-status]");
    const searchParams = new URLSearchParams(window.location.search);
    const gameHubRepository = createGameHubApiRepository();
    const urlMemberRole = searchParams.get("memberRole");
    const defaultGameMemberRole = "Owner";
    const gameMemberRole = GAME_HUB_MEMBER_ROLES.includes(urlMemberRole)
        ? urlMemberRole
        : defaultGameMemberRole;
    const session = getSessionCurrent();
    const adminSession = session?.isAdmin === true;
    const authenticatedSession = session?.authenticated === true && Boolean(session?.userKey);
    const sessionRoles = Array.isArray(session?.roleSlugs) ? session.roleSlugs : [];
    const betaSession = sessionRoles.includes("beta");
    let currentMode = searchParams.get("view") === "group" ? "grouped" : searchParams.get("view") === "build-path" ? "build-path" : "ascending";
    let targetGroupSlug = currentMode === "grouped" ? groupSlug(searchParams.get("group")) : "";
    const visibleReleaseChannels = new Set();
    let releaseFilterMode = "";
    const registryDiagnostic = getToolRegistryApiDiagnostic();
    if (registryDiagnostic) {
        const diagnostic = document.createElement("p");
        diagnostic.className = "status";
        diagnostic.setAttribute("role", "status");
        diagnostic.textContent = "Toolbox registry could not load from the server API: " + registryDiagnostic;
        list.replaceChildren(diagnostic);
        return;
    }
    const toolboxContract = getToolboxContract();
    const releaseChannelOrder = Object.freeze([...(toolboxContract.releaseChannels || [])]);
    const defaultReleaseChannel = releaseChannelOrder[0] || "planned";
    const toolboxDefaultReleaseChannels = Object.freeze([...(toolboxContract.defaultReleaseChannels?.toolbox || [])]);
    const buildPathDefaultReleaseChannels = Object.freeze([...(toolboxContract.defaultReleaseChannels?.buildPath || [])]);
    const releaseChannelLabels = Object.freeze({ ...(toolboxContract.releaseChannelLabels || {}) });
    const releaseChannelHelpText = Object.freeze({ ...(toolboxContract.releaseChannelHelpText || {}) });
    const releaseChannelByStatus = Object.freeze({ ...(toolboxContract.releaseChannelByStatus || {}) });
    const roleFocusTools = Object.freeze({ ...(toolboxContract.roleFocusTools || {}) });
    const toolboxGroupOrder = Object.freeze([...(toolboxContract.toolboxGroupOrder || [])]);
    const groupSwatchMap = Object.freeze({ ...(toolboxContract.groupSwatches || {}) });
    const stateSwatchMap = Object.freeze({ ...(toolboxContract.releaseChannelSwatches || {}) });
    const gameJourneyGroupOrder = Object.freeze([
        "Idea",
        "Design",
        "Graphics",
        "Audio",
        "Objects",
        "Worlds",
        "Interface",
        "Controls",
        "Rules",
        "Progression",
        "Play Test",
        "Publish",
        "Share"
    ]);
    const gameJourneyFriendlyDescriptions = Object.freeze({
        "Idea": "Dream, brainstorm, and explore",
        "Design": "Shape your game's story and systems",
        "Graphics": "Create the visual look of your game",
        "Audio": "Build sounds, music, and voices",
        "Objects": "Create the things players interact with",
        "Worlds": "Build levels, maps, and places to explore",
        "Interface": "Design menus, HUDs, and player screens",
        "Controls": "Define how players interact with your game",
        "Rules": "Create gameplay behavior and events",
        "Progression": "Build rewards, unlocks, and advancement",
        "Play Test": "Test, debug, and improve your game",
        "Publish": "Prepare and release your game",
        "Share": "Grow your audience and community"
    });
    const gameJourneyGroupSwatches = Object.freeze({
        "Idea": "swatch-red",
        "Design": "swatch-orange",
        "Graphics": "swatch-gold",
        "Audio": "swatch-yellow",
        "Objects": "swatch-lime",
        "Worlds": "swatch-green",
        "Interface": "swatch-teal",
        "Controls": "swatch-cyan",
        "Rules": "swatch-blue",
        "Progression": "swatch-indigo",
        "Play Test": "swatch-purple",
        "Publish": "swatch-magenta",
        "Share": "swatch-pink"
    });
    const gameJourneyGroupClasses = Object.freeze({
        "Idea": "tool-group-idea",
        "Design": "tool-group-journey-design",
        "Graphics": "tool-group-graphics",
        "Audio": "tool-group-journey-audio",
        "Objects": "tool-group-objects",
        "Worlds": "tool-group-worlds",
        "Interface": "tool-group-interface",
        "Controls": "tool-group-controls",
        "Rules": "tool-group-rules",
        "Progression": "tool-group-progression",
        "Play Test": "tool-group-play-test",
        "Publish": "tool-group-publish",
        "Share": "tool-group-journey-share"
    });
    const gameJourneyGroupByToolId = Object.freeze({
        "achievements": "Progression",
        "ai-assistant": "Design",
        "animations": "Graphics",
        "assets": "Graphics",
        "audio": "Audio",
        "audio-effects": "Audio",
        "build-game": "Publish",
        "characters": "Objects",
        "cloud": "Share",
        "code": "Rules",
        "colors": "Graphics",
        "community": "Share",
        "controls": "Controls",
        "debug": "Play Test",
        "environments": "Publish",
        "events": "Rules",
        "fonts": "Interface",
        "game-configuration": "Design",
        "game-crew": "Design",
        "game-design": "Design",
        "game-journey": "Progression",
        "game-migration": "Publish",
        "game-testing": "Play Test",
        "game-hub": "Design",
        "hitboxes": "Controls",
        "idea-board": "Idea",
        "input-mapping-v2": "Controls",
        "languages": "Interface",
        "learn": "Idea",
        "marketplace": "Share",
        "messages": "Design",
        "midi": "Audio",
        "music": "Audio",
        "objects": "Objects",
        "particles": "Graphics",
        "performance": "Play Test",
        "platform-settings": "Publish",
        "publish": "Publish",
        "ratings": "Share",
        "saved-data": "Progression",
        "speech-to-text": "Audio",
        "sprites": "Graphics",
        "tags": "Design",
        "text-to-speech": "Audio",
        "users": "Design",
        "videos": "Graphics",
        "voices": "Audio",
        "worlds": "Worlds"
    });
    const toolboxGroupPositions = new Map(toolboxGroupOrder.map((group, index) => [group, index]));
    const workflowToolOrderByGroup = Object.freeze({
        "Design": Object.freeze({
            "game-hub": 1,
            "users": 2,
            "game-crew": 2,
            "game-configuration": 3,
            "tags": 4,
            "game-design": 5,
            "ai-assistant": 6
        })
    });
    toolboxDefaultReleaseChannels.forEach((channel) => {
        visibleReleaseChannels.add(channel);
    });
    const registryTools = getActiveToolRegistry();
    const registryOrderPositions = new Map(registryTools.map((tool, index) => [tool.id, index]));
    const registryToolsByTitle = new Map(registryTools.map((tool) => [tool.displayName || tool.name, tool]));
    const toolGroups = gameJourneyGroupOrder
        .map((group) => ({
            group,
            tools: registryTools
                .filter((tool) => includeToolInToolboxInventory(tool) && gameJourneyGroupForTool(tool) === group)
                .sort(compareByRegistryOrder)
        }))
        .filter((group) => group.tools.length > 0);
    let toolboxVoteRows = [];
    const voteRowsByToolId = new Map();
    let voteDiagnostic = "";
    let gameJourneyCompletionSnapshot = null;
    let gameJourneyCompletionUnavailable = false;

    function applyToolboxVoteSnapshot(snapshot) {
        voteRowsByToolId.clear();
        toolboxVoteRows = snapshot?.rows || [];
        toolboxVoteRows.forEach((row) => {
            voteRowsByToolId.set(row.toolKey || row.toolId, row);
        });
    }

    try {
        applyToolboxVoteSnapshot(readToolboxVoteSnapshot());
    } catch (error) {
        voteDiagnostic = error instanceof Error ? error.message : String(error || "Toolbox vote data unavailable.");
    }

    try {
        gameJourneyCompletionSnapshot = readGameJourneyCompletionMetrics();
    } catch (error) {
        gameJourneyCompletionUnavailable = true;
    }

    const gameJourneyCompletionByGroup = new Map(
        (gameJourneyCompletionSnapshot?.records || []).map((metric) => [metric.bucketName, metric])
    );

    function gameJourneyAccordionLabel(groupName) {
        const metric = gameJourneyCompletionByGroup.get(groupName);
        const description = gameJourneyFriendlyDescriptions[groupName] || groupName;
        const percentComplete = Number.isFinite(metric?.percentComplete) ? metric.percentComplete : 0;
        return `${percentComplete}% Complete — ${groupName}: ${description}`;
    }

    function getGameProgressSummary() {
        const activeGame = gameHubRepository.getActiveGame();
        const progress = gameHubRepository.getGameProgress();
        return {
            activeGameName: activeGame?.name || "No active game",
            gameProgress: progress.gameProgress,
            publishingProgress: progress.publishingProgress,
            currentFocus: progress.currentFocus,
            recommendedNextTool: progress.recommendedNextTool
        };
    }
    function compareByTitle(left, right) {
        return left.title.localeCompare(right.title);
    }

    function compareByRegistryOrder(left, right) {
        const leftGroup = toolboxGroupPositions.get(left.toolboxGroup) ?? Number.MAX_SAFE_INTEGER;
        const rightGroup = toolboxGroupPositions.get(right.toolboxGroup) ?? Number.MAX_SAFE_INTEGER;
        return leftGroup - rightGroup
            || (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER)
            || String(left.displayName || left.name || "").localeCompare(String(right.displayName || right.name || ""));
    }

    function workflowOrderForTool(tool) {
        const toolGroupOrder = workflowToolOrderByGroup[tool.group || gameJourneyGroupForTool(tool)];
        if (toolGroupOrder && Number.isInteger(toolGroupOrder[tool.id])) {
            return toolGroupOrder[tool.id];
        }
        return registryOrderPositions.get(tool.id) ?? Number.MAX_SAFE_INTEGER;
    }

    function compareByWorkflowOrder(left, right) {
        return workflowOrderForTool(left) - workflowOrderForTool(right)
            || (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER)
            || String(left.displayName || left.name || left.title || "").localeCompare(String(right.displayName || right.name || right.title || ""));
    }

    function releaseChannelForTool(tool) {
        if (typeof tool === "string") {
            const explicitChannel = tool.trim().toLowerCase();
            return releaseChannelOrder.includes(explicitChannel) ? explicitChannel : defaultReleaseChannel;
        }
        const explicitChannel = typeof tool?.releaseChannel === "string" ? tool.releaseChannel.trim().toLowerCase() : "";
        if (releaseChannelOrder.includes(explicitChannel)) {
            return explicitChannel;
        }
        return releaseChannelByStatus[tool?.status] || defaultReleaseChannel;
    }

    function releaseChannelLabel(channel) {
        return releaseChannelLabels[channel] || releaseChannelLabels[defaultReleaseChannel] || channel || defaultReleaseChannel;
    }

    function releaseChannelHelp(channel) {
        return releaseChannelHelpText[channel] || releaseChannelHelpText[defaultReleaseChannel] || "";
    }

    function includeToolInToolboxInventory(tool) {
        return tool?.visibleInToolsList === true || (adminSession && tool?.adminOnly === true);
    }

    function toolboxInventoryTools() {
        return registryTools.filter(includeToolInToolboxInventory);
    }

    function hasSessionRole(roleName) {
        return sessionRoles.includes(roleName);
    }

    function announceToolboxStatus(message) {
        if (launchStatus) {
            launchStatus.textContent = message;
        }
    }

    function colorGroupForTool(tool) {
        return tool.category || "Platform";
    }

    function gameJourneyGroupForTool(tool) {
        const toolId = String(tool?.id || "").trim().toLowerCase();
        if (gameJourneyGroupByToolId[toolId]) {
            return gameJourneyGroupByToolId[toolId];
        }
        const searchable = [
            toolId,
            tool?.displayName,
            tool?.name,
            tool?.category,
            tool?.toolboxGroup,
            tool?.subgroup
        ].filter(Boolean).join(" ").toLowerCase();
        if (/\b(audio|music|voice|midi|sound|speech)\b/.test(searchable)) return "Audio";
        if (/\b(color|asset|sprite|font|video|animation|particle|graphic)\b/.test(searchable)) return "Graphics";
        if (/\b(object|character|tag)\b/.test(searchable)) return "Objects";
        if (/\b(world|workspace|map|scene)\b/.test(searchable)) return "Worlds";
        if (/\b(interface|language|ui|ux)\b/.test(searchable)) return "Interface";
        if (/\b(control|input|hitbox)\b/.test(searchable)) return "Controls";
        if (/\b(rule|event|configuration|code|extension)\b/.test(searchable)) return "Rules";
        if (/\b(progress|achievement|saved|journey)\b/.test(searchable)) return "Progression";
        if (/\b(test|debug|performance)\b/.test(searchable)) return "Play Test";
        if (/\b(publish|build|migration|environment|settings)\b/.test(searchable)) return "Publish";
        if (/\b(share|marketplace|community|cloud|rating|user)\b/.test(searchable)) return "Share";
        if (/\b(design)\b/.test(searchable)) return "Design";
        return "Idea";
    }

    function enrichTool(tool, groupName = "") {
        const registryTool = registryToolForCard(tool) || tool;
        const metadata = voteRowsByToolId.get(registryTool.id) || null;
        const metadataGroup = metadata?.group || colorGroupForTool(registryTool);
        const displayGroup = groupName || metadataGroup;
        const route = getToolRoute(registryTool);
        const path = String(metadata?.path || route || "").replace(/^\/+/, "");
        const title = registryTool.displayName || registryTool.name || tool.title || "Tool";
        const releaseChannel = releaseChannelForTool(metadata?.status || metadata?.releaseChannel || registryTool);
        return {
            ...tool,
            capabilityLabel: registryTool.capabilityLabel,
            childCapabilities: registryTool.childCapabilities || [],
            colorGroup: registryTool.colorGroup,
            description: registryTool.description || registryTool.shortDescription || tool.description || "",
            href: path ? `../${path}` : "",
            id: registryTool.id,
            mascot: "foundry-bot",
            metadataSource: metadata ? "toolbox_tool_metadata" : "registry-default",
            role: registryTool.adminOnly ? "Admin Preview" : registryTool.hidden ? "Hidden Preview" : "Foundry Bot",
            subgroup: registryTool.subgroup,
            theme: registryTool.category === "Audio" ? "bot" : "forge",
            title,
            toolKey: metadata?.toolKey || metadata?.toolId || registryTool.id,
            adminOnly: registryTool?.adminOnly === true,
            group: displayGroup,
            hidden: registryTool?.hidden === true,
            order: metadata?.order ?? registryTool.order,
            path,
            planned: registryTool?.deferred === true || registryTool?.status === "Planned",
            missingStatusFields: registryTool?.missingStatusFields || [],
            missingStatusMetadata: registryTool?.missingStatusMetadata !== false,
            progressChecklist: registryTool?.progressChecklist || [],
            readiness: registryTool?.readiness || "No",
            releaseChannel,
            releaseChannelHelpText: releaseChannelHelp(releaseChannel),
            releaseChannelLabel: metadata?.releaseChannelLabel || releaseChannelLabel(releaseChannel),
            requiredForPublish: registryTool?.requiredForPublish === true,
            requiredForTestable: registryTool?.requiredForTestable === true,
            requiredRole: typeof registryTool?.requiredRole === "string" ? registryTool.requiredRole : "",
            requires: registryTool?.requires || [],
            status: registryTool?.status || "Missing Metadata",
            statusDiagnostic: registryTool
                ? toolRegistryMetadataDiagnostic(registryTool)
                : "Missing Toolbox registry metadata: status metadata."
        };
    }

    function baseVisibleForCreator(tool) {
        if (adminSession) {
            return true;
        }
        return tool.adminOnly !== true && (
            tool.releaseChannel === "complete" ||
            tool.releaseChannel === "beta" ||
            tool.releaseChannel === "wireframe" ||
            (tool.releaseChannel === "deprecated" && visibleReleaseChannels.has("deprecated")) ||
            (tool.releaseChannel === "planned" && visibleReleaseChannels.has("planned"))
        );
    }

    function activeRoleFocus() {
        return gameMemberRole;
    }

    function isFocusedRoleView() {
        return !adminSession && activeRoleFocus() !== "Owner";
    }

    function isVisibleForRole(tool) {
        if (adminSession) {
            return true;
        }
        const focusedTools = roleFocusTools[activeRoleFocus()];

        if (!focusedTools) {
            return baseVisibleForCreator(tool);
        }

        if (!focusedTools.includes(tool.title)) {
            return false;
        }

        return baseVisibleForCreator(tool);
    }

    function unavailableToolNamesForFocus() {
        if (!isFocusedRoleView()) {
            return [];
        }

        const visibleTitles = new Set(roleAwareTools().map((tool) => tool.title));
        return toolGroups
            .flatMap((group) => group.tools)
            .filter((tool) => tool.adminOnly !== true)
            .map((tool) => tool.title)
            .filter((title, index, titles) => titles.indexOf(title) === index)
            .filter((title) => !visibleTitles.has(title))
            .sort((left, right) => left.localeCompare(right));
    }

    function visibleToolGroups() {
        return toolGroups
            .map((toolGroup) => ({
                group: toolGroup.group,
                tools: toolGroup.tools
                    .map((tool) => enrichTool(tool, toolGroup.group))
                    .filter(isVisibleForRole)
                    .sort(compareByWorkflowOrder)
            }))
            .filter((group) => group.tools.length > 0);
    }

    function roleAwareTools() {
        return visibleToolGroups().flatMap((group) => group.tools);
    }

    function isVisibleForStatusFilter(tool) {
        return visibleReleaseChannels.has(tool.releaseChannel);
    }

    function applyReleaseFilterDefaults(mode) {
        if (releaseFilterMode === mode) {
            return;
        }
        visibleReleaseChannels.clear();
        const defaults = mode === "build-path" ? buildPathDefaultReleaseChannels : toolboxDefaultReleaseChannels;
        defaults.forEach((channel) => {
            visibleReleaseChannels.add(channel);
        });
        releaseFilterMode = mode;
    }

    function filteredRoleAwareTools() {
        return roleAwareTools().filter(isVisibleForStatusFilter);
    }

    function filteredVisibleToolGroups() {
        return visibleToolGroups()
            .map((group) => ({
                ...group,
                tools: group.tools.filter(isVisibleForStatusFilter)
            }))
            .filter((group) => group.tools.length > 0);
    }

    function groupClass(groupName) {
        return gameJourneyGroupClasses[groupName] || registryTools.find((tool) => tool.category === groupName)?.colorGroup || "";
    }

    function groupSwatch(groupName) {
        return gameJourneyGroupSwatches[groupName] || groupSwatchMap[groupName] || "swatch-orange";
    }

    function stateSwatch(channel) {
        return stateSwatchMap[channel] || "swatch-gray";
    }

    function groupSlug(groupName) {
        return String(groupName || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function setActiveButton(mode) {
        if (orderButton) {
            const orderIsActive = mode === "ascending" || mode === "descending";
            orderButton.setAttribute("aria-pressed", String(orderIsActive));
            orderButton.classList.toggle("primary", orderIsActive);
            orderButton.textContent = `Order ${orderButton.dataset.toolsOrder === "ascending" ? "A-Z" : "Z-A"}`;
        }
        if (groupedButton) {
            groupedButton.setAttribute("aria-pressed", String(mode === "grouped"));
            groupedButton.classList.toggle("primary", mode === "grouped");
        }
        if (buildPathButton) {
            buildPathButton.setAttribute("aria-pressed", String(mode === "build-path"));
            buildPathButton.classList.toggle("primary", mode === "build-path");
        }
    }

    function getOrderedTools(mode) {
        const tools = filteredRoleAwareTools();
        tools.sort((left, right) => left.title.localeCompare(right.title));
        if (mode === "descending") {
            tools.reverse();
        }
        return tools;
    }

    function getGroupedTools() {
        return filteredVisibleToolGroups().map((toolGroup) => ({
            title: toolGroup.group,
            tools: toolGroup.tools.map((tool) => ({
                ...tool,
                group: toolGroup.group
            })),
            groupClass: groupClass(toolGroup.group)
        }));
    }

    function getBuildPathRows() {
        if (voteDiagnostic) {
            return [];
        }
        return registryTools
            .filter(includeToolInToolboxInventory)
            .map((tool) => enrichTool(tool))
            .filter(isVisibleForStatusFilter)
            .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER) || left.title.localeCompare(right.title))
            .map((tool) => ({
                order: tool.order ?? "",
                status: tool.releaseChannel,
                statusLabel: tool.releaseChannelLabel,
                tool
            }));
    }

    function createBuildPathSummary() {
        const gameProgressSummary = getGameProgressSummary();
        const article = document.createElement("article");
        article.className = "callout";

        const title = document.createElement("h3");
        title.textContent = "Build Path Guidance";

        const activeGame = document.createElement("p");
        activeGame.textContent = "Active Game: " + gameProgressSummary.activeGameName;

        const nextAction = document.createElement("p");
        nextAction.textContent = "What should I do next? " + gameProgressSummary.recommendedNextTool;

        const gameCompletion = document.createElement("p");
        gameCompletion.textContent = "Game Progress: " + gameProgressSummary.gameProgress;

        const publishingProgress = document.createElement("p");
        publishingProgress.textContent = "Launch Progress: " + gameProgressSummary.publishingProgress;

        const currentFocus = document.createElement("p");
        currentFocus.textContent = "Current Focus: " + gameProgressSummary.currentFocus;

        const direction = document.createElement("p");
        direction.textContent = "Work top-to-bottom and left-to-right through the workflow table.";

        article.append(title, activeGame, nextAction, gameCompletion, publishingProgress, currentFocus, direction);
        return article;
    }

    function createTableCell(tagName, text) {
        const cell = document.createElement(tagName);
        cell.textContent = text;
        return cell;
    }

    function createBuildPathBadgeDiagnostic(tool, registryTool) {
        if (registryTool && registryImageSource(registryTool, "badge") !== TOOL_IMAGE_FALLBACK) {
            return null;
        }
        return createToolImageDiagnostic(tool.title, ["Badge image missing; fallback shown."]);
    }

    function createBuildPathToolCell(tool) {
        const cell = document.createElement("td");
        const registryTool = registryToolForCard(tool);
        const route = String(tool.path || registryToolRoute(registryTool) || "").replace(/^\/+/, "");
        const href = route ? "/" + route : registryToolHref(registryTool);

        const content = document.createElement("span");
        content.className = "content-cluster";

        const badge = document.createElement("img");
        badge.src = registryImageSource(registryTool, "badge");
        badge.alt = tool.title + " badge";
        badge.width = 64;
        badge.height = 64;
        badge.dataset.buildPathBadge = tool.title;
        badge.dataset.toolImageKind = "badge";
        badge.dataset.toolImageSource = registryTool ? "registry" : "fallback";
        configureImageDiagnostic(badge, cell, tool.title, "badge");
        content.append(badge);

        if (route && href) {
            const link = document.createElement("a");
            link.href = href;
            link.dataset.buildPathToolLink = tool.title;
            link.dataset.registeredToolRoute = route;
            link.textContent = tool.title;
            content.append(link);
        } else {
            const text = document.createElement("span");
            text.textContent = tool.title;
            content.append(text);
        }

        cell.append(content);
        const diagnostic = createBuildPathBadgeDiagnostic(tool, registryTool);
        if (diagnostic) {
            cell.append(diagnostic);
        }
        return cell;
    }

    function createBuildPathStatusCell(row) {
        const cell = createTableCell("td", row.statusLabel);
        cell.dataset.buildPathStatusHelp = row.status;
        cell.title = `${row.statusLabel}: ${row.tool.releaseChannelHelpText.replace(/\s+/g, " ")}`;
        return cell;
    }

    function createBuildPathTable() {
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        wrapper.dataset.buildPathTable = "workflow";

        const table = document.createElement("table");
        table.className = "data-table";
        table.setAttribute("aria-label", "Build Path workflow status");

        const caption = document.createElement("caption");
        caption.textContent = "Game Build Path";

        const head = document.createElement("thead");
        const headRow = document.createElement("tr");
        ["Order", "Tool", "Status"].forEach((heading) => {
            headRow.append(createTableCell("th", heading));
        });
        head.append(headRow);

        const body = document.createElement("tbody");
        const rows = getBuildPathRows();
        if (!rows.length) {
            const tableRow = document.createElement("tr");
            const cell = createTableCell("td", voteDiagnostic
                ? `Toolbox Vote Review metadata unavailable: ${voteDiagnostic}`
                : "No Build Path tools match the selected status filters.");
            cell.colSpan = 3;
            tableRow.append(cell);
            body.append(tableRow);
        }
        rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            tableRow.dataset.buildPathTool = row.tool.title;
            tableRow.dataset.buildPathGroup = row.tool.group;
            tableRow.dataset.buildPathMetadataSource = row.tool.metadataSource;
            tableRow.dataset.buildPathPath = row.tool.path;
            tableRow.dataset.buildPathReleaseChannel = row.status;
            tableRow.dataset.buildPathStatus = row.statusLabel;
            tableRow.append(
                createTableCell("td", String(row.order)),
                createBuildPathToolCell(row.tool),
                createBuildPathStatusCell(row)
            );
            body.append(tableRow);
        });

        table.append(caption, head, body);
        wrapper.append(table);
        return wrapper;
    }

    function createRoleFocusSummary() {
        if (!isFocusedRoleView()) {
            return null;
        }

        const unavailableTools = unavailableToolNamesForFocus();
        const article = document.createElement("article");
        article.className = "callout";
        article.dataset.toolboxRoleFocus = activeRoleFocus();

        const title = document.createElement("h3");
        title.textContent = "Role Focus: " + activeRoleFocus();

        const summary = document.createElement("p");
        summary.textContent = activeRoleFocus() === "Viewer"
            ? "Viewer focus shows preview-safe read-only tiles only."
            : "This planned view focuses the Toolbox on tools this project role can work on.";

        const explanation = document.createElement("p");
        explanation.textContent = unavailableTools.length
            ? "Unavailable tools are hidden by role focus, not by security enforcement."
            : "All tools for this role are visible.";

        article.append(title, summary, explanation);
        return article;
    }

    function renderWithRoleFocus(...children) {
        const roleFocusSummary = createRoleFocusSummary();
        list.replaceChildren(...(roleFocusSummary ? [roleFocusSummary, ...children] : children));
    }

    function updateToolCount() {
        if (!toolCount) {
            return;
        }
        const visibleCount = filteredRoleAwareTools().length;
        const totalCount = toolboxInventoryTools().length;
        toolCount.textContent = `Tool Count: ${visibleCount}/${totalCount}`;
    }

    function releaseChannelCounts() {
        const counts = Object.fromEntries(releaseChannelOrder.map((channel) => [channel, 0]));
        toolboxInventoryTools()
            .map((tool) => enrichTool(tool))
            .forEach((tool) => {
                counts[tool.releaseChannel] = (counts[tool.releaseChannel] || 0) + 1;
            });
        return counts;
    }

    function renderStatusFilters() {
        if (!statusFilterList) {
            return;
        }

        const counts = releaseChannelCounts();
        const buttons = releaseChannelOrder.map((channel) => {
            const button = document.createElement("button");
            button.className = visibleReleaseChannels.has(channel) ? "btn btn--compact primary" : "btn btn--compact";
            button.type = "button";
            button.dataset.toolboxStatusFilter = channel;
            button.setAttribute("aria-pressed", String(visibleReleaseChannels.has(channel)));
            button.title = releaseChannelHelp(channel);
            button.textContent = `${releaseChannelLabel(channel)} (${counts[channel] || 0})`;
            button.addEventListener("click", () => {
                if (visibleReleaseChannels.has(channel)) {
                    visibleReleaseChannels.delete(channel);
                } else {
                    visibleReleaseChannels.add(channel);
                }
                const activeLabels = releaseChannelOrder
                    .filter((item) => visibleReleaseChannels.has(item))
                    .map(releaseChannelLabel);
                announceToolboxStatus(activeLabels.length
                    ? `Showing ${activeLabels.join(", ")} tools.`
                    : "No status filters are selected.");
                render(currentMode);
            });
            return button;
        });

        statusFilterList.replaceChildren(...buttons);
    }

    function createGroupSwatch(groupName) {
        const swatch = document.createElement("span");
        swatch.className = "brand-color-swatch " + groupSwatch(groupName);
        swatch.setAttribute("role", "img");
        swatch.setAttribute("aria-label", groupName + " group color");
        swatch.title = groupName + " color";
        return swatch;
    }

    function createGroupLabel(groupName, visibleText = groupName) {
        const label = document.createElement("span");
        label.className = "content-cluster";
        label.dataset.toolboxGroupBadge = groupName;

        const text = document.createElement("span");
        text.className = "swatch-label " + groupSwatch(groupName);
        text.dataset.toolboxGroupLabel = groupName;
        text.textContent = visibleText;

        label.append(createGroupSwatch(groupName), text);
        return label;
    }

    function createStateLabel(tool) {
        const label = document.createElement("span");
        label.className = "swatch-label " + stateSwatch(tool.releaseChannel);
        label.dataset.toolboxReadiness = tool.releaseChannelLabel;
        label.dataset.toolboxReleaseChannel = tool.releaseChannel;
        label.dataset.toolboxKicker = tool.releaseChannelLabel;
        label.dataset.toolboxStateBadge = tool.releaseChannel;
        label.title = tool.releaseChannelHelpText;
        label.setAttribute("aria-label", `${tool.releaseChannelLabel}: ${tool.releaseChannelHelpText.replace(/\s+/g, " ")}`);
        label.textContent = tool.releaseChannelLabel;
        return label;
    }

    function createChildCapabilities(tool) {
        if (!Array.isArray(tool.childCapabilities) || tool.childCapabilities.length === 0) {
            return null;
        }
        const capabilities = document.createElement("p");
        capabilities.dataset.childCapabilities = tool.title;
        capabilities.setAttribute("aria-label", tool.title + " child capabilities");
        capabilities.textContent = `${tool.capabilityLabel || "Planned child capabilities"}: ${tool.childCapabilities.join(", ")}`;
        return capabilities;
    }

    function registryToolForCard(tool) {
        if (tool?.id) {
            return registryTools.find((candidate) => candidate.id === tool.id) || tool;
        }
        return registryToolsByTitle.get(tool.title) || null;
    }

    function registryImageSource(registryTool, kind) {
        return registryTool ? getToolImageSource(registryTool, kind) : TOOL_IMAGE_FALLBACK;
    }

    function registryToolRoute(registryTool) {
        return registryTool ? getToolRoute(registryTool) : "";
    }

    function registryToolHref(registryTool) {
        const route = registryToolRoute(registryTool);
        return route ? "/" + route.replace(/^\/+/, "") : "";
    }

    function betaAccessBlocked(tool) {
        return tool.releaseChannel === "beta" &&
            tool.requiredRole === "beta" &&
            !adminSession &&
            !betaSession &&
            !hasSessionRole("beta");
    }

    function plannedLaunchBlocked(tool) {
        return tool.releaseChannel === "planned";
    }

    function launchBlockedMessage(tool) {
        if (betaAccessBlocked(tool)) {
            return "This tool is in beta. Request beta access to try it.";
        }
        if (plannedLaunchBlocked(tool)) {
            return `${tool.title} is planned. Vote or review planned details here before runtime work begins.`;
        }
        return "";
    }

    function configureToolLaunchLink(link, tool) {
        if (!link || !tool) {
            return;
        }
        link.dataset.toolboxLaunchLink = tool.title;
        link.dataset.toolboxReleaseChannel = tool.releaseChannel;
        if (betaAccessBlocked(tool)) {
            link.dataset.toolboxLaunchBlocked = "beta";
        }
        if (plannedLaunchBlocked(tool)) {
            link.dataset.toolboxLaunchBlocked = "planned";
        }
        link.addEventListener("click", (event) => {
            const message = launchBlockedMessage(tool);
            if (!message) {
                return;
            }
            event.preventDefault();
            announceToolboxStatus(message);
        });
    }

    function createToolNameHeading(tool, registryTool) {
        const title = document.createElement("h3");
        const href = registryToolHref(registryTool);
        const route = registryToolRoute(registryTool);

        if (!href || !route) {
            title.textContent = tool.title;
            return title;
        }

        const link = document.createElement("a");
        link.href = href;
        link.dataset.registeredToolRoute = route;
        link.dataset.toolboxToolNameLink = tool.title;
        link.textContent = tool.title;
        configureToolLaunchLink(link, tool);
        title.append(link);
        return title;
    }

    function createToolImageDiagnostic(toolTitle, diagnostics) {
        if (!Array.isArray(diagnostics) || diagnostics.length === 0) {
            return null;
        }

        const diagnostic = document.createElement("p");
        diagnostic.className = "status";
        diagnostic.dataset.toolImageDiagnostic = toolTitle;
        diagnostic.setAttribute("role", "status");
        diagnostic.textContent = "Image diagnostics: " + diagnostics.join(" ");
        return diagnostic;
    }

    function createStatusMetadataDiagnostic(tool) {
        if (!tool.statusDiagnostic) {
            return null;
        }

        const diagnostic = document.createElement("div");
        diagnostic.className = "status";
        diagnostic.dataset.toolboxStatusDiagnostic = tool.title;
        diagnostic.setAttribute("role", "status");
        diagnostic.textContent = tool.statusDiagnostic;
        return diagnostic;
    }

    function appendToolImageDiagnostic(host, toolTitle, message) {
        let diagnostic = host.querySelector("[data-tool-image-diagnostic]");
        if (!diagnostic) {
            diagnostic = createToolImageDiagnostic(toolTitle, [message]);
            host.append(diagnostic);
            return;
        }

        if (!diagnostic.textContent.includes(message)) {
            diagnostic.textContent += " " + message;
        }
    }

    function configureImageDiagnostic(image, host, toolTitle, kind) {
        image.addEventListener("error", () => {
            const message = `${kind === "badge" ? "Badge" : "Tool"} image missing; fallback shown.`;
            appendToolImageDiagnostic(host, toolTitle, message);

            const currentPath = new URL(image.src, window.location.href).pathname;
            if (currentPath !== TOOL_IMAGE_FALLBACK) {
                image.src = TOOL_IMAGE_FALLBACK;
            }
        });
    }

    function createToolActionRow(tool, registryTool, host) {
        const row = document.createElement("div");
        row.className = "content-cluster";
        row.dataset.toolboxTileActionRow = tool.title;

        const badge = document.createElement("img");
        badge.src = registryImageSource(registryTool, "badge");
        badge.alt = tool.title + " badge";
        badge.width = 48;
        badge.height = 48;
        badge.dataset.toolImageKind = "badge";
        badge.dataset.toolImageSource = registryTool ? "registry" : "fallback";
        configureImageDiagnostic(badge, host, tool.title, "badge");

        const link = document.createElement("a");
        link.className = "btn";
        link.href = tool.href;
        configureToolLaunchLink(link, tool);
        if (tool.releaseChannel === "planned") {
            link.textContent = "Planned Details";
        } else {
            link.textContent = tool.href.indexOf("toolbox/") === 0 || tool.href.indexOf("../toolbox/") === 0 ? "Open Tool" : "Open Page";
        }

        row.append(badge, link);
        return row;
    }

    function createToolVoteControls(tool) {
        if (!["planned", "wireframe", "deprecated"].includes(tool.releaseChannel)) {
            return null;
        }

        const row = document.createElement("div");
        row.className = "content-cluster";
        row.dataset.toolboxVoteControls = tool.title;
        row.dataset.toolboxVoteToolId = tool.id || "";

        const label = document.createElement("span");
        label.textContent = "Feedback";

        const upVote = document.createElement("button");
        upVote.className = "btn btn--compact";
        upVote.type = "button";
        upVote.dataset.toolboxVote = "up";
        upVote.setAttribute("aria-label", `Up vote ${tool.title}`);
        upVote.dataset.toolboxVoteCount = "up";

        const downVote = document.createElement("button");
        downVote.className = "btn btn--compact";
        downVote.type = "button";
        downVote.dataset.toolboxVote = "down";
        downVote.setAttribute("aria-label", `Down vote ${tool.title}`);
        downVote.dataset.toolboxVoteCount = "down";

        const loginRequired = document.createElement("span");
        loginRequired.className = "status";
        loginRequired.dataset.toolboxVoteLoginRequired = tool.title;
        loginRequired.textContent = "Sign in required to vote.";
        loginRequired.hidden = authenticatedSession;

        function voteRecord() {
            return voteRowsByToolId.get(tool.id) || {
                currentUserVote: "",
                down: 0,
                up: 0
            };
        }

        function updateVoteDisplay() {
            const record = voteRecord();
            const selectedDirection = record.currentUserVote || "";
            upVote.textContent = `Up ${record.up}`;
            downVote.textContent = `Down ${record.down}`;
            upVote.setAttribute("aria-pressed", String(selectedDirection === "up"));
            downVote.setAttribute("aria-pressed", String(selectedDirection === "down"));
            upVote.classList.toggle("primary", selectedDirection === "up");
            downVote.classList.toggle("primary", selectedDirection === "down");
            upVote.disabled = !authenticatedSession;
            downVote.disabled = !authenticatedSession;
        }

        function castVote(direction) {
            if (!authenticatedSession) {
                announceToolboxStatus(`${tool.title} vote requires login.`);
                return;
            }
            try {
                applyToolboxVoteSnapshot(castToolboxVote(tool.id, direction));
                updateVoteDisplay();
                announceToolboxStatus(`${tool.title} ${direction} vote recorded for Admin review.`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error || "Toolbox vote data unavailable.");
                announceToolboxStatus(`${tool.title} vote could not be recorded. ${message}`);
            }
        }

        [upVote, downVote].forEach((button) => {
            button.addEventListener("click", () => {
                const direction = button.dataset.toolboxVote === "up" ? "up" : "down";
                castVote(direction);
            });
        });

        updateVoteDisplay();
        if (voteDiagnostic) {
            const diagnostic = document.createElement("span");
            diagnostic.className = "status";
            diagnostic.dataset.toolboxVoteDiagnostic = tool.title;
            diagnostic.textContent = voteDiagnostic;
            row.append(label, diagnostic);
            return row;
        }
        row.append(label, upVote, downVote, loginRequired);
        return row;
    }

    function createPlanDetails(tool) {
        if (!["planned", "wireframe", "deprecated"].includes(tool.releaseChannel)) {
            return null;
        }
        const details = document.createElement("p");
        details.className = "status";
        details.dataset.toolboxPlanDetails = tool.title;
        details.setAttribute("role", "status");
        if (tool.releaseChannel === "planned") {
            details.textContent = "Planned details and vote controls are shown here; runtime launch is not available yet.";
        } else if (tool.releaseChannel === "deprecated") {
            details.textContent = "Deprecated details and vote controls are shown here; the tool remains supported but is not recommended for new workflows.";
        } else {
            details.textContent = "Wireframe details and vote controls are shown here; controls are not wired to runtime behavior yet.";
        }
        return details;
    }

    function createToolValues(tool, options = {}) {
        const values = document.createElement("div");
        values.className = "content-stack content-stack--compact";
        values.dataset.toolboxTileValues = tool.title;

        const childCapabilities = createChildCapabilities(tool);
        if (childCapabilities) {
            values.append(childCapabilities);
        }

        if (options.showReadiness) {
            const requirements = document.createElement("p");
            requirements.textContent = `Required: testable ${tool.requiredForTestable ? "yes" : "no"}, publish ${tool.requiredForPublish ? "yes" : "no"}`;

            const requires = document.createElement("p");
            requires.textContent = `Requires: ${tool.requires.length ? tool.requires.join(", ") : "none"}`;

            const checklist = document.createElement("p");
            checklist.textContent = `Checklist: ${tool.progressChecklist.join(", ")}`;

            values.append(requirements, requires, checklist);
        }

        return values.childElementCount ? values : null;
    }

    function createToolCard(tool, options = {}) {
        const registryTool = registryToolForCard(tool);
        const article = document.createElement("article");
        article.className = `control-card ${groupClass(tool.group)}`;
        article.dataset.mascot = tool.mascot;
        article.dataset.toolboxReleaseChannel = tool.releaseChannel;
        article.dataset.toolboxToolCard = tool.title;
        article.dataset.toolboxRole = tool.adminOnly ? "admin" : tool.hidden ? "hidden" : tool.planned ? "planned" : "creator";

        const body = document.createElement("div");
        body.className = "card-body";

        const media = document.createElement("div");
        media.className = "card-media";
        const mediaLink = document.createElement("a");
        mediaLink.className = "card-media-link";
        mediaLink.href = tool.href;
        mediaLink.setAttribute("aria-label", "Open " + tool.title);
        configureToolLaunchLink(mediaLink, tool);
        const image = document.createElement("img");
        image.src = registryImageSource(registryTool, "tool");
        image.alt = tool.title + " preview";
        image.dataset.toolImageKind = "tool";
        image.dataset.toolImageSource = registryTool ? "registry" : "fallback";
        configureImageDiagnostic(image, body, tool.title, "tool");
        mediaLink.append(image);
        media.append(mediaLink);

        const imageDiagnostic = createToolImageDiagnostic(tool.title, getToolImageDiagnostics(registryTool));
        const statusDiagnostic = createStatusMetadataDiagnostic(tool);

        const title = createToolNameHeading(tool, registryTool);

        const description = document.createElement("p");
        description.textContent = tool.description;
        const actionRow = createToolActionRow(tool, registryTool, body);
        const groupLabel = createGroupLabel(tool.group);
        const voteControls = createToolVoteControls(tool);
        const plannedDetails = createPlanDetails(tool);
        const values = createToolValues(tool, options);
        const stateBadge = createStateLabel(tool);

        const cardParts = [title, description];
        if (imageDiagnostic) {
            cardParts.push(imageDiagnostic);
        }
        if (statusDiagnostic) {
            cardParts.push(statusDiagnostic);
        }
        cardParts.push(actionRow);
        cardParts.push(groupLabel);
        cardParts.push(stateBadge);
        if (voteControls) {
            cardParts.push(voteControls);
        }
        if (plannedDetails) {
            cardParts.push(plannedDetails);
        }
        if (values) {
            cardParts.push(values);
        }

        body.append(...cardParts);
        article.append(media, body);
        return article;
    }

    function createAccordion(group, isOpen, options = {}) {
        const details = document.createElement("details");
        details.className = `vertical-accordion ${group.groupClass}`;
        details.dataset.toolsAccordion = group.title;
        details.open = isOpen;

        const summary = document.createElement("summary");
        summary.append(createGroupLabel(group.title, gameJourneyAccordionLabel(group.title)));

        const body = document.createElement("div");
        body.className = "accordion-body";

        if (gameJourneyCompletionUnavailable) {
            const diagnostic = document.createElement("p");
            diagnostic.className = "status";
            diagnostic.dataset.gameJourneyCompletionDiagnostic = group.title;
            diagnostic.setAttribute("role", "status");
            diagnostic.textContent = "Game Journey progress is temporarily unavailable. Continue building while progress refreshes.";
            body.append(diagnostic);
        }

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
        applyReleaseFilterDefaults(mode);
        if (mode === "grouped") {
            const accordions = getGroupedTools().map((group, position) => {
                const groupIsTargeted = targetGroupSlug ? groupSlug(group.title) === targetGroupSlug : position === 0;
                return createAccordion(group, groupIsTargeted);
            });
            renderWithRoleFocus(...accordions);
        } else if (mode === "build-path") {
            targetGroupSlug = "";
            renderWithRoleFocus(createBuildPathSummary(), createBuildPathTable());
        } else {
            targetGroupSlug = "";
            renderWithRoleFocus(createToolGrid(getOrderedTools(mode)));
        }
        currentMode = mode;
        setActiveButton(mode);
        updateToolCount();
        renderStatusFilters();
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
            targetGroupSlug = "";
            render("grouped");
        });
    }

    if (buildPathButton) {
        buildPathButton.addEventListener("click", () => {
            render("build-path");
        });
    }

    render(currentMode);
}());
