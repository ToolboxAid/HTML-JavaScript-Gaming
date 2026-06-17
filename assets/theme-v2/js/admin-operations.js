import {
    readAdminOperationsStatus,
    runAdminOperationAction
} from "../../../src/engine/api/admin-operations-api-client.js";

class AdminOperationsController {
    constructor(root) {
        this.root = root;
        this.environmentStatus = root.querySelector("[data-admin-operations-environment]");
        this.groupContainers = new Map([
            ["project-packaging", root.querySelector("[data-admin-operation-group='project-packaging']")],
            ["backup-recovery", root.querySelector("[data-admin-operation-group='backup-recovery']")],
            ["database-operations", root.querySelector("[data-admin-operation-group='database-operations']")],
        ]);
        this.resultRows = root.querySelector("[data-admin-operation-result-rows]");
        this.safetyRows = root.querySelector("[data-admin-operation-safety-rows]");
        this.status = root.querySelector("[data-admin-operations-status]");
    }

    init() {
        if (!this.environmentStatus || !this.resultRows || !this.safetyRows || !this.status || Array.from(this.groupContainers.values()).some((container) => !container)) {
            return;
        }
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    renderActionGroups(actionGroups = []) {
        this.groupContainers.forEach((container, groupId) => {
            const group = actionGroups.find((candidate) => candidate.id === groupId);
            container.replaceChildren();
            if (!group || !Array.isArray(group.actions) || !group.actions.length) {
                const message = document.createElement("p");
                message.className = "status";
                message.textContent = `${group?.status || "SKIP"}: ${group?.message || "No actions are available for this section."}`;
                container.append(message);
                return;
            }
            group.actions.forEach((action, index) => {
                const button = document.createElement("button");
                button.className = index === 0 ? "btn btn--compact primary" : "btn btn--compact";
                button.dataset.adminOperationAction = action.id || "";
                button.textContent = action.label || action.id || "Unnamed Action";
                button.type = "button";
                button.addEventListener("click", () => this.runAction(button.dataset.adminOperationAction));
                container.append(button);
                if (action.confirmationRequired || action.risky || action.notImplemented) {
                    const warning = document.createElement("p");
                    warning.textContent = `${action.confirmationRequired ? "Confirmation required" : "Diagnostic"}: ${action.confirmationMessage || action.diagnostic || "Action requires reviewed server-side execution."}`;
                    container.append(warning);
                }
            });
        });
    }

    renderSafetyRows(actionGroups = []) {
        const rows = actionGroups.flatMap((group) => {
            const actions = Array.isArray(group.actions) ? group.actions : [];
            return actions.map((action) => [
                group.label || "Operations",
                action.label || action.id || "Unnamed Action",
                action.status || "SKIP",
                action.confirmationRequired ? "required before execution" : "not required for current placeholder",
                action.diagnostic || action.message || "No diagnostic returned.",
            ]);
        });
        this.safetyRows.replaceChildren();
        (rows.length ? rows : [["Startup", "Actions", "WARN", "unknown", "Admin Operations safety diagnostics unavailable."]]).forEach((row) => {
            const tableRow = document.createElement("tr");
            row.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                tableRow.append(cell);
            });
            this.safetyRows.append(tableRow);
        });
    }

    appendResult(result = {}) {
        const row = document.createElement("tr");
        [
            result.actionLabel || result.actionId || "admin-operation",
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
            const payload = readAdminOperationsStatus();
            const actionGroups = Array.isArray(payload.actionGroups) ? payload.actionGroups : [];
            this.renderActionGroups(actionGroups);
            this.renderSafetyRows(actionGroups);
            this.environmentStatus.textContent = `Current environment lane: ${payload.currentEnvironment || "UNKNOWN"}.`;
            this.setStatus(payload.status || "PASS", payload.message || "Admin Operations loaded.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Admin Operations are unavailable.");
        }
    }

    runAction(actionId) {
        try {
            const result = runAdminOperationAction(actionId);
            this.appendResult(result);
            this.setStatus(result.status || "SKIP", result.message || "Admin operation returned no message.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Admin operation failed.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-operations]");
    if (!root) {
        return;
    }
    new AdminOperationsController(root).init();
});
