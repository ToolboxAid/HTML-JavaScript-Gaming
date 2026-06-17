import {
    readOwnerOperationsStatus,
    runOwnerOperationAction,
    validateOwnerOperationsConnection
} from "../../../src/engine/api/owner-operations-api-client.js";

class OwnerOperationsController {
    constructor(root) {
        this.root = root;
        this.actionButtons = Array.from(root.querySelectorAll("[data-owner-operation-action]"));
        this.connectionSummary = root.querySelector("[data-owner-connection-summary]");
        this.databaseStatusRows = root.querySelector("[data-owner-database-status-rows]");
        this.promotionFoundationRows = root.querySelector("[data-owner-promotion-foundation-rows]");
        this.resultRows = root.querySelector("[data-owner-operation-result-rows]");
        this.status = root.querySelector("[data-owner-operations-status]");
        this.storageStatusRows = root.querySelector("[data-owner-storage-status-rows]");
        this.validateButton = root.querySelector("[data-owner-operation-validate]");
    }

    init() {
        if (!this.connectionSummary || !this.databaseStatusRows || !this.promotionFoundationRows || !this.resultRows || !this.status || !this.storageStatusRows || !this.validateButton) {
            return;
        }
        this.validateButton.addEventListener("click", () => this.validateConnection());
        this.actionButtons.forEach((button) => {
            button.addEventListener("click", () => this.runAction(button.dataset.ownerOperationAction));
        });
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    renderConnectionSummary(summary = {}) {
        const rows = [
            ["Account", summary.account?.status || "unknown", summary.account?.configured === true ? "configured" : "not configured"],
            ["Product Data", summary.productData?.status || "unknown", summary.productData?.configured === true ? "configured" : "not configured"],
            ["Project Asset Storage", summary.projectAssetStorage?.status || "unknown", summary.projectAssetStorage?.configured === true ? "configured" : "not configured"],
            ["Environment Switching", summary.environmentSwitching || "manual-env-change-and-server-restart", "manual"],
            ["Secrets", summary.secretsExposed === true ? "exposed" : "not exposed", "read-only summary"],
        ];
        this.connectionSummary.replaceChildren();
        rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            row.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                tableRow.append(cell);
            });
            this.connectionSummary.append(tableRow);
        });
    }

    renderDatabaseStatus(databaseStatus = {}) {
        const migrationCounts = databaseStatus.migrationCounts || {};
        const lastMigration = databaseStatus.lastMigration || {};
        const rows = [
            ["Connection Configured", databaseStatus.configured === true ? "PASS" : "WARN", databaseStatus.configured === true ? "yes" : "no"],
            ["Database Host", databaseStatus.hostStatus || "WARN", databaseStatus.host || "not configured"],
            ["Database Port", databaseStatus.portStatus || "WARN", databaseStatus.port ? String(databaseStatus.port) : "not configured"],
            ["Database Name", databaseStatus.databaseNameStatus || "WARN", databaseStatus.databaseName || "not configured"],
            ["SSL Mode", databaseStatus.sslModeStatus || "WARN", databaseStatus.sslMode || "not configured"],
            ["Migration Counts", databaseStatus.migrationStatus || "WARN", `DDL=${migrationCounts.DDL || 0}; DML=${migrationCounts.DML || 0}`],
            ["Last Migration", databaseStatus.lastMigrationStatus || "WARN", lastMigration.name && lastMigration.appliedAt ? `${lastMigration.type || "unknown"} ${lastMigration.name} at ${lastMigration.appliedAt}` : "not recorded"],
        ];
        this.databaseStatusRows.replaceChildren();
        rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            row.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                tableRow.append(cell);
            });
            this.databaseStatusRows.append(tableRow);
        });
    }

    renderStorageStatus(storageStatus = {}) {
        const rows = [
            ["Storage Configured", storageStatus.configured === true ? "PASS" : "WARN", storageStatus.configured === true ? "yes" : "no"],
            ["Storage Endpoint", storageStatus.endpointStatus || "WARN", storageStatus.endpoint || "not configured"],
            ["Storage Bucket", storageStatus.bucketStatus || "WARN", storageStatus.bucket || "not configured"],
            ["Projects Prefix", storageStatus.projectsPrefixStatus || "WARN", storageStatus.projectsPrefix || "not configured"],
            ["Access Key", storageStatus.accessKeyStatus || "WARN", storageStatus.accessKeyConfigured === true ? "configured; value hidden" : "not configured"],
            ["Secret Key", storageStatus.secretKeyStatus || "WARN", storageStatus.secretKeyConfigured === true ? "configured; value hidden" : "not configured"],
        ];
        this.storageStatusRows.replaceChildren();
        rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            row.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                tableRow.append(cell);
            });
            this.storageStatusRows.append(tableRow);
        });
    }

    renderPromotionFoundation(promotionFoundation = {}) {
        const steps = Array.isArray(promotionFoundation.steps) ? promotionFoundation.steps : [];
        const rows = steps.length
            ? steps.map((step) => [
                step.stage || "Unknown",
                step.operation || "Planning",
                step.status || "PLAN",
                `${step.safetyStatus || "WARN"}: ${step.safetyDiagnostic || promotionFoundation.safetyMessage || "Promotion safety validation unavailable."}`,
                `${promotionFoundation.ownerOnly === true ? "Owner-only" : "Restricted"}; ${promotionFoundation.browserExecutionAllowed === false ? "browser execution disabled" : "browser execution unknown"}; ${promotionFoundation.destructiveOperationsAllowed === false ? "destructive operations disabled" : "destructive operations unknown"}; ${step.message || promotionFoundation.message || "Promotion foundation planning."}`,
            ])
            : [["DEV/UAT/PROD", "Planning", promotionFoundation.status || "WARN", promotionFoundation.safetyMessage || "Promotion safety validation unavailable.", promotionFoundation.message || "Promotion foundation status unavailable."]];
        this.promotionFoundationRows.replaceChildren();
        rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            row.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                tableRow.append(cell);
            });
            this.promotionFoundationRows.append(tableRow);
        });
    }

    appendResult(result = {}) {
        const row = document.createElement("tr");
        [
            result.actionId || "validate-current-connection",
            result.status || "WARN",
            result.executed === true ? "yes" : "no",
            result.message || "No operation message returned.",
        ].forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });
        this.resultRows.prepend(row);
    }

    load() {
        try {
            const payload = readOwnerOperationsStatus();
            this.renderConnectionSummary(payload.connectionSummary || {});
            this.renderDatabaseStatus(payload.databaseStatus || {});
            this.renderPromotionFoundation(payload.promotionFoundation || {});
            this.renderStorageStatus(payload.storageStatus || {});
            this.setStatus(payload.status || "PASS", payload.message || "Owner Operations loaded.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Owner Operations are unavailable.");
        }
    }

    validateConnection() {
        try {
            const result = validateOwnerOperationsConnection();
            this.renderConnectionSummary(result.connectionSummary || {});
            this.renderDatabaseStatus(result.databaseStatus || {});
            this.renderPromotionFoundation(result.promotionFoundation || {});
            this.renderStorageStatus(result.storageStatus || {});
            this.appendResult(result);
            this.setStatus(result.status || "PASS", result.message || "Connection validation finished.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Connection validation failed.");
        }
    }

    runAction(actionId) {
        try {
            const result = runOwnerOperationAction(actionId);
            this.appendResult(result);
            this.setStatus(result.status || "SKIP", result.message || "Owner operation returned no message.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Owner operation failed.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-owner-operations]");
    if (!root) {
        return;
    }
    new OwnerOperationsController(root).init();
});
