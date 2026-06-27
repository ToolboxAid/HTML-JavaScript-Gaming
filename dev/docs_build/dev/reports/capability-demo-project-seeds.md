# Capability Demo Project Seeds

Stacked PR:
- PR_26155_065-capability-demo-project-seeds

## Summary

Added mock seed definitions for Capability Demo projects.

Seeded projects:
- Gravity Demo
- Collision Demo
- Camera Follow Demo

Each demo is a real mock project row with:
- `purpose: "Capability Demo"`
- Creator User membership
- Admin User membership
- Guest Preview User Viewer membership

No real game runtime files, sample JSON, or playable demo implementation was added.

## Validation

Covered by `npm run test:lane:project-workspace`.

The targeted lane verifies:
- Capability Demo projects appear in the Project Workspace project list.
- Capability Demo projects are seeded as projects, not as samples or runtime assets.
- Reset/seed/clear mock data actions still work through the existing admin Project Data wireframe.
