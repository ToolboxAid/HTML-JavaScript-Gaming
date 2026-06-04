# PR_26151_008-design-build-publish-page-wireframes Validation

## Scope

- Updated Game Design Studio page content.
- Updated Game Builder page content.
- Updated Publish Studio page content.
- Kept the implementation to static wireframe HTML inside existing tool page layout and accordion patterns.

## Static HTML Validation

PASS:

```text
rg -n --pcre2 "<style\\b|<script(?![^>]*\\bsrc=)|\\son[a-zA-Z]+\\s*=|\\sstyle\\s*=" GameFoundryStudio/tools/game-design-studio.html GameFoundryStudio/tools/game-builder.html GameFoundryStudio/tools/publisher.html
```

Result: no matches.

Interpretation:

- No inline CSS was added.
- No inline JavaScript was added.
- No inline event handlers were added.
- Existing external shared scripts remain for partial loading and Tool Display Mode.

## Content Differentiation Validation

PASS:

```text
rg -n "What game are we building\\?|game\\.gdd\\.json|AI -> GDD|Architect / Blueprint|How is the game assembled\\?|game\\.manifest\\.json|GDD -> Manifest|Construction Crew|Hero|Dynamic Killable|How is the game released\\?|Release Package|Marketplace Listing|Published Game Record|Manifest -> Publish|Real Estate Agent" GameFoundryStudio/tools/game-design-studio.html GameFoundryStudio/tools/game-builder.html GameFoundryStudio/tools/publisher.html
```

Result: matched the required positioning, outputs, workflows, examples, and analogies.

PASS:

```text
rg -n "Genre|Players|Story|Objectives|Win Conditions|Lose Conditions|Rules|Characters|Progression|Economy|Monetization|Asset Requirements|Sound Requirements" GameFoundryStudio/tools/game-design-studio.html
```

Result: all requested Game Design Studio purpose fields are present.

PASS:

```text
rg -n "Screens|Levels|Objects|Assets|Audio|Input Mapping|Physics|Behaviors|Object Types|State Transitions|Ice Block|Static Breakable|Water|Damage Volume" GameFoundryStudio/tools/game-builder.html
```

Result: all requested Game Builder purpose fields and object examples are present.

PASS:

```text
rg -n "Version|Screenshots|Trailer|Categories|Tags|Age Rating|Release Notes|Visibility|Pricing|Marketplace Information" GameFoundryStudio/tools/publisher.html
```

Result: all requested Publish Studio purpose fields are present.

## Runtime Behavior Validation

PASS by source review:

- No new JavaScript files were added.
- No new script references were added to the three changed pages.
- No save logic was added.
- No publishing logic was added.
- The pages remain static wireframes.

## Side Accordion Count Validation

PASS:

```text
rg -n "Toolbox Accordion|Inspector Accordion|panel [0-9]+" GameFoundryStudio/tools -g "*.html"
```

Result: no matches.

Interpretation:

- The page-processing counter no longer appears as visible accordion numbering.
- Placeholder side accordions use content labels instead of counter labels.
- Game Design Studio uses three left-side and three right-side accordions.
- Game Builder uses two left-side and two right-side accordions.
- Publish Studio uses two left-side and two right-side accordions.

Existing external shared scripts remain:

```text
../assets/js/gamefoundry-partials.js
../assets/js/tool-display-mode.js
```

These are preserved to keep the shared header/nav/footer and current badge/character Tool Display Mode header format.

## Playwright Impact

Playwright impacted: No.

Reason: this PR changes static HTML wireframe content only and adds no runtime behavior, interaction logic, save logic, publishing logic, or new JavaScript.

## Samples Decision

SKIP: full samples smoke test was not run because this PR only changes static GameFoundryStudio tool page wireframe content.

## Blocked Commands

The following commands were attempted and blocked by the sandbox:

```text
git diff -- GameFoundryStudio/tools/game-design-studio.html GameFoundryStudio/tools/game-builder.html GameFoundryStudio/tools/publisher.html
git diff --stat -- GameFoundryStudio/tools/game-design-studio.html GameFoundryStudio/tools/game-builder.html GameFoundryStudio/tools/publisher.html
Compress-Archive -Path <changed files> -DestinationPath tmp/PR_26151_008-design-build-publish-page-wireframes_delta_20260531.zip -Force
```

Sandbox error:

```text
windows sandbox: spawn setup refresh
```
