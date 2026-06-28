import {
    readOwnerAiCreditSettings,
    updateOwnerAiCreditSettings,
} from "../../../../src/api/owner-ai-credits-api-client.js";

function text(value, fallback = "N/A") {
    return value === undefined || value === null || value === "" ? fallback : String(value);
}

function cell(...children) {
    const td = document.createElement("td");
    td.append(...children);
    return td;
}

function textInput(field, value, label) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = text(value, "");
    input.dataset.ownerAiField = field;
    input.setAttribute("aria-label", label);
    return input;
}

function numberInput(field, value, label, min = 0, max = 1000000) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    input.dataset.ownerAiField = field;
    input.setAttribute("aria-label", label);
    return input;
}

function checkboxInput(field, value, labelText) {
    const label = document.createElement("label");
    label.className = "field-inline";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = value === true;
    input.dataset.ownerAiField = field;
    const span = document.createElement("span");
    span.textContent = labelText;
    label.append(input, span);
    return label;
}

function saveButton(label) {
    const button = document.createElement("button");
    button.className = "btn btn--compact primary";
    button.dataset.ownerAiSave = "";
    button.textContent = label;
    button.type = "button";
    return button;
}

function integerValue(input, label, min = 0, max = 1000000) {
    const value = Number(input.value.trim());
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`${label} must be an integer from ${min} to ${max}.`);
    }
    return value;
}

function inputValue(row, field) {
    return row.querySelector(`[data-owner-ai-field='${field}']`);
}

function codeValue(row, label) {
    const code = inputValue(row, "code").value.trim().toUpperCase();
    if (!code) {
        throw new Error(`${label} code is required.`);
    }
    return code;
}

function displayNameValue(row, label) {
    const value = inputValue(row, "displayName").value.trim();
    if (!value) {
        throw new Error(`${label} display name is required.`);
    }
    return value;
}

function duplicateCode(root, row, kind, code) {
    return Array.from(root.querySelectorAll(`[data-owner-ai-kind='${kind}']`))
        .some((candidate) => candidate !== row && codeValue(candidate, kind) === code);
}

function rowPayload(root, row) {
    const kind = row.dataset.ownerAiKind || "";
    if (kind === "pack") {
        const code = codeValue(row, "Pack");
        if (duplicateCode(root, row, kind, code)) {
            throw new Error(`Duplicate AI credit pack code ${code} is not allowed.`);
        }
        return {
            kind,
            pack: {
                active: inputValue(row, "active").checked,
                code,
                credits: integerValue(inputValue(row, "credits"), "Pack credits"),
                displayName: displayNameValue(row, "Pack"),
                key: row.dataset.ownerAiRecordKey || "",
                priceCents: integerValue(inputValue(row, "priceCents"), "Pack price cents"),
            },
        };
    }
    if (kind === "action") {
        const code = codeValue(row, "AI action");
        if (duplicateCode(root, row, kind, code)) {
            throw new Error(`Duplicate AI action code ${code} is not allowed.`);
        }
        return {
            action: {
                active: inputValue(row, "active").checked,
                code,
                creditCost: integerValue(inputValue(row, "creditCost"), "AI action cost"),
                displayName: displayNameValue(row, "AI action"),
                key: row.dataset.ownerAiRecordKey || "",
            },
            kind,
        };
    }
    if (kind === "monthlyGrant") {
        return {
            kind,
            monthlyAiCredits: integerValue(inputValue(row, "monthlyAiCredits"), "Monthly AI credits"),
            planCode: row.dataset.ownerAiPlanCode || "",
        };
    }
    if (kind === "bonus") {
        return {
            kind,
            planCode: row.dataset.ownerAiPlanCode || "",
            purchasedCreditBonusBps: integerValue(inputValue(row, "purchasedCreditBonusBps"), "Purchased credit bonus basis points", 0, 10000),
        };
    }
    throw new Error("Owner AI credit row kind is unsupported.");
}

function summaryFor(payload) {
    if (payload.kind === "pack") {
        return `Pending pack ${payload.pack.code}: ${payload.pack.credits} credits for ${payload.pack.priceCents} cents.`;
    }
    if (payload.kind === "action") {
        return `Pending action ${payload.action.code}: ${payload.action.creditCost} credits.`;
    }
    if (payload.kind === "monthlyGrant") {
        return `Pending ${payload.planCode} monthly grant: ${payload.monthlyAiCredits} credits.`;
    }
    return `Pending ${payload.planCode} bonus: ${payload.purchasedCreditBonusBps} bps.`;
}

class OwnerAiCreditsController {
    constructor(root) {
        this.root = root;
        this.actionRows = root.querySelector("[data-owner-ai-action-rows]");
        this.bonusRows = root.querySelector("[data-owner-ai-bonus-rows]");
        this.grantRows = root.querySelector("[data-owner-ai-grant-rows]");
        this.packRows = root.querySelector("[data-owner-ai-pack-rows]");
        this.pending = root.querySelector("[data-owner-ai-pending]");
        this.status = root.querySelector("[data-owner-ai-status]");
    }

    init() {
        if (!this.actionRows || !this.bonusRows || !this.grantRows || !this.packRows || !this.pending || !this.status) {
            return;
        }
        this.root.addEventListener("input", (event) => this.updatePending(event));
        this.root.addEventListener("change", (event) => this.updatePending(event));
        this.root.addEventListener("click", (event) => {
            const button = event.target.closest("[data-owner-ai-save]");
            if (button) {
                this.saveRow(button.closest("[data-owner-ai-kind]"));
            }
        });
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    render(payload) {
        this.renderPacks(payload.packs || []);
        this.renderActions(payload.actions || []);
        this.renderGrants(payload.monthlyGrants || []);
        this.renderBonuses(payload.bonusPlans || []);
    }

    renderPacks(packs) {
        this.packRows.replaceChildren();
        packs.forEach((pack) => {
            const row = document.createElement("tr");
            row.dataset.ownerAiKind = "pack";
            row.dataset.ownerAiRecordKey = pack.key || "";
            row.append(
                cell(textInput("code", pack.code, "Pack code")),
                cell(textInput("displayName", pack.displayName, "Pack display name")),
                cell(numberInput("credits", pack.credits, "Pack credits")),
                cell(numberInput("priceCents", pack.priceCents, "Pack price cents")),
                cell(checkboxInput("active", pack.active, "Active")),
                cell(saveButton("Save Pack")),
            );
            this.packRows.append(row);
        });
    }

    renderActions(actions) {
        this.actionRows.replaceChildren();
        actions.forEach((action) => {
            const row = document.createElement("tr");
            row.dataset.ownerAiKind = "action";
            row.dataset.ownerAiRecordKey = action.key || "";
            row.append(
                cell(textInput("code", action.code, "AI action code")),
                cell(textInput("displayName", action.displayName, "AI action display name")),
                cell(numberInput("creditCost", action.creditCost, "AI action cost")),
                cell(checkboxInput("active", action.active, "Active")),
                cell(saveButton("Save Action")),
            );
            this.actionRows.append(row);
        });
    }

    renderGrants(grants) {
        this.grantRows.replaceChildren();
        grants.forEach((grant) => {
            const row = document.createElement("tr");
            row.dataset.ownerAiKind = "monthlyGrant";
            row.dataset.ownerAiPlanCode = grant.planCode || "";
            row.append(
                cell(text(grant.planCode)),
                cell(text(grant.displayName)),
                cell(numberInput("monthlyAiCredits", grant.monthlyAiCredits, "Monthly AI credits")),
                cell(saveButton("Save Grant")),
            );
            this.grantRows.append(row);
        });
    }

    renderBonuses(bonuses) {
        this.bonusRows.replaceChildren();
        bonuses.forEach((bonus) => {
            const row = document.createElement("tr");
            row.dataset.ownerAiKind = "bonus";
            row.dataset.ownerAiPlanCode = bonus.planCode || "";
            row.append(
                cell(text(bonus.planCode)),
                cell(text(bonus.displayName)),
                cell(numberInput("purchasedCreditBonusBps", bonus.purchasedCreditBonusBps, "Purchased credit bonus basis points", 0, 10000)),
                cell(saveButton("Save Bonus")),
            );
            this.bonusRows.append(row);
        });
    }

    load() {
        try {
            const payload = readOwnerAiCreditSettings();
            this.render(payload);
            this.setStatus(payload.status || "PASS", payload.diagnostic || "Loaded Owner AI credit settings.");
            this.pending.textContent = "No pending edits.";
        } catch (error) {
            this.render({
                actions: [],
                bonusPlans: [],
                monthlyGrants: [],
                packs: [],
            });
            this.setStatus("FAIL", error instanceof Error ? error.message : "Owner AI credit settings are unavailable.");
        }
    }

    updatePending(event) {
        const row = event.target.closest("[data-owner-ai-kind]");
        if (!row) {
            return;
        }
        try {
            this.pending.textContent = summaryFor(rowPayload(this.root, row));
        } catch (error) {
            this.pending.textContent = error instanceof Error ? error.message : "Pending edit is invalid.";
        }
    }

    saveRow(row) {
        if (!row) {
            return;
        }
        try {
            const payload = updateOwnerAiCreditSettings(rowPayload(this.root, row));
            this.render(payload);
            this.setStatus(payload.status || "PASS", payload.diagnostic || "Saved Owner AI credit settings.");
            this.pending.textContent = "No pending edits.";
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Owner AI credit settings could not be saved.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-owner-ai-credits]");
    if (!root) {
        return;
    }
    new OwnerAiCreditsController(root).init();
});
