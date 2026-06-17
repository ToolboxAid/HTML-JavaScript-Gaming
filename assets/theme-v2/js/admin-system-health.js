import {
    readAdminSystemHealthStatus,
    runAdminSystemHealthStorageConnectivityAction
} from "../../../src/engine/api/admin-system-health-api-client.js";

const STORAGE_CONNECTIVITY_ACTIONS = Object.freeze([
    "storage-list",
    "storage-write-test-object",
    "storage-read-test-object",
    "storage-delete-test-object",
]);

class AdminSystemHealthController {
    constructor(root) {
        this.root = root;
        this.connectionSummary = root.querySelector("[data-admin-system-health-connection-summary]");
        this.databaseStatusRows = root.querySelector("[data-admin-system-health-database-status-rows]");
        this.details = root.querySelector("[data-admin-system-health-detail-rows]");
        this.limits = root.querySelector("[data-admin-system-health-limit-rows]");
        this.overview = root.querySelector("[data-admin-system-health-overview-rows]");
        this.r2Readiness = root.querySelector("[data-admin-system-health-r2-readiness-rows]");
        this.status = root.querySelector("[data-admin-system-health-status]");
        this.storageActionButtons = Array.from(root.querySelectorAll("[data-admin-system-health-storage-action]"));
        this.storageConnectivityRows = root.querySelector("[data-admin-system-health-storage-connectivity-result-rows]");
        this.storageConnectivityStatus = root.querySelector("[data-admin-system-health-storage-connectivity-status]");
        this.storageStatusRows = root.querySelector("[data-admin-system-health-storage-status-rows]");
        this.summary = root.querySelector("[data-admin-system-health-summary-rows]");
    }

    init() {
        if (!this.connectionSummary || !this.databaseStatusRows || !this.details || !this.limits || !this.overview || !this.r2Readiness || !this.status || !this.storageConnectivityRows || !this.storageConnectivityStatus || !this.storageStatusRows || !this.summary) {
            return;
        }
        this.storageActionButtons.forEach((button) => {
            button.addEventListener("click", () => this.runStorageConnectivityAction(button.dataset.adminSystemHealthStorageAction));
        });
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    setStorageConnectivityStatus(status, message) {
        this.storageConnectivityStatus.textContent = `${status}: ${message}`;
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

    renderConnectionSummary(summary = {}) {
        this.connectionSummary.replaceChildren();
        [
            ["Account", summary.account?.status || "unknown", summary.account?.configured === true ? "configured" : "not configured"],
            ["Product Data / Local DB", summary.productData?.status || "unknown", summary.productData?.configured === true ? "configured" : "not configured"],
            ["Project Asset Storage / R2", summary.projectAssetStorage?.status || "unknown", summary.projectAssetStorage?.configured === true ? "configured" : "not configured"],
            ["Environment Switching", summary.environmentSwitching || "manual-env-change-and-server-restart", "manual"],
            ["Secrets", summary.secretsExposed === true ? "exposed" : "not exposed", "read-only summary"],
        ].forEach((row) => {
            this.connectionSummary.append(this.createRow(row));
        });
    }

    renderDatabaseStatus(databaseStatus = {}) {
        const migrationCounts = databaseStatus.migrationCounts || {};
        const lastMigration = databaseStatus.lastMigration || {};
        this.databaseStatusRows.replaceChildren();
        [
            ["Connection Configured", databaseStatus.configured === true ? "PASS" : "WARN", databaseStatus.configured === true ? "yes" : "no"],
            ["Database Host", databaseStatus.hostStatus || "WARN", databaseStatus.host || "not configured"],
            ["Database Port", databaseStatus.portStatus || "WARN", databaseStatus.port ? String(databaseStatus.port) : "not configured"],
            ["Database Name", databaseStatus.databaseNameStatus || "WARN", databaseStatus.databaseName || "not configured"],
            ["SSL Mode", databaseStatus.sslModeStatus || "WARN", databaseStatus.sslMode || "not configured"],
            ["Migration Counts", databaseStatus.migrationStatus || "WARN", `DDL=${migrationCounts.DDL || 0}; DML=${migrationCounts.DML || 0}`],
            ["Last Migration", databaseStatus.lastMigrationStatus || "WARN", lastMigration.name && lastMigration.appliedAt ? `${lastMigration.type || "unknown"} ${lastMigration.name} at ${lastMigration.appliedAt}` : "not recorded"],
        ].forEach((row) => {
            this.databaseStatusRows.append(this.createRow(row));
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

    renderStorageStatus(storageStatus = {}) {
        this.storageStatusRows.replaceChildren();
        [
            ["Storage Configured", storageStatus.configured === true ? "PASS" : "WARN", storageStatus.configured === true ? "yes" : "no"],
            ["Storage Endpoint", storageStatus.endpointStatus || "WARN", storageStatus.endpoint || "not configured"],
            ["Storage Bucket", storageStatus.bucketStatus || "WARN", storageStatus.bucket || "not configured"],
            ["Projects Prefix", storageStatus.projectsPrefixStatus || "WARN", storageStatus.projectsPrefix || "not configured"],
            ["Access Key", storageStatus.accessKeyStatus || "WARN", storageStatus.accessKeyConfigured === true ? "configured; value hidden" : "not configured"],
            ["Secret Key", storageStatus.secretKeyStatus || "WARN", storageStatus.secretKeyConfigured === true ? "configured; value hidden" : "not configured"],
        ].forEach((row) => {
            this.storageStatusRows.append(this.createRow(row));
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

    appendStorageConnectivityResult(result = {}) {
        this.storageConnectivityRows.prepend(this.createRow([
            result.actionId || "storage-connectivity",
            result.status || "WARN",
            result.executed === true ? "yes" : "no",
            result.message || "No storage connectivity message returned.",
        ]));
    }

    clearStorageConnectivityResults() {
        this.storageConnectivityRows.replaceChildren();
    }

    runStorageConnectivityAction(actionId) {
        try {
            const result = runAdminSystemHealthStorageConnectivityAction(actionId);
            this.appendStorageConnectivityResult(result);
            this.setStorageConnectivityStatus(result.status || "WARN", result.message || "Storage connectivity action returned no message.");
            return result;
        } catch (error) {
            const result = {
                actionId: actionId || "storage-connectivity",
                executed: false,
                message: error instanceof Error ? error.message : "Storage connectivity action failed.",
                status: "FAIL",
            };
            this.appendStorageConnectivityResult(result);
            this.setStorageConnectivityStatus("FAIL", result.message);
            return result;
        }
    }

    runStartupStorageConnectivity() {
        this.clearStorageConnectivityResults();
        this.setStorageConnectivityStatus("SKIP", "Storage connectivity startup running.");
        const results = STORAGE_CONNECTIVITY_ACTIONS.map((actionId) => this.runStorageConnectivityAction(actionId));
        const failed = results.find((result) => result.status === "FAIL");
        const warned = results.find((result) => result.status === "WARN");
        const skipped = results.find((result) => result.status === "SKIP");
        if (failed) {
            this.setStorageConnectivityStatus("FAIL", "Storage connectivity startup found one or more failures. Review result diagnostics.");
        } else if (warned) {
            this.setStorageConnectivityStatus("WARN", "Storage connectivity startup found one or more warnings. Review result diagnostics.");
        } else if (skipped) {
            this.setStorageConnectivityStatus("SKIP", "Storage connectivity startup skipped one or more actions. Review result diagnostics.");
        } else {
            this.setStorageConnectivityStatus("PASS", "Storage connectivity startup completed List, Write Test Object, Read Test Object, and Delete Test Object.");
        }
    }

    load() {
        try {
            const payload = readAdminSystemHealthStatus();
            this.renderSummary(payload.summary || {});
            this.renderOverview(Array.isArray(payload.overview) ? payload.overview : []);
            this.renderConnectionSummary(payload.connectionSummary || {});
            this.renderDatabaseStatus(payload.databaseStatus || {});
            this.renderStorageStatus(payload.storageStatus || {});
            this.renderDetails(Array.isArray(payload.details) ? payload.details : []);
            this.renderLimits(Array.isArray(payload.limits) ? payload.limits : []);
            this.renderR2Readiness(payload.r2Readiness || {});
            this.setStatus(payload.status || "WARN", payload.message || "Admin System Health loaded.");
            this.runStartupStorageConnectivity();
        } catch (error) {
            this.renderSummary({ counts: { FAIL: 1, PASS: 0, WARN: 0 }, lastRefreshAt: "not available", score: 0, status: "FAIL" });
            this.renderConnectionSummary({});
            this.renderDatabaseStatus({});
            this.renderOverview([
                {
                    area: "System Health",
                    status: "FAIL",
                    summary: error instanceof Error ? error.message : "Admin System Health unavailable.",
                },
            ]);
            this.renderStorageStatus({});
            this.renderDetails([]);
            this.renderLimits([]);
            this.renderR2Readiness({ rows: [] });
            this.clearStorageConnectivityResults();
            this.setStatus("FAIL", error instanceof Error ? error.message : "Admin System Health unavailable.");
            this.setStorageConnectivityStatus("SKIP", "Storage connectivity startup skipped because Admin System Health failed to load.");
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
