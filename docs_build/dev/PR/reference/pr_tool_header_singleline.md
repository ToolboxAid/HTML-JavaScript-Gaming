# PR — Tool Header Single-Line Standard

## Purpose
Standardize fullscreen tool headers to a single-line format to maximize workspace and maintain consistency.

---

## Rule

All tools must render the header as:

<Tool Name> — <Short Description>

---

## Constraints

- Must be a single line
- No wrapping
- No separate intro paragraph
- No multi-line headers
- Use ellipsis (…) if overflow occurs
- Tooltip must display full text on hover

---

## Examples

Vector Map Editor — Platform Layout & Tile Composition  
Vector Asset Studio — Asset Creation & Editing  
Sprite Editor — Animation & Frame Control  
State Inspector — Object State & JSON Viewer  

---

## Implementation

tool = {
  name: "Vector Map Editor",
  shortDescription: "Platform Layout & Tile Composition"
}

Render:

`${tool.name} — ${tool.shortDescription}`

---

## Scope

Apply to:
- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector

---

## Notes

- Removes redundant intro blocks in fullscreen
- Ensures consistent UX across all tools
- Maximizes vertical workspace
