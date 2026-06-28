import {
    createAdminBetaInvite,
    readAdminInvites,
    revokeAdminBetaInvite
} from "../../../../src/api/admin-invitations-api-client.js";
import { formatStatusMessage } from "../../js/shared/status.js";

function text(value) {
    if (value === undefined || value === null || value === "") {
        return "N/A";
    }
    return String(value);
}

function shortCode(value) {
    const code = String(value || "");
    if (code.length <= 18) {
        return code || "N/A";
    }
    return `${code.slice(0, 10)}...${code.slice(-6)}`;
}

class AdminInvitesController {
    constructor(root) {
        this.root = root;
        this.emailInput = root.querySelector("[data-admin-invitation-email]");
        this.expiresAtInput = root.querySelector("[data-admin-invitation-expires-at]");
        this.form = root.querySelector("[data-admin-invitation-form]");
        this.inviteSourceInput = root.querySelector("[data-admin-invitation-source]");
        this.messageInput = root.querySelector("[data-admin-invitation-message]");
        this.recipientNameInput = root.querySelector("[data-admin-invitation-recipient-name]");
        this.relationshipNoteInput = root.querySelector("[data-admin-invitation-relationship-note]");
        this.rows = root.querySelector("[data-admin-invitation-rows]");
        this.status = root.querySelector("[data-admin-invitation-status]");
        this.summary = root.querySelector("[data-admin-invitation-summary]");
    }

    init() {
        if (!this.emailInput || !this.expiresAtInput || !this.form || !this.inviteSourceInput || !this.messageInput || !this.recipientNameInput || !this.relationshipNoteInput || !this.rows || !this.status || !this.summary) {
            return;
        }
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.createInvite();
        });
        this.rows.addEventListener("click", (event) => {
            const button = event.target.closest("[data-admin-invitation-revoke]");
            if (!button) {
                return;
            }
            this.revokeInvite(button.dataset.adminInvitationRevoke || "");
        });
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = formatStatusMessage(status, message);
    }

    setSummary(payload = {}) {
        const plan = payload.plan || {};
        const invites = Array.isArray(payload.invitations) ? payload.invitations : [];
        const pending = invites.filter((invite) => invite.status === "pending").length;
        this.summary.textContent = `Beta is invite-only and Studio-equivalent. ${pending} pending invite(s). Membership assignment: ${plan.membershipAssignment || "deferred"}.`;
    }

    renderRows(invites = []) {
        this.rows.replaceChildren();
        if (!invites.length) {
            const row = document.createElement("tr");
            ["No invites", "N/A", "N/A", "N/A", "BETA", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", ""].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            this.rows.append(row);
            return;
        }
        invites.forEach((invite) => {
            const row = document.createElement("tr");
            [
                invite.email,
                invite.recipientName,
                invite.relationshipNote,
                invite.inviteSource,
                invite.planKey,
                invite.status,
                invite.expiresAt,
                invite.invitedBy,
                invite.acceptedBy,
                invite.personalMessage,
                shortCode(invite.invitationCode),
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = text(value);
                row.append(cell);
            });
            const actionCell = document.createElement("td");
            if (invite.status === "pending") {
                const button = document.createElement("button");
                button.className = "btn btn--compact";
                button.dataset.adminInvitationRevoke = invite.key || "";
                button.textContent = "Revoke";
                button.type = "button";
                actionCell.append(button);
            } else {
                actionCell.textContent = "N/A";
            }
            row.append(actionCell);
            this.rows.append(row);
        });
    }

    load() {
        try {
            const payload = readAdminInvites();
            this.renderRows(payload.invitations || []);
            this.setSummary(payload);
            this.setStatus(payload.status || "PASS", payload.message || "Loaded Beta invites.");
        } catch (error) {
            this.renderRows([]);
            this.setSummary({});
            this.setStatus("FAIL", error instanceof Error ? error.message : "Admin Invites are unavailable.");
        }
    }

    createInvite() {
        try {
            const payload = createAdminBetaInvite({
                email: this.emailInput.value,
                expiresAt: this.expiresAtInput.value,
                inviteSource: this.inviteSourceInput.value,
                personalMessage: this.messageInput.value,
                recipientName: this.recipientNameInput.value,
                relationshipNote: this.relationshipNoteInput.value,
            });
            this.emailInput.value = "";
            this.expiresAtInput.value = "";
            this.inviteSourceInput.value = "";
            this.messageInput.value = "";
            this.recipientNameInput.value = "";
            this.relationshipNoteInput.value = "";
            this.load();
            this.setStatus(payload.status || "PASS", payload.message || "Created Beta invite.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Beta invite create failed.");
        }
    }

    revokeInvite(inviteKey) {
        try {
            const payload = revokeAdminBetaInvite(inviteKey);
            this.load();
            this.setStatus(payload.status || "PASS", payload.message || "Revoked Beta invite.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Beta invite revoke failed.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-invitations]");
    if (!root) {
        return;
    }
    new AdminInvitesController(root).init();
});
