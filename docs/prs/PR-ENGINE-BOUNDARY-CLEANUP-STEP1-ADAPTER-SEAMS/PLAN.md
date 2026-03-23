Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Step 1 Adapter Seams

## Changes

### 1. Renderer Boundary Fix
- Remove direct ctx usage from scenes
- Route drawing through renderer interface

### 2. Engine Injection Seams
- Allow Engine to accept scheduler/time adapters

### 3. Browser Guards
- Wrap window/document/localStorage access

### 4. Test Structure
- Create tests/engine/
- Register in test runner

## Acceptance Criteria
- No ctx outside renderer
- Engine runs without browser globals
- tests/engine exists and executes
- No gameplay change
