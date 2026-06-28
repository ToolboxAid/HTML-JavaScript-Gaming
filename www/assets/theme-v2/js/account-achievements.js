import { createServerRepositoryClient } from "../../../../src/api/server-api-client.js";
import { getSessionCurrent } from "../../../../src/api/session-api-client.js";

const tabs = Array.from(document.querySelectorAll("[data-achievements-tab]"));
const panels = Array.from(document.querySelectorAll("[data-achievements-panel]"));
const buildRows = document.querySelector("[data-achievements-build-rows]");
const buildStatus = document.querySelector("[data-achievements-build-status]");
const createdCount = document.querySelector("[data-achievements-build-created-count]");
const readyCount = document.querySelector("[data-achievements-build-ready-count]");
const repository = createServerRepositoryClient("game-hub");

function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function showTab(tabName) {
    tabs.forEach((tab) => {
        const isActive = tab.dataset.achievementsTab === tabName;
        tab.setAttribute("aria-pressed", String(isActive));
        tab.classList.toggle("primary", isActive);
    });

    panels.forEach((panel) => {
        const isActive = panel.dataset.achievementsPanel === tabName;
        panel.hidden = !isActive;
        panel.setAttribute("aria-hidden", String(!isActive));
    });
}

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

function createActionCell(project) {
    const cell = document.createElement("td");
    const button = document.createElement("button");
    button.className = "btn";
    button.type = "button";
    button.textContent = `Open ${project.name}`;
    cell.append(button);
    return cell;
}

function renderBuildRows(games) {
    if (!buildRows) {
        return;
    }

    buildRows.replaceChildren();
    if (!games.length) {
        const row = document.createElement("tr");
        const cell = createCell("No Game Hub games are available.");
        cell.colSpan = 5;
        row.append(cell);
        buildRows.append(row);
        setText(buildStatus, "No Game Hub games are available for Build achievements.");
        return;
    }

    games.forEach((project) => {
        const row = document.createElement("tr");
        row.dataset.achievementsBuildProject = project.id || "";
        row.append(
            createCell(project.name || "Untitled Game"),
            createCell(project.status || "Not tracked yet"),
            createCell("Not tracked yet"),
            createCell("Not tracked yet"),
            createActionCell(project),
        );
        buildRows.append(row);
    });

    const readyGames = games.filter((project) => project.status === "Ready for Publish").length;
    setText(createdCount, String(games.length));
    setText(readyCount, String(readyGames));
    setText(buildStatus, "Build game rows use the Game Hub game source. Stats and ratings are not tracked yet.");
}

function renderBuildError(message) {
    if (!buildRows) {
        return;
    }
    buildRows.replaceChildren();
    const row = document.createElement("tr");
    const cell = createCell(message || "Game Hub data is unavailable.");
    cell.colSpan = 5;
    row.append(cell);
    buildRows.append(row);
    setText(createdCount, "0");
    setText(readyCount, "0");
    setText(buildStatus, message || "Game Hub data is unavailable.");
}

function currentBuildUserId() {
    try {
        const session = getSessionCurrent();
        if (session?.authenticated && session.userKey) {
            return session.userKey;
        }
    } catch {}

    const activeProject = repository.getActiveGame?.();
    return activeProject?.ownerUserId || "";
}

function loadBuildGames() {
    const userId = currentBuildUserId();
    const result = repository.listGames(userId ? { userId } : {});
    if (result?.error) {
        renderBuildError(result.message || "Game Hub data is unavailable.");
        return;
    }
    if (!Array.isArray(result)) {
        renderBuildError("Game Hub did not return game rows.");
        return;
    }
    renderBuildRows(result);
}

if (tabs.length && panels.length) {
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            showTab(tab.dataset.achievementsTab);
        });
    });

    loadBuildGames();
    showTab("build");
}
