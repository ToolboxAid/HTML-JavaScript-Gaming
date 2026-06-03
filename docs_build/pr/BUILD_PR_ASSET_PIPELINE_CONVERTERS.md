# BUILD_PR_ASSET_PIPELINE_CONVERTERS

## Purpose
Extend asset pipeline with initial converter layer for transforming assets between formats used by tools.

## Goals
- introduce converter abstraction
- enable tile ↔ vector ↔ sprite transformations (basic only)
- keep converters modular and optional

## Scope
- converter interface
- minimal converters (safe/common only)
- integration with pipeline foundation

## Out of Scope
- full production-grade converters
- 3D formats
- UI redesign
- rendering changes

## Strategy
- define converter registry
- plug into pipeline after normalize stage
- keep transformations reversible where possible

## Validation
- npm run test:launch-smoke -- --tools
- converted assets usable in at least 2 tools
