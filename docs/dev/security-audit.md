# Security Audit

## JavaScript Injection Search

Searched for:

- `innerHTML`
- `outerHTML`
- `insertAdjacentHTML`
- `eval`
- `new Function`
- `document.write`
- dynamic script creation

## Findings

- `gamefoundry-partials.js` uses `innerHTML` to parse trusted repository-local partials.
- No user-content rendering path was changed in this PR.
- No new JavaScript execution path was added.

## Decision

The trusted local partial `innerHTML` usage remains because it loads static partial files from
`GameFoundryStudio/assets/partials`. It is documented in `docs/security/js-injection-policy.md` and must not be reused for
user content.

## Validation

No runtime behavior was intentionally changed. Long smoke tests were skipped.
