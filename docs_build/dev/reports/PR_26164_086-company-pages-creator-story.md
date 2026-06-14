# PR_26164_086-company-pages-creator-story

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `* main`
- Result: PASS

## Scope

- Updated company page content and company footer navigation only.
- Added `company/how-we-build.html`.
- Updated `assets/theme-v2/partials/footer.html` only to add the new Company navigation link.
- Required report artifacts updated:
  - `docs_build/dev/reports/codex_review.diff`
  - `docs_build/dev/reports/codex_changed_files.txt`
- Unrelated existing untracked file left untouched:
  - `assets/theme-v2/images/game-foundry-tools-poster=2.png`

## Requirement Checklist

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution: PASS
- Verified current branch is `main` before making changes: PASS
- Scope limited to company pages and required reports, with footer Company navigation support: PASS
- Reframed company pages around creator-focused messaging: PASS
- Kept technical messaging as secondary/supporting content: PASS
- About page retains current improvements and adds `What Can You Build?`: PASS
- About page adds `One Creator Ecosystem` and closes with `Build &middot; Play &middot; Share`: PASS
- Mission page rewritten as timeless WHY page with no mascot usage: PASS
- Added `company/how-we-build.html` as HOW page with ForgeBot, Pixel Smith, Spark and Foundry Bot guidance: PASS
- Vision page rewritten around the future destination with light mascot usage: PASS
- Roadmap page rewritten around creator outcomes: PASS
- Release Notes page keeps platform status and adds `Latest Updates` with Build, Play, Share and Platform categories: PASS
- Contact page removes planning-language framing and direct-email strategy, replacing it with ticket-driven support categories: PASS
- Added How We Build to Company navigation: PASS
- Playwright impacted: No. Content/navigation only: PASS
- Required repo-structured ZIP produced: PASS

## Manual Validation Notes

- Reviewed all existing files under `company/`.
- Reviewed `assets/theme-v2/partials/footer.html` because the BUILD requested adding the new page to Company navigation.
- Did not modify `assets/theme-v2/js/gamefoundry-partials.js`; the new footer link is root-relative and resolved by static link validation.
- Did not add CSS, page-local styles, inline scripts or inline event handlers.
- The public Company Roadmap page was rewritten per this BUILD request. The repo roadmap governance file was not touched.
- No direct email addresses were introduced.

## Validation

- `git diff --check`: PASS
  - Note: Git reported LF-to-CRLF working-copy warnings for touched HTML/report files; the command exited successfully.
- Inline HTML restriction check: PASS
  - No `<style>` blocks.
  - No inline `<script>` blocks.
  - No inline event handlers.
  - No inline `style` attributes.
- Company page render-shell check: PASS
  - `company/about.html`
  - `company/mission.html`
  - `company/how-we-build.html`
  - `company/vision.html`
  - `company/roadmap.html`
  - `company/release-notes.html`
  - `company/contact.html`
- Company navigation link resolution: PASS
  - About
  - Contact
  - How We Build
  - Mission
  - Release Notes
  - Roadmap
  - Vision
- Retired language search: PASS
  - No `manifest`.
  - No `Manifest`.
  - No `engine`.
  - No `Engine`.
  - No `config-driven`.
  - No `no-code`.
  - No `zero user code`.
  - No `custom user code`.
  - No `without writing code`.
  - No `email` or `@` in changed company content.
- Evidence search: PASS
  - `Game Design Document (GDD) &rarr; Structured Game Data &rarr; Playable Experiences`
  - `Build &middot; Play &middot; Share`
  - `ForgeBot`
  - `Pixel Smith`
  - `Spark`
  - `Foundry Bot`
  - `Open a support ticket`
  - `Latest Updates`
  - `Near Term`
  - `Mid Term`
  - `Long Term`

## Playwright

- Playwright impacted: No.
- Playwright run: SKIP.
- Reason: This PR changes static company page content and one footer Company navigation link only. No runtime behavior, tool workflow, shared engine behavior, or browser interaction changed.

## Samples

- Full samples smoke test: SKIP.
- Reason: No samples or runtime game surfaces changed.

## Review Artifacts

- `docs_build/dev/reports/codex_review.diff`: PASS
- `docs_build/dev/reports/codex_changed_files.txt`: PASS

## ZIP

- `tmp/PR_26164_086-company-pages-creator-story_delta.zip`: PASS
