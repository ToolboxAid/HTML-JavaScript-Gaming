# PR_26164_087-home-and-how-mascots

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `* main`
- Result: PASS

## Scope

- Updated `index.html`.
- Updated `company/how-we-build.html`.
- No navigation file changes were required because `company/how-we-build.html` already exists in Company footer navigation and the new Home CTAs link directly to that page.
- Required report artifacts updated:
  - `docs_build/dev/reports/codex_review.diff`
  - `docs_build/dev/reports/codex_changed_files.txt`

## Requirement Checklist

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution: PASS
- Verified current branch is `main` before making changes: PASS
- Scope limited to `company/how-we-build.html`, `index.html`, required navigation updates if needed, and reports: PASS
- Added correct mascot image to each How We Build mascot block: PASS
  - ForgeBot for Build: `../assets/theme-v2/images/mascots/forgebot.png`
  - Pixel Smith for Design: `../assets/theme-v2/images/mascots/pixel-smith.png`
  - Spark for Audio: `../assets/theme-v2/images/mascots/spark.png`
  - Foundry Bot for Guide / AI / Help: `../assets/theme-v2/images/mascots/foundry-bot.png`
- Used existing Theme V2 card/media classes where possible: PASS
- Did not add inline styles, script blocks, style blocks, or page-local CSS: PASS
- Home hero uses creator-focused `Build. Play. Share.` copy: PASS
- Fake production metrics were removed: PASS
- `Trending Games` / `Most played this week` replaced with `Featured Experiences`: PASS
- `Staff Picks` replaced with `Creator Highlights`: PASS
- What is GameFoundryStudio section updated with creator destination copy and added Game Design Document (GDD), Testing & Preview, and Creator Templates: PASS
- Featured Tools public copy no longer uses internal governance language: PASS
- Mascot section updated to `Meet the Foundry Guides` with `See How We Build` CTA to `company/how-we-build.html`: PASS
- Final CTA updated to `Start Creating` with Start Building, Explore Games, and Learn How It Works buttons: PASS
- Playwright impacted: No. Content/navigation/image placement only: PASS
- Required repo-structured ZIP produced: PASS

## Manual Validation Notes

- Reviewed `index.html` and `company/how-we-build.html` before editing.
- Confirmed mascot files exist under `assets/theme-v2/images/mascots/`.
- Confirmed `company/how-we-build.html` was already linked from the Company footer navigation, so no navigation file edit was required.
- Confirmed changed links resolve:
  - `toolbox/index.html`
  - `games/index.html`
  - `company/how-we-build.html`
- Confirmed no CSS or JavaScript files were changed.

## Validation

- `git diff --check`: PASS
  - Note: Git reported LF-to-CRLF working-copy warnings for touched HTML files; the command exited successfully.
- Home render-shell validation: PASS
- `company/how-we-build.html` render-shell validation: PASS
- Mascot image path resolution: PASS
- Changed navigation/link resolution: PASS
- Inline HTML restriction check: PASS
  - No `<style>` blocks.
  - No inline `<script>` blocks.
  - No inline event handlers.
  - No inline `style` attributes.
- Retired Home text search: PASS
  - No `Most played this week`.
  - No `Trending Games`.
  - No `Staff Picks`.
  - No fake player counts or fake ratings.
  - No `Open Brand Kit`.
  - No `manifest-driven`.
  - No `explicit manifest data`.
  - No `hidden fallback`.
- Required Home evidence search: PASS
  - `Game Foundry Studio helps Creators design games`
  - `Advanced creators can extend projects later`
  - `Featured Experiences`
  - `Creator Highlights`
  - `Game Design Document (GDD)`
  - `Testing & Preview`
  - `Creator Templates`
  - `Focused tools help Creators`
  - `Meet the Foundry Guides`
  - `See How We Build`
  - `Start Creating`
  - `Learn How It Works`

## Playwright

- Playwright impacted: No.
- Playwright run: SKIP.
- Reason: This PR changes static content, links, and image placement only. No runtime behavior, tool workflow, shared engine behavior, or browser interaction changed.

## Samples

- Full samples smoke test: SKIP.
- Reason: No samples or runtime game surfaces changed.

## Review Artifacts

- `docs_build/dev/reports/codex_review.diff`: PASS
- `docs_build/dev/reports/codex_changed_files.txt`: PASS

## ZIP

- `tmp/PR_26164_087-home-and-how-mascots_delta.zip`: PASS
