# Performance Review and Optimization Guide

## Purpose

Provide a practical performance workflow for `ToolboxAid/HTML-JavaScript-Gaming`, especially for engine hot paths.

## Main rule

Optimize only after identifying a meaningful hotspot, and keep performance changes separate from unrelated cleanup.

## Priority hot paths

Review these areas first:

1. update loop orchestration
2. render loop orchestration
3. collision detection and response
4. object registry iteration
5. animation frame stepping
6. input polling or event fan-out
7. allocation-heavy utilities used per frame

## Performance review checklist

### Frame-time pressure

- Is this called every frame?
- Is it called for every object every frame?
- Does it nest inside collision or render loops?

### Allocation pressure

- Does it create arrays, objects, closures, or strings each frame?
- Can it reuse state instead?

### Repeated work

- Is the same calculation done multiple times in one frame?
- Can values be cached or precomputed safely?

### Data access

- Does the code repeatedly walk broad registries when it could narrow the set first?
- Are object lookups or transforms done more often than needed?

### Rendering cost

- Is work done for off-screen or hidden objects?
- Are canvas state changes or draw calls avoidably repeated?

## Optimization rules

- Keep behavior identical unless the PR explicitly changes behavior.
- Prefer clarity over micro-optimizations unless profiling proves the benefit.
- Record risk level for every performance PR.
- Measure before and after when practical.

## Good candidates

- caching repeated derived values
- reducing per-frame allocations
- splitting broad loops into filtered paths
- short-circuiting work for invisible or inactive objects
- narrowing collision candidate sets

## Risk flags

Treat these as medium or high risk:

- lifecycle timing changes
- update order changes
- render order changes
- changes that alter floating-point accumulation or physics sequencing

## Suggested PR template add-on

### Performance hypothesis

What is believed to be slow and why.

### Expected gain

What kind of improvement is expected.

### Verification

How behavior parity and performance were checked.
