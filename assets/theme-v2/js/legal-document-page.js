import { readPublishedLegalDocument } from "../../../src/api/legal-api-client.js";

function target(root, selector) {
    return root.querySelector(selector);
}

function text(value, fallback = "") {
    const normalized = String(value || "").trim();
    return normalized || fallback;
}

function setStatus(root, status, message) {
    const statusTarget = target(root, "[data-legal-document-status]");
    if (statusTarget) {
        statusTarget.textContent = `${status}: ${message}`;
    }
}

function effectiveDate(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) {
        return "Effective date unavailable.";
    }
    return `Effective ${new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
        year: "numeric",
    }).format(date)}.`;
}

function unavailableMessage(title) {
    const label = text(title, "legal document");
    if (label === "Terms of Service") {
        return "Published Terms are unavailable.";
    }
    return `Published ${label} is unavailable.`;
}

function renderBody(root, bodyMarkdown) {
    const body = target(root, "[data-legal-document-body]");
    if (!body) {
        return;
    }
    body.replaceChildren();
    text(bodyMarkdown).split(/\n{2,}/).map((block) => block.trim()).filter(Boolean).forEach((block) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = block.replace(/^#+\s*/, "");
        body.append(paragraph);
    });
}

function renderUnavailable(root, payload) {
    const title = target(root, "[data-legal-document-title]");
    const effective = target(root, "[data-legal-document-effective]");
    const body = target(root, "[data-legal-document-body]");
    const titleText = text(payload.title, title?.textContent || "legal document");
    if (title) {
        title.textContent = titleText;
    }
    if (effective) {
        effective.textContent = unavailableMessage(titleText);
    }
    if (body) {
        body.replaceChildren();
    }
    setStatus(root, payload.status || "WARN", text(payload.diagnostic, "Published legal content is unavailable."));
}

function renderPublished(root, payload) {
    const title = target(root, "[data-legal-document-title]");
    const effective = target(root, "[data-legal-document-effective]");
    if (title) {
        title.textContent = text(payload.title, title.textContent);
    }
    if (effective) {
        effective.textContent = effectiveDate(payload.effectiveAt);
    }
    renderBody(root, payload.bodyMarkdown);
    setStatus(root, "PASS", text(payload.diagnostic, "Loaded published legal content."));
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-legal-document-page]");
    if (!root) {
        return;
    }
    try {
        const documentType = root.dataset.legalDocumentType || "";
        const payload = readPublishedLegalDocument(documentType);
        if (payload.available === true) {
            renderPublished(root, payload);
            return;
        }
        renderUnavailable(root, payload);
    } catch (error) {
        renderUnavailable(root, {
            diagnostic: error instanceof Error ? error.message : "Legal document is unavailable.",
            status: "FAIL",
            title: target(root, "[data-legal-document-title]")?.textContent || "Legal Document",
        });
    }
});
