import {
    readAdminSystemHealthStatus
} from "../../../src/engine/api/admin-system-health-api-client.js";

class AdminSystemHealthController {
    constructor(root) {
        this.root = root;
        this.details = root.querySelector("[data-admin-system-health-detail-rows]");
        this.limits = root.querySelector("[data-admin-system-health-limit-rows]");
        this.overview = root.querySelector("[data-admin-system-health-overview-rows]");
        this.r2Readiness = root.querySelector("[data-admin-system-health-r2-readiness-rows]");
        this.status = root.querySelector("[data-admin-system-health-status]");
        this.summary = root.querySelector("[data-admin-system-health-summary-rows]");
    }

    init() {
        if (!this.details || !this.limits || !this.overview || !this.r2Readiness || !this.status || !this.summary) {
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

    renderSummary(summary) {
        this.summary.replaceChildren();
        this.summary.append(this.createRow([
            summary.status || "WARN",
            typeof summary.score === "number" ? `${summary.score}` : "0",
            `${summary.counts?.PASS || 0}`,
            `${summary.counts?.WARN || 0}`,
            `${summary.counts?.FAIL || 0}`,
            summary.lastRefreshAt || "not available",
        ]));
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

    renderR2Readiness(readiness) {
        this.r2Readiness.replaceChildren();
        const rows = Array.isArray(readiness?.rows) ? readiness.rows : [];
        rows.forEach((row) => {
            this.r2Readiness.append(this.createRow([
                row.area || "Project Asset Storage / R2",
                row.field || "Status",
                row.status || "WARN",
                row.value || "not configured",
                row.nextStep || "Review R2 configuration.",
            ]));
        });
    }

    load() {
        try {
            const payload = readAdminSystemHealthStatus();
            this.renderSummary(payload.summary || {});
            this.renderOverview(Array.isArray(payload.overview) ? payload.overview : []);
            this.renderDetails(Array.isArray(payload.details) ? payload.details : []);
            this.renderLimits(Array.isArray(payload.limits) ? payload.limits : []);
            this.renderR2Readiness(payload.r2Readiness || {});
            this.setStatus(payload.status || "WARN", payload.message || "Admin System Health loaded.");
        } catch (error) {
            this.renderSummary({ counts: { FAIL: 1, PASS: 0, WARN: 0 }, lastRefreshAt: "not available", score: 0, status: "FAIL" });
            this.renderOverview([
                {
                    area: "System Health",
                    status: "FAIL",
                    summary: error instanceof Error ? error.message : "Admin System Health unavailable.",
                },
            ]);
            this.renderDetails([]);
            this.renderLimits([]);
            this.renderR2Readiness({ rows: [] });
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
