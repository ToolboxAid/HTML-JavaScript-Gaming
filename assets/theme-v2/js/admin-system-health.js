import {
    readAdminSystemHealthStatus
} from "../../../src/engine/api/admin-system-health-api-client.js";

class AdminSystemHealthController {
    constructor(root) {
        this.root = root;
        this.details = root.querySelector("[data-admin-system-health-detail-rows]");
        this.limits = root.querySelector("[data-admin-system-health-limit-rows]");
        this.overview = root.querySelector("[data-admin-system-health-overview-rows]");
        this.status = root.querySelector("[data-admin-system-health-status]");
    }

    init() {
        if (!this.details || !this.limits || !this.overview || !this.status) {
            return;
        }
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    createRow(values) {
        const row = document.createElement("tr");
        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });
        return row;
    }

    renderOverview(rows) {
        this.overview.replaceChildren();
        rows.forEach((row) => {
            this.overview.append(this.createRow([
                row.area || "Unknown",
                row.status || "WARN",
                row.summary || "Status unavailable.",
            ]));
        });
    }

    renderDetails(rows) {
        this.details.replaceChildren();
        rows.forEach((row) => {
            this.details.append(this.createRow([
                row.area || "Unknown",
                row.field || "Status",
                row.status || "WARN",
                row.value || "not available",
            ]));
        });
    }

    renderLimits(rows) {
        this.limits.replaceChildren();
        rows.forEach((row) => {
            this.limits.append(this.createRow([
                row.variableName || "Unknown",
                row.limit || "not configured",
                row.usage || "NOT AVAILABLE",
                row.pressure || "NOT AVAILABLE",
                row.nextStep || "Add safe service usage reporting through the Local API.",
            ]));
        });
    }

    load() {
        try {
            const payload = readAdminSystemHealthStatus();
            this.renderOverview(Array.isArray(payload.overview) ? payload.overview : []);
            this.renderDetails(Array.isArray(payload.details) ? payload.details : []);
            this.renderLimits(Array.isArray(payload.limits) ? payload.limits : []);
            this.setStatus(payload.status || "WARN", payload.message || "Admin System Health loaded.");
        } catch (error) {
            this.renderOverview([
                {
                    area: "System Health",
                    status: "FAIL",
                    summary: error instanceof Error ? error.message : "Admin System Health unavailable.",
                },
            ]);
            this.renderDetails([]);
            this.renderLimits([]);
            this.setStatus("FAIL", error instanceof Error ? error.message : "Admin System Health unavailable.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-system-health]");
    if (!root) {
        return;
    }
    new AdminSystemHealthController(root).init();
});
