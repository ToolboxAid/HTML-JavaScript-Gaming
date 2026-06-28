import {
    readMarketplaceCategories,
    readMarketplaceEntitlements,
} from "../../../../src/api/marketplace-api-client.js";

const ACTIONS = Object.freeze([
    { id: "browse", label: "Browse Marketplace" },
    { id: "buy", label: "Buy Assets" },
    { id: "freeDownload", label: "Download Free Assets" },
    { id: "sell", label: "Sell Assets" },
]);

function text(value, fallback = "N/A") {
    return value === undefined || value === null || value === "" ? fallback : String(value);
}

function setStatus(root, status, message) {
    const target = root.querySelector("[data-marketplace-status]");
    if (target) {
        target.textContent = `${status}: ${message}`;
    }
}

function setCategoryStatus(root, payload) {
    const target = root.querySelector("[data-marketplace-categories-status]");
    if (target) {
        target.textContent = `${payload.status || "PASS"}: ${payload.diagnostic || "Loaded marketplace categories."}`;
    }
}

function actionClass(allowed) {
    return allowed ? "btn primary" : "btn";
}

function renderAction(entry, permission) {
    const article = document.createElement("article");
    article.className = "card";
    article.dataset.marketplaceAction = entry.id;

    const body = document.createElement("div");
    body.className = "card-body content-stack";

    const kicker = document.createElement("div");
    kicker.className = "kicker";
    kicker.textContent = permission?.allowed ? "Allowed" : "Membership Required";

    const heading = document.createElement("h2");
    heading.textContent = entry.label;

    const action = document.createElement("button");
    action.className = actionClass(permission?.allowed);
    action.disabled = permission?.allowed !== true;
    action.type = "button";
    action.textContent = entry.label;

    const diagnostic = document.createElement("p");
    diagnostic.className = "status";
    diagnostic.textContent = text(permission?.diagnostic, "Marketplace entitlement unavailable.");

    body.append(kicker, heading, action, diagnostic);
    article.append(body);
    return article;
}

function renderMembership(root, payload) {
    const target = root.querySelector("[data-marketplace-membership]");
    if (!target) {
        return;
    }
    target.replaceChildren();
    const active = payload.activeMembership;
    const heading = document.createElement("h2");
    heading.textContent = active?.plan?.displayName ? `Active: ${active.plan.displayName}` : "Guest Marketplace Access";
    const diagnostic = document.createElement("p");
    diagnostic.className = "status";
    diagnostic.textContent = payload.authenticated
        ? "Marketplace rules are loaded from your active membership limits."
        : "Guests can browse. Sign in with a platform account for buying, downloads, and selling eligibility.";
    target.append(heading, diagnostic);
}

function renderActions(root, payload) {
    const target = root.querySelector("[data-marketplace-actions]");
    if (!target) {
        return;
    }
    target.replaceChildren();
    ACTIONS.forEach((entry) => {
        target.append(renderAction(entry, payload.permissions?.[entry.id]));
    });
}

function renderRevenue(root, payload) {
    const target = root.querySelector("[data-marketplace-revenue]");
    if (!target) {
        return;
    }
    target.replaceChildren();
    const model = payload.sellerRevenueModel || {};
    const heading = document.createElement("h2");
    heading.textContent = model.shareLabel || "Seller revenue unavailable";
    const status = document.createElement("p");
    status.className = "status";
    status.textContent = model.eligible
        ? "Seller revenue share is loaded from membership plan revenue settings."
        : "Creator or higher membership is required before seller revenue applies.";
    const preview = document.createElement("p");
    preview.className = "status";
    preview.textContent = text(model.previewDiagnostic, "Revenue previews require complete transaction inputs.");
    const list = document.createElement("ul");
    (model.deductionCategories || []).forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = text(entry.label);
        list.append(item);
    });
    target.append(heading, status, preview, list);
}

function renderCategory(category) {
    const article = document.createElement("article");
    article.className = "card";
    article.dataset.marketplaceCategory = category.code;

    const body = document.createElement("div");
    body.className = "card-body content-stack";

    const kicker = document.createElement("div");
    kicker.className = "kicker";
    kicker.textContent = "Category";

    const heading = document.createElement("h2");
    heading.textContent = text(category.displayName);

    const link = document.createElement("a");
    link.className = "btn";
    link.href = `./index.html?category=${encodeURIComponent(category.code)}#packs`;
    link.textContent = text(category.displayName);

    body.append(kicker, heading, link);
    article.append(body);
    return article;
}

function renderCategoryDiagnostics(payload) {
    const diagnostics = Array.isArray(payload.diagnostics) ? payload.diagnostics : [];
    if (!diagnostics.length) {
        return null;
    }
    const list = document.createElement("ul");
    list.className = "status";
    diagnostics.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = `${entry.status || "WARN"} ${entry.code || "category"}: ${entry.message || "Category diagnostic unavailable."}`;
        list.append(item);
    });
    return list;
}

function renderCategories(root, payload) {
    const target = root.querySelector("[data-marketplace-categories]");
    if (!target) {
        return;
    }
    if (!Array.isArray(payload?.categories)) {
        throw new Error("Marketplace category API did not return a category list.");
    }
    target.replaceChildren();
    payload.categories.forEach((category) => {
        target.append(renderCategory(category));
    });
    const diagnostics = renderCategoryDiagnostics(payload);
    if (diagnostics) {
        target.append(diagnostics);
    }
    setCategoryStatus(root, payload);
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-marketplace-page]");
    if (!root) {
        return;
    }
    try {
        const payload = readMarketplaceEntitlements();
        const categories = readMarketplaceCategories();
        renderMembership(root, payload);
        renderActions(root, payload);
        renderRevenue(root, payload);
        renderCategories(root, categories);
        setStatus(root, payload.status || "PASS", payload.diagnostic || "Loaded marketplace entitlements.");
    } catch (error) {
        setStatus(root, "FAIL", error instanceof Error ? error.message : "Marketplace entitlements are unavailable.");
    }
});
