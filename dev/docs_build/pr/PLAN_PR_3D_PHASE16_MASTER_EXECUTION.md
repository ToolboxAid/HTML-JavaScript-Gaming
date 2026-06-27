
# PLAN_PR_3D_PHASE16_MASTER_EXECUTION

## Purpose
Define a clean, dependency-ordered execution plan for all Phase 16 (3D) items (~41 items) based on the current roadmap state.

This is a PLAN-ONLY bundle. No implementation.

---

## Ground Truth
Non-3D system is complete and stable.
3D work begins as an isolated capability lane.

Reference:
- 3D Engine Foundation
- 3D Samples
- 3D Debug Support
- 3D Tooling
- 3D Capability Requirements

---

## Execution Strategy

### RULES (Carry Forward)
- no broad repo cleanup
- exact-cluster extraction only
- validate-first before promotion
- samples prove capability before engine abstraction

---

## PHASE 16 EXECUTION STACK

### LAYER 1 — Minimal 3D Runtime Spine (FOUNDATION)
Goal: Get something rendering and moving.

1. 3D scene boot
2. 3D render foundation
3. basic transform model (position/rotation/scale)
4. camera controls (orbit + free)
5. minimal render loop integration

Exit Criteria:
- cube renders
- camera moves
- no tools required

---

### LAYER 2 — Core Interaction (MOVEMENT + COLLISION)
Goal: Make 3D interactive.

6. 3D movement base
7. basic collision (AABB or simple bounds)
8. input mapping for 3D
9. update loop integration with state

Exit Criteria:
- player can move
- collision prevents pass-through

---

### LAYER 3 — SAMPLE PROOF (PREREQUISITES)
Goal: Lock learning path before expansion.

10. Scene Boot Sample
11. Camera Orbit Sample
12. 3D Movement Sample
13. Basic Collision Sample

Exit Criteria:
- all 4 prerequisite samples exist and run independently

---

### LAYER 4 — CORE SAMPLE TRACK (1601–1608)
Goal: Expand capability through samples.

14–21:
- Cube Explorer
- Maze Runner
- First Person Walkthrough
- Platformer
- Driving Sandbox
- Physics Playground
- Space Shooter
- Dungeon Crawler

Rule:
- each sample introduces ONE concept cleanly

---

### LAYER 5 — ADVANCED CAPABILITY
22–24:
- Lighting Demo
- AI Navigation Demo
- Large World Streaming

---

### LAYER 6 — DEBUG SUPPORT (3D)
25–30:
- transform inspector
- camera debug panel
- render pipeline stages
- collision overlays
- scene graph inspector

Rule:
- debug surfaces follow sample needs (not ahead)

---

### LAYER 7 — TOOLING (3D)
31–36:
- 3DMapEditor stabilization
- 3DAssetViewer validation
- camera path editor alignment
- physics sandbox integration
- asset pipeline validation for 3D
- model converter alignment

Rule:
- tools follow asset + sample pressure

---

### LAYER 8 — CAPABILITY COMPLETION
37–41:
- rendering completeness
- camera completeness
- movement completeness
- physics completeness
- debug completeness

Exit Criteria:
- 3D matches 2D capability maturity (parity mindset)

---

## DELIVERY MODEL

Each layer executes as:
PLAN → BUILD → APPLY

Small PRs only:
- 1 concept per PR
- 1 sample per PR
- no cross-layer mixing

---

## ORDER OF EXECUTION (STRICT)

1. Layer 1 (foundation)
2. Layer 2 (interaction)
3. Layer 3 (prereq samples)
4. Layer 4 (core samples)
5. Layer 6 (debug as needed)
6. Layer 7 (tools as needed)
7. Layer 5 (advanced)
8. Layer 8 (finalization)

---

## VALIDATION STRATEGY

For every PR:
- visual validation required
- sample runs independently
- no regression to 2D

---

## OUTPUT
<project folder>/tmp/PLAN_PR_3D_PHASE16_MASTER_EXECUTION.zip
