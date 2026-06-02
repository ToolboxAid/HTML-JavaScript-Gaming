# ProjectWorkspace Validation Boundaries

Date: 2026-06-02

## Purpose

ProjectWorkspace validation is a contract and lifecycle boundary lane. It validates ProjectWorkspace coordination rules without requiring tool runtime UAT.

## Preferred Term

ProjectWorkspace is the preferred current term in docs, reports, fixtures, and validation language.

Workspace V2 may remain only where existing file names, command names, package scripts, or historical references require it.

## Active Scope

- ProjectWorkspace launch inputs.
- ProjectWorkspace manifest handoff inputs.
- ProjectWorkspace state coordination.
- Tool State ownership boundaries.
- Palette ownership boundaries.
- Hidden persisted ProjectWorkspace state assumptions.

## Skipped Scope

- Samples are SKIP / pending rebuild.
- Unmigrated tools are SKIP / not migrated / out of scope.
- Tool runtime validation is a future lane.
- Tool-specific rendering is out of scope.
- Runtime UAT is out of scope.

## Result Rules

- Contract-valid ProjectWorkspace inputs are PASS.
- Invalid ProjectWorkspace boundary inputs are REJECT with visible validation detail.
- Unmigrated tools are SKIP and must not be classified as FAIL in this lane.

## Non-Goals

This document does not:

- modify runtime behavior
- modify samples
- add fallback data
- validate tool runtime behavior
- require unmigrated tools to pass
- persist ProjectWorkspace state
