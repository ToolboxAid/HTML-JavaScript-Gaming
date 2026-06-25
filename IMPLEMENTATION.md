# Legal Foundation Implementation Instructions

## PR

Use:

`PR_26175_OWNER_050-legal-foundation`

## Goal

Publish the initial Game Foundry Studio legal foundation.

## Required Pages

Create or update:

```text
/legal/index.html
/legal/terms-of-service.html
/legal/privacy-policy.html
/legal/cookie-policy.html
/legal/community-guidelines.html
/legal/copyright-policy.html
/legal/dmca-policy.html
/legal/legal-nav.js
```

## Source Drafts

Use the markdown files in `/legal/` from this package as the source content for the HTML pages.

## Single Source of Truth Legal Menu

The left-side legal menu on all legal pages must be rendered from one shared source of truth.

Do not duplicate legal side-menu links in each HTML file.

Suggested file:

```text
/legal/legal-nav.js
```

Suggested SSoT:

```js
const LEGAL_NAV_ITEMS = [
  { href: "/legal/index.html", label: "Legal Overview" },
  { href: "/legal/terms-of-service.html", label: "Terms of Service" },
  { href: "/legal/privacy-policy.html", label: "Privacy Policy" },
  { href: "/legal/cookie-policy.html", label: "Cookie Policy" },
  { href: "/legal/community-guidelines.html", label: "Community Guidelines" },
  { href: "/legal/copyright-policy.html", label: "Copyright Policy" },
  { href: "/legal/dmca-policy.html", label: "DMCA Policy" }
];
```

Each legal page should include only a mount point:

```html
<nav class="legal-side-nav" aria-label="Legal documents" data-legal-nav></nav>
```

Required JavaScript behavior:

- Render the legal navigation links from `LEGAL_NAV_ITEMS`.
- Detect the current page from `window.location.pathname`.
- Normalize `/legal/` to `/legal/index.html`.
- Apply an active/current class to the matching legal page.
- Set `aria-current="page"` on the active link.
- Preserve keyboard and tab accessibility.
- Do not require inline event handlers.

Suggested current-page logic:

```js
function normalizeLegalPath(pathname) {
  if (pathname.endsWith("/legal/")) return "/legal/index.html";
  if (pathname === "/legal") return "/legal/index.html";
  return pathname;
}
```

## Layout Requirements

- Use the existing Game Foundry Studio site shell/template where appropriate.
- Legal pages should use a two-column layout on desktop:
  - Left: shared legal side navigation
  - Right: legal document content
- On small screens, the legal navigation may stack above the content.
- Keep the legal pages readable and accessible.
- Do not introduce unrelated UI changes.

## Footer Links

Add footer links to:

- Terms
- Privacy
- Cookies
- Community Guidelines
- Copyright
- DMCA

Footer links may point to the corresponding `/legal/*.html` pages.

## Validation Requirements

Run the repository's relevant validation before opening the PR.

At minimum:

- HTML validation or existing static-page checks, if present
- JS syntax check for `/legal/legal-nav.js`
- Existing legal/nav/footer tests, if present
- Any repository-required governance validation

## Acceptance Criteria

- All six legal documents are published as HTML pages.
- `/legal/index.html` links to all legal documents.
- Footer includes legal links.
- Legal side navigation is generated from one SSoT.
- Current page is visually selected.
- Current page has `aria-current="page"`.
- No page has a hand-maintained duplicate left legal menu.
- No unrelated code, route, database, API, or storage changes.
