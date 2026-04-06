# LEVEL_SVG_EDITOR_BOUNDING_BOX_ALIGNMENT_FIX

## Problem
In the SVG Background Editor, when a drawn object uses a bounded box or selection rectangle, the final placed geometry is not aligned correctly to the visible line/object.

## Required Fix
- the selection/bounding box must be derived from the actual placed geometry
- line endpoints and object bounds must share the same coordinate basis
- drag-start, drag-current, and final committed object coordinates must map consistently
- no visual offset is allowed between the object and its selection handles

## Acceptance
- a drawn line sits inside its selection bounds correctly
- resizing handles match the true object extents
- committed placement matches preview placement
