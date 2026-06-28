import {
    getAdminNavigationItems,
    getOwnerNavigationItems,
} from "../../../../src/api/admin-owner-navigation.js";

function currentPagePath() {
    return window.location.pathname.replace(/^\/+/, "") || "index.html";
}

function itemHref(item) {
    if (item.href) {
        return item.href;
    }
    return `/${item.path}`;
}

function disabledLabel(item) {
    return item.planned ? `${item.label} (planned)` : item.label;
}

function createDisabledItem(item) {
    const label = document.createElement("span");
    label.className = "btn btn--compact";
    label.dataset.menuItemDisabled = "";
    label.setAttribute("aria-disabled", "true");
    label.textContent = disabledLabel(item);
    return label;
}

function createLink(item, activePath) {
    if (item.disabled) {
        return createDisabledItem(item);
    }
    const link = document.createElement("a");
    const href = itemHref(item);
    const itemPath = String(item.path || href).replace(/^\/+/, "");
    const active = itemPath === activePath;
    link.className = active ? "btn btn--compact primary" : "btn btn--compact";
    link.href = href;
    link.textContent = item.label || itemPath;
    if (active) {
        link.setAttribute("aria-current", "page");
    }
    if (item.route) {
        link.dataset.route = item.route;
    }
    return link;
}

function renderNavigation(root, items) {
    const activePath = currentPagePath();
    root.replaceChildren();
    items.forEach((item) => {
        root.append(createLink(item, activePath));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-admin-tool-menu]").forEach((root) => {
        renderNavigation(root, getAdminNavigationItems());
    });
    document.querySelectorAll("[data-owner-tool-menu]").forEach((root) => {
        renderNavigation(root, getOwnerNavigationItems());
    });
});
