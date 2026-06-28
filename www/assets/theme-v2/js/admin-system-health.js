import {
    readAdminSystemHealthStatus,
    runAdminSystemHealthAction,
    runAdminSystemHealthStorageExpandedValidation,
} from "../../../../src/api/admin-system-health-api-client.js";
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
const STORAGE_DIAGNOSTIC_ACTION_KEY_BY_ID = new Map(STORAGE_DIAGNOSTIC_ACTIONS.map((action) => [action.actionId, action.key]));

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
        this.storageTimings = new Map(Array.from(root.querySelectorAll("[data-admin-system-health-storage-timing]")).map((node) => [
            node.dataset.adminSystemHealthStorageTiming,
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
        this.apiContractRows = root.querySelector("[data-admin-system-health-api-contract-rows]");
        this.apiRegistryRows = root.querySelector("[data-admin-system-health-api-registry-rows]");
        this.environmentComparisonRows = root.querySelector("[data-admin-system-health-environment-comparison-rows]");
        this.capabilityRows = root.querySelector("[data-admin-system-health-capability-rows]");
        this.featureFlagRows = root.querySelector("[data-admin-system-health-feature-flag-rows]");
        this.actionRows = root.querySelector("[data-admin-system-health-action-rows]");
        this.actionButtons = Array.from(root.querySelectorAll("[data-admin-system-health-action]"));
        this.configurationRows = root.querySelector("[data-admin-system-health-configuration-rows]");
        this.scheduledRows = root.querySelector("[data-admin-system-health-scheduled-rows]");
        this.notificationRows = root.querySelector("[data-admin-system-health-notification-rows]");
        this.serviceCards = root.querySelector("[data-admin-system-health-service-cards]");
        this.startupRows = root.querySelector("[data-admin-system-health-startup-rows]");
        this.postgresMetricRows = root.querySelector("[data-admin-system-health-postgres-metric-rows]");
        this.runtimeRows = root.querySelector("[data-admin-system-health-runtime-rows]");
    }

    init() {
        if ((!this.environmentValues.size && !this.dbValues.size && !this.storageValues.size) || document.querySelector("[data-session-access-blocked='admin']") || window.GameFoundrySessionGuard?.blocked === true) {
            return;
        }
        this.bindManualActions();
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

    setStorageTiming(key, value, fallback) {
        const node = this.storageTimings.get(key);
        if (node) {
            node.textContent = asText(value, fallback);
        }
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
        this.renderPostgresMetricsPending(reason);
        this.renderStoragePending(reason);
        this.renderRuntimeHealthPending(reason);
        this.renderEnvironmentComparisonPending(reason);
        this.renderEnvironmentCapabilitiesPending(reason);
        this.renderApiContractPending(reason);
        this.renderAdminApiRegistryPending(reason);
        this.renderRuntimeFeatureFlagsPending(reason);
        this.renderServiceHealthPending(reason);
        this.renderConfigurationSummaryPending(reason);
        this.renderScheduledMonitoringPending(reason);
        this.renderNotificationsFoundationPending(reason);
        this.renderHistoryPending(reason);
    }

    bindManualActions() {
        this.actionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                this.runManualHealthAction(button.dataset.adminSystemHealthAction);
            });
        });
    }

    setManualActionsDisabled(disabled) {
        this.actionButtons.forEach((button) => {
            button.disabled = disabled;
        });
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

    renderEnvironmentComparisonPending(reason) {
        if (!this.environmentComparisonRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Environment comparison"),
            this.createCell("Reference-only"),
            this.createCell("not available"),
            this.createCell("Reference-only"),
            this.createCell("Reference-only"),
            this.createCell("Unavailable"),
            this.createStatusCell("PENDING", reason),
        );
        this.environmentComparisonRows.replaceChildren(row);
    }

    renderEnvironmentComparison(environmentComparison = {}) {
        if (!this.environmentComparisonRows) {
            return;
        }
        if (environmentComparison?.secretsExposed === true || environmentComparison?.secretEditingAllowed === true) {
            this.renderEnvironmentComparisonPending("Safe environment comparison response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(environmentComparison.rows) ? environmentComparison.rows : [];
        if (!rows.length) {
            this.renderEnvironmentComparisonPending("Safe Admin System Health API returned no environment comparison rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((comparisonRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(comparisonRow.displayName),
                this.createCell(comparisonRow.hostingModel),
                this.createCell(comparisonRow.runtimeExpectation),
                this.createCell(comparisonRow.databaseModel),
                this.createCell(comparisonRow.storageFolder),
                this.createCell(comparisonRow.state),
                this.createStatusCell(comparisonRow.status, comparisonRow.summary || environmentComparison.message),
            );
            fragment.append(row);
        });
        this.environmentComparisonRows.replaceChildren(fragment);
    }

    renderStoragePending(reason) {
        ["bucket", "list", "upload", "read", "delete", "lastChecked"].forEach((key) => {
            this.setStorageStatus(key, "PENDING", reason);
            this.setStorageTiming(key, "not available");
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
        this.renderPostgresMetrics(databaseStatus.postgresMetrics || {});
    }

    renderPostgresMetricsPending(reason) {
        if (!this.postgresMetricRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Postgres metrics"),
            this.createCell("Unavailable"),
            this.createStatusCell("PENDING", reason),
        );
        this.postgresMetricRows.replaceChildren(row);
    }

    renderPostgresMetrics(postgresMetrics = {}) {
        if (!this.postgresMetricRows) {
            return;
        }
        if (postgresMetrics?.secretsExposed === true || postgresMetrics?.secretEditingAllowed === true) {
            this.renderPostgresMetricsPending("Safe Postgres metrics response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(postgresMetrics.rows) ? postgresMetrics.rows : [];
        if (!rows.length) {
            this.renderPostgresMetricsPending("Safe Admin System Health API returned no Postgres metric rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((metricRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(metricRow.metric),
                this.createCell(metricRow.value),
                this.createStatusCell(metricRow.status, postgresMetrics.message),
            );
            fragment.append(row);
        });
        this.postgresMetricRows.replaceChildren(fragment);
    }

    renderStorageStatus(storageStatus = {}) {
        const reason = storageStatus.message || "Cloudflare R2 configuration status returned by the safe Admin System Health API.";
        this.setStorageValue("bucket", storageStatus.environmentFolder ? `${storageStatus.bucket || "not configured"} ${storageStatus.environmentFolder}` : storageStatus.bucket, "not configured");
        this.setStorageStatus("bucket", storageStatus.bucketStatus || storageStatus.status, reason);
        this.setStorageTiming("bucket", storageStatus.lastChecked ? "configuration status" : "not available");
        this.setStorageValue("lastChecked", storageStatus.lastChecked, "not available");
        this.setStorageStatus("lastChecked", storageStatus.lastChecked ? "PASS" : "WARN", reason);
        this.setStorageTiming("lastChecked", storageStatus.lastChecked ? "configuration status" : "not available");
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

    renderApiContractPending(reason) {
        if (!this.apiContractRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Health API Contract"),
            this.createCell("not available"),
            this.createStatusCell("PENDING", reason),
        );
        this.apiContractRows.replaceChildren(row);
    }

    renderApiContract(apiContract = {}) {
        if (!this.apiContractRows) {
            return;
        }
        if (apiContract?.secretsExposed === true || apiContract?.secretEditingAllowed === true) {
            this.renderApiContractPending("Safe API contract response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(apiContract.rows) ? apiContract.rows : [];
        if (!rows.length) {
            this.renderApiContractPending("Safe Admin System Health API returned no contract rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((contractRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(contractRow.field),
                this.createCell(contractRow.value),
                this.createStatusCell(contractRow.status, apiContract.message),
            );
            fragment.append(row);
        });
        this.apiContractRows.replaceChildren(fragment);
    }

    renderEnvironmentCapabilitiesPending(reason) {
        if (!this.capabilityRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Environment Capabilities"),
            this.createCell("not available"),
            this.createStatusCell("PENDING", reason),
        );
        this.capabilityRows.replaceChildren(row);
    }

    renderEnvironmentCapabilities(environmentCapabilities = {}) {
        if (!this.capabilityRows) {
            return;
        }
        if (environmentCapabilities?.secretsExposed === true || environmentCapabilities?.secretEditingAllowed === true) {
            this.renderEnvironmentCapabilitiesPending("Safe environment capabilities response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(environmentCapabilities.rows) ? environmentCapabilities.rows : [];
        if (!rows.length) {
            this.renderEnvironmentCapabilitiesPending("Safe Admin System Health API returned no environment capability rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((capabilityRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(capabilityRow.capability),
                this.createCell(capabilityRow.value),
                this.createStatusCell(capabilityRow.status, environmentCapabilities.message),
            );
            fragment.append(row);
        });
        this.capabilityRows.replaceChildren(fragment);
    }

    renderAdminApiRegistryPending(reason) {
        if (!this.apiRegistryRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("GET"),
            this.createCell("not available"),
            this.createCell("Team Charlie"),
            this.createStatusCell("PENDING", reason),
        );
        this.apiRegistryRows.replaceChildren(row);
    }

    renderAdminApiRegistry(adminApiRegistry = {}) {
        if (!this.apiRegistryRows) {
            return;
        }
        if (adminApiRegistry?.secretsExposed === true || adminApiRegistry?.secretEditingAllowed === true) {
            this.renderAdminApiRegistryPending("Safe Admin API registry response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(adminApiRegistry.rows) ? adminApiRegistry.rows : [];
        if (!rows.length) {
            this.renderAdminApiRegistryPending("Safe Admin System Health API returned no Admin API registry rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((registryRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(registryRow.method),
                this.createCell(`${registryRow.path} - ${registryRow.purpose}`),
                this.createCell(registryRow.owner),
                this.createStatusCell(registryRow.status, adminApiRegistry.message),
            );
            fragment.append(row);
        });
        this.apiRegistryRows.replaceChildren(fragment);
    }

    renderRuntimeFeatureFlagsPending(reason) {
        if (!this.featureFlagRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Runtime Feature Flags"),
            this.createCell("not available"),
            this.createStatusCell("PENDING", reason),
        );
        this.featureFlagRows.replaceChildren(row);
    }

    renderRuntimeFeatureFlags(runtimeFeatureFlags = {}) {
        if (!this.featureFlagRows) {
            return;
        }
        if (runtimeFeatureFlags?.secretsExposed === true || runtimeFeatureFlags?.secretEditingAllowed === true) {
            this.renderRuntimeFeatureFlagsPending("Safe runtime feature flags response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(runtimeFeatureFlags.rows) ? runtimeFeatureFlags.rows : [];
        if (!rows.length) {
            this.renderRuntimeFeatureFlagsPending("Safe Admin System Health API returned no runtime feature flag rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((featureRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(featureRow.flag),
                this.createCell(featureRow.value),
                this.createStatusCell(featureRow.status, runtimeFeatureFlags.message),
            );
            fragment.append(row);
        });
        this.featureFlagRows.replaceChildren(fragment);
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

    renderConfigurationSummaryPending(reason) {
        if (!this.configurationRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Configuration Summary"),
            this.createCell("not available"),
            this.createStatusCell("PENDING", reason),
        );
        this.configurationRows.replaceChildren(row);
    }

    renderConfigurationSummary(configurationSummary = {}) {
        if (!this.configurationRows) {
            return;
        }
        if (configurationSummary?.secretsExposed === true || configurationSummary?.secretEditingAllowed === true) {
            this.renderConfigurationSummaryPending("Safe configuration summary response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(configurationSummary.rows) ? configurationSummary.rows : [];
        if (!rows.length) {
            this.renderConfigurationSummaryPending("Safe Admin System Health API returned no configuration summary rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((configurationRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(configurationRow.field),
                this.createCell(configurationRow.value),
                this.createStatusCell(configurationRow.status, configurationSummary.message),
            );
            fragment.append(row);
        });
        this.configurationRows.replaceChildren(fragment);
    }

    renderScheduledMonitoringPending(reason) {
        if (!this.scheduledRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Scheduled Health Monitoring"),
            this.createCell("Not Configured"),
            this.createStatusCell("PENDING", reason),
        );
        this.scheduledRows.replaceChildren(row);
    }

    renderScheduledMonitoring(scheduledMonitoring = {}) {
        if (!this.scheduledRows) {
            return;
        }
        if (scheduledMonitoring?.secretsExposed === true || scheduledMonitoring?.secretEditingAllowed === true) {
            this.renderScheduledMonitoringPending("Safe scheduled monitoring response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(scheduledMonitoring.rows) ? scheduledMonitoring.rows : [];
        if (!rows.length) {
            this.renderScheduledMonitoringPending("Safe Admin System Health API returned no scheduled monitoring rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((scheduledRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(scheduledRow.field),
                this.createCell(scheduledRow.value),
                this.createStatusCell(scheduledRow.status, scheduledMonitoring.message),
            );
            fragment.append(row);
        });
        this.scheduledRows.replaceChildren(fragment);
    }

    renderNotificationsFoundationPending(reason) {
        if (!this.notificationRows) {
            return;
        }
        const row = document.createElement("tr");
        row.append(
            this.createCell("Notifications & Alerts"),
            this.createCell("Not Configured"),
            this.createStatusCell("PENDING", reason),
        );
        this.notificationRows.replaceChildren(row);
    }

    renderNotificationsFoundation(notificationsFoundation = {}) {
        if (!this.notificationRows) {
            return;
        }
        if (notificationsFoundation?.secretsExposed === true || notificationsFoundation?.secretEditingAllowed === true) {
            this.renderNotificationsFoundationPending("Safe notifications response was blocked because it exposed secret controls.");
            return;
        }
        const rows = Array.isArray(notificationsFoundation.rows) ? notificationsFoundation.rows : [];
        if (!rows.length) {
            this.renderNotificationsFoundationPending("Safe Admin System Health API returned no notifications rows.");
            return;
        }
        const fragment = document.createDocumentFragment();
        rows.forEach((notificationRow) => {
            const row = document.createElement("tr");
            row.append(
                this.createCell(notificationRow.field),
                this.createCell(notificationRow.value),
                this.createStatusCell(notificationRow.status, notificationsFoundation.message),
            );
            fragment.append(row);
        });
        this.notificationRows.replaceChildren(fragment);
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
        this.setStorageTiming(key, Number.isFinite(Number(result.durationMs)) ? `${result.durationMs} ms` : "not available");
        if (result.lastChecked) {
            this.setStorageValue("lastChecked", result.lastChecked);
            this.setStorageStatus("lastChecked", "PASS", "Most recent current-environment R2 health check timestamp.");
            this.setStorageTiming("lastChecked", Number.isFinite(Number(result.durationMs)) ? `${result.durationMs} ms` : "not available");
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
            this.setStorageTiming(key, "running");
        });
        try {
            const validation = runAdminSystemHealthStorageExpandedValidation();
            const diagnostics = Array.isArray(validation.storageDiagnostics) ? validation.storageDiagnostics : [];
            diagnostics.forEach((storageResult) => {
                const key = STORAGE_DIAGNOSTIC_ACTION_KEY_BY_ID.get(storageResult.actionId);
                if (key) {
                    this.renderStorageResult(key, storageResult);
                }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Safe R2 diagnostic API is unavailable.";
            STORAGE_DIAGNOSTIC_ACTIONS.forEach(({ key }) => {
                this.setStorageStatus(key, "PENDING", message);
                this.setStorageTiming(key, "not available");
            });
        }
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

    renderManualActionResult(result = {}) {
        if (!this.actionRows) {
            return;
        }
        const blocked = result?.secretsExposed === true || result?.secretEditingAllowed === true;
        const row = document.createElement("tr");
        row.append(
            this.createCell(result.label || "Manual health action"),
            this.createCell(result.checkedAt || result.lastChecked || "not available"),
            this.createStatusCell(blocked ? "PENDING" : result.status, blocked ? "Safe manual action response was blocked because it exposed secret controls." : result.message),
            this.createCell(blocked ? "Safe manual action response was blocked." : result.message),
        );
        this.actionRows.replaceChildren(row);
    }

    applyManualActionResult(result = {}) {
        if (result.statusSnapshot) {
            this.renderStatusData(result.statusSnapshot);
        }
        if (result.runtimeHealth) {
            this.renderRuntimeHealth(result.runtimeHealth);
        }
        if (result.databaseStatus) {
            this.renderPostgresStatus(result.databaseStatus);
        }
        if (result.storageStatus) {
            this.renderStorageStatus(result.storageStatus);
        }
        const storageDiagnostics = Array.isArray(result.storageDiagnostics) ? result.storageDiagnostics : [];
        storageDiagnostics.forEach((storageResult) => {
            const key = STORAGE_DIAGNOSTIC_ACTION_KEY_BY_ID.get(storageResult.actionId);
            if (key) {
                this.renderStorageResult(key, storageResult);
            }
        });
    }

    runManualHealthAction(actionId) {
        if (!actionId) {
            return;
        }
        this.setManualActionsDisabled(true);
        this.renderManualActionResult({
            checkedAt: new Date().toISOString(),
            label: "Manual health action",
            message: "Manual health action is running through the safe Admin System Health API.",
            status: "PENDING",
        });
        try {
            const result = runAdminSystemHealthAction(actionId);
            this.renderManualActionResult(result);
            this.applyManualActionResult(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Safe Admin System Health action API is unavailable.";
            this.renderManualActionResult({
                checkedAt: new Date().toISOString(),
                label: "Manual health action",
                message,
                status: "FAIL",
            });
        } finally {
            this.setManualActionsDisabled(false);
        }
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

    renderStatusData(data = {}) {
        if (data?.secretsExposed === true || data?.secretEditingAllowed === true) {
            this.renderPending("Safe Admin System Health API refused to render because the response exposed secret controls.");
            return;
        }
        this.renderEnvironmentIdentity(data?.environmentIdentity || {});
        this.renderEnvironmentComparison(data?.environmentComparison || {});
        this.renderPostgresStatus(data?.databaseStatus || {});
        this.renderStartupDiagnostics(data?.localApiStartup || {});
        this.renderStorageStatus(data?.storageStatus || {});
        this.runStorageDiagnostics();
        this.renderRuntimeHealth(data?.runtimeHealth || {});
        this.renderEnvironmentCapabilities(data?.environmentCapabilities || {});
        this.renderApiContract(data?.apiContract || {});
        this.renderAdminApiRegistry(data?.adminApiRegistry || {});
        this.renderRuntimeFeatureFlags(data?.runtimeFeatureFlags || {});
        this.renderServiceHealth(data?.serviceHealth || {});
        this.renderConfigurationSummary(data?.configurationSummary || {});
        this.renderScheduledMonitoring(data?.scheduledMonitoring || {});
        this.renderNotificationsFoundation(data?.notificationsFoundation || {});
        this.renderHealthCheckHistory(data?.healthCheckHistory || []);
        this.renderRuntimeEnvironment(data?.runtimeEnvironment || {});
    }

    load() {
        try {
            const data = readAdminSystemHealthStatus();
            this.renderStatusData(data);
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
