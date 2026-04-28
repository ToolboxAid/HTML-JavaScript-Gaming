# PR — Fix Asset Browser Sample 1505 (No Data)

## Purpose
Fix Asset Browser sample `1505` where no data is shown.

---

## Problem
Sample `1505` loads with no visible data and no clear explanation.

---

## Required Behavior
Asset Browser must clearly show ONE of:

1. Source exists but empty  
2. Source missing  
3. Source invalid  
4. Load failure  

---

## Required Output Example

Missing:
Asset Browser could not find data for sample 1505.
Missing: tools.asset-browser.assets
Next action: add assets or provide assetCatalogPath.

Empty:
Asset Browser found 0 assets for sample 1505.
Next action: import or create assets.

---

## Rules
- No silent fallback
- No blank UI
- Always show source + result + next action

---

## Acceptance Criteria
- Sample 1505 shows explicit message
- No fallback data used
- Message includes next action

---

## Validation
- Launch sample 1505
- Confirm visible message
