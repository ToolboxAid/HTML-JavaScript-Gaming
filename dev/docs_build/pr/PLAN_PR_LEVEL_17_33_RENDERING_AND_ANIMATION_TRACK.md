# PLAN_PR_LEVEL_17_33_RENDERING_AND_ANIMATION_TRACK

## Purpose
Add a compact, demonstrable Level 17 rendering-and-animation sample track that makes the documented visual capability gap concrete with a small number of higher-value samples.

## Why This PR Exists
Current Level 17 samples validate 3D systems but do not yet visibly demonstrate:
- classic rendering styles
- textured / image-skinned presentation
- clearly recognizable visual differentiation from primitive 3D system samples

To reduce churn, this PR bundles a small proof set instead of scattering many thin samples.

## Scope
Create a bundled proof set consisting of:
- a couple of filled samples
- a couple of image-skinned samples

## Bundled Proof Set
### Filled Samples
1. Raycast Demo
   - classic DOOM/Wolf-style corridor proof
   - filled wall rendering
   - movement + turning
   - simple map and obvious depth cues

2. Voxel World Demo
   - Minecraft-lite block world proof
   - filled blocks / terrain chunks
   - simple navigation
   - obvious voxel identity

### Image-Skinned Samples
3. Material / Texture Scene Demo
   - image-backed textured sample surfaces
   - clear contrast vs primitive flat shapes
   - simple lighting/material response

4. Skinned Sprite / Image-Mapped Character Demo
   - image skin or image-backed character/body parts
   - visible animation or layered image pose change
   - educational demonstration rather than production rig complexity

## Intent
This is a demonstrator bundle, not a full graphics-engine rewrite.
The goal is to prove and teach the rendering/visual concepts with a few stronger examples.

## Out of Scope
- full shader pipeline
- large external asset pipeline
- AAA character rigging
- engine-wide render rewrite
- broad sample renumbering outside this bounded group

## Success Criteria
- samples are visibly distinct from current primitive 3D examples
- at least two samples use filled visual presentation
- at least two samples use image-backed skins/textures
- samples/index reflects the new bundled track cleanly
- each sample remains understandable as a standalone teaching unit
