# BUILD_PR — LEVEL 09.01 FLOW RULES VS FLOW CONTENT SPLIT

## Purpose
Introduce a consistent repo-wide split between:
- behavioral flow rules
- player-facing flow content

This keeps timing, return modes, and transition behavior separate from UI/status copy.

## Why this PR exists
Current game flow rule files mix:
- behavioral constants, for example auto-exit timing and return mode
- player-facing text, for example status prompts and headings

That makes the rules layer carry both behavior and content. This PR separates them cleanly.

## Target pattern
For every game with flow/rules support:

games/<GameName>/rules/
  flowRules.js
  flowContent.js

## Classification standard

### Keep in `flowRules.js`
Behavior-defining values:
- auto-exit timing
- return mode
- return status codes / machine-facing values
- contract version
- booleans that alter flow behavior
- enum-like transition selectors

### Move to `flowContent.js`
Player-facing content:
- visible status strings
- headings
- prompts
- instructions shown to the player
- labels displayed during attract / intro / highscore / game-over flow

## Important distinction
A string is **not automatically config**.

Use this rule:
- if it defines system/runtime environment → `config/`
- if it defines game behavior → `rules/flowRules.js`
- if it is player-facing text used by flow behavior → `rules/flowContent.js`

## In scope
Repo-wide split for games that currently store flow text in rules files.

## Out of scope
- no engine changes
- no launcher/bootstrap changes
- no gameplay redesign
- no i18n framework
- do not move environment/system settings into this PR

## Acceptance criteria
For each affected game:
1. `rules/flowRules.js` contains behavior-only constants
2. `rules/flowContent.js` contains player-facing flow text only
3. flow and game files import from the correct file
4. no duplicate literals remain between rules/content/flow/game for the migrated constants
5. no behavior meaning changes

## Validation examples
Examples of behavior constants:
- `*_AUTO_EXIT_SECONDS`
- `*_RETURN_MODE`
- `*_RETURN_RESET_IDLE`
- `*_CONTRACT_VERSION`

Examples of content constants:
- `*_RETURN_STATUS`
- `*_HIGHSCORE_STATUS`
- headings, prompts, visible labels

## Notes
This PR is a structural split only. Preserve exact behavior.
