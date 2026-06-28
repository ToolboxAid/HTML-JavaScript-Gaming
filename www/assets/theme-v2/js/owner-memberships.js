import {
    readOwnerMembershipSettings,
    updateOwnerMembershipSettings,
} from "../../../../src/api/owner-memberships-api-client.js";

const PLAN_NUMBER_FIELDS = Object.freeze([
    Object.freeze({ field: "monthlyPriceCents", label: "Price cents", max: 1000000, min: 0 }),
    Object.freeze({ field: "revenueShareBps", label: "Revenue bps", max: 10000, min: 0 }),
    Object.freeze({ field: "purchasedCreditBonusBps", label: "Bonus bps", max: 10000, min: 0 }),
]);

const LIMIT_NUMBER_FIELDS = Object.freeze([
    Object.freeze({ field: "storageMb", label: "Storage MB", max: 1000000, min: 0 }),
    Object.freeze({ field: "monthlyAiCredits", label: "AI credits", max: 1000000, min: 0 }),
    Object.freeze({ field: "publishExperienceLimit", label: "Publish limit", max: 1000000, min: 0, nullable: true }),
    Object.freeze({ field: "maxTeamMembers", label: "Team limit", max: 1000000, min: 1 }),
]);

const PLAN_BOOLEAN_FIELDS = Object.freeze([
    Object.freeze({ field: "active", label: "Active" }),
    Object.freeze({ field: "isPublic", label: "Public" }),
    Object.freeze({ field: "requiresInvitation", label: "Invitation" }),
    Object.freeze({ field: "isFounding", label: "Founding" }),
]);

const LIMIT_BOOLEAN_FIELDS = Object.freeze([
    Object.freeze({ field: "collaborationEnabled", label: "Collab" }),
    Object.freeze({ field: "marketplaceBrowseEnabled", label: "Browse" }),
    Object.freeze({ field: "marketplaceBuyEnabled", label: "Buy" }),
    Object.freeze({ field: "marketplaceFreeDownloadEnabled", label: "Free" }),
    Object.freeze({ field: "marketplaceSellEnabled", label: "Sell" }),
]);

function text(value, fallback = "N/A") {
    return value === undefined || value === null || value === "" ? fallback : String(value);
}

function numberInput(entry, value, scope) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(entry.min);
    input.max = String(entry.max);
    input.step = "1";
    input.dataset.ownerMembershipField = entry.field;
    input.dataset.ownerMembershipScope = scope;
    input.setAttribute("aria-label", entry.label);
    if (entry.nullable === true && (value === null || value === undefined || value === "")) {
        input.value = "";
        input.placeholder = "Unlimited";
    } else {
        input.value = String(value);
    }
    return input;
}

function checkboxInput(entry, value, scope) {
    const label = document.createElement("label");
    label.className = "field-inline";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = value === true;
    input.dataset.ownerMembershipField = entry.field;
    input.dataset.ownerMembershipScope = scope;
    const span = document.createElement("span");
    span.textContent = entry.label;
    label.append(input, span);
    return label;
}

function tableCell(...children) {
    const cell = document.createElement("td");
    cell.append(...children);
    return cell;
}

function controlGroup(entries, source, scope, factory) {
    const group = document.createElement("div");
    group.className = "content-stack content-stack--compact";
    entries.forEach((entry) => {
        group.append(factory(entry, source[entry.field], scope));
    });
    return group;
}

function integerControlValue(input, label, options = {}) {
    const raw = input.value.trim();
    if (!raw && options.nullable === true) {
        return null;
    }
    const value = Number(raw);
    const min = Number.isInteger(options.min) ? options.min : 0;
    const max = Number.isInteger(options.max) ? options.max : Number.MAX_SAFE_INTEGER;
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`${label} must be an integer from ${min} to ${max}.`);
    }
    return value;
}

function readNumberFields(row, entries, scope) {
    return Object.fromEntries(entries.map((entry) => {
        const input = row.querySelector(`[data-owner-membership-scope='${scope}'][data-owner-membership-field='${entry.field}']`);
        return [entry.field, integerControlValue(input, entry.label, entry)];
    }));
}

function readBooleanFields(row, entries, scope) {
    return Object.fromEntries(entries.map((entry) => {
        const input = row.querySelector(`[data-owner-membership-scope='${scope}'][data-owner-membership-field='${entry.field}']`);
        return [entry.field, input.checked];
    }));
}

function rowPayload(row) {
    const planCode = row.dataset.ownerMembershipPlanCode || "";
    const plan = {
        ...readNumberFields(row, PLAN_NUMBER_FIELDS, "plan"),
        ...readBooleanFields(row, PLAN_BOOLEAN_FIELDS, "plan"),
    };
    const limits = {
        ...readNumberFields(row, LIMIT_NUMBER_FIELDS, "limits"),
        ...readBooleanFields(row, LIMIT_BOOLEAN_FIELDS, "limits"),
    };
    if (planCode === "FREE" && limits.publishExperienceLimit !== 1) {
        throw new Error("Free membership publish limit must remain 1.");
    }
    return {
        limits,
        plan,
        planCode,
    };
}

function pendingSummary(payload) {
    return [
        `Pending ${payload.planCode}`,
        `${payload.plan.monthlyPriceCents} cents`,
        `${payload.plan.revenueShareBps} revenue bps`,
        `${payload.limits.storageMb} MB`,
        `${payload.limits.maxTeamMembers} team members`,
    ].join(" · ");
}

class OwnerMembershipsController {
    constructor(root) {
        this.root = root;
        this.foundingSummary = root.querySelector("[data-owner-membership-founding-summary]");
        this.lockedPrices = root.querySelector("[data-owner-membership-locked-prices]");
        this.pending = root.querySelector("[data-owner-membership-pending]");
        this.rows = root.querySelector("[data-owner-membership-rows]");
        this.status = root.querySelector("[data-owner-membership-status]");
    }

    init() {
        if (!this.foundingSummary || !this.lockedPrices || !this.pending || !this.rows || !this.status) {
            return;
        }
        this.rows.addEventListener("input", (event) => this.updatePending(event));
        this.rows.addEventListener("change", (event) => this.updatePending(event));
        this.rows.addEventListener("click", (event) => {
            const button = event.target.closest("[data-owner-membership-save]");
            if (button) {
                this.saveRow(button.closest("[data-owner-membership-plan-code]"));
            }
        });
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    renderFounding(foundingProgram = {}) {
        this.foundingSummary.textContent = `Founding capacity: ${text(foundingProgram.assignedSequenceCount, "0")} of ${text(foundingProgram.capacityLimit, "100")} assigned. Active founding memberships: ${text(foundingProgram.activeCount, "0")}.`;
        this.lockedPrices.replaceChildren();
        const lockedActivePrices = Array.isArray(foundingProgram.lockedActivePrices) ? foundingProgram.lockedActivePrices : [];
        if (!lockedActivePrices.length) {
            const item = document.createElement("li");
            item.textContent = "No active founding locked prices.";
            this.lockedPrices.append(item);
            return;
        }
        lockedActivePrices.forEach((entry) => {
            const item = document.createElement("li");
            item.textContent = `${text(entry.planCode)} #${text(entry.sequenceNumber)}: ${text(entry.lockedMonthlyPriceCents)} cents`;
            this.lockedPrices.append(item);
        });
    }

    renderRows(plans = []) {
        this.rows.replaceChildren();
        plans.forEach((entry) => {
            this.rows.append(this.createPlanRow(entry));
        });
    }

    createPlanRow(entry) {
        const plan = entry.plan || {};
        const limits = entry.limits || {};
        const row = document.createElement("tr");
        row.dataset.ownerMembershipPlanCode = plan.code || "";

        const planLabel = document.createElement("div");
        planLabel.className = "content-stack content-stack--compact";
        const code = document.createElement("strong");
        code.textContent = text(plan.code);
        const name = document.createElement("span");
        name.textContent = text(plan.displayName);
        planLabel.append(code, name);

        const save = document.createElement("button");
        save.className = "btn btn--compact primary";
        save.dataset.ownerMembershipSave = plan.code || "";
        save.textContent = "Save";
        save.type = "button";

        row.append(
            tableCell(planLabel),
            tableCell(controlGroup(PLAN_NUMBER_FIELDS, plan, "plan", numberInput)),
            tableCell(controlGroup(PLAN_BOOLEAN_FIELDS, plan, "plan", checkboxInput)),
            tableCell(controlGroup(LIMIT_NUMBER_FIELDS, limits, "limits", numberInput)),
            tableCell(controlGroup(LIMIT_BOOLEAN_FIELDS, limits, "limits", checkboxInput)),
            tableCell(save),
        );
        return row;
    }

    load() {
        try {
            const payload = readOwnerMembershipSettings();
            this.renderRows(payload.plans || []);
            this.renderFounding(payload.foundingProgram || {});
            this.setStatus(payload.status || "PASS", payload.diagnostic || "Loaded Owner membership settings.");
            this.pending.textContent = "No pending edits.";
        } catch (error) {
            this.rows.replaceChildren();
            this.renderFounding({});
            this.setStatus("FAIL", error instanceof Error ? error.message : "Owner membership settings are unavailable.");
        }
    }

    updatePending(event) {
        const row = event.target.closest("[data-owner-membership-plan-code]");
        if (!row) {
            return;
        }
        try {
            this.pending.textContent = pendingSummary(rowPayload(row));
        } catch (error) {
            this.pending.textContent = error instanceof Error ? error.message : "Pending edit is invalid.";
        }
    }

    saveRow(row) {
        if (!row) {
            return;
        }
        try {
            const payload = updateOwnerMembershipSettings(rowPayload(row));
            this.renderRows(payload.plans || []);
            this.renderFounding(payload.foundingProgram || {});
            this.setStatus(payload.status || "PASS", payload.diagnostic || "Saved Owner membership settings.");
            this.pending.textContent = "No pending edits.";
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Owner membership settings could not be saved.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-owner-memberships]");
    if (!root) {
        return;
    }
    new OwnerMembershipsController(root).init();
});
