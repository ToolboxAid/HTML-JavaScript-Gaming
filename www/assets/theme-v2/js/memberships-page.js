import { readMembershipCatalog } from "../../../../src/api/memberships-api-client.js";

function text(value, fallback = "N/A") {
    return value === undefined || value === null || value === "" ? fallback : String(value);
}

function money(cents, availability = {}) {
    if (availability.showLockedPrice === false) {
        return "Locked for active founding members";
    }
    const amount = Number(cents);
    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }
    return `$${(amount / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}/month`;
}

function percentFromBps(value) {
    const bps = Number(value || 0);
    return `${Math.round(bps / 100)}%`;
}

function storageText(value) {
    const mb = Number(value);
    if (!Number.isFinite(mb)) {
        return "Storage unavailable";
    }
    if (mb >= 1024) {
        return `${Number.isInteger(mb / 1024) ? mb / 1024 : (mb / 1024).toFixed(1)} GB storage`;
    }
    return `${mb} MB storage`;
}

function publishText(value) {
    return value === null || value === undefined || value === "" ? "Publishing limit not capped" : `Publish ${value} experience${Number(value) === 1 ? "" : "s"}`;
}

function teamText(value, collaborationEnabled) {
    if (!collaborationEnabled) {
        return "No collaboration";
    }
    return `Up to ${value} team members`;
}

function sellText(enabled) {
    return enabled ? "Sell marketplace assets" : "Cannot sell marketplace assets";
}

function bonusText(value) {
    const bps = Number(value || 0);
    return bps > 0 ? `${percentFromBps(bps)} bonus purchased AI credits` : "No purchased AI credit bonus";
}

function analyticsText(value) {
    const tier = String(value || "none");
    if (tier === "advanced") {
        return "Advanced analytics";
    }
    if (tier === "creator") {
        return "Creator analytics";
    }
    return "No analytics tier";
}

function capabilityItems(entry) {
    const plan = entry.plan || {};
    const limits = entry.limits || {};
    return [
        storageText(limits.storageMb),
        `${text(limits.monthlyAiCredits, "0")} AI credits/month`,
        publishText(limits.publishExperienceLimit),
        teamText(limits.maxTeamMembers, limits.collaborationEnabled === true),
        "Browse, buy, and download marketplace assets",
        sellText(limits.marketplaceSellEnabled === true),
        analyticsText(limits.analyticsTier),
        `${percentFromBps(plan.revenueShareBps)} Net Revenue`,
        bonusText(plan.purchasedCreditBonusBps),
    ];
}

function createPlanCard(entry) {
    const plan = entry.plan || {};
    const availability = entry.availability || {};
    const article = document.createElement("article");
    article.className = "card";
    article.dataset.membershipPlanCode = plan.code || "";

    const body = document.createElement("div");
    body.className = "card-body content-stack";

    const kicker = document.createElement("div");
    kicker.className = "kicker";
    kicker.textContent = text(plan.code);
    const title = document.createElement("h2");
    title.textContent = text(plan.displayName, "Membership");
    const price = document.createElement("p");
    price.className = "lede";
    price.textContent = money(plan.monthlyPriceCents, availability);

    const list = document.createElement("ul");
    capabilityItems(entry).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.append(li);
    });

    const action = document.createElement("button");
    action.className = entry.isActivePlan ? "btn primary" : "btn";
    action.disabled = availability.disabled !== false;
    action.type = "button";
    action.textContent = availability.actionLabel || "Unavailable";

    const reason = document.createElement("p");
    reason.className = "status";
    reason.textContent = availability.actionReason || "Membership action unavailable.";

    body.append(kicker, title, price, list, action, reason);
    article.append(body);
    return article;
}

function renderActive(root, payload) {
    const activeTarget = root.querySelector("[data-memberships-active]");
    if (!activeTarget) {
        return;
    }
    activeTarget.replaceChildren();
    const active = payload.active;
    if (!active) {
        const message = document.createElement("p");
        message.className = "status";
        message.textContent = "Sign in to see your active membership.";
        activeTarget.append(message);
        return;
    }
    const plan = active.plan || {};
    const limits = active.limits || {};
    const heading = document.createElement("h2");
    heading.textContent = `Active: ${text(plan.displayName)}`;
    const details = document.createElement("p");
    details.textContent = `${money(plan.monthlyPriceCents, { showLockedPrice: true })}. ${storageText(limits.storageMb)}. ${text(limits.monthlyAiCredits, "0")} AI credits/month.`;
    const source = document.createElement("p");
    source.className = "status";
    source.textContent = `Source: ${text(active.membership?.source)}. Status: ${text(active.membership?.status)}.`;
    activeTarget.append(heading, details, source);
}

function renderPlans(root, payload) {
    const plansTarget = root.querySelector("[data-memberships-plans]");
    if (!plansTarget) {
        return;
    }
    plansTarget.replaceChildren();
    (payload.plans || []).forEach((entry) => {
        plansTarget.append(createPlanCard(entry));
    });
}

function setStatus(root, status, message) {
    const target = root.querySelector("[data-memberships-status]");
    if (target) {
        target.textContent = `${status}: ${message}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-memberships-page]");
    if (!root) {
        return;
    }
    try {
        const payload = readMembershipCatalog();
        renderActive(root, payload);
        renderPlans(root, payload);
        setStatus(root, payload.status || "PASS", payload.diagnostic || "Loaded memberships.");
    } catch (error) {
        setStatus(root, "FAIL", error instanceof Error ? error.message : "Memberships are unavailable.");
    }
});
