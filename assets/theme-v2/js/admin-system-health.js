import { readAdminSystemHealthStatus } from "../../../src/api/admin-system-health-api-client.js";

const STATUS_VALUES = Object.freeze(["PASS", "WARN", "FAIL", "PENDING", "INFO", "SKIP"]);

function asText(value, fallback = "not available") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

function statusValue(value, fallback = "PENDING") {
    const normalized = String(value || "").trim().toUpperCase();
    return STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

function reasonText(status, reason) {
    const message = asText(reason, "Safe server diagnostics did not provide a reason.");
    return `${status}: ${message}`;
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
    }

    init() {
        if (!this.dbValues.size || !this.dbStatuses.size || document.querySelector("[data-session-access-blocked='admin']") || window.GameFoundrySessionGuard?.blocked === true) {
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

    setStatus(key, status, reason = "") {
        const node = this.dbStatuses.get(key);
        if (!node) {
            return;
        }
        const normalized = statusValue(status);
        node.textContent = normalized;
        node.dataset.healthStatus = normalized;
        if (normalized === "PASS" && !reason) {
            node.removeAttribute("title");
            node.removeAttribute("aria-label");
            return;
        }
        const resolvedReason = reasonText(normalized, reason);
        node.setAttribute("title", `Reason: ${asText(reason, "Safe server diagnostics returned this non-PASS status.")}`);
        node.setAttribute("aria-label", resolvedReason);
    }

    renderPending(reason) {
        ["host", "database", "migration", "connection"].forEach((key) => {
            this.setStatus(key, "PENDING", reason);
        });
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

    load() {
        try {
            const data = readAdminSystemHealthStatus();
            if (data?.secretsExposed === true || data?.secretEditingAllowed === true) {
                this.renderPending("Safe Admin System Health API refused to render because the response exposed secret controls.");
                return;
            }
            this.renderPostgresStatus(data?.databaseStatus || {});
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
