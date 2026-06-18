import {
    getAdminNavigationItems,
    getOwnerNavigationItems,
} from "../../../src/api/admin-owner-navigation.js";

function currentPagePath() {
    return window.location.pathname.replace(/^\/+/, "") || "index.html";
}

function itemHref(item) {
    if (item.href) {
        return item.href;
    }
    return `/${item.path}`;
}

function createLink(item, activePath) {
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
