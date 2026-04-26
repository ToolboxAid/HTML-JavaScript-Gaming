# Tool Launch SSoT Routing Validation

## Changed Files

- `games/index.render.js`
- `docs/dev/reports/tool_launch_ssot_routing_validation.md`

## Tested UAT Paths

1. Samples hub: sample-to-tool action label and launch href generation.
2. Games hub: game-to-workspace action label and launch href generation.
3. External launch flow: storage reset before navigation.
4. Missing launch context behavior: sample missing `sampleId`; game entries missing valid `href`.

## Proof Sample Actions Are Labeled `Open <tool>`

Code proof:

- `samples/index.render.js:102`

```text
const label = `Open ${normalize(tool.displayName) || normalize(tool.name) || toolId}`;
```

This preserves required sample launch semantics and does not use `Open with Workspace Manager` for sample-to-tool actions.

## Proof Samples Route To `tools/<tool>/index.html`

Command output:

```text
sampleLaunch {
  href: '/tools/Sprite%20Editor/index.html?sampleId=1208&sampleTitle=Tool+Formatted+Tiles+Parallax',
  error: ''
}
```

Code proof:

- `tools/shared/toolLaunchSSoT.js:75`
- `tools/shared/toolLaunchSSoT.js:86`
- `samples/index.render.js:92`
- `samples/index.render.js:345`

## Proof Game Actions Are Labeled `Open with Workspace Manager`

Code proof:

- `games/index.render.js:260`

```text
Open with Workspace Manager
```

Additional V2 hardening:

- Removed unlabeled game launch triggers (`game-title-link`, card-click launch) so workspace launch is exposed through the required labeled action path.

## Proof Games Route To `tools/Workspace Manager/index.html`

Command output:

```text
gameLaunch {
  href: '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game',
  error: ''
}
```

Code proof:

- `tools/shared/toolLaunchSSoT.js:105`
- `tools/shared/toolLaunchSSoT.js:117`
- `tools/shared/toolLaunchSSoT.js:118`
- `games/index.render.js:147`
- `games/index.render.js:407`

## Proof External Launch Memory Is Cleared

Command output:

```text
clearResult true
localAfterClear [ [ 'keep.one', 'x' ] ]
sessionAfterClear [ [ 'keep.two', 'y' ] ]
launchResult true
assignCalls [ '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game' ]
localAfterLaunch [ [ 'keep.one', 'x' ] ]
sessionAfterLaunch [ [ 'keep.two', 'y' ] ]
```

Code proof:

- `tools/shared/toolLaunchSSoT.js:123`
- `tools/shared/toolLaunchSSoT.js:140`
- `samples/index.render.js:537`
- `games/index.render.js:416`

## Proof Missing Context Does Not Fallback

1. Missing sample launch context is explicit and non-routable:

```text
missingSampleContext { href: '', error: 'Tool "sprite-editor" launch is missing sampleId.' }
```

2. Missing game launch context is visible in games UI (`Workspace launch error`) instead of silently falling back:

- `games/index.render.js:147`
- `games/index.render.js:264`
- `games/index.render.js:330`

Metadata scan used during validation:

```text
{ totalGames: 29, missingValidHref: 18 }
```

3. No hidden alternate game workspace launch action remains in touched flow:

- `games/index.render.js` contains no `game-title-link`, `handleCardLaunch`, or `data-workspace-href` launch path.

## Static Validation

Commands run:

```bash
node --check tools/shared/toolLaunchSSoT.js
node --check games/index.render.js
node --check samples/index.render.js
```

All commands exited successfully.

## Anti-Pattern Self-Check

- No duplicate launch state introduced.
- No hidden/default/fallback route/tool/workspace behavior added in touched flow.
- No duplicate event listeners introduced.
- No globals/managers/factories/service layers added.
- No unrelated cleanup or scope expansion.
