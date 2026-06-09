import {
    PROJECT_WORKSPACE_MEMBER_ROLES,
    createProjectWorkspaceApiRepository
} from "./project-workspace/project-workspace-api-client.js";
import {
    TOOL_IMAGE_FALLBACK,
    getActiveToolRegistry,
    getToolRegistryApiDiagnostic,
    getToolImageDiagnostics,
    getToolImageSource,
    getToolRoute,
    toolRegistryMetadataDiagnostic
} from "./tool-registry-api-client.js";
import { getSessionCurrent } from "../src/engine/api/session-api-client.js";

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
    const projectWorkspaceRepository = createProjectWorkspaceApiRepository();
    projectWorkspaceRepository.resetProjectData();
    const urlMemberRole = searchParams.get("memberRole");
    const defaultProjectMemberRole = "Owner";
    const projectMemberRole = PROJECT_WORKSPACE_MEMBER_ROLES.includes(urlMemberRole)
        ? urlMemberRole
        : defaultProjectMemberRole;
    const session = getSessionCurrent();
    const adminSession = session?.isAdmin === true;
    const sessionRoles = Array.isArray(session?.roleSlugs) ? session.roleSlugs : [];
    const betaSession = sessionRoles.includes("beta");
    let currentMode = searchParams.get("view") === "group" ? "grouped" : searchParams.get("view") === "build-path" ? "build-path" : "ascending";
    let targetGroupSlug = currentMode === "grouped" ? groupSlug(searchParams.get("group")) : "";
    const releaseChannelOrder = Object.freeze(["planned", "wireframe", "beta", "complete"]);
    const defaultReleaseChannels = Object.freeze(["wireframe", "beta", "complete"]);
    const visibleReleaseChannels = new Set(defaultReleaseChannels);
    const releaseChannelLabels = Object.freeze({
        complete: "Complete",
        beta: "Beta",
        wireframe: "Wireframe",
        planned: "Planned"
    });
    const releaseChannelHelpText = Object.freeze({
        planned: "Idea exists.\nNot yet available.",
        wireframe: "Preview the planned workflow and layout.\nHelp shape the design before development begins.",
        beta: "Ready to try.\nFeatures, layout, and workflows may change based on feedback.",
        complete: "Production ready and fully supported."
    });
    const releaseChannelByStatus = Object.freeze({
        Ready: "complete",
        Wireframe: "wireframe",
        "Under Construction": "beta",
        Planned: "planned",
        Hidden: "planned",
        Deprecated: "planned"
    });
    const buildPathStatusIndicators = Object.freeze({
        complete: "\u{1F7E2} Complete",
        "in-progress": "\u{1F7E1} In Progress",
        "not-started": "\u{1F534} Not Started",
        "not-applicable": "\u26AA N/A"
    });
    const buildPathAlwaysRequired = Object.freeze([
        "Project Workspace",
        "Project Journey",
        "Game Design",
        "Game Configuration",
        "Build Game",
        "Game Testing",
        "Publish"
    ]);
    const roleFocusTools = Object.freeze({
        Owner: null,
        Designer: ["Project Workspace", "Project Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Characters", "Colors", "Assets"],
        "World Builder": ["Worlds", "Objects", "Assets", "Colors", "Animations"],
        Artist: ["Assets", "Colors", "Fonts", "Sprites", "Characters", "Objects", "Animations"],
        "Audio Creator": ["Audio", "Music", "Voices", "MIDI", "Audio Effects", "Voice Capture", "Voice Output", "Assets"],
        Translator: ["Languages", "Voices", "Voice Capture", "Voice Output"],
        Tester: ["Game Testing", "Controls", "Hitboxes", "Debug", "Performance", "Events"],
        Publisher: ["Publish", "Marketplace", "Community", "Cloud", "Languages"],
        Viewer: ["Project Workspace", "Project Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Assets", "Colors", "Audio", "Publish", "Marketplace", "Community", "Languages", "Achievements", "Ratings"]
    });
    const registryDiagnostic = getToolRegistryApiDiagnostic();
    if (registryDiagnostic) {
        const diagnostic = document.createElement("p");
        diagnostic.className = "status";
        diagnostic.setAttribute("role", "status");
        diagnostic.textContent = "Toolbox registry could not load from the server API: " + registryDiagnostic;
        list.replaceChildren(diagnostic);
        return;
    }
    const registryTools = getActiveToolRegistry();
    const registryToolsByTitle = new Map(registryTools.map((tool) => [tool.displayName || tool.name, tool]));
    const toolboxGroupOrder = Object.freeze([
        "Create",
        "Build",
        "Content",
        "Media",
        "Test",
        "Share",
        "Account"
    ]);
    const toolGroups = toolboxGroupOrder
        .map((group) => ({
            group,
            tools: registryTools
                .filter((tool) => tool.toolboxGroup === group && tool.visibleInToolsList === true)
                .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER))
        }))
        .filter((group) => group.tools.length > 0);
    const groupSwatchMap = {
        "AI": "swatch-purple",
        "Audio": "swatch-orange",
        "Build/Create": "swatch-red",
        "Design": "swatch-pink",
        "Marketplace": "swatch-gold",
        "Platform": "swatch-blue",
        "Play": "swatch-green"
    };
    const stateSwatchMap = {
        planned: "swatch-gray",
        wireframe: "swatch-blue",
        beta: "swatch-gold",
        complete: "swatch-green"
    };
    const voteStateByTool = new Map();
    function getProjectProgressSummary() {
        const activeProject = projectWorkspaceRepository.getActiveProject();
        const progress = projectWorkspaceRepository.getProjectProgress();
        return {
            activeProjectName: activeProject?.name || "No active project",
            projectProgress: progress.projectProgress,
            publishingProgress: progress.publishingProgress,
            currentFocus: progress.currentFocus,
            recommendedNextTool: progress.recommendedNextTool
        };
    }
    const buildPathGroups = [
        {
                "title": "Project Workspace",
                "groupClass": "tool-group-build",
                "note": "Start with the single project surface that coordinates current focus, readiness, and recommended next tool.",
                "tools": [
                        "Project Workspace",
                        "Project Journey"
                ]
        },
        {
                "title": "Game Design",
                "groupClass": "tool-group-design",
                "note": "Define gameplay, rules, player experience, and the requirements that shape the build path.",
                "tools": [
                        "Game Design"
                ]
        },
        {
                "title": "Game Configuration",
                "groupClass": "tool-group-build",
                "note": "Complete playable setup from a valid Game Design handoff before Assets and Build Game readiness.",
                "tools": [
                        "Game Configuration"
                ]
        },
        {
                "title": "Required Tool Path",
                "groupClass": "tool-group-design",
                "note": "Use readiness fields to identify creator-facing blockers before a playable build.",
                "tools": [
                        "Colors",
                        "Controls",
                        "Assets",
                        "Sprites",
                        "Characters",
                        "Objects",
                        "Worlds",
                        "Animations",
                        "Audio"
                ]
        },
        {
                "title": "Build Game",
                "groupClass": "tool-group-build",
                "note": "Build Game is the package and playable-output checkpoint for this planned tool path.",
                "tools": [
                        "Build Game"
                ]
        },
        {
                "title": "Game Testing",
                "groupClass": "tool-group-play",
                "note": "Game Testing collects test readiness, hitboxes, debug policy, performance checks, and event review.",
                "tools": [
                        "Game Testing",
                        "Hitboxes",
                        "Debug",
                        "Performance",
                        "Events"
                ]
        },
        {
                "title": "Publish",
                "groupClass": "tool-group-marketplace",
                "note": "Publish is required for public release; Marketplace, Community, Languages, Achievements, and Ratings support Share readiness.",
                "tools": [
                        "Publish",
                        "Marketplace",
                        "Community",
                        "Languages",
                        "Achievements",
                        "Ratings"
                ]
        }
];
    function compareByTitle(left, right) {
        return left.title.localeCompare(right.title);
    }

    function compareByGroup(left, right) {
        return left.group.localeCompare(right.group);
    }

    function releaseChannelForTool(tool) {
        const explicitChannel = typeof tool?.releaseChannel === "string" ? tool.releaseChannel.trim().toLowerCase() : "";
        if (releaseChannelOrder.includes(explicitChannel)) {
            return explicitChannel;
        }
        return releaseChannelByStatus[tool?.status] || "planned";
    }

    function releaseChannelLabel(channel) {
        return releaseChannelLabels[channel] || releaseChannelLabels.planned;
    }

    function releaseChannelHelp(channel) {
        return releaseChannelHelpText[channel] || releaseChannelHelpText.planned;
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

    function enrichTool(tool, groupName = colorGroupForTool(tool)) {
        const registryTool = registryToolForCard(tool) || tool;
        const route = getToolRoute(registryTool);
        const title = registryTool.displayName || registryTool.name || tool.title || "Tool";
        const releaseChannel = releaseChannelForTool(registryTool);
        return {
            ...tool,
            capabilityLabel: registryTool.capabilityLabel,
            childCapabilities: registryTool.childCapabilities || [],
            colorGroup: registryTool.colorGroup,
            description: registryTool.description || registryTool.shortDescription || tool.description || "",
            href: route ? `../${route}` : "",
            id: registryTool.id,
            mascot: "foundry-bot",
            role: registryTool.adminOnly ? "Admin Preview" : registryTool.hidden ? "Hidden Preview" : "Foundry Bot",
            subgroup: registryTool.subgroup,
            theme: registryTool.category === "Audio" ? "bot" : "forge",
            title,
            adminOnly: registryTool?.adminOnly === true,
            group: groupName,
            hidden: registryTool?.hidden === true,
            planned: registryTool?.deferred === true || registryTool?.status === "Planned",
            missingStatusFields: registryTool?.missingStatusFields || [],
            missingStatusMetadata: registryTool?.missingStatusMetadata !== false,
            progressChecklist: registryTool?.progressChecklist || [],
            readiness: registryTool?.readiness || "No",
            releaseChannel,
            releaseChannelHelpText: registryTool.releaseChannelHelpText || releaseChannelHelp(releaseChannel),
            releaseChannelLabel: registryTool.releaseChannelLabel || releaseChannelLabel(releaseChannel),
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
            tool.releaseChannel === "wireframe"
        );
    }

    function activeRoleFocus() {
        return projectMemberRole;
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
        const groups = new Map();
        toolGroups.flatMap((toolGroup) => toolGroup.tools).map((tool) => enrichTool(tool)).filter(isVisibleForRole).forEach((tool) => {
            const groupName = tool.group;
            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }
            groups.get(groupName).push(tool);
        });
        return Array.from(groups.entries()).map(([group, tools]) => ({
            group,
            tools: tools.sort(compareByTitle)
        })).sort(compareByGroup);
    }

    function roleAwareTools() {
        return visibleToolGroups().flatMap((group) => group.tools);
    }

    function isVisibleForStatusFilter(tool) {
        return visibleReleaseChannels.has(tool.releaseChannel);
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
        return registryTools.find((tool) => tool.category === groupName)?.colorGroup || "";
    }

    function groupSwatch(groupName) {
        return groupSwatchMap[groupName] || "swatch-orange";
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
            orderButton.setAttribute("aria-pressed", String(mode === "ascending" || mode === "descending"));
            orderButton.textContent = `Order ${orderButton.dataset.toolsOrder === "ascending" ? "A-Z" : "Z-A"}`;
        }
        if (groupedButton) {
            groupedButton.setAttribute("aria-pressed", String(mode === "grouped"));
        }
        if (buildPathButton) {
            buildPathButton.setAttribute("aria-pressed", String(mode === "build-path"));
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

    function sourceToolByTitle(title) {
        const registryTool = registryToolsByTitle.get(title);
        return registryTool ? enrichTool(registryTool) : null;
    }

    function isRequiredForCurrentBuildPath(tool) {
        if (tool.title === "Publish") {
            return true;
        }
        if (buildPathAlwaysRequired.includes(tool.title)) {
            return true;
        }
        if (!isFocusedRoleView()) {
            return true;
        }
        const focusTools = roleFocusTools[activeRoleFocus()];
        return !Array.isArray(focusTools) || focusTools.includes(tool.title);
    }

    function buildPathStatusForTool(tool, activeProject) {
        if (!isRequiredForCurrentBuildPath(tool)) {
            return "not-applicable";
        }
        if (tool.title === "Project Workspace") {
            return activeProject ? "complete" : "not-started";
        }
        if (!activeProject) {
            return "not-started";
        }
        if (tool.status === "Complete") {
            return "complete";
        }
        if (tool.status === "Ready" || tool.status === "Wireframe" || tool.status === "Under Construction") {
            return "in-progress";
        }
        return "not-started";
    }

    function buildPathCompleteLabel(status) {
        if (status === "complete") {
            return "Yes";
        }
        if (status === "not-applicable") {
            return "N/A";
        }
        return "No";
    }

    function getBuildPathRows() {
        const activeProject = projectWorkspaceRepository.getActiveProject();
        let order = 0;
        return buildPathGroups.flatMap((group) => group.tools.map((title) => {
            const tool = sourceToolByTitle(title);
            if (!tool) {
                return null;
            }
            const status = buildPathStatusForTool(tool, activeProject);
            order += 1;
            return {
                complete: buildPathCompleteLabel(status),
                order,
                status,
                statusLabel: buildPathStatusIndicators[status],
                tool
            };
        }).filter(Boolean));
    }

    function createBuildPathSummary() {
        const projectProgressSummary = getProjectProgressSummary();
        const article = document.createElement("article");
        article.className = "callout";

        const title = document.createElement("h3");
        title.textContent = "Build Path Guidance";

        const activeProject = document.createElement("p");
        activeProject.textContent = "Active Project: " + projectProgressSummary.activeProjectName;

        const nextAction = document.createElement("p");
        nextAction.textContent = "What should I do next? " + projectProgressSummary.recommendedNextTool;

        const projectCompletion = document.createElement("p");
        projectCompletion.textContent = "Project Completion: " + projectProgressSummary.projectProgress;

        const publishingProgress = document.createElement("p");
        publishingProgress.textContent = "Publishing Progress: " + projectProgressSummary.publishingProgress;

        const currentFocus = document.createElement("p");
        currentFocus.textContent = "Current Focus: " + projectProgressSummary.currentFocus;

        const direction = document.createElement("p");
        direction.textContent = "Work top-to-bottom and left-to-right through the workflow table.";

        article.append(title, activeProject, nextAction, projectCompletion, publishingProgress, currentFocus, direction);
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
        const route = registryToolRoute(registryTool);
        const href = registryToolHref(registryTool);

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

    function createBuildPathTable() {
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        wrapper.dataset.buildPathTable = "workflow";

        const table = document.createElement("table");
        table.className = "data-table";
        table.setAttribute("aria-label", "Build Path workflow status");

        const caption = document.createElement("caption");
        caption.textContent = "Project Build Path";

        const head = document.createElement("thead");
        const headRow = document.createElement("tr");
        ["Order", "Tool", "Status", "Complete"].forEach((heading) => {
            headRow.append(createTableCell("th", heading));
        });
        head.append(headRow);

        const body = document.createElement("tbody");
        getBuildPathRows().forEach((row) => {
            const tableRow = document.createElement("tr");
            tableRow.dataset.buildPathTool = row.tool.title;
            tableRow.dataset.buildPathStatus = row.statusLabel;
            tableRow.dataset.buildPathComplete = row.complete;
            tableRow.append(
                createTableCell("td", String(row.order)),
                createBuildPathToolCell(row.tool),
                createTableCell("td", row.statusLabel),
                createTableCell("td", row.complete)
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
        const totalCount = toolGroups.flatMap((group) => group.tools).length;
        toolCount.textContent = `Tool Count: ${visibleCount}/${totalCount}`;
    }

    function releaseChannelCounts() {
        const counts = Object.fromEntries(releaseChannelOrder.map((channel) => [channel, 0]));
        roleAwareTools().forEach((tool) => {
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
        label.dataset.toolboxGroupBadge = visibleText;

        const text = document.createElement("span");
        text.className = "swatch-label " + groupSwatch(groupName);
        text.dataset.toolboxGroupLabel = visibleText;
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

        row.append(badge, link, createGroupLabel(tool.group), createStateLabel(tool));
        return row;
    }

    function createToolVoteControls(tool) {
        if (tool.releaseChannel !== "planned" && tool.releaseChannel !== "wireframe") {
            return null;
        }

        const row = document.createElement("div");
        row.className = "content-cluster";
        row.dataset.toolboxVoteControls = tool.title;

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

        function voteRecord() {
            if (!voteStateByTool.has(tool.title)) {
                voteStateByTool.set(tool.title, {
                    down: 0,
                    up: 0,
                    voters: new Map()
                });
            }
            return voteStateByTool.get(tool.title);
        }

        function voterKey() {
            return session?.userKey || session?.displayName || "guest";
        }

        function updateVoteDisplay() {
            const record = voteRecord();
            const selectedDirection = record.voters.get(voterKey()) || "";
            upVote.textContent = `Up ${record.up}`;
            downVote.textContent = `Down ${record.down}`;
            upVote.setAttribute("aria-pressed", String(selectedDirection === "up"));
            downVote.setAttribute("aria-pressed", String(selectedDirection === "down"));
        }

        function castVote(direction) {
            const record = voteRecord();
            const key = voterKey();
            const previousDirection = record.voters.get(key);
            if (previousDirection === direction) {
                return;
            }
            if (previousDirection === "up") {
                record.up = Math.max(0, record.up - 1);
            }
            if (previousDirection === "down") {
                record.down = Math.max(0, record.down - 1);
            }
            record[direction] += 1;
            record.voters.set(key, direction);
            updateVoteDisplay();
            announceToolboxStatus(`${tool.title} ${direction} vote noted as a non-persistent ${tool.releaseChannel} control.`);
        }

        [upVote, downVote].forEach((button) => {
            button.addEventListener("click", () => {
                const direction = button.dataset.toolboxVote === "up" ? "up" : "down";
                castVote(direction);
            });
        });

        updateVoteDisplay();
        row.append(label, upVote, downVote);
        return row;
    }

    function createPlanDetails(tool) {
        if (tool.releaseChannel !== "planned" && tool.releaseChannel !== "wireframe") {
            return null;
        }
        const details = document.createElement("p");
        details.className = "status";
        details.dataset.toolboxPlanDetails = tool.title;
        details.setAttribute("role", "status");
        details.textContent = tool.releaseChannel === "planned"
            ? "Planned details and vote controls are shown here; runtime launch is not available yet."
            : "Wireframe details and vote controls are shown here; controls are not wired to runtime behavior yet.";
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
        const voteControls = createToolVoteControls(tool);
        const plannedDetails = createPlanDetails(tool);
        const values = createToolValues(tool, options);

        const cardParts = [title, description];
        if (imageDiagnostic) {
            cardParts.push(imageDiagnostic);
        }
        if (statusDiagnostic) {
            cardParts.push(statusDiagnostic);
        }
        cardParts.push(actionRow);
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
