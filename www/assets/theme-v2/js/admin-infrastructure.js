import {
    readAdminInfrastructureStoragePathStatus
} from "../../../../src/api/admin-infrastructure-api-client.js";

const STORAGE_PATH_LANES = Object.freeze([
    Object.freeze({ lane: "DEV", path: "/dev/projects/" }),
    Object.freeze({ lane: "IST", path: "/ist/projects/" }),
    Object.freeze({ lane: "UAT", path: "/uat/projects/" }),
    Object.freeze({ lane: "PRD", path: "/prod/projects/" }),
]);

class AdminInfrastructureStoragePathStatus {
    constructor(root) {
        this.root = root;
        this.rows = root.querySelector("[data-admin-storage-path-status-rows]");
    }

    init() {
        if (!this.rows) {
            return;
        }
        this.load();
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

}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-wireframe='infrastructure']");
    if (!root) {
        return;
    }
    new AdminInfrastructureStoragePathStatus(root).init();
});
