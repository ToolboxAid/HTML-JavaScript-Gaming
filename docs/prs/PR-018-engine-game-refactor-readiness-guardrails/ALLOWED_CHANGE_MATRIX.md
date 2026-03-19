PR-018 — allowed change matrix

### Allowed First-Code-PR Changes

| Guardrail Category | Allowed Status | Rationale | Review Note |
| --- | --- | --- | --- |
| non-breaking code comments | allowed | comments can reinforce documented intent without affecting runtime behavior | verify no logic change is bundled with the comments |
| runtime-neutral intent markers | allowed | internal markers or annotations may help align code with docs if they do not affect execution | confirm markers are purely descriptive |
| preferred-path comments near exports | allowed | comments may steer future maintainers toward documented preferred direction without removing compatibility surfaces | ensure imports and behavior remain unchanged |
| docs-adjacent metadata that is runtime-neutral | allowed | metadata is acceptable only if it does not affect build/runtime paths | verify it is ignored by runtime |
| small surgical scope in a single purpose PR | allowed | first refactor step should remain reversible and easy to review | reject scope creep across unrelated files |

### Allowed Change Rule

The first code PR should behave like an alignment PR, not a structural rewrite.
