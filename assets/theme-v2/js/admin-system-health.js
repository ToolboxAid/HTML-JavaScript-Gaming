import {
    readAdminSystemHealthStatus,
    runAdminSystemHealthStorageConnectivityAction,
} from "../../../src/api/admin-system-health-api-client.js";
import {
    applyStatusNode,
    normalizeStatusValue,
    statusText,
} from "../../js/shared/status.js";

const STORAGE_DIAGNOSTIC_ACTIONS = Object.freeze([
    Object.freeze({ actionId: "storage-list", key: "list" }),
    Object.freeze({ actionId: "storage-write-test-object", key: "write" }),
    Object.freeze({ actionId: "storage-read-test-object", key: "read" }),
    Object.freeze({ actionId: "storage-delete-test-object", key: "delete" }),
]);

function asText(value, fallback = "not available") {
    return statusText(value, fallback);
}

class AdminSystemHealthController {
    constructor(root) {
        this.root = root;
        this.dbValues = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-db-value]")).map((node) => [
            node.dataset.adminSystemHealthDbValue,
            node,
        ]));
        this.dbStatuses = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-db-status]")).map((node) => [
            node.dataset.adminSystemHealthDbStatus,
            node,
        ]));
        this.storageValues = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-storage-value]")).map((node) => [
            node.dataset.adminSystemHealthStorageValue,
            node,
        ]));
        this.storageStatuses = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-storage-status]")).map((node) => [
            node.dataset.adminSystemHealthStorageStatus,
            node,
        ]));
        this.startupRows = root.querySelector("[data-admin-system-health-startup-rows]");
        this.runtimeRows = root.querySelector("[data-admin-system-health-runtime-rows]");
    }

    init() {
        if ((!this.dbValues.size && !this.storageValues.size) || document.querySelector("[data-session-access-blocked='admin']") || window.GameFoundrySessionGuard?.blocked === true) {
            return;
        }
        this.load();
    }

    setValue(key, value, fallback) {
        const node = this.dbValues.get(key);
        if (node) {
            node.textContent = asText(value, fallback);
        }
    }

    setStorageValue(key, value, fallback) {
        const node = this.storageValues.get(key);
        if (node) {
            node.textContent = asText(value, fallback);
        }
    }

    setStatus(key, status, reason = "") {
        const node = this.dbStatuses.get(key);
        this.setStatusNode(node, status, reason);
    }

    setStorageStatus(key, status, reason = "") {
        const node = this.storageStatuses.get(key);
        this.setStatusNode(node, status, reason);
    }

    setStatusNode(node, status, reason = "") {
        applyStatusNode(node, status, { reason });
    }

    renderPending(reason) {
        ["host", "database", "migration", "connection"].forEach((key) => {
            this.setStatus(key, "PENDING", reason);
        });
        this.renderStartupPending(reason);
        this.renderStoragePending(reason);
    }

    renderStoragePending(reason) {
        ["bucket", "list", "read", "write", "delete"].forEach((key) => {
            this.setStorageStatus(key, "PENDING", reason);
        });
        this.renderRuntimePending(reason);
    }

    renderPostgresStatus(databaseStatus = {}) {
        const migrationCounts = databaseStatus.migrationCounts || {};
        const lastMigration = databaseStatus.lastMigration || {};
        const migrationSummary = lastMigration.name
            ? `${asText(lastMigration.type, "migration")} ${lastMigration.name}${lastMigration.appliedAt ? ` at ${lastMigration.appliedAt}` : ""}`
            : `DDL=${migrationCounts.DDL || 0}; DML=${migrationCounts.DML || 0}; last migration not recorded`;
        const connectionReason = databaseStatus.message || "Postgres diagnostic status returned by the safe Admin System Health API.";

        this.setValue("provider", "Postgres");
        this.setStatus("provider", "PASS");
        this.setValue("host", databaseStatus.host, "not configured");
        this.setStatus("host", databaseStatus.hostStatus, connectionReason);
        this.setValue("port", databaseStatus.port ? String(databaseStatus.port) : "", "not configured");
        this.setStatus("port", databaseStatus.portStatus, connectionReason);
        this.setValue("database", databaseStatus.databaseName, "not configured");
        this.setStatus("database", databaseStatus.databaseNameStatus, connectionReason);
        this.setValue("migration", migrationSummary);
        this.setStatus("migration", databaseStatus.lastMigrationStatus || databaseStatus.migrationStatus, connectionReason);
        this.setValue("connection", databaseStatus.configured === true ? connectionReason : databaseStatus.message || "Postgres configuration is not complete.");
        this.setStatus("connection", databaseStatus.status, connectionReason);
    }

    renderStorageStatus(storageStatus = {}) {
        const reason = storageStatus.message || "Cloudflare R2 configuration status returned by the safe Admin System Health API.";
        this.setStorageValue("bucket", storageStatus.bucket, "not configured");
        this.setStorageStatus("bucket", storageStatus.bucketStatus || storageStatus.status, reason);
    }

    renderStartupPending(reason) {
        if (!this.startupRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Local API startup diagnostics"),
            this.createCell("not available"),
            this.createStatusCell("PENDING", reason),
        );
        this.startupRows.replaceChildren(row);
    }

    renderStartupDiagnostics(localApiStartup = {}) {
        if (!this.startupRows) {
            return;
        }
        if (localApiStartup?.secretsExposed === true || localApiStartup?.secretEditingAllowed === true) {
            this.renderStartupPending("Safe Local API startup diagnostics were blocked because the response exposed secret controls.");
            return;
        }
        const rows = Array.isArray(localApiStartup.rows) ? localApiStartup.rows : [];
        if (!rows.length) {
            this.renderStartupPending("Safe Local API startup diagnostics returned no rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((startupRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(startupRow.field),
                this.createCell(startupRow.value),
                this.createStatusCell(startupRow.status, startupRow.reason || localApiStartup.message),
            );
            fragment.append(row);
        });
        this.startupRows.replaceChildren(fragment);
    }

    storageResultTarget(result = {}) {
        if (typeof result.keysListed === "number" && result.actionId === "storage-list") {
            return `${result.keysListed} object(s) under ${asText(result.projectsPrefix, "configured prefix")}`;
        }
        return result.testObjectKey || result.projectsPrefix || result.message || "diagnostic target unavailable";
    }

    renderStorageResult(key, result = {}) {
        if (result?.secretsExposed === true || result?.secretEditingAllowed === true) {
            this.setStorageStatus(key, "PENDING", "Safe R2 diagnostic response was blocked because it exposed secret controls.");
            return;
        }
        this.setStorageValue(key, this.storageResultTarget(result));
        this.setStorageStatus(key, result.status, result.message || "R2 diagnostic returned without a message.");
    }

    runStorageDiagnostics() {
        STORAGE_DIAGNOSTIC_ACTIONS.forEach(({ key }) => {
            this.setStorageStatus(key, "PENDING", "R2 diagnostic is running through the safe Admin System Health API.");
        });
        STORAGE_DIAGNOSTIC_ACTIONS.forEach(({ actionId, key }) => {
            try {
                this.renderStorageResult(key, runAdminSystemHealthStorageConnectivityAction(actionId));
            } catch (error) {
                const message = error instanceof Error ? error.message : "Safe R2 diagnostic API is unavailable.";
                this.setStorageStatus(key, "PENDING", message);
            }
        });
    }

    createCell(text) {
        const cell = document.createElement("td");
        cell.textContent = asText(text);
        return cell;
    }

    createStatusCell(status, reason) {
        const cell = document.createElement("td");
        cell.dataset.healthStatus = normalizeStatusValue(status);
        this.setStatusNode(cell, status, reason);
        return cell;
    }

    renderRuntimePending(reason) {
        if (!this.runtimeRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Runtime environment"),
            this.createCell("not available"),
            this.createStatusCell("PENDING", reason),
        );
        this.runtimeRows.replaceChildren(row);
    }

    renderRuntimeEnvironment(runtimeEnvironment = {}) {
        if (!this.runtimeRows) {
            return;
        }
        if (runtimeEnvironment?.secretsExposed === true || runtimeEnvironment?.secretEditingAllowed === true) {
            this.renderRuntimePending("Safe runtime environment diagnostics were blocked because the response exposed secret controls.");
            return;
        }
        const rows = Array.isArray(runtimeEnvironment.rows) ? runtimeEnvironment.rows : [];
        if (!rows.length) {
            this.renderRuntimePending("Safe runtime environment diagnostics returned no loaded keys.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((runtimeRow) => {
            const row = document.createElement("tr");
            const keyCell = this.createCell(runtimeRow.key);
            keyCell.dataset.adminSystemHealthRuntimeKey = "";
            row.append(
                keyCell,
                this.createCell(runtimeRow.display),
                this.createStatusCell(runtimeRow.status, runtimeRow.reason),
            );
            fragment.append(row);
        });
        this.runtimeRows.replaceChildren(fragment);
    }

    load() {
        try {
            const data = readAdminSystemHealthStatus();
            if (data?.secretsExposed === true || data?.secretEditingAllowed === true) {
                this.renderPending("Safe Admin System Health API refused to render because the response exposed secret controls.");
                return;
            }
            this.renderPostgresStatus(data?.databaseStatus || {});
            this.renderStartupDiagnostics(data?.localApiStartup || {});
            this.renderStorageStatus(data?.storageStatus || {});
            this.runStorageDiagnostics();
            this.renderRuntimeEnvironment(data?.runtimeEnvironment || {});
        } catch (error) {
            const message = error instanceof Error ? error.message : "Safe Admin System Health API is unavailable.";
            this.renderPending(message);
        }
    }
}

function bootAdminSystemHealth() {
    const root = document.querySelector("[data-admin-system-health]");
    if (!root) return;
    new AdminSystemHealthController(root).init();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAdminSystemHealth);
} else {
    bootAdminSystemHealth();
}
