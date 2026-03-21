# Sample19 - ECS Render System

## Purpose
Separates drawing into a render-focused ECS pass that uses shared renderable component data.

## What it shows
- transform + size + renderable query
- one shared render loop
- multiple entity types
- label drawing
- system-focused rendering

## Behavior
All entities are drawn through the same render pass without hard-coding each object in the scene.
