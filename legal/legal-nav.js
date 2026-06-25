const LEGAL_NAV_ITEMS = [
  { href: "/legal/index.html", label: "Legal Overview" },
  { href: "/legal/terms-of-service.html", label: "Terms of Service" },
  { href: "/legal/privacy-policy.html", label: "Privacy Policy" },
  { href: "/legal/cookie-policy.html", label: "Cookie Policy" },
  { href: "/legal/community-guidelines.html", label: "Community Guidelines" },
  { href: "/legal/copyright-policy.html", label: "Copyright Policy" },
  { href: "/legal/dmca-policy.html", label: "DMCA Policy" }
];

function normalizeLegalPath(pathname) {
  if (pathname === "/legal" || pathname === "/legal/") return "/legal/index.html";
  if (pathname.endsWith("/terms.html")) return "/legal/terms-of-service.html";
  if (pathname.endsWith("/cookies-policy.html")) return "/legal/cookie-policy.html";
  return pathname;
}

function renderLegalNav() {
  const mounts = document.querySelectorAll("[data-legal-nav]");
  if (!mounts.length) return;
  const currentPath = normalizeLegalPath(window.location.pathname);
  for (const mount of mounts) {
    mount.textContent = "";
    for (const item of LEGAL_NAV_ITEMS) {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      if (item.href === currentPath) {
        link.classList.add("active", "is-current");
        link.setAttribute("aria-current", "page");
      }
      mount.appendChild(link);
    }
  }
}

document.addEventListener("DOMContentLoaded", renderLegalNav);
