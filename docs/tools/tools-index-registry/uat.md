# Tools Index / Registry — UAT

## Purpose
Validate that the tools index and registry surfaces correctly expose active tools.

## Scope
- tools/index.html
- tools/renderToolsIndex.js
- tools/toolRegistry.js

## Validation Scenarios

### VS-001: Index loads
- [ ] tools index page loads
- [ ] no blocking console errors

### VS-002: Registered tools appear
- [ ] active tools are listed
- [ ] entries route to correct tool surfaces

### VS-003: Registry consistency
- [ ] registry names align with visible tool names
- [ ] no stale/dead entries remain

## Final Status
- [ ] ACCEPTED
- [ ] REJECTED
- [ ] BLOCKED
