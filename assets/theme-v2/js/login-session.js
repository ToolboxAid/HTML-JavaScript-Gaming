const continueLink = document.querySelector("[data-login-continue]");
const form = document.querySelector("[data-login-form]");
const statusField = document.querySelector("[data-login-status]");

function rootPrefix() {
  const rootSegments = new Set([
    "account",
    "admin",
    "company",
    "community",
    "docs",
    "games",
    "learn",
    "legal",
    "marketplace",
    "toolbox",
  ]);
  const parts = window.location.pathname.split("/").filter(Boolean);
  const rootIndex = parts.findIndex((part) => rootSegments.has(part));
  const pageParts = rootIndex >= 0 ? parts.slice(rootIndex) : [parts[parts.length - 1] || "index.html"];
  return pageParts.length > 1 ? "../".repeat(pageParts.length - 1) : "";
}

function repoPathHref(path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return normalizedPath ? rootPrefix() + normalizedPath : "#";
}

function currentReturnTo() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("returnTo") || "";
  if (!value || value.startsWith("/") || value.includes("://") || value.includes("..")) {
    return repoPathHref("toolbox/index.html");
  }
  return repoPathHref(value);
}

function setStatus(message) {
  if (statusField) {
    statusField.textContent = message;
  }
}

if (continueLink) {
  continueLink.href = currentReturnTo();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("Account features are being connected to the production authentication provider.");
});
