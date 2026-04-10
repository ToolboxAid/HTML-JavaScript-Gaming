# Sample 0117 - ECS Input System

## Purpose
Shows how input can drive an entity through components rather than a hand-wired scene object.

## What it shows
- inputControlled component
- speed component
- transform updates from input
- bounded play area
- ECS-based interaction

## Controls
- Arrow keys: move player

## Behavior
The input system finds the controlled entity and updates its transform using shared component data.
