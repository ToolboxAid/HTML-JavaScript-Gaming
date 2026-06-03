# PR 11.180 Diagnosis

## Finding
`[SVG_HOSTED_WORKSPACE_ENTRY]` does not appear.

That means the SVG hosted entry branch is not executing.

## Highest probability causes
1. SVG is not being mounted.
2. SVG launch URL lacks `hosted=1`, `hostToolId=svg-asset-studio`, or `hostContextId`.
3. Workspace Manager launches a different entry file than `toolbox/SVG Asset Studio/main.js`.
4. The guard condition in SVG entry does not match actual launch params.

## Fix Strategy
Trace from Workspace Manager launch to SVG entry top, then correct the first broken link.
