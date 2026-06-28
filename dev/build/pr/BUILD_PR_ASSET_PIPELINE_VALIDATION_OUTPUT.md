# BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT

## Purpose
Add validation, export, and build-output stages to the asset pipeline so assets can be verified and packaged consistently.

## Goals
- validation rules enforcement
- export formats (JSON baseline)
- build artifacts output

## Scope
- validation layer
- export/output layer
- integration with existing pipeline

## Out of Scope
- complex packaging systems
- deployment pipelines
- 3D/export formats

## Strategy
- extend pipeline after converters
- add validation checkpoints
- output standardized artifacts

## Validation
- npm run test:launch-smoke -- --tools
- assets validate and export without errors
