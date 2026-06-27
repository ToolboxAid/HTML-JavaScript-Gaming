
# BUILD_PR_LEVEL_20_28_POPULATE_TOOL_SELECT_AND_ENABLE

## Purpose

Fix the tool selector dropdown so it is populated, usable, and synced with pager state.

## Current UAT

- PREV/NEXT works ✅
- selector empty ❌
- tabindex=-1 ❌
- aria-hidden ❌

## Required Behavior

- populate select with tools
- remove tabindex and aria-hidden
- sync with pager
- selecting tool mounts it

## Implementation

Populate:

tools.forEach(tool => {
  const opt = document.createElement('option')
  opt.value = tool.id
  opt.textContent = tool.displayName
  select.appendChild(opt)
})

Bind:

select.addEventListener('change', e => {
  setCurrentToolById(e.target.value)
  mountTool(e.target.value)
})
