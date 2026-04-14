# BUILD_PR_LEVEL_10_13_ASSET_DEDUP_AND_BEZEL_ROADMAP

## Problem

Duplicate asset definitions detected:
- assets.json
- tools.manifest.json

These create ambiguity in source of truth.

Also:
- bezel currently exists as image/parallax concept but lacks formal system placement

## Purpose

1. Establish SINGLE source of truth for asset discovery
2. Add bezel support to roadmap (low priority, pre-next-game)

## Scope

### Asset Deduplication

Rules:
- tools.manifest.json = ONLY source of truth
- assets.json = deprecated

Required:
- Remove assets.json
- Ensure ALL loaders reference tools.manifest.json only
- Remove any duplicated structures in data folders

### Bezel Roadmap Addition

Add new roadmap item:

FEATURE: Fullscreen Bezel Overlay System

Requirements:
- Rendered at final compositing layer (NOT parallax)
- Independent of camera
- Anchored to screen space (not world space)
- Supports:
  - static image (bezel.png)
  - optional overlay effects (future)

Location Decision:
- assets/images/bezel.png (correct)
- NOT part of parallax system

## Testable Outcome

- Only one manifest exists
- No duplicate asset definitions
- Bezel defined in roadmap
- No runtime break

## Non-Goals
- No rendering implementation yet