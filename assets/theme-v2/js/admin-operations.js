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

    createLabeledControl(labelText, control) {
        const label = document.createElement("label");
        label.textContent = labelText;
        label.append(control);
        return label;
    }

    renderActionInputs(container, action) {
        if (action.requiresPackageFile) {
            const input = document.createElement("input");
            input.accept = ".gfsp";
            input.dataset.adminOperationPackageFile = action.id || "";
            input.type = "file";
            container.append(this.createLabeledControl("Project Package", input));
        }
        if (action.requiresBackupFile) {
            const input = document.createElement("input");
            input.accept = ".json";
            input.dataset.adminOperationBackupFile = action.id || "";
            input.type = "file";
            container.append(this.createLabeledControl("Backup File", input));
        }
        if (action.supportsImportModes) {
            const select = document.createElement("select");
            select.dataset.adminOperationImportMode = action.id || "";
            [
                ["import-as-new", "Import As New Project"],
                ["replace-existing", "Replace Existing"],
            ].forEach(([value, text]) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = text;
                select.append(option);
            });
            container.append(this.createLabeledControl("Import Mode", select));
        }
        if (action.confirmationRequired) {
            const checkbox = document.createElement("input");
            checkbox.dataset.adminOperationConfirmation = action.id || "";
            checkbox.type = "checkbox";
            container.append(this.createLabeledControl("Confirm Risky Operation", checkbox));
            if (action.confirmationPhrase) {
                const phrase = document.createElement("input");
                phrase.dataset.adminOperationConfirmationPhrase = action.id || "";
                phrase.placeholder = action.confirmationPhrase;
                phrase.type = "text";
                container.append(this.createLabeledControl(`Type ${action.confirmationPhrase}`, phrase));
            }
        }
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
                this.renderActionInputs(container, action);
                const button = document.createElement("button");
                button.className = index === 0 ? "btn btn--compact primary" : "btn btn--compact";
                button.dataset.adminOperationAction = action.id || "";
                button.textContent = action.label || action.id || "Unnamed Action";
                button.type = "button";
                button.addEventListener("click", () => this.runAction(action));
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

    async readFileAsBase64(file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const chunkSize = 32768;
        let binary = "";
        for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
        }
        return btoa(binary);
    }

    async collectActionOptions(action = {}) {
        const options = {};
        const packageFileInput = this.root.querySelector(`[data-admin-operation-package-file='${action.id}']`);
        const packageFile = packageFileInput?.files?.[0];
        if (packageFile) {
            options.packageFileName = packageFile.name;
            options.packageBytesBase64 = await this.readFileAsBase64(packageFile);
        }

        const backupFileInput = this.root.querySelector(`[data-admin-operation-backup-file='${action.id}']`);
        const backupFile = backupFileInput?.files?.[0];
        if (backupFile) {
            options.backupFileName = backupFile.name;
            options.backupBytesBase64 = await this.readFileAsBase64(backupFile);
        }

        const importMode = this.root.querySelector(`[data-admin-operation-import-mode='${action.id}']`);
        if (importMode) {
            options.importMode = importMode.value;
        }

        const confirmation = this.root.querySelector(`[data-admin-operation-confirmation='${action.id}']`);
        if (confirmation) {
            if (action.id === "restore-from-backup") {
                options.restoreConfirmed = confirmation.checked;
            } else {
                options.overwriteConfirmed = confirmation.checked;
            }
        }

        const phrase = this.root.querySelector(`[data-admin-operation-confirmation-phrase='${action.id}']`);
        if (phrase) {
            options.confirmationPhrase = phrase.value;
        }
        return options;
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

    async runAction(action = {}) {
        try {
            this.setStatus("SKIP", `Running ${action.label || action.id || "Admin Operation"} through the Local API.`);
            const options = await this.collectActionOptions(action);
            const result = runAdminOperationAction(action.id, options);
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
