import { readAiCreditDisplay } from "../../../../src/api/ai-credits-api-client.js";

function text(value, fallback = "N/A") {
    return value === undefined || value === null || value === "" ? fallback : String(value);
}

function creditsText(value) {
    const credits = Number(value);
    if (!Number.isFinite(credits)) {
        return "Credits unavailable";
    }
    return `${credits.toLocaleString("en-US")} credit${credits === 1 ? "" : "s"}`;
}

function money(cents, currency = "USD") {
    const amount = Number(cents);
    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }
    return new Intl.NumberFormat("en-US", {
        currency: currency || "USD",
        maximumFractionDigits: 0,
        style: "currency",
    }).format(amount / 100);
}

function dateText(value) {
    if (!value) {
        return "Not available";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function percentFromBps(value) {
    const bps = Number(value || 0);
    return `${Math.round(bps / 100)}%`;
}

function sourceLabel(row) {
    const source = text(row?.sourceType, "source").replaceAll("_", " ");
    const action = row?.actionName ? `${row.actionName} ` : "";
    return `${action}${source}`;
}

function setStatus(root, status, message) {
    const target = root.querySelector("[data-ai-credits-status]");
    if (target) {
        target.textContent = `${status}: ${message}`;
    }
}

function target(root, selector) {
    return root.querySelector(selector);
}

function renderRows(rows) {
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((value) => {
            const td = document.createElement("td");
            td.textContent = text(value);
            tr.append(td);
        });
        tbody.append(tr);
    });
    return tbody;
}

function renderTable(headers, rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = header;
        tr.append(th);
    });
    thead.append(tr);
    table.append(thead, renderRows(rows));
    wrapper.append(table);
    return wrapper;
}

function renderBalance(root, payload) {
    const summary = target(root, "[data-ai-credits-summary]");
    const breakdown = target(root, "[data-ai-credits-breakdown]");
    if (!summary || !breakdown) {
        return;
    }
    summary.replaceChildren();
    breakdown.replaceChildren();

    const account = payload.account;
    const heading = document.createElement("h2");
    heading.textContent = account ? creditsText(account.totalBalance) : "Balance unavailable";
    const diagnostic = document.createElement("p");
    diagnostic.className = "status";
    diagnostic.textContent = payload.accountDiagnostic || "AI credit balance status unavailable.";
    summary.append(heading, diagnostic);

    if (!account) {
        breakdown.append(renderTable(["Balance", "Credits"], [
            ["Included", "Unavailable"],
            ["Purchased", "Unavailable"],
            ["Bonus", "Unavailable"],
        ]));
        return;
    }

    breakdown.append(renderTable(["Balance", "Credits"], [
        ["Included", creditsText(account.includedBalance)],
        ["Purchased", creditsText(account.purchasedBalance)],
        ["Bonus", creditsText(account.bonusBalance)],
    ]));
}

function renderMembership(root, payload) {
    const membership = target(root, "[data-ai-credits-membership]");
    if (!membership) {
        return;
    }
    membership.replaceChildren();
    const active = payload.activeMembership || {};
    const plan = active.plan || {};
    const monthlyGrant = payload.monthlyGrant || {};
    const heading = document.createElement("h2");
    heading.textContent = `${text(plan.displayName, "Membership")} AI grant`;
    const grant = document.createElement("p");
    grant.className = "lede";
    grant.textContent = `${creditsText(monthlyGrant.credits)} per month`;
    const period = document.createElement("p");
    period.className = "status";
    period.textContent = `Current period: ${dateText(monthlyGrant.periodStart)} to ${dateText(monthlyGrant.periodEnd)}.`;
    membership.append(heading, grant, period);
}

function renderPacks(root, payload) {
    const packs = target(root, "[data-ai-credits-packs]");
    if (!packs) {
        return;
    }
    packs.replaceChildren();
    (payload.packs || []).forEach((pack) => {
        const article = document.createElement("article");
        article.className = "card";
        const body = document.createElement("div");
        body.className = "card-body content-stack";
        const kicker = document.createElement("div");
        kicker.className = "kicker";
        kicker.textContent = text(pack.code);
        const heading = document.createElement("h2");
        heading.textContent = text(pack.displayName, "AI Credit Pack");
        const price = document.createElement("p");
        price.className = "lede";
        price.textContent = `${creditsText(pack.credits)} for ${money(pack.priceCents, pack.currency)}`;
        body.append(kicker, heading, price);
        if (Number(pack.bonusCredits || 0) > 0) {
            const bonus = document.createElement("p");
            bonus.className = "status";
            bonus.textContent = `${percentFromBps(payload.planBonusBps)} Studio bonus: +${creditsText(pack.bonusCredits)}.`;
            body.append(bonus);
        }
        article.append(body);
        packs.append(article);
    });
}

function renderUsage(root, payload) {
    const usage = target(root, "[data-ai-credits-usage]");
    if (!usage) {
        return;
    }
    usage.replaceChildren();
    const rows = payload.usage || [];
    if (!rows.length) {
        const empty = document.createElement("p");
        empty.className = "status";
        empty.textContent = "No AI credit usage has been recorded for this account yet.";
        usage.append(empty);
        return;
    }
    usage.append(renderTable(["Action / Source", "Delta", "Balance After", "Date"], rows.map((row) => [
        sourceLabel(row),
        creditsText(row.creditDelta),
        creditsText(row.balanceAfter),
        dateText(row.createdAt),
    ])));
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-ai-credits-page]");
    if (!root) {
        return;
    }
    try {
        const payload = readAiCreditDisplay();
        renderBalance(root, payload);
        renderMembership(root, payload);
        renderPacks(root, payload);
        renderUsage(root, payload);
        setStatus(root, payload.status || "PASS", payload.diagnostic || payload.accountDiagnostic || "Loaded AI credits.");
    } catch (error) {
        setStatus(root, "FAIL", error instanceof Error ? error.message : "AI credits are unavailable.");
    }
});

