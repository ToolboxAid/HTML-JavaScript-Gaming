# Tool Launch SSoT Routing Validation

## Changed Files

- `tools/shared/toolLaunchSSoT.js`
- `games/index.render.js`
- `docs/dev/reports/tool_launch_ssot_routing_validation.md`

## Tested UAT Paths

1. Samples hub roundtrip launch href resolution via `resolveSampleToolLaunchHref(...)`.
2. Games hub workspace launch href resolution via `resolveGameWorkspaceLaunchHref(...)`.
3. External launch memory clearing via `clearExternalToolWorkspaceMemory()` and `launchWithExternalToolWorkspaceReset(...)`.
4. Missing launch context handling for:
   - sample launch missing `sampleId`
   - games metadata entries missing valid `href`

## Proof: Samples Route To `tools/<tool>/index.html`

Command run:

```bash
node --input-type=module -
```

Script output:

```text
sampleLaunch {
  href: '/tools/Sprite%20Editor/index.html?sampleId=1208&sampleTitle=Tool+Formatted+Tiles+Parallax',
  error: ''
}
```

Implementation references:

- `tools/shared/toolLaunchSSoT.js:75`
- `tools/shared/toolLaunchSSoT.js:91`
- `samples/index.render.js:92`

## Proof: Games Route To `tools/Workspace Manager/index.html`

Command run:

```bash
node --input-type=module -
```

Script output:

```text
gameLaunch {
  href: '/tools/Workspace%20Manager/index.html?gameId=2001&mount=game',
  error: ''
}
```

Implementation references:

- `tools/shared/toolLaunchSSoT.js:105`
- `tools/shared/toolLaunchSSoT.js:117`
- `tools/shared/toolLaunchSSoT.js:118`
- `games/index.render.js:147`

## Proof: External Launch Memory Is Cleared

Command run:

```bash
node --input-type=module -
```

Script output:

```text
clearResult true
localAfterClear [ [ 'keep.one', 'x' ] ]
sessionAfterClear [ [ 'keep.two', 'y' ] ]
launchResult true
assignCalls [ '/tools/Sprite%20Editor/index.html?sampleId=1208' ]
localAfterLaunch [ [ 'keep.one', 'x' ] ]
sessionAfterLaunch [ [ 'keep.two', 'y' ] ]
```

Implementation references:

- `tools/shared/toolLaunchSSoT.js:123`
- `tools/shared/toolLaunchSSoT.js:140`
- `samples/index.render.js:537`
- `games/index.render.js:424`
- `games/index.render.js:444`

## Proof: Missing Context Does Not Fallback

1. Sample launch now requires `sampleId`; missing context returns explicit error and empty href:

```text
missingSampleContext { href: '', error: 'Tool "sprite-editor" launch is missing sampleId.' }
```

2. Games rows missing valid game `href` now emit explicit visible launch errors instead of silent empty launch state:

- `games/index.render.js:147`
- `games/index.render.js:271`
- `games/index.render.js:336`

3. Workspace launch links are only bound when explicit `workspaceHref` exists, so missing context cannot route through a fallback launcher:

- `games/index.render.js:266`
- `games/index.render.js:416`

## Static Validation

Commands run:

```bash
node --check tools/shared/toolLaunchSSoT.js
node --check games/index.render.js
node --check samples/index.render.js
```

All commands exited successfully.

## Anti-Pattern Self-Check

- No new duplicate launch state introduced.
- No new hidden/default/fallback launch route added in touched flow.
- No duplicate event listeners added.
- No new globals/managers/factories introduced.
- No unrelated files changed for behavior.
