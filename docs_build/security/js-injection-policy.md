# JavaScript Injection Policy

User data is hostile.

GameFoundryStudio must not execute user-provided JavaScript in the main application. Game manifests, tool state payloads,
marketplace metadata, account fields, and imported files must be treated as untrusted input.

## Rules

- No user JavaScript in the main app.
- No manifest-provided JavaScript.
- No user HTML rendering.
- User input renders with `textContent` or an approved sanitizer only.
- Future scripting or mod/plugin execution must use Worker isolation or sandboxed iframe isolation.
- Do not use `eval`, `new Function`, or `document.write`.
- Do not create dynamic script elements from user-controlled input.

## Local Partials

`gamefoundry-partials.js` currently uses `innerHTML` to parse trusted, repository-local partial HTML loaded from
`assets/theme/v2/partials`. This path is allowed only for trusted local partials and must not be reused for
user content, manifest content, marketplace content, account content, or imported project data.
