export const STATUS_VALUES = Object.freeze(["PASS", "WARN", "FAIL", "PENDING", "INFO", "SKIP"]);

export function statusText(value, fallback = "not available") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

export function normalizeStatusValue(value, fallback = "PENDING") {
    const normalized = String(value || "").trim().toUpperCase();
    return STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

export function formatStatusMessage(status, message, options = {}) {
    const normalized = normalizeStatusValue(status, options.fallbackStatus || "PENDING");
    const resolvedMessage = Object.hasOwn(options, "fallbackMessage")
        ? statusText(message, options.fallbackMessage)
        : String(message);
    return `${normalized}: ${resolvedMessage}`;
}

export function formatStatusReason(status, reason, options = {}) {
    const normalized = normalizeStatusValue(status, options.fallbackStatus || "PENDING");
    return `${normalized}: ${statusText(reason, options.fallbackReason || "Safe server diagnostics did not provide a reason.")}`;
}

export function applyStatusNode(node, status, options = {}) {
    if (!node) {
        return "";
    }
    const normalized = normalizeStatusValue(status, options.fallbackStatus || "PENDING");
    node.textContent = normalized;
    node.dataset.healthStatus = normalized;
    if (normalized === "PASS" && !options.reason) {
        node.removeAttribute("title");
        node.removeAttribute("aria-label");
        return normalized;
    }
    const reason = statusText(options.reason, options.titleFallback || "Safe server diagnostics returned this non-PASS status.");
    node.setAttribute("title", `${options.titlePrefix || "Reason: "}${reason}`);
    node.setAttribute("aria-label", formatStatusReason(normalized, options.reason, options));
    return normalized;
}
