# 3D Sample Adapter Harness Notes

## Purpose
Provide a low-risk validation path for shared 3D debug support without hard-coding a specific renderer into the shared layer.

## Harness Responsibilities
- expose transform summaries
- expose camera summaries
- expose render stage summaries
- expose collision/debug volume summaries
- expose scene graph summaries

## Harness Rules
- adapter remains project-local
- shared 3D panels/providers stay generic
- no renderer internals in shared layer
