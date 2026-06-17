import {
    readAdminInfrastructureStoragePathStatus,
    runAdminInfrastructureStorageConnectivityAction
} from "../../../src/engine/api/admin-infrastructure-api-client.js";

const STORAGE_PATH_LANES = Object.freeze([
    Object.freeze({ lane: "DEV", path: "/dev/projects/" }),
    Object.freeze({ lane: "IST", path: "/ist/projects/" }),
    Object.freeze({ lane: "UAT", path: "/uat/projects/" }),
    Object.freeze({ lane: "PRD", path: "/prd/projects/" }),
]);

class AdminInfrastructureStoragePathStatus {
    constructor(root) {
        this.root = root;
        this.connectivityActionButtons = Array.from(root.querySelectorAll("[data-admin-storage-connectivity-action]"));
        this.connectivityRows = root.querySelector("[data-admin-storage-connectivity-result-rows]");
        this.connectivityStatus = root.querySelector("[data-admin-storage-connectivity-status]");
        this.rows = root.querySelector("[data-admin-storage-path-status-rows]");
    }

    init() {
        if (!this.rows) {
            return;
        }
        this.connectivityActionButtons.forEach((button) => {
            button.addEventListener("click", () => this.runStorageConnectivityAction(button.dataset.adminStorageConnectivityAction));
        });
        this.load();
    }

    setConnectivityStatus(status, message) {
        if (this.connectivityStatus) {
            this.connectivityStatus.textContent = `${status}: ${message}`;
        }
    }

    appendConnectivityResult(result = {}) {
        if (!this.connectivityRows) {
            return;
        }
        const row = document.createElement("tr");
        [
            result.actionId || "storage-connectivity",
            result.status || "WARN",
            result.executed === true ? "yes" : "no",
            result.message || "No storage connectivity message returned.",
        ].forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });
        this.connectivityRows.prepend(row);
    }

    renderRows(rows) {
        this.rows.replaceChildren();
        rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            [
                row.lane || "",
                row.path || "",
                row.value || "ERROR",
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                tableRow.append(cell);
            });
            this.rows.append(tableRow);
        });
    }

    renderFailure(message) {
        this.renderRows(STORAGE_PATH_LANES.map((lane) => ({
            ...lane,
            value: `ERROR: ${message}`,
        })));
    }

    load() {
        try {
            const payload = readAdminInfrastructureStoragePathStatus();
            const rows = Array.isArray(payload.rows) ? payload.rows : [];
            this.renderRows(rows.length ? rows : STORAGE_PATH_LANES.map((lane) => ({
                ...lane,
                value: "ERROR",
            })));
        } catch (error) {
            this.renderFailure(error instanceof Error ? error.message : "Storage path status unavailable.");
        }
    }

    runStorageConnectivityAction(actionId) {
        try {
            const result = runAdminInfrastructureStorageConnectivityAction(actionId);
            this.appendConnectivityResult(result);
            this.setConnectivityStatus(result.status || "WARN", result.message || "Storage connectivity action returned no message.");
        } catch (error) {
            this.setConnectivityStatus("FAIL", error instanceof Error ? error.message : "Storage connectivity action failed.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-wireframe='infrastructure']");
    if (!root) {
        return;
    }
    new AdminInfrastructureStoragePathStatus(root).init();
});
