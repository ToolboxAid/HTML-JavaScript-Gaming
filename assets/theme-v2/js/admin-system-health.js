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
    Object.freeze({ actionId: "storage-bucket-connectivity", key: "bucket" }),
    Object.freeze({ actionId: "storage-list", key: "list" }),
    Object.freeze({ actionId: "storage-upload-test-object", key: "upload" }),
    Object.freeze({ actionId: "storage-read-test-object", key: "read" }),
    Object.freeze({ actionId: "storage-delete-test-object", key: "delete" }),
]);

function asText(value, fallback = "not available") {
    return statusText(value, fallback);
}

function formatUptimeSeconds(value) {
    const seconds = Number(value);
    return Number.isFinite(seconds) ? `${Math.max(0, Math.floor(seconds))} s` : "not available";
}

class AdminSystemHealthController {
    constructor(root) {
        this.root = root;
        this.environmentValues = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-environment-value]")).map((node) => [
            node.dataset.adminSystemHealthEnvironmentValue,
            node,
        ]));
        this.environmentStatuses = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-environment-status]")).map((node) => [
            node.dataset.adminSystemHealthEnvironmentStatus,
            node,
        ]));
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
        this.runtimeHealthValues = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-runtime-health-value]")).map((node) => [
            node.dataset.adminSystemHealthRuntimeHealthValue,
            node,
        ]));
        this.runtimeHealthStatuses = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-runtime-health-status]")).map((node) => [
            node.dataset.adminSystemHealthRuntimeHealthStatus,
            node,
        ]));
        this.historyRows = root.querySelector("[data-admin-system-health-history-rows]");
        this.serviceCards = root.querySelector("[data-admin-system-health-service-cards]");
        this.startupRows = root.querySelector("[data-admin-system-health-startup-rows]");
        this.runtimeRows = root.querySelector("[data-admin-system-health-runtime-rows]");
    }

    init() {
        if ((!this.environmentValues.size && !this.dbValues.size && !this.storageValues.size) || document.querySelector("[data-session-access-blocked='admin']") || window.GameFoundrySessionGuard?.blocked === true) {
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

    setEnvironmentValue(key, value, fallback) {
        const node = this.environmentValues.get(key);
        if (node) {
            node.textContent = asText(value, fallback);
        }
    }

    setEnvironmentStatus(key, status, reason = "") {
        const node = this.environmentStatuses.get(key);
        this.setStatusNode(node, status, reason);
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

    setRuntimeHealthValue(key, value, fallback) {
        const node = this.runtimeHealthValues.get(key);
        if (node) {
            node.textContent = asText(value, fallback);
        }
    }

    setRuntimeHealthStatus(key, status, reason = "") {
        const node = this.runtimeHealthStatuses.get(key);
        this.setStatusNode(node, status, reason);
    }

    setStatusNode(node, status, reason = "") {
        applyStatusNode(node, status, { reason });
    }

    renderPending(reason) {
        ["name", "hostingModel", "siteUrl", "apiUrl", "databaseModel", "storageFolder", "lastHealthCheck"].forEach((key) => {
            this.setEnvironmentStatus(key, "PENDING", reason);
        });
        ["type", "connectivity", "responseTime", "version", "lastChecked"].forEach((key) => {
            this.setStatus(key, "PENDING", reason);
        });
        this.renderStartupPending(reason);
        this.renderStoragePending(reason);
        this.renderRuntimeHealthPending(reason);
        this.renderServiceHealthPending(reason);
        this.renderHistoryPending(reason);
    }

    renderEnvironmentIdentity(environmentIdentity = {}) {
        const reason = environmentIdentity.message || "Current deployment environment identity returned by the safe Admin System Health API.";
        this.setEnvironmentValue("name", environmentIdentity.name, "Unknown");
        this.setEnvironmentStatus("name", environmentIdentity.status, reason);
        this.setEnvironmentValue("hostingModel", environmentIdentity.hostingModel, "not configured");
        this.setEnvironmentStatus("hostingModel", environmentIdentity.hostingModel ? "PASS" : "WARN", reason);
        this.setEnvironmentValue("siteUrl", environmentIdentity.siteUrl, "not configured");
        this.setEnvironmentStatus("siteUrl", environmentIdentity.siteUrlStatus, reason);
        this.setEnvironmentValue("apiUrl", environmentIdentity.apiUrl, "not configured");
        this.setEnvironmentStatus("apiUrl", environmentIdentity.apiUrlStatus, reason);
        this.setEnvironmentValue("databaseModel", environmentIdentity.databaseModel, "not configured");
        this.setEnvironmentStatus("databaseModel", environmentIdentity.databaseModel ? "PASS" : "WARN", reason);
        this.setEnvironmentValue("storageFolder", environmentIdentity.storageFolder, "not configured");
        this.setEnvironmentStatus("storageFolder", environmentIdentity.storageFolderStatus, reason);
        this.setEnvironmentValue("lastHealthCheck", environmentIdentity.lastHealthCheck, "not available");
        this.setEnvironmentStatus("lastHealthCheck", environmentIdentity.lastHealthCheck ? "PASS" : "WARN", reason);
    }

    renderStoragePending(reason) {
        ["bucket", "list", "upload", "read", "delete", "lastChecked"].forEach((key) => {
            this.setStorageStatus(key, "PENDING", reason);
        });
        this.renderRuntimePending(reason);
    }

    renderPostgresStatus(databaseStatus = {}) {
        const reason = databaseStatus.message || "Current environment database health returned by the safe Admin System Health API.";
        const responseTime = Number.isFinite(databaseStatus.responseTimeMs)
            ? `${databaseStatus.responseTimeMs} ms`
            : "not available";

        this.setValue("type", databaseStatus.databaseType, "PostgreSQL");
        this.setStatus("type", databaseStatus.databaseType ? "PASS" : "WARN", reason);
        this.setValue("connectivity", databaseStatus.connectivity, databaseStatus.message || "not configured");
        this.setStatus("connectivity", databaseStatus.connectivityStatus || databaseStatus.status, reason);
        this.setValue("responseTime", responseTime);
        this.setStatus("responseTime", Number.isFinite(databaseStatus.responseTimeMs) ? "PASS" : "WARN", reason);
        this.setValue("version", databaseStatus.version, "not available");
        this.setStatus("version", databaseStatus.versionStatus, reason);
        this.setValue("lastChecked", databaseStatus.lastChecked, "not available");
        this.setStatus("lastChecked", databaseStatus.lastChecked ? "PASS" : "WARN", reason);
    }

    renderStorageStatus(storageStatus = {}) {
        const reason = storageStatus.message || "Cloudflare R2 configuration status returned by the safe Admin System Health API.";
        this.setStorageValue("bucket", storageStatus.environmentFolder ? `${storageStatus.bucket || "not configured"} ${storageStatus.environmentFolder}` : storageStatus.bucket, "not configured");
        this.setStorageStatus("bucket", storageStatus.bucketStatus || storageStatus.status, reason);
        this.setStorageValue("lastChecked", storageStatus.lastChecked, "not available");
        this.setStorageStatus("lastChecked", storageStatus.lastChecked ? "PASS" : "WARN", reason);
    }

    renderRuntimeHealthPending(reason) {
        ["environment", "appVersion", "apiVersion", "nodeVersion", "serverStartTime", "uptime", "lastChecked"].forEach((key) => {
            this.setRuntimeHealthValue(key, "not available");
            this.setRuntimeHealthStatus(key, "PENDING", reason);
        });
    }

    renderRuntimeHealth(runtimeHealth = {}) {
        const reason = runtimeHealth.message || "Current deployment runtime health returned by the safe Admin System Health API.";
        if (runtimeHealth?.secretsExposed === true || runtimeHealth?.secretEditingAllowed === true) {
            this.renderRuntimeHealthPending("Safe runtime health response was blocked because it exposed secret controls.");
            return;
        }
        this.setRuntimeHealthValue("environment", runtimeHealth.environmentName, "Unknown");
        this.setRuntimeHealthStatus("environment", runtimeHealth.environmentName ? runtimeHealth.status : "WARN", reason);
        this.setRuntimeHealthValue("appVersion", runtimeHealth.appVersion, "not available");
        this.setRuntimeHealthStatus("appVersion", runtimeHealth.appVersion ? "PASS" : "WARN", reason);
        this.setRuntimeHealthValue("apiVersion", runtimeHealth.apiVersion, "not available");
        this.setRuntimeHealthStatus("apiVersion", runtimeHealth.apiVersion ? "PASS" : "WARN", reason);
        this.setRuntimeHealthValue("nodeVersion", runtimeHealth.nodeVersion, "not available");
        this.setRuntimeHealthStatus("nodeVersion", runtimeHealth.nodeVersion ? "PASS" : "WARN", reason);
        this.setRuntimeHealthValue("serverStartTime", runtimeHealth.serverStartTime, "not available");
        this.setRuntimeHealthStatus("serverStartTime", runtimeHealth.serverStartTime ? "PASS" : "WARN", reason);
        this.setRuntimeHealthValue("uptime", formatUptimeSeconds(runtimeHealth.uptimeSeconds));
        this.setRuntimeHealthStatus("uptime", Number.isFinite(Number(runtimeHealth.uptimeSeconds)) ? "PASS" : "WARN", reason);
        this.setRuntimeHealthValue("lastChecked", runtimeHealth.lastChecked, "not available");
        this.setRuntimeHealthStatus("lastChecked", runtimeHealth.lastChecked ? "PASS" : "WARN", reason);
    }

    renderServiceHealthPending(reason) {
        if (!this.serviceCards) {
            return;
        }
        const card = this.createServiceHealthCard({
            healthStatus: "PENDING",
            label: "Service Health",
            status: "Not Configured",
            summary: reason,
        });
        this.serviceCards.replaceChildren(card);
    }

    createServiceHealthCard(service = {}) {
        const card = document.createElement("article");
        card.className = "card";
        card.dataset.adminSystemHealthServiceCard = service.id || "";
        const body = document.createElement("div");
        body.className = "card-body content-stack content-stack--compact";
        const title = document.createElement("h4");
        title.textContent = asText(service.label, "Service");
        const status = document.createElement("p");
        const healthStatus = normalizeStatusValue(service.healthStatus);
        status.dataset.healthStatus = healthStatus;
        status.textContent = asText(service.status, "Not Configured");
        if (healthStatus !== "PASS") {
            const reason = asText(service.summary, "Safe server diagnostics did not provide a reason.");
            status.setAttribute("title", `Reason: ${reason}`);
            status.setAttribute("aria-label", `${status.textContent}: ${reason}`);
        }
        const summary = document.createElement("p");
        summary.textContent = asText(service.summary, "Status unavailable.");
        const checkedAt = document.createElement("p");
        checkedAt.textContent = `Last checked: ${asText(service.lastChecked, "not available")}`;
        body.append(title, status, summary, checkedAt);
        card.append(body);
        return card;
    }

    renderServiceHealth(serviceHealth = {}) {
        if (!this.serviceCards) {
            return;
        }
        if (serviceHealth?.secretsExposed === true || serviceHealth?.secretEditingAllowed === true) {
            this.renderServiceHealthPending("Safe service health response was blocked because it exposed secret controls.");
            return;
        }
        const services = Array.isArray(serviceHealth.services) ? serviceHealth.services : [];
        if (!services.length) {
            this.renderServiceHealthPending("Safe Admin System Health API returned no service health cards.");
            return;
        }
        const fragment = document.createDocumentFragment();
        services.forEach((service) => {
            fragment.append(this.createServiceHealthCard(service));
        });
        this.serviceCards.replaceChildren(fragment);
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
            return `${result.keysListed} object(s) under ${asText(result.environmentFolder, "current environment folder")}`;
        }
        if (result.actionId === "storage-bucket-connectivity") {
            return result.environmentFolder || result.message || "bucket connectivity target unavailable";
        }
        return result.testObjectKey || result.environmentFolder || result.message || "diagnostic target unavailable";
    }

    renderStorageResult(key, result = {}) {
        if (result?.secretsExposed === true || result?.secretEditingAllowed === true) {
            this.setStorageStatus(key, "PENDING", "Safe R2 diagnostic response was blocked because it exposed secret controls.");
            return;
        }
        this.setStorageValue(key, this.storageResultTarget(result));
        this.setStorageStatus(key, result.status, result.message || "R2 diagnostic returned without a message.");
        if (result.lastChecked) {
            this.setStorageValue("lastChecked", result.lastChecked);
            this.setStorageStatus("lastChecked", "PASS", "Most recent current-environment R2 health check timestamp.");
        }
    }

    renderHistoryPending(reason) {
        if (!this.historyRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("not available"),
            this.createCell("current environment"),
            this.createCell("Health Check History"),
            this.createStatusCell("PENDING", reason),
            this.createCell("Safe health check history is not available."),
        );
        this.historyRows.replaceChildren(row);
    }

    renderHealthCheckHistory(historyRows = []) {
        if (!this.historyRows) {
            return;
        }
        const rows = Array.isArray(historyRows) ? historyRows : [];
        if (!rows.length) {
            this.renderHistoryPending("Safe Admin System Health API returned no current-environment health check history rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((historyRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(historyRow.checkedAt),
                this.createCell(historyRow.environmentName),
                this.createCell(historyRow.area),
                this.createStatusCell(historyRow.result || historyRow.status, historyRow.summary),
                this.createCell(historyRow.summary),
            );
            fragment.append(row);
        });
        this.historyRows.replaceChildren(fragment);
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
            this.renderEnvironmentIdentity(data?.environmentIdentity || {});
            this.renderPostgresStatus(data?.databaseStatus || {});
            this.renderStartupDiagnostics(data?.localApiStartup || {});
            this.renderStorageStatus(data?.storageStatus || {});
            this.runStorageDiagnostics();
            this.renderRuntimeHealth(data?.runtimeHealth || {});
            this.renderServiceHealth(data?.serviceHealth || {});
            this.renderHealthCheckHistory(data?.healthCheckHistory || []);
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
