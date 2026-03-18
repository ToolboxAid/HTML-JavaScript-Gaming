# ToolboxAid Dev Protocol v1

## Purpose
Standardized command interface for interacting with ChatGPT for:
- Code review
- Architecture analysis
- PR generation
- Refactoring planning

---

## Session Start (Short Version)

Use this at the start of every ChatGPT session:

COMMAND: START_SESSION  
REPO: ToolboxAid/HTML-JavaScript-Gaming  
SCOPE: full  
FOCUS: architecture  
OUTPUT: review_state, plan, tasks  

---

## Command Structure

COMMAND: <action>  
REPO: <owner/repo>  
SCOPE: <area>  
FOCUS: <analysis type>  
OUTPUT: <response type>  

---

## COMMAND Options

### Core
- START_SESSION
- REVIEW_PASS
- FIND_RISK
- LIST_API
- TRACE_FLOW
- BUILD_PR
- PLAN_PR
- SUMMARIZE
- COMPARE
- REFACTOR

### Advanced
- ENFORCE_RULES
- CHECK_CONSISTENCY
- MAP_DEPENDENCIES
- VALIDATE_BOUNDARIES

---

## SCOPE Options

### Broad
- full
- engine
- games
- samples
- tests
- docs
- tools

### Folder Examples
- engine/core
- engine/render
- engine/physics
- engine/lifecycle

### Logical
- runtime
- collision
- render_loop
- object_lifecycle
- input_pipeline

---

## FOCUS Options

### Architecture
- architecture
- design
- coupling

### Code Quality
- bugs
- edge_cases
- consistency
- cleanup

### Performance
- performance
- memory
- rendering
- physics

### Behavior
- lifecycle
- collision
- input
- timing

### Refactor
- refactor
- modernize
- simplify

---

## OUTPUT Options

### Review
- review_state
- findings
- risks
- summary

### Planning
- plan
- tasks
- roadmap
- pr_candidates

### PR
- pr_plan
- diff
- description
- title
- tests

### Deep Analysis
- dependency_map
- call_flow
- api_surface
- boundary_map

---

## Review Rules

- One PR = one concern
- Do not mix refactor + bug fixes + formatting
- Identify public vs internal vs private
- Prefer small, safe changes
- Treat engine as a reusable library
- Use games/samples as validation of architecture

---

## Workflow

1. Start session with short command
2. Run REVIEW_PASS by scope
3. Identify risks and PR candidates
4. Build PRs in small, focused units
5. Validate using tests/samples

---

## Example Commands

COMMAND: REVIEW_PASS  
SCOPE: engine/core  
FOCUS: architecture  
OUTPUT: findings, risks, pr_candidates  

COMMAND: BUILD_PR  
SCOPE: engine/lifecycle  
FOCUS: refactor  
OUTPUT: title, description, diff  

---

## Mental Model

COMMAND = what to do  
REPO = where  
SCOPE = how much  
FOCUS = why  
OUTPUT = what you get  