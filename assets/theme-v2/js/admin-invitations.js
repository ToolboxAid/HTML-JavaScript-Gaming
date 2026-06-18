import {
    createAdminBetaInvitation,
    readAdminInvitations,
    revokeAdminBetaInvitation
} from "../../../src/api/admin-invitations-api-client.js";

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

class AdminInvitationsController {
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
            this.createInvitation();
        });
        this.rows.addEventListener("click", (event) => {
            const button = event.target.closest("[data-admin-invitation-revoke]");
            if (!button) {
                return;
            }
            this.revokeInvitation(button.dataset.adminInvitationRevoke || "");
        });
        this.load();
    }

    setStatus(status, message) {
        this.status.textContent = `${status}: ${message}`;
    }

    setSummary(payload = {}) {
        const plan = payload.plan || {};
        const invitations = Array.isArray(payload.invitations) ? payload.invitations : [];
        const pending = invitations.filter((invitation) => invitation.status === "pending").length;
        this.summary.textContent = `Beta is invitation-only and Studio-equivalent. ${pending} pending invitation(s). Membership assignment: ${plan.membershipAssignment || "deferred"}.`;
    }

    renderRows(invitations = []) {
        this.rows.replaceChildren();
        if (!invitations.length) {
            const row = document.createElement("tr");
            ["No invitations", "N/A", "N/A", "N/A", "BETA", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", ""].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            this.rows.append(row);
            return;
        }
        invitations.forEach((invitation) => {
            const row = document.createElement("tr");
            [
                invitation.email,
                invitation.recipientName,
                invitation.relationshipNote,
                invitation.inviteSource,
                invitation.planKey,
                invitation.status,
                invitation.expiresAt,
                invitation.invitedBy,
                invitation.acceptedBy,
                invitation.personalMessage,
                shortCode(invitation.invitationCode),
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = text(value);
                row.append(cell);
            });
            const actionCell = document.createElement("td");
            if (invitation.status === "pending") {
                const button = document.createElement("button");
                button.className = "btn btn--compact";
                button.dataset.adminInvitationRevoke = invitation.key || "";
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
            const payload = readAdminInvitations();
            this.renderRows(payload.invitations || []);
            this.setSummary(payload);
            this.setStatus(payload.status || "PASS", payload.message || "Loaded Beta invitations.");
        } catch (error) {
            this.renderRows([]);
            this.setSummary({});
            this.setStatus("FAIL", error instanceof Error ? error.message : "Admin Invitations are unavailable.");
        }
    }

    createInvitation() {
        try {
            const payload = createAdminBetaInvitation({
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
            this.setStatus(payload.status || "PASS", payload.message || "Created Beta invitation.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Beta invitation create failed.");
        }
    }

    revokeInvitation(invitationKey) {
        try {
            const payload = revokeAdminBetaInvitation(invitationKey);
            this.load();
            this.setStatus(payload.status || "PASS", payload.message || "Revoked Beta invitation.");
        } catch (error) {
            this.setStatus("FAIL", error instanceof Error ? error.message : "Beta invitation revoke failed.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-invitations]");
    if (!root) {
        return;
    }
    new AdminInvitationsController(root).init();
});
