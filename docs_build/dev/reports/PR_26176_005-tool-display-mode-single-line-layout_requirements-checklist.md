# PR_26176_005 Requirements Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Continue only on `PR_26176_005-tool-display-mode-single-line-layout` | PASS | Branch confirmed before cleanup and validation. |
| Do not create `PR_26176_006` or `PR_26176_007` | PASS | No new branch was created during finalization. |
| Review modified and untracked files | PASS | Dirty set was reviewed; final dirty set is scoped to PR_26176_005 files. |
| Remove accidental/unneeded PR_26176_001-004 artifacts | PASS | Untracked PR_26176_001 through PR_26176_004 report files were removed. |
| Preserve PR_26176_005 reports/specs | PASS | PR_26176_005 report, checklist, validation lane, branch validation, manual notes, diff, changed-files list, and focused spec were updated. |
| Use shared Theme V2/tool display CSS/JS only unless required | PASS | Runtime changes are limited to shared Theme V2 CSS and `tool-display-mode.js`; no individual toolbox pages changed. |
| Badge, title, character/image content, and fullscreen/exit icon align in one horizontal row where practical | PASS | Playwright geometry asserts one visual row at the focused desktop width with no overlap or clipping. |
| Fullscreen/exit icon remains anchored far right | PASS | Shared CSS uses `margin-left: auto`; Playwright verifies right-edge anchoring in normal, fullscreen, and restored states. |
| Remove old Tool Display Mode chevron | PASS | JS no longer renders `.tool-display-mode__chevron`; obsolete CSS selectors were removed. |
| Remove `nav.tool-display-mode__navigation-row` from all toolbox pages | PASS | Shared component no longer creates the navigation row. |
| Remove rendered `Previous: {tool}` and `Next: {tool}` UI | PASS | Playwright and static assertions verify those labels are not rendered by Tool Display Mode. |
| Remove CSS/JS used solely for the navigation row | PASS | Shared navigation-row, navigation-link, navigation-icon CSS and JS construction were removed. |
| Normal mode displays both platform banner placements | PASS | Playwright verifies header and footer `data-platform-banner-placement` banners are visible in normal mode. |
| Fullscreen keeps header-placement platform banner visible | PASS | Playwright verifies the header-placement banner, `.platform-banner__inner`, and `Development Environment` remain visible in focus mode. |
| Fullscreen hides footer-placement platform banner | PASS | Shared focus CSS targets `[data-platform-banner-placement="footer"]`; Playwright verifies the footer-placement banner is `display: none` in focus mode. |
| Fullscreen hides main site navigation container | PASS | Shared focus CSS hides `.site-header > div.container.nav`; Playwright verifies it is `display: none` in focus mode. |
| Do not target `.platform-banner__inner` for fullscreen banner hiding | PASS | Shared status CSS no longer contains a focus-mode rule for `.platform-banner__inner`; the footer placement is targeted by data attribute instead. |
| Normal mode character image renders at final requested size with aspect ratio preserved | PASS | Playwright verifies the character image is 224px wide with natural aspect ratio. |
| Normal mode badge is larger | PASS | Playwright verifies the badge is 128x128. |
| Fullscreen hides character image | PASS | Playwright verifies `.tool-display-mode__character` is not displayed in focus mode. |
| Fullscreen badge remains larger than the original focus badge | PASS | Playwright verifies the focus badge is 64x64. |
| Fullscreen badge left, tool name centered/growing, exit icon far right | PASS | Playwright verifies badge left alignment, centered title styling, flex growth, and icon right anchoring. |
| Preserve fullscreen icon state restoration | PASS | Playwright verifies the icon switches to exit-fullscreen in focus mode and returns to fullscreen after exit. |
| Do not change Game Journey completion metrics SQLite/Postgres behavior | PASS | No storage/runtime metrics files were changed; warning is documented as Golf-owned external storage migration work. |
| No unrelated cleanup | PASS | Older accordion color/footer status icon changes were removed from this branch; only PR_26176_005 files remain. |
| Produce reports under `docs_build/dev/reports/` | PASS | Required PR_26176_005 reports were generated/updated. |
| Produce repo-structured ZIP under `tmp/` | PASS | `tmp/PR_26176_005-tool-display-mode-single-line-layout_delta.zip` generated after validation. |
