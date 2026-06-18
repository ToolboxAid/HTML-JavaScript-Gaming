# Codex Commands

## PR
- `PR_26169_019-admin-health-operations`

## Source Documents
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/pr/PLAN_PR_26169_019-admin-health-operations.md`
- `docs_build/pr/BUILD_PR_26169_019-admin-health-operations.md`

## Validation Commands
```bash
git branch --show-current
```

```bash
node --check src/dev-runtime/server/local-api-router.mjs
node --check assets/theme-v2/js/admin-system-health.js
node --check tests/dev-runtime/AdminHealthOperations.test.mjs
node --check tests/playwright/tools/AdminHealthOperationsPage.spec.mjs
```

```bash
node -e "<static HTML restriction check for admin/system-health.html>"
```

```bash
node --test tests/dev-runtime/AdminHealthOperations.test.mjs
```

```bash
npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs
```

```bash
git diff --check -- <PR_26169_019 scoped file list>
```

## Artifact Commands
```bash
python - <<'PY'
# Generate docs_build/dev/reports/codex_changed_files.txt
# Generate docs_build/dev/reports/codex_review.diff
# Create tmp/PR_26169_019-admin-health-operations_delta.zip
# Verify ZIP size and repo-relative paths
PY
```
